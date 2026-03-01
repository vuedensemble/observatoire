import argparse
import json
from pathlib import Path
import statistics
from pypdf import PdfReader
from tqdm import tqdm


def count_pages(pdf_path: Path) -> int:
    try:
        reader = PdfReader(str(pdf_path))
        return len(reader.pages)
    except Exception as e:
        return 0


def load_manifest_paths(manifest_path: str, base_dir: Path) -> set[Path]:
    """Load PDF paths from a filter manifest JSON file."""
    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)
    paths = set()
    for city_entry in manifest:
        city = city_entry["city"]
        for file_entry in city_entry.get("files", []):
            paths.add(base_dir / city / file_entry["path"])
    return paths


def main():
    parser = argparse.ArgumentParser(description="Count pages in PDF files")
    parser.add_argument(
        "--manifest",
        help="Path to filter manifest JSON (from filter-pdfs). Only count pages for matched PDFs.",
    )
    args = parser.parse_args()

    # Find PDFs
    pdf_dir = Path('datasets/cities')

    if args.manifest:
        allowed = load_manifest_paths(args.manifest, pdf_dir)
        pdf_files = sorted(p for p in allowed if p.exists())
        print(f'Found {len(pdf_files)} PDF files from manifest ({len(allowed)} listed)')
    else:
        pdf_files = list(pdf_dir.rglob('*.pdf'))
        print(f'Found {len(pdf_files)} PDF files')
    print()

    # Count pages for each PDF
    page_counts = []
    errors = []
    for pdf in tqdm(pdf_files, desc="Processing PDFs"):
        count = count_pages(pdf)
        if count > 0:
            page_counts.append(count)
        else:
            errors.append(pdf)

    # Calculate statistics
    total_pages = sum(page_counts)
    num_pdfs = len(page_counts)

    print('=== PDF Page Statistics ===')
    print(f'Total PDFs processed: {num_pdfs}')
    print(f'PDFs with errors: {len(errors)}')
    print(f'Total pages: {total_pages}')
    print()

    if page_counts:
        print(f'Mean pages per PDF: {statistics.mean(page_counts):.2f}')
        print(f'Median pages per PDF: {statistics.median(page_counts):.2f}')
        if len(page_counts) > 1:
            print(f'Std deviation: {statistics.stdev(page_counts):.2f}')
        print(f'Min pages: {min(page_counts)}')
        print(f'Max pages: {max(page_counts)}')
        print()

        # Distribution
        print('=== Page Distribution ===')
        ranges = [(1, 1), (2, 5), (6, 10), (11, 20), (21, 50), (51, 100), (101, float('inf'))]
        for low, high in ranges:
            count = sum(1 for p in page_counts if low <= p <= high)
            if high == float('inf'):
                label = f'{low}+'
            elif low == high:
                label = f'{low}'
            else:
                label = f'{low}-{int(high)}'
            print(f'  {label} pages: {count} PDFs')


if __name__ == '__main__':
    main()
