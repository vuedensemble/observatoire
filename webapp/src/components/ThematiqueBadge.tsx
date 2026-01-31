import { Thematique } from '@/lib/types';

interface ThematiqueBadgeProps {
  thematique: Thematique;
}

export default function ThematiqueBadge({ thematique }: ThematiqueBadgeProps) {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${thematique.couleur}20`,
        color: thematique.couleur,
      }}
    >
      {thematique.nom}
    </span>
  );
}
