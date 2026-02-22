/**
 * Deduplicate project mentions for a commune into proposed groups.
 *
 * Usage:
 *   npx tsx scripts/dedup-projects.ts anglet
 *   npx tsx scripts/dedup-projects.ts --all
 */

import Database from 'better-sqlite3';
import { stringSimilarity } from 'string-similarity-js';

const args = process.argv.slice(2);
const allMode = args.includes('--all');
const verbose = args.includes('--verbose');
const communeArg = args.find((a) => !a.startsWith('--'));

const sqlite = new Database(process.env.DATABASE_URL || 'sqlite.db');
sqlite.pragma('journal_mode = WAL');

interface MentionRow {
  id: string;
  commune_id: string;
  deliberation_id: string | null;
  nom: string;
  description: string | null;
  nature: string | null;
  competence: string | null;
  source_file: string | null;
  groupe_id: string | null;
}

/** Normalize a project name for comparison */
function normalize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Generate a slug for IDs */
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function dedupCommune(communeId: string): { groups: number; mentions: number } {
  // Get all ungrouped mentions for this commune
  const mentions: MentionRow[] = sqlite
    .prepare('SELECT * FROM projet_mentions WHERE commune_id = ? AND groupe_id IS NULL')
    .all(communeId) as MentionRow[];

  if (mentions.length === 0) {
    if (verbose) console.log(`  No ungrouped mentions for ${communeId}`);
    return { groups: 0, mentions: 0 };
  }

  if (verbose) console.log(`  ${mentions.length} ungrouped mentions`);

  // Step 1: Group by exact normalized match
  const normMap = new Map<string, MentionRow[]>();
  for (const m of mentions) {
    const norm = normalize(m.nom);
    if (!normMap.has(norm)) normMap.set(norm, []);
    normMap.get(norm)!.push(m);
  }

  // Build initial groups: each entry is { key, mentions[], representative }
  const groups: { key: string; mentions: MentionRow[]; representative: MentionRow }[] = [];
  for (const [key, ms] of normMap) {
    groups.push({ key, mentions: ms, representative: ms[0] });
  }

  // Step 2: Prefix matching — merge groups where one name is a prefix of another
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i].key;
        const b = groups[j].key;
        if (a.startsWith(b) || b.startsWith(a)) {
          // Merge j into i (keep the shorter name as canonical)
          groups[i].mentions.push(...groups[j].mentions);
          if (b.length < a.length) {
            groups[i].key = b;
            groups[i].representative = groups[j].representative;
          }
          groups.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  // Step 3: Fuzzy similarity (Dice coefficient > 0.8)
  merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const sim = stringSimilarity(groups[i].key, groups[j].key);
        if (sim > 0.8) {
          groups[i].mentions.push(...groups[j].mentions);
          // Keep the name that appears most frequently
          if (groups[j].mentions.length > groups[i].mentions.length) {
            groups[i].key = groups[j].key;
            groups[i].representative = groups[j].representative;
          }
          groups.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  // Step 4: Insert groups into projet_groupes and link mentions
  const now = new Date().toISOString();
  const insertGroup = sqlite.prepare(
    `INSERT OR REPLACE INTO projet_groupes (id, commune_id, nom_canonique, description, nature, competence, statut, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'proposition', ?)`
  );
  const updateMention = sqlite.prepare(
    `UPDATE projet_mentions SET groupe_id = ? WHERE id = ?`
  );

  const transaction = sqlite.transaction(() => {
    for (const group of groups) {
      // Only create groups with 1+ mentions
      const rep = group.representative;
      const groupId = `grp-${communeId}-${slugify(rep.nom).slice(0, 60)}`;

      insertGroup.run(
        groupId,
        communeId,
        rep.nom,
        rep.description,
        rep.nature,
        rep.competence,
        now,
      );

      for (const m of group.mentions) {
        updateMention.run(groupId, m.id);
      }
    }
  });

  transaction();

  if (verbose) {
    console.log(`  Created ${groups.length} groups from ${mentions.length} mentions`);
    // Show top groups by mention count
    const sorted = groups.sort((a, b) => b.mentions.length - a.mentions.length);
    for (const g of sorted.slice(0, 10)) {
      const uniqueNames = [...new Set(g.mentions.map((m) => m.nom))];
      console.log(`    "${g.representative.nom}" (${g.mentions.length} mentions, ${uniqueNames.length} variants)`);
    }
    if (sorted.length > 10) console.log(`    ... and ${sorted.length - 10} more groups`);
  }

  return { groups: groups.length, mentions: mentions.length };
}

// --- Main ---
if (allMode) {
  const communeRows: { id: string; nom: string }[] = sqlite
    .prepare('SELECT DISTINCT c.id, c.nom FROM communes c INNER JOIN projet_mentions pm ON pm.commune_id = c.id WHERE pm.groupe_id IS NULL')
    .all() as { id: string; nom: string }[];

  console.log(`Deduplicating projects for ${communeRows.length} communes...`);

  let totalGroups = 0;
  let totalMentions = 0;

  for (const { id, nom } of communeRows) {
    console.log(`\n${nom}:`);
    const result = dedupCommune(id);
    totalGroups += result.groups;
    totalMentions += result.mentions;
    console.log(`  ${result.groups} groups from ${result.mentions} mentions`);
  }

  console.log(`\nTotal: ${totalGroups} groups from ${totalMentions} mentions`);
} else {
  if (!communeArg) {
    console.error('Usage: npx tsx scripts/dedup-projects.ts <commune-slug> [--verbose]');
    console.error('       npx tsx scripts/dedup-projects.ts --all [--verbose]');
    process.exit(1);
  }

  // Find commune by slug or id
  const commune = sqlite
    .prepare('SELECT id, nom FROM communes WHERE slug = ? OR id = ?')
    .get(communeArg, communeArg) as { id: string; nom: string } | undefined;

  if (!commune) {
    console.error(`Commune not found: ${communeArg}`);
    process.exit(1);
  }

  console.log(`Deduplicating projects for ${commune.nom}...`);
  const result = dedupCommune(commune.id);
  console.log(`Done: ${result.groups} groups from ${result.mentions} mentions`);
}

sqlite.close();
