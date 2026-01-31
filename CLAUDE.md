# Development Instructions

## Running Python

Always use `uv run python` instead of `python` to run Python scripts and commands.

## IPython Autoreload

To automatically reload modules when they change:

```python
%load_ext autoreload
%autoreload 2
```

## Code Style

Prefer pure functions as much as possible. Functions should have all context passed via arguments rather than relying on closures or global state.

## CLI

The main CLI is at `observatoire/cli/run.py`. Run commands with:

```bash
uv run python -m observatoire.cli.run <command> [options]
```

Available commands:

- `scrape` - Scrape city websites from a CSV file
- `classify` - Classify sections as municipal council related using LLM batch API
- `ocr` - Run Mistral OCR on all PDFs in a folder

Examples:

```bash
# Run OCR on all PDFs in a folder
uv run python -m observatoire.cli.run ocr /path/to/pdfs/

# Run OCR recursively
uv run python -m observatoire.cli.run ocr /path/to/pdfs/ -r -v
```

## Web Application

The `webapp/` directory contains a NextJS application for the project's web interface.

Specifications are in `webapp/specs/`:

- `01-vision.md` - Mission, context, target users
- `02-architecture.md` - Data model, API routes
- `03-pages.md` - Page descriptions
- `04-composants.md` - Reusable UI components
- `05-charte.md` - Colors, typography, design system
