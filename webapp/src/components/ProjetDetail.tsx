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
      <div className="card !border !border-black/30" style={{ padding: '1rem 1.25rem', backgroundColor: 'transparent' }}>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
          <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a', flex: 1 }}>
            {delib.objet}
          </h4>
          {delib.conseil.pdf_url && (
            <a
              href={delib.conseil.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
              style={{ fontSize: '0.8125rem', color: 'var(--violet)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </a>
          )}
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#1a1a1a', marginBottom: '0.5rem', lineHeight: 1.6 }}>
          {delib.detail}
        </p>
        <div style={{ fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--neutre)' }}>Décision :</span>{' '}
          <span style={{ fontWeight: 500, color: 'var(--vert)' }}>{delib.decision}</span>
        </div>
        {delib.votants && (
          <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--neutre)' }}>
            Pour : {delib.votants.pour} | Contre : {delib.votants.contre} | Abstention : {delib.votants.abstention}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <div>
      {/* En-tête projet */}
      <div className="bg-white rounded-lg p-5 mb-5">
        {/* Commune(s) */}
        <div className="flex flex-wrap gap-2 mb-1">
          {projet.communes.map((commune) => (
            <Link
              key={commune.id}
              href={`/commune/${commune.slug}`}
              className="hover:text-[var(--violet)]"
              style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--neutre)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {commune.nom}
            </Link>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-black leading-snug mb-3">
          {projet.nom}
        </h3>

        {/* Badges : thématiques + statut */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {projet.thematiques.map((thematique) => (
            <ThematiqueBadge key={thematique.id} thematique={thematique} />
          ))}
          <StatutBadge statut={projet.statut} />
        </div>

        {/* Infos */}
        <div className="grid sm:grid-cols-2 gap-3 py-3">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutre)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Compétence</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', marginTop: '0.125rem' }}>{projet.competence}</p>
          </div>
          {projet.montant && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--neutre)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Montant</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a1a', marginTop: '0.125rem' }}>{formatMontant(projet.montant)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.375rem' }}>
            En quelques mots
          </div>
          <p style={{ fontSize: '0.875rem', color: '#1a1a1a', lineHeight: 1.7 }}>
            {projet.description}
          </p>
        </div>
      </div>

      {/* Timeline des délibérations */}
      <div style={{ paddingRight: '1.25rem' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--violet)', marginBottom: '0.75rem' }}>
          Chronologie des délibérations
          <span style={{ fontWeight: 600, color: 'var(--violet)', marginLeft: '0.25rem' }}>
            ({projet.deliberations.length})
          </span>
        </div>

        {timelineItems.length > 0 ? (
          <Timeline items={timelineItems} />
        ) : (
          <p className="text-[var(--neutre)] text-center py-8" style={{ fontSize: '0.875rem' }}>
            Aucune délibération associée à ce projet.
          </p>
        )}
      </div>
    </div>
  );
}
