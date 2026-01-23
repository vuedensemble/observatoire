#!/usr/bin/env python
import argparse
import logging

from observatoire.processors.e2e import scrape_cities_from_csv
from observatoire.processors.llm import classify_sections_by_city, ocr_folder


def scrape_command(args):
    if args.verbose:
        logging.getLogger().setLevel(logging.INFO)

    if args.list:
        results = scrape_cities_from_csv(
            csv_path=args.csv_path,
            output_base_dir=args.output_dir,
            skip_non_empty=not args.no_skip,
            city_names=args.cities if args.cities else None,
            list_only=True,
        )
        to_process = results["to_process"]
        skipped = results["skipped"]

        print(f"Cities to process ({len(to_process)}):")
        for city in to_process:
            print(f"  {city['city_name']}: {city['url']}")

        if skipped:
            print(f"\nSkipped ({len(skipped)}):")
            for city in skipped:
                print(f"  {city['city']}: {city['reason']}")
        return

    results = scrape_cities_from_csv(
        csv_path=args.csv_path,
        output_base_dir=args.output_dir,
        max_depth=args.max_depth,
        skip_non_empty=not args.no_skip,
        parallel_workers=args.parallel_workers,
        city_names=args.cities if args.cities else None,
    )

    print(f"\nSummary:")
    print(f"  Processed: {len(results['processed'])}")
    print(f"  Skipped: {len(results['skipped'])}")
    print(f"  Errors: {len(results['errors'])}")


def classify_command(args):
    if args.verbose:
        logging.getLogger().setLevel(logging.INFO)

    classify_sections_by_city(
        cities_dir=args.cities_dir,
        city_names=args.cities if args.cities else None,
    )


def ocr_command(args):
    if args.verbose:
        logging.getLogger().setLevel(logging.INFO)

    results = ocr_folder(
        folder_path=args.folder,
        recursive=True,
        skip_existing=not args.no_skip,
        model=args.model,
        include_image_base64=not args.no_images,
    )

    print(f"Processed {len(results)} PDFs")


def main():
    parser = argparse.ArgumentParser(
        description="Observatoire CLI tools",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape cities from CSV
  %(prog)s scrape cities.csv output/

  # Scrape specific cities only
  %(prog)s scrape cities.csv output/ -c paris lyon marseille

  # Classify sections for all cities
  %(prog)s classify cities/

  # Classify sections for specific cities only
  %(prog)s classify cities/ -c paris lyon marseille

  # Run OCR on all PDFs in a folder
  %(prog)s ocr /path/to/pdfs/
""",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Scrape command
    scrape_parser = subparsers.add_parser(
        "scrape",
        help="Scrape city websites from a CSV file",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage
  %(prog)s cities.csv output/

  # Limit crawl depth to 2 levels
  %(prog)s cities.csv output/ -d 2

  # Process 10 cities in parallel
  %(prog)s cities.csv output/ -p 10

  # Process only specific cities
  %(prog)s cities.csv output/ -c paris lyon marseille

  # List cities that would be processed (dry run)
  %(prog)s cities.csv output/ --list

  # Re-process cities even if folder exists
  %(prog)s cities.csv output/ --no-skip

  # Verbose output
  %(prog)s cities.csv output/ -v
""",
    )
    scrape_parser.add_argument(
        "csv_path",
        help="Path to the CSV file with city URLs",
    )
    scrape_parser.add_argument(
        "output_dir",
        help="Base directory for output folders",
    )
    scrape_parser.add_argument(
        "-d", "--max-depth",
        type=int,
        default=None,
        help="Maximum crawl depth (default: unlimited)",
    )
    scrape_parser.add_argument(
        "--no-skip",
        action="store_true",
        help="Process cities even if their folder already has content",
    )
    scrape_parser.add_argument(
        "-p", "--parallel-workers",
        type=int,
        default=5,
        help="Number of cities to process in parallel (default: 5)",
    )
    scrape_parser.add_argument(
        "-c", "--cities",
        nargs="+",
        help="Only process these city names (default: all cities)",
    )
    scrape_parser.add_argument(
        "-l", "--list",
        action="store_true",
        help="List cities that would be processed without actually processing them",
    )
    scrape_parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable debug logging",
    )
    scrape_parser.set_defaults(func=scrape_command)

    # Classify command
    classify_parser = subparsers.add_parser(
        "classify",
        help="Classify sections as municipal council related using LLM batch API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Classify all cities in directory
  %(prog)s cities/

  # Classify only specific cities
  %(prog)s cities/ -c paris lyon

  # Verbose output
  %(prog)s cities/ -v
""",
    )
    classify_parser.add_argument(
        "cities_dir",
        help="Path to directory containing city folders (e.g., 'cities/')",
    )
    classify_parser.add_argument(
        "-c", "--cities",
        nargs="+",
        help="Only process these city folder names (default: all cities)",
    )
    classify_parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable debug logging",
    )
    classify_parser.set_defaults(func=classify_command)

    # OCR command
    ocr_parser = subparsers.add_parser(
        "ocr",
        help="Run Mistral OCR on all PDFs in a folder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic usage (searches subfolders recursively)
  %(prog)s /path/to/pdfs/

  # Force reprocess (don't skip existing _ocr.json)
  %(prog)s /path/to/pdfs/ --no-skip

  # Verbose output
  %(prog)s /path/to/pdfs/ -v
""",
    )
    ocr_parser.add_argument(
        "folder",
        help="Path to folder containing PDF files",
    )
    ocr_parser.add_argument(
        "--no-skip",
        action="store_true",
        help="Process all PDFs even if _ocr.json already exists",
    )
    ocr_parser.add_argument(
        "--model",
        default="mistral-ocr-latest",
        help="Mistral OCR model to use (default: mistral-ocr-latest)",
    )
    ocr_parser.add_argument(
        "--no-images",
        action="store_true",
        help="Don't include base64 images in OCR output",
    )
    ocr_parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable debug logging",
    )
    ocr_parser.set_defaults(func=ocr_command)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
