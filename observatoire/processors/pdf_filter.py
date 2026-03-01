"""
Filter PDFs to keep only council meeting reports (compte-rendu, procès-verbal).

Uses multi-layered metadata heuristics (filename patterns, link text, URLs,
section metadata) to classify each PDF. No OCR or LLM calls needed.
"""

import json
import logging
import re
from pathlib import Path

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
