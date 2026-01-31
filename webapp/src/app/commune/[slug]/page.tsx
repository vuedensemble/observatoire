import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ProjetFilters from '@/components/ProjetFilters';
import StatBox from '@/components/StatBox';
import ConseilAccordion from '@/components/ConseilAccordion';
import {
  getCommuneBySlug,
  getProjetsByCommune,
  getConseilsByCommune,
  getAllThematiques,
} from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default async function CommunePage({ params }: PageProps) {
  const { slug } = await params;
  const commune = getCommuneBySlug(slug);

  if (!commune) {
    notFound();
  }

  const projets = getProjetsByCommune(commune.id);
  const conseils = getConseilsByCommune(commune.id);
  const thematiques = getAllThematiques();

  return (
    <div className="section">
      <div className="container">
        <Breadcrumb items={[{ label: commune.nom }]} />

        {/* En-tête commune */}
        <div className="bg-white rounded-lg border border-[var(--border)] p-6 lg:p-8 mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[var(--violet)] mb-4">
            {commune.nom}
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox value={commune.code_postal} label="Code postal" />
            <StatBox
              value={formatNumber(commune.population)}
              label="Habitants"
            />
            <StatBox value={projets.length} label="Projets" />
            <StatBox value={conseils.length} label="Conseils" />
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <p className="text-[var(--neutre)]">
              <span className="font-medium text-[var(--violet-dark)]">Maire :</span>{' '}
              {commune.maire}
            </p>
          </div>
        </div>

        {/* Section Projets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--violet)] mb-6">
            Projets de la commune
          </h2>

          {projets.length > 0 ? (
            <ProjetFilters projets={projets} thematiques={thematiques} />
          ) : (
            <p className="text-[var(--neutre)] text-center py-8">
              Aucun projet recensé pour cette commune.
            </p>
          )}
        </section>

        {/* Section Historique des conseils */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--violet)] mb-6">
            Historique des conseils municipaux
          </h2>

          {conseils.length > 0 ? (
            <ConseilAccordion conseils={conseils} />
          ) : (
            <p className="text-[var(--neutre)] text-center py-8">
              Aucun conseil municipal recensé pour cette commune.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const commune = getCommuneBySlug(slug);

  if (!commune) {
    return { title: 'Commune non trouvée' };
  }

  return {
    title: `${commune.nom} - Vue d'Ensemble`,
    description: `Découvrez les projets et délibérations de ${commune.nom} (${commune.code_postal})`,
  };
}
