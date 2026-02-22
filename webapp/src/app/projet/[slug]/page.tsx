import { notFound } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import ThematiqueBadge from '@/components/ThematiqueBadge';
import StatutBadge from '@/components/StatutBadge';
import Timeline from '@/components/Timeline';
import { getProjetBySlug } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjetPage({ params }: PageProps) {
  const { slug } = await params;
  const projet = getProjetBySlug(slug);

  if (!projet) {
    notFound();
  }

  const breadcrumbItems = [];
  if (projet.communes.length > 0) {
    breadcrumbItems.push({
      label: projet.communes[0].nom,
      href: `/commune/${projet.communes[0].slug}`,
    });
  }
  breadcrumbItems.push({ label: projet.nom });

  const formatMontant = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)} M€`;
    }
    return `${(montant / 1000).toFixed(0)} k€`;
  };

  const timelineItems = projet.deliberations.map((delib) => ({
    id: delib.id,
    date: delib.conseil.date,
    content: (
      <div className="card">
        {delib.conseil.pdf_url && (
          <div className="flex items-end justify-end mb-2">
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
          </div>
        )}
        <h4 className="font-semibold text-black mb-2">
          {delib.objet}
        </h4>
        <p className="text-sm text-black mb-3">
          {delib.detail}
        </p>
        <div className="text-sm">
          <span className="text-[var(--neutre)]">Décision :</span>{' '}
          <span className="font-medium text-[var(--vert)]">{delib.decision}</span>
        </div>
        {delib.votants_texte && delib.votants_texte !== '---' ? (
          <div className="mt-2 text-xs text-[var(--neutre)]">{delib.votants_texte}</div>
        ) : delib.votants ? (
          <div className="mt-2 text-xs text-[var(--neutre)]">
            Pour : {delib.votants.pour} | Contre : {delib.votants.contre} | Abstention : {delib.votants.abstention}
          </div>
        ) : null}
      </div>
    ),
  }));

  return (
    <div className="section">
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        {/* En-tête projet */}
        <div className="bg-white rounded-lg p-6 lg:p-8 mb-8">
          {/* Commune(s) */}
          <div className="flex flex-wrap gap-2 mb-1">
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

          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--violet)] mb-4">
            {projet.nom}
          </h1>

          {/* Badges : thématiques + statut */}
          <div className="flex flex-wrap gap-2 mb-6">
            {projet.thematiques.map((thematique) => (
              <ThematiqueBadge key={thematique.id} thematique={thematique} />
            ))}
            <StatutBadge statut={projet.statut} />
          </div>

          {/* Infos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
            <div>
              <span className="text-sm text-[var(--neutre)]">Compétence</span>
              <p className="font-medium text-black">{projet.competence}</p>
            </div>
            {projet.montant && (
              <div>
                <span className="text-sm text-[var(--neutre)]">Montant</span>
                <p className="font-medium text-black">{formatMontant(projet.montant)}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-[var(--neutre)]">Délibérations</span>
              <p className="font-medium text-black">{projet.deliberations.length}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[var(--violet)] mb-2">
              Description
            </h2>
            <p className="text-black leading-relaxed">
              {projet.description}
            </p>
          </div>
        </div>

        {/* Timeline des délibérations */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--violet)] mb-6">
            Chronologie des délibérations
          </h2>

          {timelineItems.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <p className="text-[var(--neutre)] text-center py-8">
              Aucune délibération associée à ce projet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const projet = getProjetBySlug(slug);

  if (!projet) {
    return { title: 'Projet non trouvé' };
  }

  return {
    title: `${projet.nom} - Vue d'Ensemble`,
    description: projet.description.slice(0, 160),
  };
}
