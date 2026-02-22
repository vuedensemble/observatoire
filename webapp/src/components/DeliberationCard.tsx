import { Deliberation, ConseilMunicipal } from '@/lib/types';
import { formatDateLong } from '@/lib/utils';

interface DeliberationCardProps {
  deliberation: Deliberation & { conseil: ConseilMunicipal };
  showPdfLink?: boolean;
  index?: number;
}

export default function DeliberationCard({
  deliberation,
  showPdfLink = true,
  index,
}: DeliberationCardProps) {
  // Mode compact : dans l'accordéon des conseils municipaux
  if (!showPdfLink && index !== undefined) {
    return (
      <article className="flex gap-4 py-4 group">
        {/* Numéro séquentiel */}
        <div className="flex-shrink-0 w-8 text-right">
          <span className="text-sm font-semibold text-[var(--violet)] opacity-40 group-hover:opacity-100 transition-opacity">
            {index}
          </span>
        </div>

        {/* Trait violet à gauche */}
        <div className="w-0.5 flex-shrink-0 bg-[var(--violet)] opacity-20 group-hover:opacity-60 rounded-full transition-opacity" />

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-black leading-snug mb-1">
            {deliberation.objet}
          </h4>
          <p className="text-sm text-black/70 line-clamp-1 mb-1.5">
            {deliberation.detail}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span>
              <span className="text-[var(--neutre)]">Décision :</span>{' '}
              <span className="font-medium text-[var(--vert)]">{deliberation.decision}</span>
            </span>
            {deliberation.votants_texte && deliberation.votants_texte !== '---' ? (
              <span className="text-xs text-[var(--neutre)]">{deliberation.votants_texte}</span>
            ) : deliberation.votants ? (
              <span className="text-xs text-[var(--neutre)]">
                {deliberation.votants.pour} pour
                {deliberation.votants.contre ? ` · ${deliberation.votants.contre} contre` : ''}
                {deliberation.votants.abstention ? ` · ${deliberation.votants.abstention} abst.` : ''}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  // Mode card classique (timeline projet, standalone)
  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <span className="text-sm text-[var(--neutre)]">
          {formatDateLong(deliberation.conseil.date)}
        </span>
      </div>

      <h4 className="font-semibold text-black mb-2">
        {deliberation.objet}
      </h4>

      <p className="text-sm text-black mb-3 line-clamp-2">
        {deliberation.detail}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm">
          <span className="text-[var(--neutre)]">Décision :</span>{' '}
          <span className="font-medium text-[var(--vert)]">{deliberation.decision}</span>
        </span>

        {showPdfLink && deliberation.conseil.pdf_url && (
          <a
            href={deliberation.conseil.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--violet)] hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            PDF
          </a>
        )}
      </div>
    </article>
  );
}
