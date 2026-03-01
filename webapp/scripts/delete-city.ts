/**
 * Delete all data for a given city from the database.
 *
 * Removes: projet_mentions, projet_groupes, projet links, projets (if orphaned),
 *          deliberations, conseils_municipaux, and optionally the commune itself.
 *
 * Usage:
 *   npx tsx scripts/delete-city.ts Anglet [--dry-run] [--keep-commune]
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, sql, inArray } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';
import { slugify } from './import-helpers';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const keepCommune = args.includes('--keep-commune');
const cityName = args.find((a) => !a.startsWith('--'));

if (!cityName) {
  console.error('Usage: npx tsx scripts/delete-city.ts <CityName> [--dry-run] [--keep-commune]');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

const db = drizzle(pool, { schema, mode: 'default' });

async function main() {
  const slug = slugify(cityName!);
  const [commune] = await db.select().from(schema.communes).where(eq(schema.communes.slug, slug)).limit(1);

  if (!commune) {
    console.error(`Commune not found for "${cityName}" (slug: ${slug})`);
    process.exit(1);
  }

  const communeId = commune.id;
  console.log(`Deleting data for ${commune.nom} (id: ${communeId})${dryRun ? ' — DRY RUN' : ''}...\n`);

  // 1. Get all conseil IDs for this commune
  const conseils = await db.select({ id: schema.conseilsMunicipaux.id })
    .from(schema.conseilsMunicipaux)
    .where(eq(schema.conseilsMunicipaux.commune_id, communeId));
  const conseilIds = conseils.map((c) => c.id);

  // 2. Get all deliberation IDs for those conseils
  let delibIds: string[] = [];
  if (conseilIds.length > 0) {
    const delibs = await db.select({ id: schema.deliberations.id })
      .from(schema.deliberations)
      .where(inArray(schema.deliberations.conseil_id, conseilIds));
    delibIds = delibs.map((d) => d.id);
  }

  // 3. Get projet IDs linked to this commune
  const projetLinks = await db.select({ projet_id: schema.projetCommunes.projet_id })
    .from(schema.projetCommunes)
    .where(eq(schema.projetCommunes.commune_id, communeId));
  const projetIds = projetLinks.map((l) => l.projet_id);

  // 4. Get mention and groupe counts
  const mentions = await db.select({ id: schema.projetMentions.id })
    .from(schema.projetMentions)
    .where(eq(schema.projetMentions.commune_id, communeId));

  const groupes = await db.select({ id: schema.projetGroupes.id })
    .from(schema.projetGroupes)
    .where(eq(schema.projetGroupes.commune_id, communeId));

  console.log(`  ${conseils.length} conseils municipaux`);
  console.log(`  ${delibIds.length} délibérations`);
  console.log(`  ${projetIds.length} projets liés`);
  console.log(`  ${groupes.length} groupes de projets`);
  console.log(`  ${mentions.length} mentions de projets`);

  if (dryRun) {
    console.log('\nDry run — no data deleted.');
    await pool.end();
    return;
  }

  // Delete in dependency order

  // Mentions
  if (mentions.length > 0) {
    await db.delete(schema.projetMentions).where(eq(schema.projetMentions.commune_id, communeId));
    console.log(`  ✓ Deleted ${mentions.length} projet_mentions`);
  }

  // Groupes
  if (groupes.length > 0) {
    await db.delete(schema.projetGroupes).where(eq(schema.projetGroupes.commune_id, communeId));
    console.log(`  ✓ Deleted ${groupes.length} projet_groupes`);
  }

  // Projet junction tables for this commune's projets
  if (projetIds.length > 0) {
    await db.delete(schema.projetDeliberations).where(inArray(schema.projetDeliberations.projet_id, projetIds));
    await db.delete(schema.projetThematiques).where(inArray(schema.projetThematiques.projet_id, projetIds));
    await db.delete(schema.projetCommunes).where(inArray(schema.projetCommunes.projet_id, projetIds));
    console.log(`  ✓ Deleted projet junction rows`);

    // Delete projets that are now orphaned (not linked to any other commune)
    let orphanedCount = 0;
    for (const projetId of projetIds) {
      const [remaining] = await db.select({ count: sql<number>`count(*)` })
        .from(schema.projetCommunes)
        .where(eq(schema.projetCommunes.projet_id, projetId));
      if (Number(remaining.count) === 0) {
        await db.delete(schema.projets).where(eq(schema.projets.id, projetId));
        orphanedCount++;
      }
    }
    console.log(`  ✓ Deleted ${orphanedCount} orphaned projets (${projetIds.length - orphanedCount} shared with other communes)`);
  }

  // Deliberations
  if (delibIds.length > 0) {
    // Also clean up any projet_deliberations referencing these delibs (from other projets)
    await db.delete(schema.projetDeliberations).where(inArray(schema.projetDeliberations.deliberation_id, delibIds));
    await db.delete(schema.deliberations).where(inArray(schema.deliberations.id, delibIds));
    console.log(`  ✓ Deleted ${delibIds.length} deliberations`);
  }

  // Conseils
  if (conseilIds.length > 0) {
    await db.delete(schema.conseilsMunicipaux).where(inArray(schema.conseilsMunicipaux.id, conseilIds));
    console.log(`  ✓ Deleted ${conseilIds.length} conseils_municipaux`);
  }

  // Commune
  if (!keepCommune) {
    await db.delete(schema.communes).where(eq(schema.communes.id, communeId));
    console.log(`  ✓ Deleted commune ${commune.nom}`);
  } else {
    console.log(`  ⏭ Kept commune ${commune.nom} (--keep-commune)`);
  }

  console.log('\nDone!');
  await pool.end();
}

main().catch((err) => {
  console.error('Delete failed:', err);
  process.exit(1);
});
