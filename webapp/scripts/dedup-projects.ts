/**
 * Deduplicate project mentions for a commune into proposed groups.
 *
 * Usage:
 *   npx tsx scripts/dedup-projects.ts anglet
 *   npx tsx scripts/dedup-projects.ts --all
 */

import { config } from 'dotenv';
config({ path: '.env' });
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, isNull, sql } from 'drizzle-orm';
import { stringSimilarity } from 'string-similarity-js';
import * as schema from '../src/lib/db/schema';

const args = process.argv.slice(2);
const allMode = args.includes('--all');
const verbose = args.includes('--verbose');
const communeArg = args.find((a) => !a.startsWith('--'));

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const db = drizzle(pool, { schema, mode: 'default' });

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

async function dedupCommune(communeId: string): Promise<{ groups: number; mentions: number }> {
  // Get all ungrouped mentions for this commune
  const mentions = await db.select()
    .from(schema.projetMentions)
    .where(eq(schema.projetMentions.commune_id, communeId))
    .then(rows => rows.filter(r => !r.groupe_id)) as MentionRow[];

  if (mentions.length === 0) {
    if (verbose) console.log(`  No ungrouped mentions for ${communeId}`);
    return { groups: 0, mentions: 0 };
  }

  console.log(`  ${mentions.length} ungrouped mentions`);

  // Step 1: Group by exact normalized match
  process.stdout.write(`  Step 1/4: Exact match grouping...`);
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
  console.log(` ${groups.length} groups`);

  // Step 2: Prefix matching — merge groups where one name is a prefix of another
  process.stdout.write(`  Step 2/4: Prefix matching (${groups.length} groups)...`);
  let merged = true;
  let mergeCount = 0;
  while (merged) {
    merged = false;
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i].key;
        const b = groups[j].key;
        if (a.startsWith(b) || b.startsWith(a)) {
          groups[i].mentions.push(...groups[j].mentions);
          if (b.length < a.length) {
            groups[i].key = b;
            groups[i].representative = groups[j].representative;
          }
          groups.splice(j, 1);
          merged = true;
          mergeCount++;
          break;
        }
      }
      if (merged) break;
    }
  }
  console.log(` ${mergeCount} merges → ${groups.length} groups`);

  // Step 3: Fuzzy similarity (Dice coefficient > 0.8)
  // Use union-find to batch all merges in a single pass instead of restarting on each merge
  process.stdout.write(`  Step 3/4: Fuzzy matching (${groups.length} groups)...`);
  mergeCount = 0;

  // Union-Find
  const parent = groups.map((_, i) => i);
  function find(x: number): number {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function union(a: number, b: number) { parent[find(a)] = find(b); }

  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (find(i) === find(j)) continue;
      const sim = stringSimilarity(groups[i].key, groups[j].key);
      if (sim > 0.8) {
        union(i, j);
        mergeCount++;
      }
    }
  }

  // Collect merged groups
  const clusterMap = new Map<number, number[]>();
  for (let i = 0; i < groups.length; i++) {
    const root = find(i);
    if (!clusterMap.has(root)) clusterMap.set(root, []);
    clusterMap.get(root)!.push(i);
  }

  const mergedGroups: typeof groups = [];
  for (const members of clusterMap.values()) {
    // Pick the member with the most mentions as representative
    let best = members[0];
    for (const m of members) {
      if (groups[m].mentions.length > groups[best].mentions.length) best = m;
    }
    const combined = {
      key: groups[best].key,
      mentions: members.flatMap(m => groups[m].mentions),
      representative: groups[best].representative,
    };
    mergedGroups.push(combined);
  }

  // Replace groups array
  groups.length = 0;
  groups.push(...mergedGroups);
  console.log(` ${mergeCount} merges → ${groups.length} groups`);

  // Step 4: Insert groups into projet_groupes and link mentions (batched)
  process.stdout.write(`  Step 4/4: Writing ${groups.length} groups + ${mentions.length} mentions to DB...`);
  const now = new Date().toISOString();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Batch insert all groups at once
    const groupRows: [string, string, string, string | null, string | null, string | null, string][] = [];
    const groupIdByIndex = new Map<number, string>();

    for (let i = 0; i < groups.length; i++) {
      const rep = groups[i].representative;
      const groupId = `grp-${communeId}-${slugify(rep.nom).slice(0, 60)}`;
      groupIdByIndex.set(i, groupId);
      groupRows.push([groupId, communeId, rep.nom, rep.description, rep.nature, rep.competence, now]);
    }

    // Insert groups in chunks of 500
    for (let i = 0; i < groupRows.length; i += 500) {
      const chunk = groupRows.slice(i, i + 500);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = chunk.flatMap(([id, cid, nom, desc, nat, comp, ts]) =>
        [id, cid, nom, desc, nat, comp, 'proposition', ts]
      );
      await conn.execute(
        `INSERT INTO projet_groupes (id, commune_id, nom_canonique, description, nature, competence, statut, created_at)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
           nom_canonique = VALUES(nom_canonique),
           description = VALUES(description),
           nature = VALUES(nature),
           competence = VALUES(competence)`,
        values
      );
    }

    // Batch update mentions: group by groupe_id, then use IN clause
    for (let i = 0; i < groups.length; i++) {
      const groupId = groupIdByIndex.get(i)!;
      const mentionIds = groups[i].mentions.map((m) => m.id);

      // Update in chunks of 500
      for (let j = 0; j < mentionIds.length; j += 500) {
        const chunk = mentionIds.slice(j, j + 500);
        const placeholders = chunk.map(() => '?').join(', ');
        await conn.execute(
          `UPDATE projet_mentions SET groupe_id = ? WHERE id IN (${placeholders})`,
          [groupId, ...chunk]
        );
      }
    }

    await conn.commit();
    console.log(` done`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

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
async function main() {
  if (allMode) {
    const communeRows = await db
      .selectDistinct({
        id: schema.communes.id,
        nom: schema.communes.nom,
      })
      .from(schema.communes)
      .innerJoin(schema.projetMentions, eq(schema.projetMentions.commune_id, schema.communes.id))
      .where(isNull(schema.projetMentions.groupe_id));

    console.log(`Deduplicating projects for ${communeRows.length} communes...`);

    let totalGroups = 0;
    let totalMentions = 0;

    for (const { id, nom } of communeRows) {
      console.log(`\n${nom}:`);
      const result = await dedupCommune(id);
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
    const [commune] = await db.select({ id: schema.communes.id, nom: schema.communes.nom })
      .from(schema.communes)
      .where(eq(schema.communes.slug, communeArg))
      .limit(1);

    if (!commune) {
      console.error(`Commune not found: ${communeArg}`);
      process.exit(1);
    }

    console.log(`Deduplicating projects for ${commune.nom}...`);
    const result = await dedupCommune(commune.id);
    console.log(`Done: ${result.groups} groups from ${result.mentions} mentions`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Dedup failed:', err);
  process.exit(1);
});
