/**
 * Import structured.json data from a city's dataset folder into the webapp database.
 *
 * Usage:
 *   npx tsx scripts/import-city.ts ../datasets/cities/Anglet [--dry-run] [--verbose]
 *   npx tsx scripts/import-city.ts --all ../datasets/cities/
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';
import {
  convertDate,
  slugify,
  parseVotants,
  conseilId,
  deliberationId,
  mentionId,
  type StructuredJson,
  type SectionCheck,
  type SectionJson,
  type ProjetMentionne,
} from './import-helpers';

// --- CLI argument parsing ---
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const allMode = args.includes('--all');
const pathArg = args.find((a) => !a.startsWith('--'));

if (!pathArg) {
  console.error('Usage: npx tsx scripts/import-city.ts <city-folder|--all cities-dir> [--dry-run] [--verbose]');
  process.exit(1);
}

// --- Database setup ---
const sqlite = new Database(process.env.DATABASE_URL || 'sqlite.db');
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

// --- Existing commune data (for merge) ---
function getExistingCommune(slug: string) {
  return db.select().from(schema.communes).where(eq(schema.communes.slug, slug)).get();
}

// --- Main import function ---
function importCity(cityFolder: string): { conseils: number; deliberations: number; mentions: number } {
  const folderName = path.basename(cityFolder);
  const communeSlug = slugify(folderName);

  if (verbose) console.log(`\nImporting ${folderName} (slug: ${communeSlug})...`);

  // 1. Read municipal_council_section_check.json
  const checkPath = path.join(cityFolder, 'municipal_council_section_check.json');
  if (!fs.existsSync(checkPath)) {
    console.log(`  SKIP: No municipal_council_section_check.json in ${folderName}`);
    return { conseils: 0, deliberations: 0, mentions: 0 };
  }

  const sectionCheck: Record<string, SectionCheck> = JSON.parse(fs.readFileSync(checkPath, 'utf-8'));
  const councilSections = Object.entries(sectionCheck)
    .filter(([, v]) => v.est_conseil_municipal)
    .map(([k]) => k);

  if (verbose) console.log(`  ${councilSections.length} council sections found`);

  // 2. Upsert commune
  const existing = getExistingCommune(communeSlug);
  const communeId = existing?.id || communeSlug;

  if (!dryRun) {
    if (existing) {
      // Merge: only update folder_name, don't overwrite existing metadata
      db.update(schema.communes)
        .set({ folder_name: folderName })
        .where(eq(schema.communes.id, communeId))
        .run();
    } else {
      db.insert(schema.communes).values({
        id: communeId,
        nom: folderName, // Use folder name as display name
        slug: communeSlug,
        code_postal: '',
        population: 0,
        maire: '',
        folder_name: folderName,
      }).run();
    }
  }

  // 3. Process each council section
  let totalConseils = 0;
  let totalDelibs = 0;
  let totalMentions = 0;

  // Collect all structured files grouped by date
  const filesByDate = new Map<string, { files: { data: StructuredJson; fileName: string; sectionName: string }[]; sectionName: string; sourceUrl: string; pdfUrl: string }>();

  for (const sectionName of councilSections) {
    const sectionDir = path.join(cityFolder, sectionName);
    if (!fs.existsSync(sectionDir)) continue;

    // Read section.json for source_url
    const sectionJsonPath = path.join(sectionDir, 'section.json');
    let sourceUrl = '';
    let pdfUrl = '';
    if (fs.existsSync(sectionJsonPath)) {
      try {
        const sectionJson: SectionJson = JSON.parse(fs.readFileSync(sectionJsonPath, 'utf-8'));
        sourceUrl = sectionJson.source_url || '';
        // Get first PDF URL if available
        if (sectionJson.files && sectionJson.files.length > 0) {
          pdfUrl = sectionJson.files[0].url || '';
        }
      } catch {
        // skip malformed section.json
      }
    }

    // Find all *_structured.json files
    const structuredFiles = fs.readdirSync(sectionDir).filter((f) => f.endsWith('_structured.json'));

    for (const fileName of structuredFiles) {
      const filePath = path.join(sectionDir, fileName);
      let data: StructuredJson;
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch {
        if (verbose) console.log(`  WARN: Could not parse ${filePath}`);
        continue;
      }

      if (!data.date) {
        if (verbose) console.log(`  WARN: No date in ${filePath}`);
        continue;
      }

      const isoDate = convertDate(data.date);
      if (!isoDate) {
        if (verbose) console.log(`  WARN: Invalid date ${data.date} in ${filePath}`);
        continue;
      }

      if (!filesByDate.has(isoDate)) {
        filesByDate.set(isoDate, { files: [], sectionName, sourceUrl, pdfUrl });
      }
      filesByDate.get(isoDate)!.files.push({ data, fileName, sectionName });
    }
  }

  // 4. For each date: create ONE conseil + N deliberations
  for (const [isoDate, { files, sectionName, sourceUrl, pdfUrl }] of filesByDate) {
    const cmId = conseilId(communeSlug, isoDate);
    totalConseils++;

    if (!dryRun) {
      // Insert or replace conseil
      sqlite.prepare(`INSERT OR REPLACE INTO conseils_municipaux (id, commune_id, date, presents, absents, pdf_url, source_section, source_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(cmId, communeId, isoDate, '[]', '[]', pdfUrl, sectionName, sourceUrl);
    }

    if (verbose) console.log(`  Conseil ${isoDate}: ${files.length} file(s)`);

    // Track deliberation numbers to avoid collisions within a conseil
    const usedDelibIds = new Set<string>();

    for (const { data, fileName, sectionName: fileSectionName } of files) {
      if (!data.deliberations) continue;

      for (let i = 0; i < data.deliberations.length; i++) {
        const delib = data.deliberations[i];
        let delibId = deliberationId(cmId, delib.numero, fileName);

        // Handle collisions: append index if needed
        if (usedDelibIds.has(delibId)) {
          delibId = `${delibId}-${i}`;
        }
        usedDelibIds.add(delibId);

        const votantsText = delib.votants && delib.votants !== '---' ? delib.votants : null;
        const votantsParsed = votantsText ? parseVotants(votantsText) : null;

        totalDelibs++;

        if (!dryRun) {
          sqlite.prepare(`INSERT OR REPLACE INTO deliberations (id, conseil_id, numero, objet, detail, decision, votants, votants_texte, source_file, source_section)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(
              delibId,
              cmId,
              delib.numero || `${i + 1}`,
              delib.objet || '',
              delib.detail || '',
              delib.decision || '',
              votantsParsed ? JSON.stringify(votantsParsed) : null,
              votantsText,
              fileName,
              fileSectionName,
            );
        }

        // Collect per-deliberation project mentions
        if (delib.projets_mentionnes) {
          for (let j = 0; j < delib.projets_mentionnes.length; j++) {
            const mention = delib.projets_mentionnes[j];
            if (!mention.nom || mention.nom === '---') continue;

            const mId = `${delibId}-pm-${j}`;
            totalMentions++;

            if (!dryRun) {
              sqlite.prepare(`INSERT OR REPLACE INTO projet_mentions (id, commune_id, deliberation_id, nom, description, nature, competence, source_file, source_section)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
                .run(
                  mId,
                  communeId,
                  delibId,
                  mention.nom,
                  mention.description || null,
                  mention.nature || null,
                  mention.competence || null,
                  fileName,
                  fileSectionName,
                );
            }
          }
        }
      }

      // Collect global project mentions (not tied to a specific deliberation)
      if (data.projets_mentionnes_global) {
        for (let k = 0; k < data.projets_mentionnes_global.length; k++) {
          const mention = data.projets_mentionnes_global[k];
          if (!mention.nom || mention.nom === '---') continue;

          const mId = mentionId(communeSlug, fileName, k);
          totalMentions++;

          if (!dryRun) {
            sqlite.prepare(`INSERT OR REPLACE INTO projet_mentions (id, commune_id, deliberation_id, nom, description, nature, competence, source_file, source_section)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
              .run(
                mId,
                communeId,
                null,
                mention.nom,
                mention.description || null,
                mention.nature || null,
                mention.competence || null,
                fileName,
                fileSectionName,
              );
          }
        }
      }
    }
  }

  return { conseils: totalConseils, deliberations: totalDelibs, mentions: totalMentions };
}

// --- Run ---
if (allMode) {
  const citiesDir = pathArg;
  if (!fs.existsSync(citiesDir)) {
    console.error(`Directory not found: ${citiesDir}`);
    process.exit(1);
  }

  const cityFolders = fs.readdirSync(citiesDir)
    .filter((f) => fs.statSync(path.join(citiesDir, f)).isDirectory())
    .sort();

  console.log(`Importing ${cityFolders.length} cities...${dryRun ? ' (DRY RUN)' : ''}`);

  let grandTotal = { conseils: 0, deliberations: 0, mentions: 0 };

  for (const folder of cityFolders) {
    const result = importCity(path.join(citiesDir, folder));
    grandTotal.conseils += result.conseils;
    grandTotal.deliberations += result.deliberations;
    grandTotal.mentions += result.mentions;

    if (result.conseils > 0 || verbose) {
      console.log(`  ${folder}: ${result.conseils} conseils, ${result.deliberations} délibérations, ${result.mentions} mentions`);
    }
  }

  console.log(`\nTotal: ${grandTotal.conseils} conseils, ${grandTotal.deliberations} délibérations, ${grandTotal.mentions} mentions`);
} else {
  if (!fs.existsSync(pathArg)) {
    console.error(`Directory not found: ${pathArg}`);
    process.exit(1);
  }

  console.log(`Importing from ${pathArg}...${dryRun ? ' (DRY RUN)' : ''}`);
  const result = importCity(pathArg);
  console.log(`Done: ${result.conseils} conseils, ${result.deliberations} délibérations, ${result.mentions} mentions`);
}

sqlite.close();
