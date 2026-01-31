interface StatutBadgeProps {
  statut: 'en_cours' | 'vote' | 'abandonne';
}

const statutLabels: Record<string, string> = {
  en_cours: 'En cours',
  vote: 'Voté',
  abandonne: 'Abandonné',
};

export default function StatutBadge({ statut }: StatutBadgeProps) {
  return (
    <span className={`badge badge-statut-${statut}`}>
      {statutLabels[statut] || statut}
    </span>
  );
}
