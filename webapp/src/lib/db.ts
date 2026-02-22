import { eq, sql } from 'drizzle-orm';
import { db } from './db/index';
import {
  communes,
  conseilsMunicipaux,
  deliberations,
  thematiques,
  projets,
  projetDeliberations,
  projetCommunes,
  projetThematiques,
  projetMentions,
  projetGroupes,
} from './db/schema';
import type {
  Commune,
  ConseilMunicipal,
  Deliberation,
  Thematique,
  Projet,
  ProjetWithRelations,
  CommuneWithStats,
  ConseilWithDeliberations,
  ProjetMention,
  ProjetGroupe,
  ProjetGroupeWithMentions,
} from './types';

// Communes
export function getAllCommunes(): CommuneWithStats[] {
  const rows = db
    .select({
      id: communes.id,
      nom: communes.nom,
      slug: communes.slug,
      code_postal: communes.code_postal,
      population: communes.population,
      maire: communes.maire,
      infos_generales: communes.infos_generales,
      nombre_projets: sql<number>`(select count(*) from projet_communes where commune_id = ${communes.id})`,
      nombre_conseils: sql<number>`(select count(*) from conseils_municipaux where commune_id = ${communes.id})`,
    })
    .from(communes)
    .all();

  return rows.map((r) => ({
    ...r,
    infos_generales: (r.infos_generales as Record<string, unknown> | null) ?? undefined,
    nombre_projets: Number(r.nombre_projets),
    nombre_conseils: Number(r.nombre_conseils),
  }));
}

export function getCommuneById(id: string): Commune | undefined {
  const row = db.select().from(communes).where(eq(communes.id, id)).get();
  if (!row) return undefined;
  return { ...row, infos_generales: (row.infos_generales as Record<string, unknown> | null) ?? undefined };
}

export function getCommuneBySlug(slug: string): Commune | undefined {
  const row = db.select().from(communes).where(eq(communes.slug, slug)).get();
  if (!row) return undefined;
  return { ...row, infos_generales: (row.infos_generales as Record<string, unknown> | null) ?? undefined };
}

export function searchCommunes(query: string): CommuneWithStats[] {
  const q = query.toLowerCase();
  return getAllCommunes().filter(
    (c) => c.nom.toLowerCase().includes(q) || c.code_postal.includes(q)
  );
}

