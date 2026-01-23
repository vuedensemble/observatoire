import csv
import glob
import json
import logging
import os
import pathlib
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse

from observatoire.processors.html_scraper import pipeline
from observatoire.processors.llm import classify_sections_by_city
from observatoire.processors.pdf_scraper import (
    download_html_contents_from_url,
    download_file,
    unzip_file,
    get_default_headers,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(name)s - %(message)s")
logger = logging.getLogger(__name__)


def get_base_url(url: str) -> str:
    """Extract the base URL (scheme + netloc) from a URL."""
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"


def is_same_base_url(url: str, base_url: str) -> str:
    """Check if a URL belongs to the same base URL."""
    return get_base_url(url) == base_url


def filter_pdf_links(sections: list) -> list:
    """Filter sections to only keep chunks that link to PDF files."""
    filtered_sections = []
    for section in sections:
        pdf_chunks = [
            chunk for chunk in section.get("chunks", [])
            if chunk.get("link", "").lower().endswith(".pdf") or chunk.get("link", "").lower().endswith(".zip")
        ]
        if pdf_chunks:
            filtered_sections.append({
                "title": section.get("title", ""),
                "chunks": pdf_chunks,
            })
    return filtered_sections


def crawl(
    url: str,
    base_url: str,
    visited: frozenset,
    results: dict,
    errors: dict,
    depth: int = 0,
    max_depth: int | None = None,
) -> tuple[frozenset, dict, dict]:
    """
    Crawl a single URL and recursively crawl all links matching the base URL.

    Args:
        url: The URL to crawl
        base_url: The base URL (scheme + netloc) to match against
        visited: Frozenset of already visited URLs
        results: Dict mapping visited URLs to pipeline output
        errors: Dict mapping URLs to error messages
        depth: Current recursion depth
        max_depth: Maximum recursion depth (None for unlimited)

    Returns:
        Tuple of (visited, results, errors) with updated values
    """
    if url in visited:
        logger.info("Skipping already visited: %s", url)
        return visited, results, errors
    if max_depth is not None and depth > max_depth:
        logger.info("Skipping max depth reached: %s", url)
        return visited, results, errors

    logger.info("Crawling: %s (depth=%d)", url, depth)
    visited = visited | {url}

    try:
        response = download_html_contents_from_url(url)
        if response.status_code != 200:
            logger.warning("HTTP error %d for: %s", response.status_code, url)
            return visited, results, {**errors, url: f"HTTP {response.status_code}"}

        html_content = response.text
        sections = pipeline(html_content, source_url=url)
        pdf_sections = filter_pdf_links(sections)
        results = {**results, url: pdf_sections}

        # Extract all links and recursively crawl matching ones
        for section in sections:
            for chunk in section.get("chunks", []):
                link = chunk.get("link", "")
                if not link:
                    continue

                # Resolve relative URLs
                absolute_url = urljoin(url, link)

                # Only crawl URLs from the same domain
                if not is_same_base_url(absolute_url, base_url):
                    logger.info("Skipping external URL: %s", absolute_url)
                    continue

                # Skip non-HTML resources
                parsed = urlparse(absolute_url)
                path_lower = parsed.path.lower()
                if path_lower.endswith(('.pdf', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.xls', '.xlsx')):
                    logger.info("Skipping non-HTML resource: %s", absolute_url)
                    continue

                visited, results, errors = crawl(
                    url=absolute_url,
                    base_url=base_url,
                    visited=visited,
                    results=results,
                    errors=errors,
                    depth=depth + 1,
                    max_depth=max_depth,
                )

    except Exception as e:
        logger.error("Exception crawling %s: %s", url, e)
        return visited, results, {**errors, url: str(e)}

    return visited, results, errors


def crawl_website(original_url: str, max_depth: int | None = None) -> dict:
    """
    Recursively crawl a website starting from original_url.

    Uses the pipeline function from html_scraper to extract links from each page,
    then recursively explores all URLs that match the base URL of the original_url.

    Args:
        original_url: The starting URL to crawl
        max_depth: Maximum recursion depth (None for unlimited)

    Returns:
        A dict with:
        - 'visited': set of all visited URLs
        - 'results': dict mapping each visited URL to its pipeline output
        - 'errors': dict mapping URLs to error messages for failed fetches
    """
    base_url = get_base_url(original_url)

    visited, results, errors = crawl(
        url=original_url,
        base_url=base_url,
        visited=frozenset(),
        results={},
        errors={},
        depth=0,
        max_depth=max_depth,
    )

    return {
        "visited": visited,
        "results": results,
        "errors": errors,
    }


def sanitize_folder_name(name: str) -> str:
    """Sanitize a string to be used as a folder name."""
    return "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in name)


def create_section_metadata_from_crawl(city_folder: str) -> int:
    """
    Create section folders and section.json metadata without downloading files.

    Args:
        city_folder: Path to the city folder containing crawl_output.json

    Returns:
        Number of sections created
    """
    crawl_output_path = os.path.join(city_folder, "crawl_output.json")
    with open(crawl_output_path, "r", encoding="utf-8") as f:
        crawl_data = json.load(f)

    results = crawl_data.get("results", {})
    total_sections = sum(len(sections) for sections in results.values())
    logger.info("Creating metadata for %d sections...", total_sections)

    section_index = 0

    for page_url, sections in results.items():
        for section in sections:
            section_index += 1
            section_folder = os.path.join(city_folder, f"section_{section_index:04d}")
            pathlib.Path(section_folder).mkdir(parents=True, exist_ok=True)

            # Build files list from chunks (without downloading)
            files = []
            for chunk in section.get("chunks", []):
                link = chunk.get("link", "")
                if not link:
                    continue
                absolute_url = urljoin(page_url, link)
                filename = os.path.basename(urlparse(absolute_url).path)
                files.append({
                    "url": absolute_url,
                    "text": chunk.get("text", ""),
                    "filename": filename,
                })

            section_metadata = {
                "title": section.get("title", ""),
                "source_url": page_url,
                "files": files,
            }

            section_metadata_path = os.path.join(section_folder, "section.json")
            with open(section_metadata_path, "w", encoding="utf-8") as f:
                json.dump(section_metadata, f, ensure_ascii=False, indent=2)

    logger.info("Created %d section metadata files", section_index)
    return section_index


def download_files_from_crawl(city_folder: str, section_filter: set[str] | None = None) -> int:
    """
    Download files for sections in a city folder.

    Args:
        city_folder: Path to the city folder containing section_* subfolders
        section_filter: Optional set of section folder names to process (e.g., {"section_0001", "section_0003"}).
                       If None, all sections are processed.

    Returns:
        Number of sections processed
    """
    section_folders = sorted([
        entry for entry in os.listdir(city_folder)
        if os.path.isdir(os.path.join(city_folder, entry)) and entry.startswith("section_")
    ])

    if section_filter is not None:
        section_folders = [s for s in section_folders if s in section_filter]

    total_sections = len(section_folders)
    logger.info("Downloading files from %d sections...", total_sections)

    headers = get_default_headers()

    for idx, section_name in enumerate(section_folders, 1):
        section_folder = os.path.join(city_folder, section_name)
        section_json_path = os.path.join(section_folder, "section.json")

        with open(section_json_path, "r", encoding="utf-8") as f:
            section_metadata = json.load(f)

        section_title = section_metadata.get("title", "")[:50]
        files = section_metadata.get("files", [])
        num_files = len(files)
        logger.info("Section %d/%d (%s): '%s' (%d files)", idx, total_sections, section_name, section_title, num_files)

        for file_index, file_entry in enumerate(files, 1):
            url = file_entry.get("url", "")
            filename = file_entry.get("filename", "")
            if not url or not filename:
                continue

            filepath = os.path.join(section_folder, filename)

            try:
                logger.info("  Downloading file %d/%d: %s", file_index, num_files, filename)
                download_file(url, filepath, verbosity=0, headers=headers)

                if filepath.lower().endswith(".zip"):
                    extract_folder = unzip_file(
                        zip_file_path=filepath,
                        dest_parent_folder=section_folder,
                        delete_after=True,
                    )
                    pdf_files = glob.glob(
                        os.path.join(extract_folder, "**", "*.pdf"),
                        recursive=True,
                    )
                    file_entry["extracted_pdfs"] = [
                        os.path.relpath(pdf, section_folder) for pdf in pdf_files
                    ]
                    logger.info("Extracted %d PDFs from ZIP", len(pdf_files))

            except Exception as e:
                logger.error("Failed to download %s: %s", url, e)
                file_entry["error"] = str(e)

        # Update section.json with any changes (extracted_pdfs, errors)
        with open(section_json_path, "w", encoding="utf-8") as f:
            json.dump(section_metadata, f, ensure_ascii=False, indent=2)

    return total_sections


def scrape_city(
    city_name: str,
    original_url: str,
    output_base_dir: str = "./datasets/cities",
    max_depth: int | None = None,
) -> dict:
    """
    Scrape a city website, download all PDFs/ZIPs, and store results.

    Args:
        city_name: Name of the city (used for folder name)
        original_url: The starting URL to crawl
        output_base_dir: Base directory for output folders
        max_depth: Maximum crawl depth (None for unlimited)

    Returns:
        Dict with city_folder path and crawl results
    """
    logger.info("Starting scrape for city: %s", city_name)
    logger.info("Original URL: %s", original_url)

    city_folder = os.path.join(output_base_dir, sanitize_folder_name(city_name))
    pathlib.Path(city_folder).mkdir(parents=True, exist_ok=True)
    logger.info("Created city folder: %s", city_folder)

    logger.info("Crawling website...")
    crawl_result = crawl_website(original_url, max_depth=max_depth)

    total_pages = len(crawl_result["results"])
    total_sections = sum(len(sections) for sections in crawl_result["results"].values())
    total_errors = len(crawl_result["errors"])
    logger.info("Crawl complete: %d pages, %d sections, %d errors", total_pages, total_sections, total_errors)

    # Store full crawl output as JSON (convert frozenset to list for JSON serialization)
    crawl_output_path = os.path.join(city_folder, "crawl_output.json")
    crawl_output_serializable = {
        "visited": list(crawl_result["visited"]),
        "results": crawl_result["results"],
        "errors": crawl_result["errors"],
    }
    with open(crawl_output_path, "w", encoding="utf-8") as f:
        json.dump(crawl_output_serializable, f, ensure_ascii=False, indent=2)
    logger.info("Saved crawl output to: %s", crawl_output_path)

    logger.info("Completed crawling city %s", city_name)

    return {
        "city_folder": city_folder,
        "crawl_result": crawl_result,
    }


def is_valid_url(url: str) -> bool:
    """Check if a string is a valid URL (not 'pas de site web' or similar)."""
    if not url:
        return False
    url_lower = url.lower().strip()
    if url_lower in ("pas de site web", "n/a", ""):
        return False
    return url_lower.startswith("http://") or url_lower.startswith("https://")


def is_folder_empty(folder_path: str) -> bool:
    """Check if a folder doesn't exist or is empty."""
    if not os.path.exists(folder_path):
        return True
    return len(os.listdir(folder_path)) == 0


def process_single_city(
    city_name: str,
    url: str,
    output_base_dir: str,
    max_depth: int | None,
    city_index: int,
    total_cities: int,
) -> dict:
    """
    Process a single city: crawl, classify sections, and download municipal council files.

    Args:
        city_name: Name of the city
        url: URL to crawl
        output_base_dir: Base directory for output folders
        max_depth: Maximum crawl depth
        city_index: 1-based index of this city in the processing queue
        total_cities: Total number of cities to process

    Returns:
        Dict with processing results
    """
    progress = f"[{city_index}/{total_cities}]"

    # Step 1: Crawl website and save crawl_output.json
    logger.info("%s %s: Starting crawl...", progress, city_name)
    result = scrape_city(
        city_name=city_name,
        original_url=url,
        output_base_dir=output_base_dir,
        max_depth=max_depth,
    )
    city_folder = result["city_folder"]

    # Step 2: Create section metadata (without downloading files)
    logger.info("%s %s: Creating section metadata...", progress, city_name)
    create_section_metadata_from_crawl(city_folder)

    # Step 3: Classify sections using LLM
    logger.info("%s %s: Classifying sections...", progress, city_name)
    classify_sections_by_city(
        cities_dir=output_base_dir,
        city_names=[sanitize_folder_name(city_name)],
    )

    # Step 4: Read classification results and filter for municipal council sections
    classification_path = os.path.join(city_folder, "municipal_council_section_check.json")
    municipal_sections = set()
    if os.path.exists(classification_path):
        with open(classification_path, "r", encoding="utf-8") as f:
            classifications = json.load(f)
        for section_name, classification in classifications.items():
            if classification.get("est_conseil_municipal", False):
                municipal_sections.add(section_name)
        logger.info("%s %s: Found %d municipal council sections", progress, city_name, len(municipal_sections))
    else:
        logger.warning("%s %s: No classification file found, skipping downloads", progress, city_name)

    # Step 5: Download files only for municipal council sections
    if municipal_sections:
        logger.info("%s %s: Downloading files...", progress, city_name)
        download_files_from_crawl(city_folder, section_filter=municipal_sections)

    logger.info("%s %s: Done", progress, city_name)
    return {"city": city_name, "result": result, "municipal_sections": len(municipal_sections)}


def scrape_cities_from_csv(
    csv_path: str,
    output_base_dir: str = "./datasets/cities",
    max_depth: int | None = None,
    skip_non_empty: bool = True,
    parallel_workers: int = 5,
) -> list[dict]:
    """
    Read a CSV file and run scrape_city on each row with a valid URL.

    CSV format expected:
    - Column 0: Commune (city name)
    - Column 1: Année (year, optional - appended to city name if present)
    - Column 3: Site web des conseils municipaux (URL or "pas de site web")

    Args:
        csv_path: Path to the CSV file
        output_base_dir: Base directory for output folders
        max_depth: Maximum crawl depth (None for unlimited)
        skip_non_empty: If True, skip cities whose folder already has content
        parallel_workers: Number of cities to process in parallel (default: 5)

    Returns:
        List of results from scrape_city for each processed city
    """
    results = []
    skipped = []
    errors = []

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # Skip header row
        rows = list(reader)

    logger.info("Loaded %d rows from CSV: %s", len(rows), csv_path)

    # Filter rows and build list of cities to process
    cities_to_process = []
    for row_index, row in enumerate(rows, 1):
        if len(row) < 4:
            logger.warning("Row %d: not enough columns, skipping", row_index)
            continue

        commune = row[0].strip()
        annee = row[1].strip() if len(row) > 1 else ""
        url = row[3].strip() if len(row) > 3 else ""
        type_de_site = row[4].strip().lower() if len(row) > 4 else ""

        # Build city name (include year if present)
        city_name = f"{commune}_{annee}" if annee else commune

        # Skip sites with browser-based readers (no direct PDF links)
        if "liseuse" in type_de_site:
            logger.info("Row %d (%s): liseuse web (no PDF), skipping", row_index, city_name)
            skipped.append({"city": city_name, "reason": "liseuse web"})
            continue

        if not is_valid_url(url):
            logger.info("Row %d (%s): no valid URL, skipping", row_index, city_name)
            skipped.append({"city": city_name, "reason": "no valid URL"})
            continue

        city_folder = os.path.join(output_base_dir, sanitize_folder_name(city_name))
        if skip_non_empty and not is_folder_empty(city_folder):
            logger.info("Row %d (%s): folder not empty, skipping", row_index, city_name)
            skipped.append({"city": city_name, "reason": "folder not empty"})
            continue

        cities_to_process.append({"city_name": city_name, "url": url})

    total_cities = len(cities_to_process)
    logger.info("Will process %d cities with %d parallel workers", total_cities, parallel_workers)

    # Process cities in parallel
    with ThreadPoolExecutor(max_workers=parallel_workers) as executor:
        future_to_city = {
            executor.submit(
                process_single_city,
                city["city_name"],
                city["url"],
                output_base_dir,
                max_depth,
                idx,
                total_cities,
            ): city["city_name"]
            for idx, city in enumerate(cities_to_process, 1)
        }

        for future in as_completed(future_to_city):
            city_name = future_to_city[future]
            try:
                result = future.result()
                results.append(result)
                logger.info("Completed %s: %d municipal sections", city_name, result.get("municipal_sections", 0))
            except Exception as e:
                logger.error("Error processing %s: %s", city_name, e)
                errors.append({"city": city_name, "error": str(e)})

    logger.info("CSV processing complete: %d processed, %d skipped, %d errors",
                len(results), len(skipped), len(errors))

    return {
        "processed": results,
        "skipped": skipped,
        "errors": errors,
    }
