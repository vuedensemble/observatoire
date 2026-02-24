import { mysqlTable, varchar, text, int, double, json, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Note: varchar(255) is required by MySQL for primary keys, unique indexes, and foreign keys.
// All other string columns use text().

// --- Tables ---

export const communes = mysqlTable('communes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  nom: text('nom').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  code_postal: text('code_postal').notNull().default(''),
  population: int('population').notNull().default(0),
  maire: text('maire').notNull().default(''),
  infos_generales: json('infos_generales'),
  folder_name: text('folder_name'),
});

export const conseilsMunicipaux = mysqlTable('conseils_municipaux', {
  id: varchar('id', { length: 255 }).primaryKey(),
  commune_id: varchar('commune_id', { length: 255 }).notNull().references(() => communes.id),
  date: text('date').notNull(),
  presents: json('presents').notNull().$type<string[]>().default([]),
  absents: json('absents').notNull().$type<string[]>().default([]),
  pdf_url: text('pdf_url').notNull().default(''),
  source_section: text('source_section'),
  source_url: text('source_url'),
});

export const deliberations = mysqlTable('deliberations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  conseil_id: varchar('conseil_id', { length: 255 }).notNull().references(() => conseilsMunicipaux.id),
  numero: text('numero').notNull(),
  objet: text('objet').notNull(),
  detail: text('detail').notNull(),
  decision: text('decision').notNull(),
  votants: json('votants').$type<{ pour?: number; contre?: number; abstention?: number }>(),
  votants_texte: text('votants_texte'),
  source_file: text('source_file'),
  source_section: text('source_section'),
});

export const thematiques = mysqlTable('thematiques', {
  id: varchar('id', { length: 255 }).primaryKey(),
  nom: text('nom').notNull(),
  description: text('description').notNull(),
  couleur: text('couleur').notNull(),
});

export const projets = mysqlTable('projets', {
  id: varchar('id', { length: 255 }).primaryKey(),
  nom: text('nom').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  nature: text('nature').notNull(),
  competence: text('competence').notNull(),
  statut: mysqlEnum('statut', ['en_cours', 'realise', 'abandonne']).notNull(),
  montant: double('montant'),
});

// --- Junction tables ---

export const projetDeliberations = mysqlTable('projet_deliberations', {
  projet_id: varchar('projet_id', { length: 255 }).notNull().references(() => projets.id),
  deliberation_id: varchar('deliberation_id', { length: 255 }).notNull().references(() => deliberations.id),
});

export const projetCommunes = mysqlTable('projet_communes', {
  projet_id: varchar('projet_id', { length: 255 }).notNull().references(() => projets.id),
  commune_id: varchar('commune_id', { length: 255 }).notNull().references(() => communes.id),
});

export const projetThematiques = mysqlTable('projet_thematiques', {
  projet_id: varchar('projet_id', { length: 255 }).notNull().references(() => projets.id),
  thematique_id: varchar('thematique_id', { length: 255 }).notNull().references(() => thematiques.id),
});

// --- Deduplication tables ---

export const projetMentions = mysqlTable('projet_mentions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  commune_id: varchar('commune_id', { length: 255 }).notNull().references(() => communes.id),
  deliberation_id: varchar('deliberation_id', { length: 255 }).references(() => deliberations.id),
  nom: text('nom').notNull(),
  description: text('description'),
  nature: text('nature'),
  competence: text('competence'),
  source_file: text('source_file'),
  source_section: text('source_section'),
  groupe_id: varchar('groupe_id', { length: 255 }).references(() => projetGroupes.id),
});

export const projetGroupes = mysqlTable('projet_groupes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  commune_id: varchar('commune_id', { length: 255 }).notNull().references(() => communes.id),
  nom_canonique: text('nom_canonique').notNull(),
  description: text('description'),
  nature: text('nature'),
  competence: text('competence'),
  statut: mysqlEnum('statut', ['proposition', 'valide', 'rejete']).notNull(),
  projet_id: varchar('projet_id', { length: 255 }).references(() => projets.id),
  created_at: text('created_at').notNull(),
});

// --- Relations ---

export const communesRelations = relations(communes, ({ many }) => ({
  conseils: many(conseilsMunicipaux),
  projetCommunes: many(projetCommunes),
}));

export const conseilsMunicipauRelations = relations(conseilsMunicipaux, ({ one, many }) => ({
  commune: one(communes, { fields: [conseilsMunicipaux.commune_id], references: [communes.id] }),
  deliberations: many(deliberations),
}));

export const deliberationsRelations = relations(deliberations, ({ one, many }) => ({
  conseil: one(conseilsMunicipaux, { fields: [deliberations.conseil_id], references: [conseilsMunicipaux.id] }),
  projetDeliberations: many(projetDeliberations),
}));

export const thematiquesRelations = relations(thematiques, ({ many }) => ({
  projetThematiques: many(projetThematiques),
}));

export const projetsRelations = relations(projets, ({ many }) => ({
  projetDeliberations: many(projetDeliberations),
  projetCommunes: many(projetCommunes),
  projetThematiques: many(projetThematiques),
}));

export const projetDeliberationsRelations = relations(projetDeliberations, ({ one }) => ({
  projet: one(projets, { fields: [projetDeliberations.projet_id], references: [projets.id] }),
  deliberation: one(deliberations, { fields: [projetDeliberations.deliberation_id], references: [deliberations.id] }),
}));

export const projetCommunesRelations = relations(projetCommunes, ({ one }) => ({
  projet: one(projets, { fields: [projetCommunes.projet_id], references: [projets.id] }),
  commune: one(communes, { fields: [projetCommunes.commune_id], references: [communes.id] }),
}));

export const projetThematiquesRelations = relations(projetThematiques, ({ one }) => ({
  projet: one(projets, { fields: [projetThematiques.projet_id], references: [projets.id] }),
  thematique: one(thematiques, { fields: [projetThematiques.thematique_id], references: [thematiques.id] }),
}));

export const projetMentionsRelations = relations(projetMentions, ({ one }) => ({
  commune: one(communes, { fields: [projetMentions.commune_id], references: [communes.id] }),
  deliberation: one(deliberations, { fields: [projetMentions.deliberation_id], references: [deliberations.id] }),
  groupe: one(projetGroupes, { fields: [projetMentions.groupe_id], references: [projetGroupes.id] }),
}));

export const projetGroupesRelations = relations(projetGroupes, ({ one, many }) => ({
  commune: one(communes, { fields: [projetGroupes.commune_id], references: [communes.id] }),
  projet: one(projets, { fields: [projetGroupes.projet_id], references: [projets.id] }),
  mentions: many(projetMentions),
}));
