// Mock database avec fonctions d'accès aux données
import {
  communes,
  conseilsMunicipaux,
  deliberations,
  thematiques,
  projets,
  projetDeliberations,
  projetThematiques,
  projetCommunes,
} from './mock-data';
import {
  Commune,
  ConseilMunicipal,
  Deliberation,
  Thematique,
  Projet,
  ProjetWithRelations,
  CommuneWithStats,
  ConseilWithDeliberations,
} from './types';

// Communes
export function getAllCommunes(): CommuneWithStats[] {
  return communes.map((commune) => ({
    ...commune,
    nombre_projets: projetCommunes.filter((pc) => pc.commune_id === commune.id).length,
    nombre_conseils: conseilsMunicipaux.filter((cm) => cm.commune_id === commune.id).length,
  }));
}

export function getCommuneById(id: string): Commune | undefined {
  return communes.find((c) => c.id === id);
}

export function getCommuneBySlug(slug: string): Commune | undefined {
  return communes.find((c) => c.slug === slug);
}

export function searchCommunes(query: string): CommuneWithStats[] {
  const q = query.toLowerCase();
  return getAllCommunes().filter(
    (c) =>
      c.nom.toLowerCase().includes(q) ||
      c.code_postal.includes(q)
  );
}

// Conseils municipaux
export function getConseilsByCommune(communeId: string): ConseilWithDeliberations[] {
  return conseilsMunicipaux
    .filter((cm) => cm.commune_id === communeId)
    .map((cm) => ({
      ...cm,
      deliberations: deliberations.filter((d) => d.conseil_id === cm.id),
      commune: communes.find((c) => c.id === cm.commune_id)!,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getConseilById(id: string): ConseilWithDeliberations | undefined {
  const conseil = conseilsMunicipaux.find((cm) => cm.id === id);
  if (!conseil) return undefined;
  return {
    ...conseil,
    deliberations: deliberations.filter((d) => d.conseil_id === conseil.id),
    commune: communes.find((c) => c.id === conseil.commune_id)!,
  };
}

// Délibérations
export function getDeliberationsByCommune(communeId: string): (Deliberation & { conseil: ConseilMunicipal })[] {
  const communeConseils = conseilsMunicipaux.filter((cm) => cm.commune_id === communeId);
  const conseilIds = new Set(communeConseils.map((cm) => cm.id));

  return deliberations
    .filter((d) => conseilIds.has(d.conseil_id))
    .map((d) => ({
      ...d,
      conseil: communeConseils.find((cm) => cm.id === d.conseil_id)!,
    }))
    .sort((a, b) => new Date(b.conseil.date).getTime() - new Date(a.conseil.date).getTime());
}

export function getDeliberationById(id: string): (Deliberation & { conseil: ConseilMunicipal }) | undefined {
  const delib = deliberations.find((d) => d.id === id);
  if (!delib) return undefined;
  const conseil = conseilsMunicipaux.find((cm) => cm.id === delib.conseil_id);
  if (!conseil) return undefined;
  return { ...delib, conseil };
}

// Thématiques
export function getAllThematiques(): Thematique[] {
  return thematiques;
}

export function getThematiqueById(id: string): Thematique | undefined {
  return thematiques.find((t) => t.id === id);
}

// Projets
export function getAllProjets(): ProjetWithRelations[] {
  return projets.map((projet) => enrichProjet(projet));
}

export function getProjetById(id: string): ProjetWithRelations | undefined {
  const projet = projets.find((p) => p.id === id);
  if (!projet) return undefined;
  return enrichProjet(projet);
}

export function getProjetBySlug(slug: string): ProjetWithRelations | undefined {
  const projet = projets.find((p) => p.slug === slug);
  if (!projet) return undefined;
  return enrichProjet(projet);
}

export function getProjetsByCommune(communeId: string): ProjetWithRelations[] {
  const projetIds = projetCommunes
    .filter((pc) => pc.commune_id === communeId)
    .map((pc) => pc.projet_id);

  return projets
    .filter((p) => projetIds.includes(p.id))
    .map((projet) => enrichProjet(projet));
}

export function getProjetsByThematique(thematiqueId: string): ProjetWithRelations[] {
  const projetIds = projetThematiques
    .filter((pt) => pt.thematique_id === thematiqueId)
    .map((pt) => pt.projet_id);

  return projets
    .filter((p) => projetIds.includes(p.id))
    .map((projet) => enrichProjet(projet));
}

function enrichProjet(projet: Projet): ProjetWithRelations {
  const communeIds = projetCommunes
    .filter((pc) => pc.projet_id === projet.id)
    .map((pc) => pc.commune_id);

  const thematiqueIds = projetThematiques
    .filter((pt) => pt.projet_id === projet.id)
    .map((pt) => pt.thematique_id);

  const deliberationIds = projetDeliberations
    .filter((pd) => pd.projet_id === projet.id)
    .map((pd) => pd.deliberation_id);

  const projetDelibs = deliberations
    .filter((d) => deliberationIds.includes(d.id))
    .map((d) => ({
      ...d,
      conseil: conseilsMunicipaux.find((cm) => cm.id === d.conseil_id)!,
    }))
    .sort((a, b) => new Date(b.conseil.date).getTime() - new Date(a.conseil.date).getTime());

  return {
    ...projet,
    communes: communes.filter((c) => communeIds.includes(c.id)),
    thematiques: thematiques.filter((t) => thematiqueIds.includes(t.id)),
    deliberations: projetDelibs,
  };
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
