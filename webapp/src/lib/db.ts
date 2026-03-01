import { eq, sql, inArray, and } from 'drizzle-orm';
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
export async function getAllCommunes(): Promise<CommuneWithStats[]> {
  const rows = await db
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
    .from(communes);

  return rows.map((r) => ({
    ...r,
    infos_generales: (r.infos_generales as Record<string, unknown> | null) ?? undefined,
    nombre_projets: Number(r.nombre_projets),
    nombre_conseils: Number(r.nombre_conseils),
  }));
}

export async function getCommuneById(id: string): Promise<Commune | undefined> {
  const [row] = await db.select().from(communes).where(eq(communes.id, id)).limit(1);
  if (!row) return undefined;
  return { ...row, infos_generales: (row.infos_generales as Record<string, unknown> | null) ?? undefined };
}

export async function getCommuneBySlug(slug: string): Promise<Commune | undefined> {
  const [row] = await db.select().from(communes).where(eq(communes.slug, slug)).limit(1);
  if (!row) return undefined;
  return { ...row, infos_generales: (row.infos_generales as Record<string, unknown> | null) ?? undefined };
}

export async function searchCommunes(query: string): Promise<CommuneWithStats[]> {
  const q = query.toLowerCase();
  const all = await getAllCommunes();
  return all.filter(
    (c) => c.nom.toLowerCase().includes(q) || c.code_postal.includes(q)
  );
}

