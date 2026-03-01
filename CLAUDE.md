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
- `filter-pdfs` - Filter PDFs to keep only council reports (metadata heuristics + optional content validation)
- `ocr` - Run Mistral OCR on all PDFs in a folder
- `extract-deliberations` - Extract deliberation data from OCR results
- `structure-json` - Convert extraction markdown to structured JSON
- `pipeline` - Run OCR + extract + structure in sequence

### End-to-end data pipeline

#### Step 1: Scrape city websites

```bash
uv run python -m observatoire.cli.run scrape cities.csv datasets/cities/
```

Crawls each city's website, downloads PDFs into `datasets/cities/<city>/section_XXXX/` with `section.json` metadata. Output: ~27K PDFs across all cities.

#### Step 2: Filter PDFs (metadata heuristics)

```bash
uv run python -m observatoire.cli.run filter-pdfs datasets/cities/ -o manifest.json -v
```

Uses filename patterns, link text, section titles, and URL signals to keep only council meeting reports. No OCR, no API calls. Output: `manifest.json` with ~5,950 matched PDFs (~78% reduction).

#### Step 3: Validate large PDFs (optional content check)

```bash
uv run python -m observatoire.cli.run filter-pdfs datasets/cities/ --validate-large -o manifest.json -v
```

Adds content validation for PDFs with 50+ pages (352 files, ~98K pages — 79% of all filtered pages). Two tiers:

- **Tier 1 (free):** PyPDF extracts text from first 3 pages. If >100 chars, checks for council keywords (needs >=2 categories from: conseil municipal, PV/CR, deliberation, seance, elus, attendance, vote).
- **Tier 2 (scanned PDFs):** If <100 chars extracted, creates a 3-page subset and sends to Mistral OCR, then checks keywords. Cost: ~3 pages per file instead of 50-2911.
- **On error:** conservatively keeps the PDF.

Use `--page-threshold N` to change the page count cutoff (default: 50).

#### Step 4: Run OCR on filtered PDFs

```bash
uv run python -m observatoire.cli.run ocr datasets/cities/ --manifest manifest.json -v
```

Sends each PDF in the manifest to Mistral OCR. Saves `<filename>_ocr.json`.

#### Step 5: Extract deliberations

```bash
uv run python -m observatoire.cli.run extract-deliberations datasets/cities/
```

Uses Mistral LLM to extract structured deliberation data from OCR results. Saves `<filename>_extraction.md`.

#### Step 6: Structure as JSON

```bash
uv run python -m observatoire.cli.run structure-json datasets/cities/
```

Converts extraction markdown to structured JSON. Saves `<filename>_structured.json`.

Steps 4-6 can be run together:

```bash
uv run python -m observatoire.cli.run pipeline datasets/cities/
```

#### Step 7: Set up the database

```bash
cd webapp
npm run db:setup    # Create MySQL database and app user
npm run db:push     # Apply Drizzle ORM migrations
npm run db:seed     # Populate with mock data (optional, for dev)
```

Requires `DB_ADMIN_USER`, `DB_ADMIN_PASSWORD`, and `DATABASE_URL` environment variables.

#### Step 8: Import structured data into the database

```bash
cd webapp
npm run db:import -- ../datasets/cities/Bayonne    # Import one city
npm run db:import-all -- ../datasets/cities/        # Import all cities
```

Reads `_structured.json` files produced by step 6 and imports communes, conseils municipaux, deliberations, and project mentions into MySQL. Use `npm run db:delete-city -- <slug>` to remove a city's data before re-importing.

#### Step 9: Deduplicate projects

```bash
cd webapp
npm run db:dedup
```

Groups similar project mentions within each commune using fuzzy string matching (exact normalization, prefix matching, Dice coefficient >0.8) and assigns them to canonical `projet_groupe` entries.

### Database scripts reference (webapp/scripts/)

| Script | npm command | Purpose |
|--------|------------|---------|
| `setup-db.ts` | `npm run db:setup` | Create MySQL database and app user |
| `seed.ts` | `npm run db:seed` | Populate database with mock data |
| `import-city.ts` | `npm run db:import` / `db:import-all` | Import structured JSON into database |
| `delete-city.ts` | `npm run db:delete-city` | Remove a city's data |
| `dedup-projects.ts` | `npm run db:dedup` | Deduplicate project mentions |
| `import-helpers.ts` | — | Shared utilities (date conversion, slug, vote parsing) |

Other useful commands:

