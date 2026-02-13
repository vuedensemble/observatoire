import { Deliberation, ConseilMunicipal } from '@/lib/types';
import { formatDateLong } from '@/lib/utils';

interface DeliberationCardProps {
  deliberation: Deliberation & { conseil: ConseilMunicipal };
  showPdfLink?: boolean;
}

export default function DeliberationCard({
  deliberation,
  showPdfLink = true,
}: DeliberationCardProps) {
  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <span className="text-sm text-[var(--neutre)]">
          {formatDateLong(deliberation.conseil.date)}
        </span>
        <span className="text-sm font-medium text-[var(--violet)]">
          {deliberation.numero}
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
