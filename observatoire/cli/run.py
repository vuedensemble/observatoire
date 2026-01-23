#!/usr/bin/env python
import argparse
import logging

from observatoire.processors.e2e import scrape_cities_from_csv
from observatoire.processors.llm import classify_sections_by_city


def scrape_command(args):
    if args.verbose:
        logging.getLogger().setLevel(logging.INFO)

    results = scrape_cities_from_csv(
        csv_path=args.csv_path,
        output_base_dir=args.output_dir,
        max_depth=args.max_depth,
        skip_non_empty=not args.no_skip,
        parallel_workers=args.parallel_workers,
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


def main():
    parser = argparse.ArgumentParser(
        description="Observatoire CLI tools",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape cities from CSV
  %(prog)s scrape cities.csv output/

  # Classify sections for all cities
  %(prog)s classify cities/

  # Classify sections for specific cities only
  %(prog)s classify cities/ -c paris lyon marseille
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

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
