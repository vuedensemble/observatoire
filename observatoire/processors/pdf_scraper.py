import glob
import os
import pathlib
from urllib.parse import urljoin
import zipfile

import requests
from bs4 import BeautifulSoup
import reflex as rx
from sqlmodel import select

from observatoire.schema.locality import Locality, LocalityAdministrativeSetup
from observatoire.schema.document import Document

def endswith_any(s: str, suffixes: list[str]):
    for suffix in suffixes:
        if s.endswith(suffix):
            return True
    return False


def extract_files_from_url(url, extensions=[".zip", ".pdf"]):
    # Download the HTML content of the URL
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to download the page {url}. Status code: {response.status_code}")
        return

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.content, "html.parser")

    # Find all links that end with '.pdf'
    pdf_links = [
        a.get("href")
        for a in soup.find_all("a", href=True)
        if endswith_any(a["href"].lower(), extensions)
    ]
    return pdf_links


def get_default_headers():
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    }


def download_file(absolute_link, filepath, verbosity=1, headers=None):
    if headers is None:
        headers = get_default_headers()
    response = requests.get(absolute_link, headers=headers)
    if response.status_code == 200:
        with open(filepath, "wb") as file:
            file.write(response.content)
        if verbosity >= 2:
            print(f"Downloaded: {response}")
    else:
        print(
            f"Failed to download {absolute_link}. Status code: {response.status_code}"
        )


def unzip_file(zip_file_path: str, dest_parent_folder: str, delete_after: bool = True):
    """
    Unzips a zip file to a specified folder.

    Args:
    - zip_file_path (str): Path to the zip file.
    - extract_to_folder (str): Path to the folder where files will be extracted.
    """
    child_folder_name = os.path.basename(zip_file_path).replace(".zip", "")
    extract_to_folder = os.path.join(dest_parent_folder, child_folder_name)
    pathlib.Path(extract_to_folder).mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(extract_to_folder)
    if delete_after:
        os.remove(zip_file_path)
    print(f"Files extracted to: {extract_to_folder}")
    return extract_to_folder


def download_pdfs_and_zips_and_unzip_them(
    base_url, links, output_folder, verbosity=1, terms: list[str] | None = None
):
    pathlib.Path(output_folder).mkdir(parents=True, exist_ok=True)
    headers = get_default_headers()

    filtered_links = []
    if terms is None:
        filtered_links = links
    else:
        terms = [term.lower() for term in terms]
        for link in links:
            link_lower = link.lower()
            keep = False
            for term in terms:
                if term in link_lower:
                    keep = True
            if keep:
                filtered_links.append(link)

    # Download each PDF
    for link in filtered_links:
        # Handle relative URLs by joining with the base URL
        absolute_link = urljoin(base_url, link)
        filepath = os.path.join(output_folder, os.path.basename(absolute_link))

        try:
            download_file(
                absolute_link=absolute_link, filepath=filepath, verbosity=verbosity, headers=headers
            )
            if filepath.endswith(".zip"):
                print(f"Unzipping {filepath} to {output_folder}")
                unzip_file(
                    zip_file_path=filepath,
                    dest_parent_folder=output_folder,
                    delete_after=True,
                )
        except Exception as e:
            print(f"Error downloading {absolute_link}: {e}")
    if verbosity >= 1:
        print("Downloaded!")


def download_and_save_documents_for_locality(locality_id: int):
    with rx.session() as session:
        locality = session.exec(
            select(Locality).where(Locality.id == locality_id)
        ).one()
        existing_documents = session.exec(
            select(Document).where(Document.locality_id == locality_id).limit(10)
        ).all()
        locality_administrative_setup: LocalityAdministrativeSetup = locality.administrative_reporting_setup
        
    already_extracted_urls = set()
    for doc in existing_documents:
        already_extracted_urls.add(doc.source_url)

    files_for_all_urls = []
    for _, year_urls in locality_administrative_setup["pages_by_year"].items():
        for base_url in year_urls:
            links = extract_files_from_url(base_url)
            for link in links:
                if link in already_extracted_urls:
                    continue
                files_for_all_urls.append((base_url, link))

    headers = get_default_headers()
    output_folder = f"/tmp/observatoire/locality-{locality_id}"
    pathlib.Path(output_folder).mkdir(parents=True, exist_ok=True)

    new_documents = []
    for base_url, absolute_link in files_for_all_urls:
        filepath = os.path.join(output_folder, os.path.basename(absolute_link))

        try:
            download_file(
                absolute_link=absolute_link, filepath=filepath, headers=headers
            )
            if filepath.endswith(".zip"):
                print(f"Unzipping {filepath} to {output_folder}")
                extract_to_folder = unzip_file(
                    zip_file_path=filepath,
                    dest_parent_folder=output_folder,
                    delete_after=True,
                )
                filepaths = glob.glob(
                    os.path.join(extract_to_folder, "**", "*.pdf"),
                    recursive=True
                )
                for filepath_in_zip in filepaths:
                    new_doc = Document(
                        locality_id=locality_id,
                        file_name=os.path.basename(filepath_in_zip),
                        file_extension="pdf",
                        source_url=absolute_link,
                        base_url=base_url,
                        raw_content=load_raw_content(filepath_in_zip),
                        gzipped=False
                    )
                    new_documents.append(new_doc)
            else:
                new_doc = Document(
                    locality_id=locality_id,
                    file_name=os.path.basename(filepath),
                    file_extension="pdf",
                    source_url=absolute_link,
                    base_url=base_url,
                    raw_content=load_raw_content(filepath),
                    gzipped=False
                )
                new_documents.append(new_doc)

        except Exception as e:
            print(f"Error downloading {absolute_link}: {e}")

    with rx.session() as session:
        for new_doc in new_documents:
            session.add(new_doc)
        session.commit()


def load_raw_content(fp: str):
    with open(fp, "rb") as f:
        return f.read()
