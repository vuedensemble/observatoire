import { ProjetWithRelations } from '@/lib/types';
import ThematiqueBadge from './ThematiqueBadge';
import StatutBadge from './StatutBadge';

interface ProjetCardProps {
  projet: ProjetWithRelations;
  onClick?: () => void;
}

function formatMontant(montant: number) {
  if (montant >= 1000000) {
    return `${(montant / 1000000).toFixed(1)} M€`;
  }
  return `${(montant / 1000).toFixed(0)} k€`;
}

const statutHoverColors: Record<string, string> = {
  en_cours: 'rgba(232, 160, 108, 0.15)',
  realise: 'rgba(139, 127, 255, 0.15)',
  abandonne: 'rgba(176, 181, 190, 0.15)',
};

export default function ProjetCard({ projet, onClick }: ProjetCardProps) {
  const hoverBg = statutHoverColors[projet.statut] || 'rgba(0,0,0,0.03)';

  return (
    <article
      className="card transition-all duration-200 hover:border-[var(--violet)] cursor-pointer p-0 overflow-hidden flex flex-col !border !border-black/30"
      style={{ backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      onClick={onClick}
    >
      {/* En-tête : commune + statut */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        {projet.communes.length > 0 ? (
          <span className="text-xs font-medium text-[var(--neutre)] uppercase tracking-wide">
            {projet.communes.map((c) => c.nom).join(', ')}
          </span>
        ) : (
          <span />
        )}
        <StatutBadge statut={projet.statut} />
      </div>

      {/* Corps : titre */}
      <div className="px-5 pb-3 flex-1">
        <h3 className="text-lg font-semibold text-black leading-snug">
          {projet.nom}
        </h3>
      </div>

      {/* Pied : thématiques + méta */}
      <div className="px-5 pb-4 pt-2">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {projet.thematiques.map((thematique) => (
            <ThematiqueBadge key={thematique.id} thematique={thematique} />
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--neutre)]">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {projet.deliberations.length} délibération{projet.deliberations.length > 1 ? 's' : ''}
          </span>
          {projet.montant && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {formatMontant(projet.montant)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