```bash
npm run db:generate  # Generate Drizzle ORM migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Web Application

The `webapp/` directory contains a NextJS application for the project's web interface.

### Running the app

```bash
cd webapp
npm run dev    # Development server
npm run build  # Production build
```

### Specifications

Specifications are in `webapp/specs/`:

- `01-vision.md` - Mission, context, target users
- `02-architecture.md` - Data model, API routes
- `03-pages.md` - Page descriptions
- `04-composants.md` - Reusable UI components
- `05-charte.md` - Colors, typography, design system

### Project Structure

```
webapp/src/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with Header/Footer
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global styles & design system
│   ├── commune/[slug]/       # Commune detail page
│   ├── projet/[slug]/        # Project detail page
│   ├── a-propos/             # About page
│   ├── methodologie/         # Methodology page
│   ├── contact/              # Contact form page
│   ├── soutenir/             # Support page
│   ├── rejoindre/            # Join us page
│   └── api/                  # API Routes
│       ├── communes/         # GET /api/communes, /api/communes/[id]
│       ├── projets/          # GET /api/projets, /api/projets/[id]
│       ├── thematiques/      # GET /api/thematiques
│       └── search/           # GET /api/search
├── components/               # React components
│   ├── Header.tsx            # Navigation header (responsive)
│   ├── Footer.tsx            # Site footer
│   ├── Breadcrumb.tsx        # Breadcrumb navigation
│   ├── SearchInput.tsx       # Search with autocomplete
│   ├── MapCAPB.tsx           # Interactive territory map
│   ├── ProjetCard.tsx        # Project card
│   ├── DeliberationCard.tsx  # Deliberation card
│   ├── ConseilAccordion.tsx  # Expandable council list
│   ├── ThematiqueBadge.tsx   # Colored theme badge
│   ├── StatutBadge.tsx       # Status badge (en_cours/vote/abandonne)
│   ├── StatBox.tsx           # Statistic display box
│   ├── Timeline.tsx          # Vertical timeline
│   ├── QuoteBlock.tsx        # Quote with green border
│   └── AccordionList.tsx     # Generic accordion
└── lib/                      # Data layer
    ├── types.ts              # TypeScript interfaces
    ├── mock-data.ts          # Mock data (communes, projets, etc.)
    ├── db.ts                 # Data access functions
    └── utils.ts              # Utility functions (date formatting)
```

### Mock Database

The app uses a mock database in `src/lib/` with:

- **15 communes** from Pays Basque (Anglet, Bayonne, Biarritz, etc.)
- **10 conseils municipaux** with dates and attendees
- **18 délibérations** with votes and decisions
- **10 projets** linked to communes and thématiques
- **8 thématiques** (Urbanisme, Environnement, Budget, etc.)

Data access functions in `db.ts`:
- `getAllCommunes()`, `getCommuneBySlug()`
- `getProjetsByCommune()`, `getProjetBySlug()`
- `getConseilsByCommune()`, `getDeliberationsByCommune()`
- `searchCommunes()`, `searchProjets()`

### Design System

Colors defined in `globals.css`:
- Violet: `#6B5CE7` (primary)
- Vert: `#2EAD6B` (success, environment)
- Orange: `#E57C3A` (accent)
- Crème: `#F5F0E1` (background)
- Violet foncé: `#3D3270` (text)

### Replacing Mock Data with Real Database

To connect to PostgreSQL:

1. Install dependencies: `npm install @prisma/client prisma`
2. Create `prisma/schema.prisma` based on types in `lib/types.ts`
3. Replace functions in `lib/db.ts` with Prisma queries
4. Update API routes if needed (they already use the db functions)

## Comment faire tourner l'application et la modifier avec Claude Code

### Étape 1 : Lancer l'application sur ton ordi

1. Ouvrir le terminal
2. Aller dans le dossier webapp :
   ```bash
   cd /Users/apple/Desktop/projets_github/observatoire/webapp
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
4. L'application tourne sur http://localhost:3000
5. Pour arrêter le serveur : `Ctrl+C`

### Étape 2 : Modifier le code avec Claude Code

1. Ouvrir l'app Claude, puis aller sur **Code** en haut
2. Aller dans une conversation puis sélectionner **Local** avec le dossier `/Users/apple/Desktop/projets_github/observatoire`
3. Discuter avec Claude pour modifier le code — l'app se recharge automatiquement dans ton navigateur
4. Quand tu as fini, dis à Claude : « Commit les changements et pousse sur Github »
