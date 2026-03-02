"""
Filter PDFs to keep only council meeting reports (compte-rendu, procès-verbal).

Uses multi-layered metadata heuristics (filename patterns, link text, URLs,
section metadata) to classify each PDF. No OCR or LLM calls needed.

For large PDFs (50+ pages), a two-tier content validation can optionally check
the first few pages for council report keywords before committing to full OCR.
"""

import io
import json
import logging
import re
from pathlib import Path

from pypdf import PdfReader, PdfWriter

logger = logging.getLogger(__name__)

# --- Internal helpers ---

# Keywords that strongly indicate a council report
_CR_PV_KEYWORDS = re.compile(
    r"compte[_\-\s]?rendu|proc[eè]s[_\-\s]?verb|registre|recueil",
    re.IGNORECASE,
)

# Abbreviations at word boundaries
_CR_PV_ABBREV = re.compile(
    r"(?:^|[\-_/\s.])(?:cr|pv)(?:[\-_/\s.]|$)",
    re.IGNORECASE,
)

# Combined report pattern: "deliberations-du-conseil-du-DATE" or "conseil-municipal-du-DATE"
# These are whole-session documents, not individual deliberations.
_COMBINED_DELIB_REPORT = re.compile(
    r"(?:"
    r"d[ée]lib[ée]rations[_\-\s]+du[_\-\s]+conseil[_\-\s]+du"
    r"|conseil[_\-\s]+municipal[_\-\s]+du"
    r"|s[ée]ance[_\-\s]+du"
    r")[_\-\s]+\d",
    re.IGNORECASE,
)

# Strict séance report pattern: filename matches "seance-du-DATE" without topic appended
_SEANCE_REPORT_STRICT = re.compile(
    r"^s[ée]ance[_\-\s]+du[_\-\s]+[\d][\d\-_\.a-z]*\.pdf$",
    re.IGNORECASE,
)

# Strong section keywords (comptes-rendus, procès-verbal) — safe for single-PDF matching
_SECTION_STRONG_KEYWORDS = re.compile(
    r"comptes?[_\-\s]?rendus?|proc[eè]s[_\-\s]?verb",
    re.IGNORECASE,
)

# Hash-like filename pattern: CMS-generated names with no meaningful words
# e.g. "4a7145_15f7369ee3b642ab84624968ca037516.pdf"
_HASH_FILENAME = re.compile(
    r"^[a-f0-9_\-]{16,}\.pdf$",
    re.IGNORECASE,
)

# Broader section keywords — only safe when filename is a hash (no other signals available)
_SECTION_BROAD_KEYWORDS = re.compile(
    r"comptes?[_\-\s]?rendus?|proc[eè]s[_\-\s]?verb|d[ée]lib[ée]rations?",
    re.IGNORECASE,
)


def _has_cr_pv_keyword(text: str) -> bool:
    """Check if text contains compte-rendu/procès-verbal keywords."""
    return bool(_CR_PV_KEYWORDS.search(text))


def _has_cr_pv_abbrev(text: str) -> bool:
    """Check if text contains CR/PV abbreviations at word boundaries."""
    return bool(_CR_PV_ABBREV.search(text))


def _is_combined_delib_report(text: str) -> bool:
    """Check if text matches combined deliberation report patterns."""
    return bool(_COMBINED_DELIB_REPORT.search(text))


def _is_seance_report_strict(filename: str) -> bool:
    """Check if filename is strictly a séance report (no topic appended)."""
    return bool(_SEANCE_REPORT_STRICT.match(filename))


