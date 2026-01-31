// Formatage de date cohérent serveur/client
const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const MOIS_COURT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
];

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  const jour = date.getDate();
  const mois = MOIS[date.getMonth()];
  const annee = date.getFullYear();
  return `${jour} ${mois} ${annee}`;
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const jour = date.getDate();
  const mois = MOIS_COURT[date.getMonth()];
  const annee = date.getFullYear();
  return `${jour} ${mois} ${annee}`;
}
