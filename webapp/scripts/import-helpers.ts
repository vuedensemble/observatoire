/**
 * Pure helper functions for the city import pipeline.
 * No side effects, no database access — only data transformations.
 */

/** Convert DD-MM-YYYY to YYYY-MM-DD */
export function convertDate(ddmmyyyy: string): string | null {
  const match = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

/** Generate a URL-friendly slug from a string */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Parse free-text votants string into structured numbers (best-effort) */
export function parseVotants(text: string): { pour?: number; contre?: number; abstention?: number } | null {
  if (!text || text === '---' || text.trim() === '') return null;

  const result: { pour?: number; contre?: number; abstention?: number } = {};

  // Patterns: "29 voix pour", "Pour : 26", "26 pour", "29 pour"
  const pourMatch = text.match(/(\d+)\s*(?:voix\s+)?pour/i) || text.match(/pour\s*:?\s*(\d+)/i);
  if (pourMatch) result.pour = parseInt(pourMatch[1], 10);

  // Patterns: "5 contre", "Contre : 5"
  const contreMatch = text.match(/(\d+)\s*contre/i) || text.match(/contre\s*:?\s*(\d+)/i);
  if (contreMatch) result.contre = parseInt(contreMatch[1], 10);

  // Patterns: "2 abstentions", "Abstention : 2", "2 abst"
  const abstMatch = text.match(/(\d+)\s*abst/i) || text.match(/abstention\s*:?\s*(\d+)/i);
  if (abstMatch) result.abstention = parseInt(abstMatch[1], 10);

  // "Adopté à l'unanimité" → no numeric breakdown, return null
  if (result.pour === undefined && result.contre === undefined && result.abstention === undefined) {
    return null;
  }

  return result;
}

/** Structured JSON file shape from the Python pipeline */
export interface StructuredJson {
  date: string; // DD-MM-YYYY
  deliberations: StructuredDeliberation[];
  projets_mentionnes_global?: ProjetMentionne[];
}

export interface StructuredDeliberation {
  numero: string;
  objet: string;
  detail: string;
  decision: string;
  votants: string;
  projets_mentionnes?: ProjetMentionne[];
}

export interface ProjetMentionne {
  nom: string;
  description?: string;
  nature?: string;
  competence?: string;
}

/** Section check JSON shape */
export interface SectionCheck {
  est_conseil_municipal: boolean;
  raison: string;
  type_documents?: string;
}

/** Section JSON shape */
export interface SectionJson {
  title: string;
  source_url: string;
  files: { url: string; text: string; filename: string }[];
}

/** Generate deterministic conseil ID from commune slug + date */
export function conseilId(communeSlug: string, date: string): string {
  return `${communeSlug}-cm-${date}`;
}

/** Generate deterministic deliberation ID from conseil ID + numero */
export function deliberationId(conseilIdStr: string, numero: string, sourceFile: string): string {
  // Use numero if meaningful, otherwise fallback to source file
  const suffix = numero && numero !== '---' && numero.trim() !== ''
    ? numero.replace(/[^a-zA-Z0-9-]/g, '_')
    : slugify(sourceFile.replace('_structured.json', ''));
  return `${conseilIdStr}-d-${suffix}`;
}

/** Generate deterministic mention ID */
export function mentionId(communeSlug: string, sourceFile: string, index: number): string {
  return `${communeSlug}-m-${slugify(sourceFile.replace('_structured.json', ''))}-${index}`;
}
