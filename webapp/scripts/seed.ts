import { config } from 'dotenv';
config({ path: '.env.local' });
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../src/lib/db/schema';
import {
  communes as communesData,
  conseilsMunicipaux as conseilsData,
  deliberations as deliberationsData,
  thematiques as thematiquesData,
  projets as projetsData,
  projetDeliberations as projetDeliberationsData,
  projetCommunes as projetCommunesData,
  projetThematiques as projetThematiquesData,
} from '../src/lib/mock-data';

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_USER_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const db = drizzle(pool, { schema, mode: 'default' });

  console.log('Seeding database...');

  // Clear existing data (in reverse dependency order)
  await db.delete(schema.projetMentions);
  await db.delete(schema.projetGroupes);
  await db.delete(schema.projetThematiques);
  await db.delete(schema.projetCommunes);
  await db.delete(schema.projetDeliberations);
  await db.delete(schema.projets);
  await db.delete(schema.deliberations);
  await db.delete(schema.conseilsMunicipaux);
  await db.delete(schema.thematiques);
  await db.delete(schema.communes);

  // Bulk insert in dependency order
  console.log('  Inserting communes...');
  if (communesData.length) await db.insert(schema.communes).values(communesData);

  console.log('  Inserting thematiques...');
  if (thematiquesData.length) await db.insert(schema.thematiques).values(thematiquesData);

  console.log('  Inserting conseils municipaux...');
  if (conseilsData.length) await db.insert(schema.conseilsMunicipaux).values(conseilsData);

  console.log('  Inserting deliberations...');
  if (deliberationsData.length) await db.insert(schema.deliberations).values(deliberationsData);

  console.log('  Inserting projets...');
  if (projetsData.length) await db.insert(schema.projets).values(projetsData);

  console.log('  Inserting projet_deliberations...');
  if (projetDeliberationsData.length) await db.insert(schema.projetDeliberations).values(projetDeliberationsData);

  console.log('  Inserting projet_communes...');
  if (projetCommunesData.length) await db.insert(schema.projetCommunes).values(projetCommunesData);

  console.log('  Inserting projet_thematiques...');
  if (projetThematiquesData.length) await db.insert(schema.projetThematiques).values(projetThematiquesData);

  console.log('Done! Database seeded successfully.');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
