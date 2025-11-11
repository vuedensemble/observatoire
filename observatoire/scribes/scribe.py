import os
import pathlib
from urllib.parse import urljoin
import zipfile

import requests
from bs4 import BeautifulSoup


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
                absolute_link=absolute_link, filepath=filepath, verbosity=verbosity
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
