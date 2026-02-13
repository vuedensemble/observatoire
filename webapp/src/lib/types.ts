// Types basés sur les spécifications 02-architecture.md

export interface Commune {
  id: string;
  nom: string;
  slug: string;
  code_postal: string;
  population: number;
  maire: string;
  infos_generales?: Record<string, unknown>;
}

export interface ConseilMunicipal {
  id: string;
  commune_id: string;
  date: string;
  presents: string[];
  absents: string[];
  pdf_url: string;
}

export interface Deliberation {
  id: string;
  conseil_id: string;
  numero: string;
  objet: string;
  detail: string;
  decision: string;
  votants?: {
    pour?: number;
    contre?: number;
    abstention?: number;
  };
}

export interface Thematique {
  id: string;
  nom: string;
  description: string;
  couleur: string;
}

export interface Projet {
  id: string;
  nom: string;
  slug: string;
  description: string;
  nature: string;
  competence: string;
  statut: 'en_cours' | 'realise' | 'abandonne';
  montant?: number;
}

// Relations
export interface ProjetDeliberation {
  projet_id: string;
  deliberation_id: string;
}

export interface ProjetThematique {
  projet_id: string;
  thematique_id: string;
}

export interface ProjetCommune {
  projet_id: string;
  commune_id: string;
}

// Types enrichis pour l'affichage
export interface ProjetWithRelations extends Projet {
  communes: Commune[];
  thematiques: Thematique[];
  deliberations: (Deliberation & { conseil: ConseilMunicipal })[];
}

export interface CommuneWithStats extends Commune {
  nombre_projets: number;
  nombre_conseils: number;
}

export interface ConseilWithDeliberations extends ConseilMunicipal {
  deliberations: Deliberation[];
  commune: Commune;
}
