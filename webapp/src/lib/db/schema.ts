import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- Tables ---

export const communes = sqliteTable('communes', {
  id: text('id').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull().unique(),
  code_postal: text('code_postal').notNull().default(''),
  population: integer('population').notNull().default(0),
  maire: text('maire').notNull().default(''),
  infos_generales: text('infos_generales', { mode: 'json' }),
  folder_name: text('folder_name'),
});

export const conseilsMunicipaux = sqliteTable('conseils_municipaux', {
  id: text('id').primaryKey(),
  commune_id: text('commune_id').notNull().references(() => communes.id),
  date: text('date').notNull(),
  presents: text('presents', { mode: 'json' }).notNull().$type<string[]>().default([]),
  absents: text('absents', { mode: 'json' }).notNull().$type<string[]>().default([]),
  pdf_url: text('pdf_url').notNull().default(''),
  source_section: text('source_section'),
  source_url: text('source_url'),
});

export const deliberations = sqliteTable('deliberations', {
  id: text('id').primaryKey(),
  conseil_id: text('conseil_id').notNull().references(() => conseilsMunicipaux.id),
  numero: text('numero').notNull(),
  objet: text('objet').notNull(),
  detail: text('detail').notNull(),
  decision: text('decision').notNull(),
  votants: text('votants', { mode: 'json' }).$type<{ pour?: number; contre?: number; abstention?: number }>(),
  votants_texte: text('votants_texte'),
  source_file: text('source_file'),
  source_section: text('source_section'),
});

export const thematiques = sqliteTable('thematiques', {
  id: text('id').primaryKey(),
  nom: text('nom').notNull(),
  description: text('description').notNull(),
  couleur: text('couleur').notNull(),
});

export const projets = sqliteTable('projets', {
  id: text('id').primaryKey(),
  nom: text('nom').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  nature: text('nature').notNull(),
  competence: text('competence').notNull(),
  statut: text('statut', { enum: ['en_cours', 'realise', 'abandonne'] }).notNull(),
  montant: real('montant'),
});

// --- Junction tables ---

export const projetDeliberations = sqliteTable('projet_deliberations', {
  projet_id: text('projet_id').notNull().references(() => projets.id),
  deliberation_id: text('deliberation_id').notNull().references(() => deliberations.id),
});

export const projetCommunes = sqliteTable('projet_communes', {
  projet_id: text('projet_id').notNull().references(() => projets.id),
  commune_id: text('commune_id').notNull().references(() => communes.id),
});

export const projetThematiques = sqliteTable('projet_thematiques', {
  projet_id: text('projet_id').notNull().references(() => projets.id),
  thematique_id: text('thematique_id').notNull().references(() => thematiques.id),
});

// --- Deduplication tables ---

export const projetMentions = sqliteTable('projet_mentions', {
  id: text('id').primaryKey(),
  commune_id: text('commune_id').notNull().references(() => communes.id),
  deliberation_id: text('deliberation_id').references(() => deliberations.id),
  nom: text('nom').notNull(),
  description: text('description'),
  nature: text('nature'),
  competence: text('competence'),
  source_file: text('source_file'),
  source_section: text('source_section'),
  groupe_id: text('groupe_id').references(() => projetGroupes.id),
});

export const projetGroupes = sqliteTable('projet_groupes', {
  id: text('id').primaryKey(),
  commune_id: text('commune_id').notNull().references(() => communes.id),
  nom_canonique: text('nom_canonique').notNull(),
  description: text('description'),
  nature: text('nature'),
  competence: text('competence'),
  statut: text('statut', { enum: ['proposition', 'valide', 'rejete'] }).notNull(),
  projet_id: text('projet_id').references(() => projets.id),
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