// Conseils municipaux
export async function getConseilsByCommune(communeId: string): Promise<ConseilWithDeliberations[]> {
  const [communeRow, conseils] = await Promise.all([
    db.select().from(communes).where(eq(communes.id, communeId)).limit(1).then(r => r[0]),
    db.select().from(conseilsMunicipaux).where(eq(conseilsMunicipaux.commune_id, communeId)),
  ]);

  if (!communeRow) return [];

  const communeObj: Commune = {
    ...communeRow,
    infos_generales: (communeRow.infos_generales as Record<string, unknown> | null) ?? undefined,
  };

  const conseilIds = conseils.map(c => c.id);
  const allDelibs = conseilIds.length > 0
    ? await db.select().from(deliberations).where(inArray(deliberations.conseil_id, conseilIds))
    : [];

  // Group deliberations by conseil_id in memory
  const delibsByConseil = new Map<string, Deliberation[]>();
  for (const d of allDelibs) {
    if (!delibsByConseil.has(d.conseil_id)) delibsByConseil.set(d.conseil_id, []);
    delibsByConseil.get(d.conseil_id)!.push(d as Deliberation);
  }

  return conseils
    .map(cm => ({
      ...cm,
      deliberations: delibsByConseil.get(cm.id) || [],
      commune: communeObj,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getConseilById(id: string): Promise<ConseilWithDeliberations | undefined> {
  const [conseil] = await db.select().from(conseilsMunicipaux).where(eq(conseilsMunicipaux.id, id)).limit(1);
  if (!conseil) return undefined;

  const [communeRow] = await db.select().from(communes).where(eq(communes.id, conseil.commune_id)).limit(1);
  if (!communeRow) return undefined;

  const delibs = await db
    .select()
    .from(deliberations)
    .where(eq(deliberations.conseil_id, conseil.id));

  return {
    ...conseil,
    deliberations: delibs as Deliberation[],
    commune: { ...communeRow, infos_generales: (communeRow.infos_generales as Record<string, unknown> | null) ?? undefined },
  };
}

// Deliberations
export async function getDeliberationsByCommune(communeId: string): Promise<(Deliberation & { conseil: ConseilMunicipal })[]> {
  const conseils = await db
    .select()
    .from(conseilsMunicipaux)
    .where(eq(conseilsMunicipaux.commune_id, communeId));

  const conseilIds = conseils.map((c) => c.id);
  if (conseilIds.length === 0) return [];

  const conseilMap = new Map(conseils.map((c) => [c.id, c]));
  const delibs = await db.select().from(deliberations).where(inArray(deliberations.conseil_id, conseilIds));

  return delibs
    .map((d) => ({
      ...(d as Deliberation),
      conseil: conseilMap.get(d.conseil_id)! as ConseilMunicipal,
    }))
    .sort((a, b) => new Date(b.conseil.date).getTime() - new Date(a.conseil.date).getTime());
}

export async function getDeliberationById(id: string): Promise<(Deliberation & { conseil: ConseilMunicipal }) | undefined> {
  const [delib] = await db.select().from(deliberations).where(eq(deliberations.id, id)).limit(1);
  if (!delib) return undefined;

  const [conseil] = await db.select().from(conseilsMunicipaux).where(eq(conseilsMunicipaux.id, delib.conseil_id)).limit(1);
  if (!conseil) return undefined;

  return { ...(delib as Deliberation), conseil: conseil as ConseilMunicipal };
}

// Thematiques
export async function getAllThematiques(): Promise<Thematique[]> {
  return db.select().from(thematiques);
}

export async function getThematiqueById(id: string): Promise<Thematique | undefined> {
  const [row] = await db.select().from(thematiques).where(eq(thematiques.id, id)).limit(1);
  return row;
}

// Projets
export async function getAllProjets(): Promise<ProjetWithRelations[]> {
  const allProjets = await db.select().from(projets);
  const results: ProjetWithRelations[] = [];
  for (const p of allProjets) {
    results.push(await enrichProjet(p as Projet));
  }
  return results;
}

export async function getProjetById(id: string): Promise<ProjetWithRelations | undefined> {
  const [projet] = await db.select().from(projets).where(eq(projets.id, id)).limit(1);
  if (!projet) return undefined;
  return enrichProjet(projet as Projet);
}

export async function getProjetBySlug(slug: string): Promise<ProjetWithRelations | undefined> {
  const [projet] = await db.select().from(projets).where(eq(projets.slug, slug)).limit(1);
  if (!projet) return undefined;
  return enrichProjet(projet as Projet);
}

export async function getProjetsByCommune(communeId: string): Promise<ProjetWithRelations[]> {
  const links = await db
    .select()
    .from(projetCommunes)
    .where(eq(projetCommunes.commune_id, communeId));

  const projetIds = links.map((l) => l.projet_id);
  if (projetIds.length === 0) return [];

  const communeProjets = await db.select().from(projets).where(inArray(projets.id, projetIds));

  const results: ProjetWithRelations[] = [];
  for (const p of communeProjets) {
    results.push(await enrichProjet(p as Projet));
  }
  return results;
}

export async function getProjetsByThematique(thematiqueId: string): Promise<ProjetWithRelations[]> {
  const links = await db
    .select()
    .from(projetThematiques)
    .where(eq(projetThematiques.thematique_id, thematiqueId));

  const projetIds = links.map((l) => l.projet_id);
  if (projetIds.length === 0) return [];

  const themProjets = await db.select().from(projets).where(inArray(projets.id, projetIds));

  const results: ProjetWithRelations[] = [];
  for (const p of themProjets) {
    results.push(await enrichProjet(p as Projet));
  }
  return results;
}

async function enrichProjet(projet: Projet): Promise<ProjetWithRelations> {
  // Fetch all junction rows in parallel
  const [communeLinks, thematiqueLinks, delibLinks] = await Promise.all([
    db.select().from(projetCommunes).where(eq(projetCommunes.projet_id, projet.id)),
    db.select().from(projetThematiques).where(eq(projetThematiques.projet_id, projet.id)),
    db.select().from(projetDeliberations).where(eq(projetDeliberations.projet_id, projet.id)),
  ]);

  const communeIds = communeLinks.map((l) => l.commune_id);
  const thematiqueIds = thematiqueLinks.map((l) => l.thematique_id);
  const delibIds = delibLinks.map((l) => l.deliberation_id);

  // Fetch only the needed rows in parallel
  const [projetCommunesRaw, projetThematiquesList, projetDelibs] = await Promise.all([
    communeIds.length > 0 ? db.select().from(communes).where(inArray(communes.id, communeIds)) : Promise.resolve([]),
    thematiqueIds.length > 0 ? db.select().from(thematiques).where(inArray(thematiques.id, thematiqueIds)) : Promise.resolve([]),
    delibIds.length > 0 ? db.select().from(deliberations).where(inArray(deliberations.id, delibIds)) : Promise.resolve([]),
  ]);

  const projetCommunesList = projetCommunesRaw.map((c) => ({
    ...c,
    infos_generales: (c.infos_generales as Record<string, unknown> | null) ?? undefined,
  }));

  // Fetch conseils for the deliberations
  const conseilIds = [...new Set(projetDelibs.map((d) => d.conseil_id))];
  const conseilRows = conseilIds.length > 0
    ? await db.select().from(conseilsMunicipaux).where(inArray(conseilsMunicipaux.id, conseilIds))
    : [];
  const conseilMap = new Map(conseilRows.map((c) => [c.id, c]));

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
export async function countProjets(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(projets);
  return Number(row?.count ?? 0);
}

export async function countDeliberations(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(deliberations);
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

export async function searchProjets(filters: SearchFilters): Promise<ProjetWithRelations[]> {
  let results = await getAllProjets();

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

export async function getProjetGroupesByCommune(communeId: string): Promise<ProjetGroupeWithMentions[]> {
  // Fetch groups and all mentions for this commune in parallel
  const [groups, allMentions] = await Promise.all([
    db.select().from(projetGroupes).where(eq(projetGroupes.commune_id, communeId)),
    db.select().from(projetMentions).where(eq(projetMentions.commune_id, communeId)),
  ]);

  // Index mentions by groupe_id in memory
  const mentionsByGroup = new Map<string, ProjetMention[]>();
  for (const m of allMentions) {
    if (!m.groupe_id) continue;
    if (!mentionsByGroup.has(m.groupe_id)) mentionsByGroup.set(m.groupe_id, []);
    mentionsByGroup.get(m.groupe_id)!.push(m as ProjetMention);
  }

  return groups.map(g => ({
    ...g,
    statut: g.statut as ProjetGroupe['statut'],
    mentions: mentionsByGroup.get(g.id) || [],
  }));
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

export async function getUnvalidatedProjetsForCommune(communeId: string): Promise<ProjetWithRelations[]> {
  // Bulk fetch: groups, commune, thematiques, and all mentions for this commune (4 parallel queries)
  const [groupsRaw, communeRow, allThems, allMentions] = await Promise.all([
    db.select().from(projetGroupes).where(eq(projetGroupes.commune_id, communeId)),
    db.select().from(communes).where(eq(communes.id, communeId)).limit(1).then(r => r[0]),
    db.select().from(thematiques),
    db.select().from(projetMentions).where(eq(projetMentions.commune_id, communeId)),
  ]);

  if (!communeRow) return [];

  const groups = groupsRaw.filter((g) => g.statut === 'proposition');
  if (groups.length === 0) return [];

  const communeObj: Commune = {
    ...communeRow,
    infos_generales: (communeRow.infos_generales as Record<string, unknown> | null) ?? undefined,
  };

  // Index mentions by groupe_id in memory
  const mentionsByGroup = new Map<string, typeof allMentions>();
  for (const m of allMentions) {
    if (!m.groupe_id) continue;
    if (!mentionsByGroup.has(m.groupe_id)) mentionsByGroup.set(m.groupe_id, []);
    mentionsByGroup.get(m.groupe_id)!.push(m);
  }

  // Collect ALL unique deliberation IDs across all mentions
  const allDelibIds = new Set<string>();
  for (const m of allMentions) {
    if (m.deliberation_id) allDelibIds.add(m.deliberation_id);
  }

  // Bulk fetch all deliberations in one query
  const allDelibs = allDelibIds.size > 0
    ? await db.select().from(deliberations).where(inArray(deliberations.id, [...allDelibIds]))
    : [];
  const delibMap = new Map(allDelibs.map(d => [d.id, d]));

  // Bulk fetch all conseils for those deliberations in one query
  const allConseilIds = [...new Set(allDelibs.map(d => d.conseil_id))];
  const allConseils = allConseilIds.length > 0
    ? await db.select().from(conseilsMunicipaux).where(inArray(conseilsMunicipaux.id, allConseilIds))
    : [];
  const conseilMap = new Map(allConseils.map(c => [c.id, c]));

  // Assemble everything in memory — no more DB queries in the loop
  const results: ProjetWithRelations[] = [];
  for (const g of groups) {
    const mentions = mentionsByGroup.get(g.id) || [];

    // Build deliberations with conseils from the pre-fetched maps
    const delibIds = new Set<string>();
    for (const m of mentions) {
      if (m.deliberation_id) delibIds.add(m.deliberation_id);
    }

    const delibsWithConseils: (Deliberation & { conseil: ConseilMunicipal })[] = [];
    for (const delibId of delibIds) {
      const delib = delibMap.get(delibId);
      if (!delib) continue;
      const conseil = conseilMap.get(delib.conseil_id);
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
    const matchedThems = inferThematiques(textsForInference, allThems);

    results.push({
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
    });
  }
  return results;
}

export async function getUngroupedMentions(communeId: string): Promise<ProjetMention[]> {
  const rows = await db
    .select()
    .from(projetMentions)
    .where(eq(projetMentions.commune_id, communeId));

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

export async function validateProjetGroupe(
  groupeId: string,
  nomCanonique: string,
  description?: string,
): Promise<{ projetId: string }> {
  const [groupe] = await db.select().from(projetGroupes).where(eq(projetGroupes.id, groupeId)).limit(1);
  if (!groupe) throw new Error(`Groupe not found: ${groupeId}`);

  const projetId = `proj-${slugify(nomCanonique).slice(0, 60)}`;
  const projetSlug = slugify(nomCanonique);

  // Create the projet
  await db.insert(projets).values({
    id: projetId,
    nom: nomCanonique,
    slug: projetSlug,
    description: description || groupe.description || '',
    nature: groupe.nature || '',
    competence: groupe.competence || '',
    statut: 'en_cours',
  });

  // Link projet to commune
  await db.insert(projetCommunes).values({
    projet_id: projetId,
    commune_id: groupe.commune_id,
  });

  // Link projet to all deliberations referenced by mentions in this group
  const mentions = await db
    .select()
    .from(projetMentions)
    .where(eq(projetMentions.groupe_id, groupeId));

  const delibIds = new Set<string>();
  for (const m of mentions) {
    if (m.deliberation_id) delibIds.add(m.deliberation_id);
  }

  for (const delibId of delibIds) {
    await db.insert(projetDeliberations).values({
      projet_id: projetId,
      deliberation_id: delibId,
    });
  }

  // Infer and persist thematiques
  const allThems = await db.select().from(thematiques);
  const textsForInference = [groupe.nature || '', groupe.competence || ''];
  for (const m of mentions) {
    if (m.nature) textsForInference.push(m.nature);
    if (m.competence) textsForInference.push(m.competence);
  }
  const matchedThems = inferThematiques(textsForInference, allThems);
  if (matchedThems.length > 0) {
    await setProjetThematiques(projetId, matchedThems.map(t => t.id));
  }

  // Update groupe status
  await db.update(projetGroupes)
    .set({ statut: 'valide', projet_id: projetId })
    .where(eq(projetGroupes.id, groupeId));

  return { projetId };
}

export async function rejectProjetGroupe(groupeId: string): Promise<void> {
  await db.update(projetGroupes)
    .set({ statut: 'rejete' })
    .where(eq(projetGroupes.id, groupeId));
}

export async function updateProjetGroupe(
  groupeId: string,
  data: { nom_canonique?: string; description?: string; nature?: string; competence?: string },
): Promise<void> {
  const updates: Record<string, string> = {};
  if (data.nom_canonique !== undefined) updates.nom_canonique = data.nom_canonique;
  if (data.description !== undefined) updates.description = data.description;
  if (data.nature !== undefined) updates.nature = data.nature;
  if (data.competence !== undefined) updates.competence = data.competence;

  if (Object.keys(updates).length > 0) {
    await db.update(projetGroupes)
      .set(updates)
      .where(eq(projetGroupes.id, groupeId));
  }
}

export async function mergeProjetGroupes(
  groupeIds: string[],
  nomCanonique: string,
): Promise<{ mergedGroupeId: string }> {
  if (groupeIds.length < 2) throw new Error('Need at least 2 groups to merge');

  // Keep the first group as the target, absorb the others
  const targetId = groupeIds[0];
  const sourceIds = groupeIds.slice(1);

  const [target] = await db.select().from(projetGroupes).where(eq(projetGroupes.id, targetId)).limit(1);
  if (!target) throw new Error(`Groupe not found: ${targetId}`);

  // Update canonical name on target
  await db.update(projetGroupes)
    .set({ nom_canonique: nomCanonique })
    .where(eq(projetGroupes.id, targetId));

  // Move all mentions from source groups to target
  for (const sourceId of sourceIds) {
    await db.update(projetMentions)
      .set({ groupe_id: targetId })
      .where(eq(projetMentions.groupe_id, sourceId));

    // Delete the now-empty source group
    await db.delete(projetGroupes)
      .where(eq(projetGroupes.id, sourceId));
  }

  return { mergedGroupeId: targetId };
}

// --- Admin: CRUD operations ---

export async function updateCommune(
  id: string,
  data: { nom?: string; slug?: string; code_postal?: string; population?: number; maire?: string; infos_generales?: Record<string, unknown> | null },
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.nom !== undefined) updates.nom = data.nom;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.code_postal !== undefined) updates.code_postal = data.code_postal;
  if (data.population !== undefined) updates.population = data.population;
  if (data.maire !== undefined) updates.maire = data.maire;
  if (data.infos_generales !== undefined) updates.infos_generales = data.infos_generales;

  if (Object.keys(updates).length > 0) {
    await db.update(communes).set(updates).where(eq(communes.id, id));
  }
}

export async function updateConseil(
  id: string,
  data: { date?: string; presents?: string[]; absents?: string[]; pdf_url?: string },
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.date !== undefined) updates.date = data.date;
  if (data.presents !== undefined) updates.presents = data.presents;
  if (data.absents !== undefined) updates.absents = data.absents;
  if (data.pdf_url !== undefined) updates.pdf_url = data.pdf_url;

  if (Object.keys(updates).length > 0) {
    await db.update(conseilsMunicipaux).set(updates).where(eq(conseilsMunicipaux.id, id));
  }
}

export async function updateDeliberation(
  id: string,
  data: { numero?: string; objet?: string; detail?: string; decision?: string; votants?: { pour?: number; contre?: number; abstention?: number } | null },
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.numero !== undefined) updates.numero = data.numero;
  if (data.objet !== undefined) updates.objet = data.objet;
  if (data.detail !== undefined) updates.detail = data.detail;
  if (data.decision !== undefined) updates.decision = data.decision;
  if (data.votants !== undefined) updates.votants = data.votants;

  if (Object.keys(updates).length > 0) {
    await db.update(deliberations).set(updates).where(eq(deliberations.id, id));
  }
}

export async function updateProjet(
  id: string,
  data: { nom?: string; slug?: string; description?: string; nature?: string; competence?: string; statut?: 'en_cours' | 'realise' | 'abandonne'; montant?: number | null },
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.nom !== undefined) updates.nom = data.nom;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.description !== undefined) updates.description = data.description;
  if (data.nature !== undefined) updates.nature = data.nature;
  if (data.competence !== undefined) updates.competence = data.competence;
  if (data.statut !== undefined) updates.statut = data.statut;
  if (data.montant !== undefined) updates.montant = data.montant;

  if (Object.keys(updates).length > 0) {
    await db.update(projets).set(updates).where(eq(projets.id, id));
  }
}

export async function setProjetThematiques(
  projetId: string,
  thematiqueIds: string[],
): Promise<void> {
  // Delete existing links
  await db.delete(projetThematiques).where(eq(projetThematiques.projet_id, projetId));

  // Insert new links
  for (const thematiqueId of thematiqueIds) {
    await db.insert(projetThematiques).values({
      projet_id: projetId,
      thematique_id: thematiqueId,
    });
  }
}

export async function createThematique(
  data: { id: string; nom: string; description: string; couleur: string },
): Promise<void> {
  await db.insert(thematiques).values(data);
}

export async function updateThematique(
  id: string,
  data: { nom?: string; description?: string; couleur?: string },
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.nom !== undefined) updates.nom = data.nom;
  if (data.description !== undefined) updates.description = data.description;
  if (data.couleur !== undefined) updates.couleur = data.couleur;

  if (Object.keys(updates).length > 0) {
    await db.update(thematiques).set(updates).where(eq(thematiques.id, id));
  }
}

export async function deleteThematique(id: string): Promise<void> {
  // Remove junction rows first
  await db.delete(projetThematiques).where(eq(projetThematiques.thematique_id, id));
  await db.delete(thematiques).where(eq(thematiques.id, id));
}