// Conseils municipaux
export function getConseilsByCommune(communeId: string): ConseilWithDeliberations[] {
  const conseils = db
    .select()
    .from(conseilsMunicipaux)
    .where(eq(conseilsMunicipaux.commune_id, communeId))
    .all();

  const commune = db.select().from(communes).where(eq(communes.id, communeId)).get();
  if (!commune) return [];

  const communeObj: Commune = {
    ...commune,
    infos_generales: (commune.infos_generales as Record<string, unknown> | null) ?? undefined,
  };

  return conseils
    .map((cm) => {
      const delibs = db
        .select()
        .from(deliberations)
        .where(eq(deliberations.conseil_id, cm.id))
        .all();
      return {
        ...cm,
        deliberations: delibs as Deliberation[],
        commune: communeObj,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getConseilById(id: string): ConseilWithDeliberations | undefined {
  const conseil = db.select().from(conseilsMunicipaux).where(eq(conseilsMunicipaux.id, id)).get();
  if (!conseil) return undefined;

  const commune = db.select().from(communes).where(eq(communes.id, conseil.commune_id)).get();
  if (!commune) return undefined;

  const delibs = db
    .select()
    .from(deliberations)
    .where(eq(deliberations.conseil_id, conseil.id))
    .all();

  return {
    ...conseil,
    deliberations: delibs as Deliberation[],
    commune: { ...commune, infos_generales: (commune.infos_generales as Record<string, unknown> | null) ?? undefined },
  };
}

// Deliberations
export function getDeliberationsByCommune(communeId: string): (Deliberation & { conseil: ConseilMunicipal })[] {
  const conseils = db
    .select()
    .from(conseilsMunicipaux)
    .where(eq(conseilsMunicipaux.commune_id, communeId))
    .all();

  const conseilMap = new Map(conseils.map((c) => [c.id, c]));
  const conseilIds = conseils.map((c) => c.id);
  if (conseilIds.length === 0) return [];

  const allDelibs = db.select().from(deliberations).all();
  const filtered = allDelibs.filter((d) => conseilMap.has(d.conseil_id));

  return filtered
    .map((d) => ({
      ...(d as Deliberation),
      conseil: conseilMap.get(d.conseil_id)! as ConseilMunicipal,
    }))
    .sort((a, b) => new Date(b.conseil.date).getTime() - new Date(a.conseil.date).getTime());
}

export function getDeliberationById(id: string): (Deliberation & { conseil: ConseilMunicipal }) | undefined {
  const delib = db.select().from(deliberations).where(eq(deliberations.id, id)).get();
  if (!delib) return undefined;

  const conseil = db.select().from(conseilsMunicipaux).where(eq(conseilsMunicipaux.id, delib.conseil_id)).get();
  if (!conseil) return undefined;

  return { ...(delib as Deliberation), conseil: conseil as ConseilMunicipal };
}

// Thematiques
export function getAllThematiques(): Thematique[] {
  return db.select().from(thematiques).all();
}

export function getThematiqueById(id: string): Thematique | undefined {
  return db.select().from(thematiques).where(eq(thematiques.id, id)).get();
}

// Projets
export function getAllProjets(): ProjetWithRelations[] {
  const allProjets = db.select().from(projets).all();
  return allProjets.map((p) => enrichProjet(p as Projet));
}

export function getProjetById(id: string): ProjetWithRelations | undefined {
  const projet = db.select().from(projets).where(eq(projets.id, id)).get();
  if (!projet) return undefined;
  return enrichProjet(projet as Projet);
}

export function getProjetBySlug(slug: string): ProjetWithRelations | undefined {
  const projet = db.select().from(projets).where(eq(projets.slug, slug)).get();
  if (!projet) return undefined;
  return enrichProjet(projet as Projet);
}

export function getProjetsByCommune(communeId: string): ProjetWithRelations[] {
  const links = db
    .select()
    .from(projetCommunes)
    .where(eq(projetCommunes.commune_id, communeId))
    .all();

  const projetIds = links.map((l) => l.projet_id);
  if (projetIds.length === 0) return [];

  const allProjets = db.select().from(projets).all();
  const projetIdSet = new Set(projetIds);

  return allProjets
    .filter((p) => projetIdSet.has(p.id))
    .map((p) => enrichProjet(p as Projet));
}

export function getProjetsByThematique(thematiqueId: string): ProjetWithRelations[] {
  const links = db
    .select()
    .from(projetThematiques)
    .where(eq(projetThematiques.thematique_id, thematiqueId))
    .all();

  const projetIds = links.map((l) => l.projet_id);
  if (projetIds.length === 0) return [];

  const allProjets = db.select().from(projets).all();
  const projetIdSet = new Set(projetIds);

  return allProjets
    .filter((p) => projetIdSet.has(p.id))
    .map((p) => enrichProjet(p as Projet));
}

function enrichProjet(projet: Projet): ProjetWithRelations {
  // Get commune IDs
  const communeLinks = db
    .select()
    .from(projetCommunes)
    .where(eq(projetCommunes.projet_id, projet.id))
    .all();
  const communeIds = new Set(communeLinks.map((l) => l.commune_id));

  // Get thematique IDs
  const thematiqueLinks = db
    .select()
    .from(projetThematiques)
    .where(eq(projetThematiques.projet_id, projet.id))
    .all();
  const thematiqueIds = new Set(thematiqueLinks.map((l) => l.thematique_id));

  // Get deliberation IDs
  const delibLinks = db
    .select()
    .from(projetDeliberations)
    .where(eq(projetDeliberations.projet_id, projet.id))
    .all();
  const delibIds = new Set(delibLinks.map((l) => l.deliberation_id));

  // Fetch related entities
  const allCommunes = db.select().from(communes).all();
  const projetCommunesList = allCommunes
    .filter((c) => communeIds.has(c.id))
    .map((c) => ({ ...c, infos_generales: (c.infos_generales as Record<string, unknown> | null) ?? undefined }));

  const allThematiques = db.select().from(thematiques).all();
  const projetThematiquesList = allThematiques.filter((t) => thematiqueIds.has(t.id));

  const allDelibs = db.select().from(deliberations).all();
  const projetDelibs = allDelibs.filter((d) => delibIds.has(d.id));

  // Get conseils for each deliberation
  const conseilIds = new Set(projetDelibs.map((d) => d.conseil_id));
  const allConseils = db.select().from(conseilsMunicipaux).all();
  const conseilMap = new Map(allConseils.filter((c) => conseilIds.has(c.id)).map((c) => [c.id, c]));

  const deliberationsWithConseils = projetDelibs
    .map((d) => ({
      ...(d as Deliberation),
      conseil: conseilMap.get(d.conseil_id)! as ConseilMunicipal,
    }))
    .filter((d) => d.conseil)
    .sort((a, b) => new Date(b.conseil.date).getTime() - new Date(a.conseil.date).getTime());

  return {
    ...projet,
    communes: projetCommunesList,
    thematiques: projetThematiquesList,
    deliberations: deliberationsWithConseils,
  };
}

// Counts
export function countProjets(): number {
  const row = db.select({ count: sql<number>`count(*)` }).from(projets).get();
  return Number(row?.count ?? 0);
}

export function countDeliberations(): number {
  const row = db.select({ count: sql<number>`count(*)` }).from(deliberations).get();
  return Number(row?.count ?? 0);
}

// Recherche globale
export interface SearchFilters {
  commune?: string;
  thematique?: string;
  dateDebut?: string;
  dateFin?: string;
  query?: string;
}

export function searchProjets(filters: SearchFilters): ProjetWithRelations[] {
  let results = getAllProjets();

  if (filters.commune) {
    results = results.filter((p) =>
      p.communes.some((c) => c.id === filters.commune || c.slug === filters.commune)
    );
  }

  if (filters.thematique) {
    results = results.filter((p) =>
      p.thematiques.some((t) => t.id === filters.thematique || t.nom.toLowerCase() === filters.thematique?.toLowerCase())
    );
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters.dateDebut || filters.dateFin) {
    results = results.filter((p) => {
      const dates = p.deliberations.map((d) => new Date(d.conseil.date));
      if (dates.length === 0) return false;

      const minDate = Math.min(...dates.map((d) => d.getTime()));
      const maxDate = Math.max(...dates.map((d) => d.getTime()));

      if (filters.dateDebut && maxDate < new Date(filters.dateDebut).getTime()) {
        return false;
      }
      if (filters.dateFin && minDate > new Date(filters.dateFin).getTime()) {
        return false;
      }
      return true;
    });
  }

  return results;
}

// --- Admin: Project deduplication ---

export function getProjetGroupesByCommune(communeId: string): ProjetGroupeWithMentions[] {
  const groups = db
    .select()
    .from(projetGroupes)
    .where(eq(projetGroupes.commune_id, communeId))
    .all();

  return groups.map((g) => {
    const mentions = db
      .select()
      .from(projetMentions)
      .where(eq(projetMentions.groupe_id, g.id))
      .all();

    return {
      ...g,
      statut: g.statut as ProjetGroupe['statut'],
      mentions: mentions as ProjetMention[],
    };
  });
}

function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Infer thematiques by matching nature/competence text against
 * the nom and description of each thematique from the DB.
 * A thematique matches if any significant word (4+ chars) from its
 * nom or description appears in the input text, or vice-versa.
 */
function inferThematiques(texts: string[], allThems: { id: string; nom: string; description: string; couleur: string }[]) {
  const combined = stripAccents(texts.filter(Boolean).join(' '));
  if (!combined) return [];

  const inputWords = combined.split(/[\s,;.·]+/).filter((w) => w.length >= 4);

  return allThems.filter((t) => {
    const themWords = stripAccents(`${t.nom} ${t.description}`)
      .split(/[\s,;.·]+/)
      .filter((w) => w.length >= 4);

    // Match if any thematique word appears in input text or any input word appears in thematique text
    return themWords.some((tw) => combined.includes(tw)) ||
           inputWords.some((iw) => stripAccents(`${t.nom} ${t.description}`).includes(iw));
  });
}

export function getUnvalidatedProjetsForCommune(communeId: string): ProjetWithRelations[] {
  const groups = db
    .select()
    .from(projetGroupes)
    .where(eq(projetGroupes.commune_id, communeId))
    .all()
    .filter((g) => g.statut === 'proposition');

  const commune = db.select().from(communes).where(eq(communes.id, communeId)).get();
  if (!commune) return [];

  const communeObj: Commune = {
    ...commune,
    infos_generales: (commune.infos_generales as Record<string, unknown> | null) ?? undefined,
  };

  return groups.map((g) => {
    // Get mentions in this group
    const mentions = db
      .select()
      .from(projetMentions)
      .where(eq(projetMentions.groupe_id, g.id))
      .all();

    // Collect unique deliberation IDs from mentions
    const delibIds = new Set<string>();
    for (const m of mentions) {
      if (m.deliberation_id) delibIds.add(m.deliberation_id);
    }

    // Build deliberations with their conseils
    const delibsWithConseils: (Deliberation & { conseil: ConseilMunicipal })[] = [];
    for (const delibId of delibIds) {
      const delib = db.select().from(deliberations).where(eq(deliberations.id, delibId)).get();
      if (!delib) continue;
      const conseil = db.select().from(conseilsMunicipaux).where(eq(conseilsMunicipaux.id, delib.conseil_id)).get();
      if (!conseil) continue;
      delibsWithConseils.push({
        ...(delib as Deliberation),
        conseil: conseil as ConseilMunicipal,
      });
    }

    delibsWithConseils.sort((a, b) => new Date(b.conseil.date).getTime() - new Date(a.conseil.date).getTime());

    // Infer thematiques from nature/competence of group + all its mentions
    const textsForInference = [g.nature || '', g.competence || ''];
    for (const m of mentions) {
      if (m.nature) textsForInference.push(m.nature);
      if (m.competence) textsForInference.push(m.competence);
    }
    const allThems = db.select().from(thematiques).all();
    const matchedThems = inferThematiques(textsForInference, allThems);

    return {
      id: g.id,
      nom: g.nom_canonique,
      slug: slugify(g.nom_canonique),
      description: g.description || '',
      nature: g.nature || '',
      competence: g.competence || '',
      statut: 'en_cours' as const,
      communes: [communeObj],
      thematiques: matchedThems,
      deliberations: delibsWithConseils,
      needsConsolidation: true,
    };
  });
}

export function getUngroupedMentions(communeId: string): ProjetMention[] {
  const rows = db
    .select()
    .from(projetMentions)
    .where(eq(projetMentions.commune_id, communeId))
    .all();

  return rows.filter((r) => !r.groupe_id) as ProjetMention[];
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function validateProjetGroupe(
  groupeId: string,
  nomCanonique: string,
  description?: string,
): { projetId: string } {
  const groupe = db.select().from(projetGroupes).where(eq(projetGroupes.id, groupeId)).get();
  if (!groupe) throw new Error(`Groupe not found: ${groupeId}`);

  const projetId = `proj-${slugify(nomCanonique).slice(0, 60)}`;
  const projetSlug = slugify(nomCanonique);

  // Create the projet
  db.insert(projets).values({
    id: projetId,
    nom: nomCanonique,
    slug: projetSlug,
    description: description || groupe.description || '',
    nature: groupe.nature || '',
    competence: groupe.competence || '',
    statut: 'en_cours',
  }).run();

  // Link projet to commune
  db.insert(projetCommunes).values({
    projet_id: projetId,
    commune_id: groupe.commune_id,
  }).run();

  // Link projet to all deliberations referenced by mentions in this group
  const mentions = db
    .select()
    .from(projetMentions)
    .where(eq(projetMentions.groupe_id, groupeId))
    .all();

  const delibIds = new Set<string>();
  for (const m of mentions) {
    if (m.deliberation_id) delibIds.add(m.deliberation_id);
  }

  for (const delibId of delibIds) {
    db.insert(projetDeliberations).values({
      projet_id: projetId,
      deliberation_id: delibId,
    }).run();
  }

  // Update groupe status
  db.update(projetGroupes)
    .set({ statut: 'valide', projet_id: projetId })
    .where(eq(projetGroupes.id, groupeId))
    .run();

  return { projetId };
}

export function rejectProjetGroupe(groupeId: string): void {
  db.update(projetGroupes)
    .set({ statut: 'rejete' })
    .where(eq(projetGroupes.id, groupeId))
    .run();
}

export function updateProjetGroupe(
  groupeId: string,
  data: { nom_canonique?: string; description?: string; nature?: string; competence?: string },
): void {
  const updates: Record<string, string> = {};
  if (data.nom_canonique !== undefined) updates.nom_canonique = data.nom_canonique;
  if (data.description !== undefined) updates.description = data.description;
  if (data.nature !== undefined) updates.nature = data.nature;
  if (data.competence !== undefined) updates.competence = data.competence;

  if (Object.keys(updates).length > 0) {
    db.update(projetGroupes)
      .set(updates)
      .where(eq(projetGroupes.id, groupeId))
      .run();
  }
}

export function mergeProjetGroupes(
  groupeIds: string[],
  nomCanonique: string,
): { mergedGroupeId: string } {
  if (groupeIds.length < 2) throw new Error('Need at least 2 groups to merge');

  // Keep the first group as the target, absorb the others
  const targetId = groupeIds[0];
  const sourceIds = groupeIds.slice(1);

  const target = db.select().from(projetGroupes).where(eq(projetGroupes.id, targetId)).get();
  if (!target) throw new Error(`Groupe not found: ${targetId}`);

  // Update canonical name on target
  db.update(projetGroupes)
    .set({ nom_canonique: nomCanonique })
    .where(eq(projetGroupes.id, targetId))
    .run();

  // Move all mentions from source groups to target
  for (const sourceId of sourceIds) {
    db.update(projetMentions)
      .set({ groupe_id: targetId })
      .where(eq(projetMentions.groupe_id, sourceId))
      .run();

    // Delete the now-empty source group
    db.delete(projetGroupes)
      .where(eq(projetGroupes.id, sourceId))
      .run();
  }

  return { mergedGroupeId: targetId };
}
