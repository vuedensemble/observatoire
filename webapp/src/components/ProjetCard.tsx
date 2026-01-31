import Link from 'next/link';
import { ProjetWithRelations } from '@/lib/types';
import ThematiqueBadge from './ThematiqueBadge';
import StatutBadge from './StatutBadge';

interface ProjetCardProps {
  projet: ProjetWithRelations;
}

export default function ProjetCard({ projet }: ProjetCardProps) {
  return (
    <Link href={`/projet/${projet.slug}`} className="block hover:no-underline">
      <article className="card transition-all hover:border-[var(--violet)]">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-semibold text-[var(--violet-dark)] flex-1">
            {projet.nom}
          </h3>
          <StatutBadge statut={projet.statut} />
        </div>

        {projet.communes.length > 0 && (
          <p className="text-sm text-[var(--neutre)] mb-3">
            {projet.communes.map((c) => c.nom).join(', ')}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {projet.thematiques.map((thematique) => (
            <ThematiqueBadge key={thematique.id} thematique={thematique} />
          ))}
        </div>

        <div className="text-sm text-[var(--neutre)]">
          {projet.deliberations.length} délibération{projet.deliberations.length > 1 ? 's' : ''}
        </div>
      </article>
    </Link>
  );
}