def is_council_report(
    filename: str,
    link_text: str,
    file_url: str,
    section_title: str,
    source_url: str,
    section_pdf_count: int,
) -> tuple[bool, str | None]:
    """
    Classify whether a PDF is a council meeting report.

    Uses multi-layered heuristics in priority order:
    1. Filename CR/PV keywords
    2. Filename combined report patterns
    3. Metadata (link text / file URL) keywords
    4. Single-PDF section with council session title
    5. Small section (<=2 PDFs) with council source URL

    Returns:
        (is_match, reason) where reason describes which rule matched,
        or (False, None) if no match.
    """
    # Normalize for matching
    fn_lower = filename.lower()

    # Layer 1: Filename CR/PV keywords
    if _has_cr_pv_keyword(fn_lower):
        return True, "filename_crpv_keyword"

    # Layer 1b: Filename CR/PV abbreviations
    if _has_cr_pv_abbrev(fn_lower):
        return True, "filename_crpv_abbrev"

    # Layer 2: Filename combined report patterns
    if _is_combined_delib_report(fn_lower):
        return True, "filename_combined_report"

    # Layer 2b: Strict séance report filename
    if _is_seance_report_strict(filename):
        return True, "filename_seance_report"

    # Layer 3: Metadata keywords (link text and file URL)
    for text, label in [(link_text, "linktext"), (file_url, "fileurl")]:
        if not text:
            continue
        text_lower = text.lower()
        if _has_cr_pv_keyword(text_lower):
            return True, f"metadata_{label}_crpv_keyword"
        if _has_cr_pv_abbrev(text_lower):
            return True, f"metadata_{label}_crpv_abbrev"
        if _is_combined_delib_report(text_lower):
            return True, f"metadata_{label}_combined_report"

    # Layer 4: Single-PDF section with council keywords in title or source URL
    if section_pdf_count == 1:
        # 4a: Strong keywords (comptes-rendus, procès-verbal) always match
        for text in [section_title, source_url]:
            if text and _SECTION_STRONG_KEYWORDS.search(text):
                return True, "section_single_pdf_council"
        # 4b: Broader keywords (includes délibérations) only for hash-named files
        # Hash filenames come from CMS platforms and carry no filename signal
        if _HASH_FILENAME.match(filename):
            for text in [section_title, source_url]:
                if text and _SECTION_BROAD_KEYWORDS.search(text):
                    return True, "section_single_pdf_hash_council"

    # Layer 5: Small section (<=2 PDFs) with strong council keywords in source URL
    if section_pdf_count <= 2:
        if source_url and _SECTION_STRONG_KEYWORDS.search(source_url):
            return True, "section_small_council_url"

    return False, None


