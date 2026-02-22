import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
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

const sqlite = new Database(process.env.DATABASE_URL || 'sqlite.db');
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

console.log('Seeding database...');

// Clear existing data (in reverse dependency order)
db.delete(schema.projetMentions).run();
db.delete(schema.projetGroupes).run();
db.delete(schema.projetThematiques).run();
db.delete(schema.projetCommunes).run();
db.delete(schema.projetDeliberations).run();
db.delete(schema.projets).run();
db.delete(schema.deliberations).run();
db.delete(schema.conseilsMunicipaux).run();
db.delete(schema.thematiques).run();
db.delete(schema.communes).run();

// Insert in dependency order
console.log('  Inserting communes...');
for (const c of communesData) {
  db.insert(schema.communes).values(c).run();
}

console.log('  Inserting thematiques...');
for (const t of thematiquesData) {
  db.insert(schema.thematiques).values(t).run();
}

console.log('  Inserting conseils municipaux...');
for (const cm of conseilsData) {
  db.insert(schema.conseilsMunicipaux).values(cm).run();
}

console.log('  Inserting deliberations...');
for (const d of deliberationsData) {
  db.insert(schema.deliberations).values(d).run();
}

console.log('  Inserting projets...');
for (const p of projetsData) {
  db.insert(schema.projets).values(p).run();
}

console.log('  Inserting projet_deliberations...');
for (const pd of projetDeliberationsData) {
  db.insert(schema.projetDeliberations).values(pd).run();
}

console.log('  Inserting projet_communes...');
for (const pc of projetCommunesData) {
  db.insert(schema.projetCommunes).values(pc).run();
}

console.log('  Inserting projet_thematiques...');
for (const pt of projetThematiquesData) {
  db.insert(schema.projetThematiques).values(pt).run();
}

console.log('Done! Database seeded successfully.');
sqlite.close();
