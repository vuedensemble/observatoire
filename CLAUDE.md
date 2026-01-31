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
