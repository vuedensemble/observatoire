'use client';

import Link from 'next/link';
import { ProjetWithRelations } from '@/lib/types';
import ThematiqueBadge from './ThematiqueBadge';
import StatutBadge from './StatutBadge';
import Timeline from './Timeline';

interface ProjetDetailProps {
  projet: ProjetWithRelations;
}

function formatMontant(montant: number) {
  if (montant >= 1000000) {
    return `${(montant / 1000000).toFixed(1)} M€`;
  }
  return `${(montant / 1000).toFixed(0)} k€`;
}

export default function ProjetDetail({ projet }: ProjetDetailProps) {
  const timelineItems = projet.deliberations.map((delib) => ({
    id: delib.id,
    date: delib.conseil.date,
    content: (
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <span className="text-sm font-medium text-[var(--violet)]">
            {delib.numero}
          </span>
          {delib.conseil.pdf_url && (
            <a
              href={delib.conseil.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--violet)] hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </a>
          )}
        </div>
        <h4 className="font-semibold text-[var(--violet-dark)] mb-2">
          {delib.objet}
        </h4>
        <p className="text-sm text-[var(--foreground)] mb-3">
          {delib.detail}
        </p>
        <div className="text-sm">
          <span className="text-[var(--neutre)]">Décision :</span>{' '}
          <span className="font-medium text-[var(--vert)]">{delib.decision}</span>
        </div>
        {delib.votants && (
          <div className="mt-2 text-xs text-[var(--neutre)]">
            Pour : {delib.votants.pour} | Contre : {delib.votants.contre} | Abstention : {delib.votants.abstention}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div>
      {/* En-tête projet */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-[var(--violet)]">
            {projet.nom}
          </h2>
          <StatutBadge statut={projet.statut} />
        </div>

        {/* Communes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {projet.communes.map((commune) => (
            <Link
              key={commune.id}
              href={`/commune/${commune.slug}`}
              className="text-sm text-[var(--violet)] hover:underline"
            >
              {commune.nom}
            </Link>
          ))}
        </div>

        {/* Thématiques */}
        <div className="flex flex-wrap gap-2 mb-6">
          {projet.thematiques.map((thematique) => (
            <ThematiqueBadge key={thematique.id} thematique={thematique} />
          ))}
        </div>

        {/* Infos */}
        <div className="grid sm:grid-cols-2 gap-4 py-4 border-y border-[var(--border)]">
          <div>
            <span className="text-sm text-[var(--neutre)]">Nature</span>
            <p className="font-medium text-[var(--violet-dark)]">{projet.nature}</p>
          </div>
          <div>
            <span className="text-sm text-[var(--neutre)]">Compétence</span>
            <p className="font-medium text-[var(--violet-dark)]">{projet.competence}</p>
          </div>
          {projet.montant && (
            <div>
              <span className="text-sm text-[var(--neutre)]">Montant</span>
              <p className="font-medium text-[var(--violet-dark)]">{formatMontant(projet.montant)}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-[var(--neutre)]">Délibérations</span>
            <p className="font-medium text-[var(--violet-dark)]">{projet.deliberations.length}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[var(--violet-dark)] mb-2">
            Description
          </h3>
          <p className="text-[var(--foreground)] leading-relaxed">
            {projet.description}
          </p>
        </div>
      </div>

      {/* Timeline des délibérations */}
      <div>
        <h3 className="text-xl font-bold text-[var(--violet)] mb-4">
          Chronologie des délibérations
        </h3>

        {timelineItems.length > 0 ? (
          <Timeline items={timelineItems} />
        ) : (
          <p className="text-[var(--neutre)] text-center py-8">
            Aucune délibération associée à ce projet.
          </p>
        )}
      </div>
    </div>
  );
}