def filter_city_pdfs(city_dir: Path) -> dict:
    """
    Analyze one city directory and classify its PDFs.

    Args:
        city_dir: Path to a city directory containing section_XXXX subdirectories.

    Returns:
        Dict with keys: city, total_pdfs, matched_pdfs, files (matched),
        excluded_files (unmatched), and per-reason stats.
    """
    city_name = city_dir.name
    matched_files = []
    excluded_files = []

    section_dirs = sorted(city_dir.glob("section_*"))

    for section_dir in section_dirs:
        section_json = section_dir / "section.json"
        if not section_json.exists():
            continue

        try:
            section_data = json.loads(section_json.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as e:
            logger.warning("Failed to read %s: %s", section_json, e)
            continue

        section_title = section_data.get("title", "")
        source_url = section_data.get("source_url", "")
        files = section_data.get("files", [])

        # Count actual PDFs in this section
        pdf_files = [f for f in files if f.get("filename", "").lower().endswith(".pdf")]
        section_pdf_count = len(pdf_files)

        for file_info in pdf_files:
            filename = file_info.get("filename", "")
            link_text = file_info.get("text", "")
            file_url = file_info.get("url", "")

            # Check if file actually exists on disk
            file_path = section_dir / filename
            if not file_path.exists():
                continue

            is_match, reason = is_council_report(
                filename=filename,
                link_text=link_text,
                file_url=file_url,
                section_title=section_title,
                source_url=source_url,
                section_pdf_count=section_pdf_count,
            )

            relative_path = f"{section_dir.name}/{filename}"

            entry = {
                "path": relative_path,
                "section_title": section_title.strip(),
                "url": file_url,
            }

            if is_match:
                entry["reason"] = reason
                matched_files.append(entry)
            else:
                excluded_files.append(entry)

    # Compute per-reason stats
    reason_counts: dict[str, int] = {}
    for f in matched_files:
        r = f["reason"]
        reason_counts[r] = reason_counts.get(r, 0) + 1

    return {
        "city": city_name,
        "total_pdfs": len(matched_files) + len(excluded_files),
        "matched_pdfs": len(matched_files),
        "files": matched_files,
        "excluded_files": excluded_files,
        "reason_counts": reason_counts,
    }


def filter_all_cities(
    cities_dir: Path,
    city_names: list[str] | None = None,
) -> dict:
    """
    Run PDF filtering across all cities.

    Args:
        cities_dir: Path to directory containing city subdirectories.
        city_names: If provided, only process these city folder names.

    Returns:
        Dict with keys: cities (list of per-city results), total_pdfs,
        total_matched, total_excluded.
    """
    city_dirs = sorted(
        d for d in cities_dir.iterdir()
        if d.is_dir() and not d.name.startswith(".")
    )

    if city_names:
        city_name_set = set(city_names)
        city_dirs = [d for d in city_dirs if d.name in city_name_set]

    results = []
    total_pdfs = 0
    total_matched = 0

    for city_dir in city_dirs:
        # Skip non-city entries (e.g. zip files show as dirs sometimes)
        if not any(city_dir.glob("section_*")):
            continue

        city_result = filter_city_pdfs(city_dir)
        results.append(city_result)
        total_pdfs += city_result["total_pdfs"]
        total_matched += city_result["matched_pdfs"]

    return {
        "cities": results,
        "total_pdfs": total_pdfs,
        "total_matched": total_matched,
        "total_excluded": total_pdfs - total_matched,
    }


def generate_report(results: dict, verbose: bool = False, list_excluded: bool = False) -> str:
    """
    Produce a human-readable summary of filtering results.

    Args:
        results: Output from filter_all_cities().
        verbose: If True, show per-city details.
        list_excluded: If True, also list excluded files.

    Returns:
        Formatted report string.
    """
    lines = []
    total = results["total_pdfs"]
    matched = results["total_matched"]
    excluded = results["total_excluded"]
    pct = (excluded / total * 100) if total > 0 else 0

    lines.append(f"PDF Filter Results")
    lines.append(f"{'=' * 50}")
    lines.append(f"Total PDFs found:    {total:,}")
    lines.append(f"Matched (to keep):   {matched:,}")
    lines.append(f"Excluded:            {excluded:,}")
    lines.append(f"Reduction:           {pct:.1f}%")
    lines.append(f"Cities processed:    {len(results['cities'])}")

    # Aggregate reason counts
    all_reasons: dict[str, int] = {}
    for city in results["cities"]:
        for reason, count in city.get("reason_counts", {}).items():
            all_reasons[reason] = all_reasons.get(reason, 0) + count

    if all_reasons:
        lines.append(f"\nMatch reasons:")
        for reason, count in sorted(all_reasons.items(), key=lambda x: -x[1]):
            lines.append(f"  {reason}: {count:,}")

    # Cities with 0 matches
    zero_cities = [c["city"] for c in results["cities"] if c["matched_pdfs"] == 0]
    if zero_cities:
        lines.append(f"\nCities with 0 matches ({len(zero_cities)}):")
        for city in zero_cities:
            lines.append(f"  - {city}")

    if verbose:
        lines.append(f"\nPer-city details:")
        lines.append(f"{'-' * 50}")
        for city in sorted(results["cities"], key=lambda c: c["city"]):
            lines.append(
                f"  {city['city']}: {city['matched_pdfs']}/{city['total_pdfs']} matched"
            )
            if list_excluded and city["excluded_files"]:
                for f in city["excluded_files"]:
                    lines.append(f"    EXCLUDED: {f['path']}")

    return "\n".join(lines)


def build_manifest(results: dict) -> list[dict]:
    """
    Build a JSON-serializable manifest from filter results.

    Returns a list of per-city manifest entries (only matched files,
    without excluded_files or reason_counts).
    """
    manifest = []
    for city in results["cities"]:
        manifest.append({
            "city": city["city"],
            "total_pdfs": city["total_pdfs"],
            "matched_pdfs": city["matched_pdfs"],
            "files": city["files"],
        })
    return manifest


def deduplicate_manifest_by_url(manifest: list[dict]) -> tuple[list[dict], dict]:
    """
    Remove duplicate PDFs that share the same source URL across sections.

    Some city websites publish the same PDF on multiple pages (e.g. one per
    deliberation). The scraper downloads it into each section, so the manifest
    contains N copies. This function keeps only the first occurrence per URL.

    Args:
        manifest: List of per-city manifest entries from build_manifest().

    Returns:
        (deduplicated_manifest, stats) where stats contains:
          - duplicates_removed: total number of duplicate entries removed
          - per_city: dict of city_name -> duplicates removed count
    """
    stats: dict = {"duplicates_removed": 0, "per_city": {}}
    deduped_manifest = []

    for city_entry in manifest:
        city_name = city_entry["city"]
        seen_urls: set[str] = set()
        kept_files = []
        removed = 0

        for file_entry in city_entry["files"]:
            url = file_entry.get("url", "").strip()
            if url and url in seen_urls:
                removed += 1
                continue
            if url:
                seen_urls.add(url)
            kept_files.append(file_entry)

        if removed > 0:
            stats["per_city"][city_name] = removed
            stats["duplicates_removed"] += removed

        deduped_entry = dict(city_entry)
        deduped_entry["files"] = kept_files
        deduped_entry["matched_pdfs"] = len(kept_files)
        deduped_manifest.append(deduped_entry)

    return deduped_manifest, stats


def generate_dedup_report(stats: dict) -> str:
    """Produce a human-readable summary of URL deduplication results."""
    removed = stats["duplicates_removed"]
    if removed == 0:
        return "\nURL deduplication: no duplicates found."

    lines = [
        "",
        "URL Deduplication Results",
        "=" * 50,
        f"Duplicates removed:  {removed:,}",
    ]

    if stats["per_city"]:
        lines.append("\nPer city:")
        for city, count in sorted(stats["per_city"].items(), key=lambda x: -x[1]):
            lines.append(f"  {city}: {count:,} duplicates removed")

    return "\n".join(lines)


# --- Large PDF content validation ---

# Keyword categories for council report content detection.
# Require >=2 distinct categories matched to classify as a council report.
_COUNCIL_CONTENT_PATTERNS: dict[str, re.Pattern] = {
    "conseil_municipal": re.compile(r"conseil\s+municipal", re.IGNORECASE),
    "pv_cr": re.compile(r"proc[èe]s[- ]verbal|compte[- ]rendu", re.IGNORECASE),
    "deliberation": re.compile(r"d[ée]lib[ée]ration", re.IGNORECASE),
    "seance": re.compile(r"s[ée]ance\s+du|ordre\s+du\s+jour", re.IGNORECASE),
    "elus": re.compile(
        r"maire|adjoint|conseillers?\s+municipa", re.IGNORECASE
    ),
    "attendance": re.compile(
        r"pr[ée]sents?|excus[ée]s?|secr[ée]taire\s+de\s+s[ée]ance", re.IGNORECASE
    ),
    "vote": re.compile(r"vote|adopt[ée]|unanimit[ée]", re.IGNORECASE),
}


def extract_text_from_pages(pdf_path: Path, max_pages: int = 3) -> str:
    """Extract text from the first N pages of a PDF using PyPDF."""
    reader = PdfReader(pdf_path)
    pages_to_read = min(max_pages, len(reader.pages))
    parts = []
    for i in range(pages_to_read):
        text = reader.pages[i].extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def extract_pages_as_pdf_bytes(pdf_path: Path, max_pages: int = 3) -> bytes:
    """Create an in-memory PDF containing only the first N pages."""
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    pages_to_copy = min(max_pages, len(reader.pages))
    for i in range(pages_to_copy):
        writer.add_page(reader.pages[i])
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def has_council_content(
    text: str, min_categories: int = 2
) -> tuple[bool, list[str]]:
    """
    Check if text contains council report keywords from multiple categories.

    Returns (is_council, matched_categories).
    """
    matched = [
        name
        for name, pattern in _COUNCIL_CONTENT_PATTERNS.items()
        if pattern.search(text)
    ]
    return len(matched) >= min_categories, matched


def validate_large_pdf(
    pdf_path: Path,
    mistral_client=None,
    max_preview_pages: int = 3,
) -> dict:
    """
    Validate whether a large PDF is actually a council report.

    Tier 1: Extract text with PyPDF. If enough text is found (>100 chars),
    check for council keywords.

    Tier 2: If the PDF is scanned (<100 chars of text), create a subset PDF
    and send to Mistral OCR, then check the OCR output for keywords.

    On any error, defaults to keeping the PDF (conservative).

    Returns dict with keys: keep, method, categories, error (optional).
    """
    try:
        text = extract_text_from_pages(pdf_path, max_pages=max_preview_pages)
    except Exception as e:
        logger.warning("Failed to read %s with PyPDF: %s", pdf_path, e)
        return {"keep": True, "method": "error_fallback", "categories": [], "error": str(e)}

    # Tier 1: text-based check
    if len(text.strip()) > 100:
        is_council, categories = has_council_content(text)
        return {
            "keep": is_council,
            "method": "text_extraction",
            "categories": categories,
        }

    # Tier 2: scanned PDF — use OCR on first few pages
    if mistral_client is None:
        logger.info("No Mistral client for scanned PDF %s, keeping by default", pdf_path)
        return {"keep": True, "method": "no_ocr_client", "categories": []}

    try:
        subset_bytes = extract_pages_as_pdf_bytes(pdf_path, max_pages=max_preview_pages)
    except Exception as e:
        logger.warning("Failed to extract pages from %s: %s", pdf_path, e)
        return {"keep": True, "method": "error_fallback", "categories": [], "error": str(e)}

    try:
        from observatoire.processors.llm import ocr_pdf

        ocr_result = ocr_pdf(mistral_client, bytes=subset_bytes)
        ocr_text = "\n".join(
            page.markdown for page in ocr_result.pages if page.markdown
        )
    except Exception as e:
        logger.warning("OCR failed for %s: %s", pdf_path, e)
        return {"keep": True, "method": "error_fallback", "categories": [], "error": str(e)}

    is_council, categories = has_council_content(ocr_text)
    return {
        "keep": is_council,
        "method": "ocr_validation",
        "categories": categories,
    }


def _get_page_count(pdf_path: Path) -> int | None:
    """Return number of pages in a PDF, or None on error."""
    try:
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except Exception:
        return None


def validate_large_pdfs_in_manifest(
    manifest: list[dict],
    cities_dir: Path,
    page_threshold: int = 50,
    mistral_client=None,
) -> tuple[list[dict], dict]:
    """
    Validate large PDFs in a manifest and remove those that aren't council reports.

    Args:
        manifest: List of per-city manifest entries from build_manifest().
        cities_dir: Base path to city directories.
        page_threshold: Only validate PDFs with >= this many pages.
        mistral_client: Optional Mistral client for Tier 2 OCR validation.

    Returns:
        (updated_manifest, stats) where stats has validation summary info.
    """
    stats = {
        "total_large": 0,
        "validated_keep": 0,
        "validated_exclude": 0,
        "errors": 0,
        "pages_before": 0,
        "pages_after": 0,
        "by_method": {},
        "excluded_files": [],
    }

    updated_manifest = []
    for city_entry in manifest:
        city_name = city_entry["city"]
        city_dir = cities_dir / city_name
        kept_files = []

        for file_entry in city_entry["files"]:
            pdf_path = city_dir / file_entry["path"]
            page_count = _get_page_count(pdf_path)

            if page_count is None or page_count < page_threshold:
                # Small PDF or unreadable — keep as-is
                kept_files.append(file_entry)
                if page_count is not None:
                    stats["pages_before"] += page_count
                    stats["pages_after"] += page_count
                continue

            # Large PDF — validate
            stats["total_large"] += 1
            stats["pages_before"] += page_count

            logger.info(
                "Validating large PDF (%d pages): %s/%s",
                page_count, city_name, file_entry["path"],
            )

            result = validate_large_pdf(
                pdf_path,
                mistral_client=mistral_client,
            )

            method = result["method"]
            stats["by_method"][method] = stats["by_method"].get(method, 0) + 1

            if result.get("error"):
                stats["errors"] += 1

            if result["keep"]:
                stats["validated_keep"] += 1
                stats["pages_after"] += page_count
                file_entry["validation"] = {
                    "method": method,
                    "categories": result["categories"],
                    "pages": page_count,
                }
                kept_files.append(file_entry)
            else:
                stats["validated_exclude"] += 1
                stats["excluded_files"].append({
                    "city": city_name,
                    "path": file_entry["path"],
                    "pages": page_count,
                    "method": method,
                    "categories": result["categories"],
                })

        updated_entry = dict(city_entry)
        updated_entry["files"] = kept_files
        updated_entry["matched_pdfs"] = len(kept_files)
        updated_manifest.append(updated_entry)

    return updated_manifest, stats


def generate_validation_report(stats: dict) -> str:
    """Produce a human-readable summary of large PDF validation results."""
    lines = [
        "",
        "Large PDF Validation Results",
        "=" * 50,
        f"Large PDFs checked:     {stats['total_large']:,}",
        f"  Kept:                 {stats['validated_keep']:,}",
        f"  Excluded:             {stats['validated_exclude']:,}",
        f"  Errors (kept):        {stats['errors']:,}",
        f"Pages before:           {stats['pages_before']:,}",
        f"Pages after:            {stats['pages_after']:,}",
        f"Pages saved:            {stats['pages_before'] - stats['pages_after']:,}",
    ]

    if stats["by_method"]:
        lines.append("\nValidation methods:")
        for method, count in sorted(stats["by_method"].items(), key=lambda x: -x[1]):
            lines.append(f"  {method}: {count:,}")

    if stats["excluded_files"]:
        lines.append(f"\nExcluded files ({len(stats['excluded_files'])}):")
        for entry in stats["excluded_files"]:
            cats = ", ".join(entry["categories"]) if entry["categories"] else "none"
            lines.append(
                f"  {entry['city']}/{entry['path']} "
                f"({entry['pages']} pages, categories: {cats})"
            )

    return "\n".join(lines)
