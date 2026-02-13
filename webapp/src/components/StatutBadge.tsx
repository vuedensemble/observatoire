interface StatutBadgeProps {
  statut: 'en_cours' | 'realise' | 'abandonne';
}

const statutLabels: Record<string, string> = {
  en_cours: 'En cours',
  realise: 'Réalisé',
  abandonne: 'Abandonné',
};

export default function StatutBadge({ statut }: StatutBadgeProps) {
  return (
    <span className={`badge badge-statut-${statut}`}>
      {statutLabels[statut] || statut}
    </span>
  );
}
