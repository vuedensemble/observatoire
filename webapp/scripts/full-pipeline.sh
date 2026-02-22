#!/usr/bin/env bash
# Full pipeline: from city council URL to displayed city with real data.
#
# Usage:
#   bash scripts/full-pipeline.sh Anglet
#   bash scripts/full-pipeline.sh --all
#
# Prerequisites:
# - Python pipeline installed (uv, observatoire package)
# - Node.js + npm installed in webapp/

set -euo pipefail

CITY="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEBAPP_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$WEBAPP_DIR")"
DATASETS_DIR="$PROJECT_ROOT/datasets/cities"

if [ -z "$CITY" ]; then
  echo "Usage: bash scripts/full-pipeline.sh <CityName|--all>"
  echo ""
  echo "Steps performed:"
  echo "  1. Scrape city website (Python)"
  echo "  2. Classify sections (Python)"
  echo "  3. Run OCR + extraction + structuring (Python)"
  echo "  4. Import into webapp DB (TypeScript)"
  echo "  5. Propose project groupings (TypeScript)"
  echo "  6. User validates groupings via admin UI"
  echo ""
  echo "Example:"
  echo "  bash scripts/full-pipeline.sh Anglet"
  exit 1
fi

if [ "$CITY" = "--all" ]; then
  echo "=== Full pipeline for ALL cities ==="

  # Step 4: Import all cities into webapp DB
  echo ""
  echo "--- Step 4: Import all cities into webapp DB ---"
  cd "$WEBAPP_DIR"
  npx tsx scripts/import-city.ts --all "$DATASETS_DIR"

  # Step 5: Propose project groupings for all
  echo ""
  echo "--- Step 5: Propose project groupings ---"
  npx tsx scripts/dedup-projects.ts --all --verbose

  echo ""
  echo "=== Done! ==="
  echo "Visit http://localhost:3000/admin/projets to validate project groupings."
else
  CITY_DIR="$DATASETS_DIR/$CITY"
  CITY_SLUG=$(echo "$CITY" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]' | sed 's/--*/-/g; s/^-//; s/-$//')

  echo "=== Full pipeline for $CITY ==="

  # Steps 1-3: Python pipeline (uncomment if needed)
  # echo ""
  # echo "--- Step 1: Scrape city website ---"
  # cd "$PROJECT_ROOT"
  # uv run python -m observatoire.cli.run scrape cities.csv datasets/cities/ -c "$CITY"
  #
  # echo ""
  # echo "--- Step 2: Classify sections ---"
  # uv run python -m observatoire.cli.run classify datasets/cities/ -c "$CITY"
  #
  # echo ""
  # echo "--- Step 3: Run OCR + extraction + structuring ---"
  # uv run python -m observatoire.cli.run pipeline "$CITY_DIR"

  # Step 4: Import into webapp DB
  echo ""
  echo "--- Step 4: Import $CITY into webapp DB ---"
  cd "$WEBAPP_DIR"
  npx tsx scripts/import-city.ts "$CITY_DIR" --verbose

  # Step 5: Propose project groupings
  echo ""
  echo "--- Step 5: Propose project groupings ---"
  npx tsx scripts/dedup-projects.ts "$CITY_SLUG" --verbose

  echo ""
  echo "=== Done! ==="
  echo "Visit http://localhost:3000/admin/projets/$CITY_SLUG to validate project groupings."
  echo "Then visit http://localhost:3000/commune/$CITY_SLUG to see the city page."
fi
