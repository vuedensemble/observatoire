import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ProjetFilters from '@/components/ProjetFilters';
import ConseilAccordion from '@/components/ConseilAccordion';
import CommuneSidebar from '@/components/CommuneSidebar';
import {
  getCommuneBySlug,
  getProjetsByCommune,
  getConseilsByCommune,
  getAllThematiques,
  getUnvalidatedProjetsForCommune,
} from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export default async function CommunePage({ params }: PageProps) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);

  if (!commune) {
    notFound();
  }

  const validatedProjets = await getProjetsByCommune(commune.id);
  const unvalidatedProjets = await getUnvalidatedProjetsForCommune(commune.id);
  const projets = [...validatedProjets, ...unvalidatedProjets]
    .sort((a, b) => b.deliberations.length - a.deliberations.length);
  const conseils = await getConseilsByCommune(commune.id);
  const thematiques = await getAllThematiques();

  return (
    <div className="flex flex-col lg:flex-row">

      {/* Bandeau latéral gauche — fixe, ne chevauche pas le footer */}
      <CommuneSidebar>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--violet)' }}>
          {commune.nom}
        </h1>
        <p className="text-black/50 text-sm mb-6">
          {commune.code_postal}
        </p>

        {/* Trait ondulé */}
        <svg className="mb-6" width="60" height="14" viewBox="0 0 60 14" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 7 C10 1, 20 13, 30 7 C40 1, 50 13, 60 7" stroke="#27B782" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>

        {/* Stats */}
        <div className="space-y-5">
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--violet)' }}>{formatNumber(commune.population)}</div>
            <div className="text-black/50 text-sm">Habitants</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--violet)' }}>{projets.length}</div>
            <div className="text-black/50 text-sm">Projets</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--violet)' }}>{conseils.length}</div>
            <div className="text-black/50 text-sm">Conseils municipaux</div>
          </div>
        </div>

        {/* Maire */}
        <div className="mt-6 pt-6">
          <div className="text-black/50 text-sm mb-1">Maire</div>
          <div className="font-medium text-black">{commune.maire}</div>
        </div>

        {/* Encart don */}
        <div className="mt-8 bg-[#E8E3F9] rounded-lg p-5">
          <p className="text-sm text-[var(--violet-dark)] mb-4">
            Chaque commune analysée coûte environ <strong>10&nbsp;€</strong> à l&apos;association.
            Soutenez-nous pour que nous puissions couvrir plus de villes&nbsp;!
          </p>
          <a
            href="https://www.helloasso.com/associations/association-vue-d-ensemble"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Faire un don
          </a>
        </div>
      </CommuneSidebar>

      {/* Espace réservé pour le bandeau fixe sur desktop */}
      <div className="hidden lg:block lg:w-96 flex-shrink-0" />

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 bg-white">
        <div className="py-10 lg:py-14">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <Breadcrumb items={[{ label: commune.nom }]} />

            {/* Section Projets */}
            <section className="mb-20">
              <h2 className="text-2xl font-bold text-[var(--violet)] mb-8">
                Projets de la commune
              </h2>

              {projets.length > 0 ? (
                <ProjetFilters projets={projets} thematiques={thematiques} />
              ) : (
                <p className="text-[var(--neutre)] text-center py-12">
                  Aucun projet recensé pour cette commune.
                </p>
              )}
            </section>

            {/* Section Historique des conseils */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-[var(--violet)] mb-8">
                Historique des conseils municipaux
              </h2>

              {conseils.length > 0 ? (
                <ConseilAccordion conseils={conseils} />
              ) : (
                <p className="text-[var(--neutre)] text-center py-12">
                  Aucun conseil municipal recensé pour cette commune.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);

  if (!commune) {
    return { title: 'Commune non trouvée' };
  }

  return {
    title: `${commune.nom} - Vue d'Ensemble`,
    description: `Découvrez les projets et délibérations de ${commune.nom} (${commune.code_postal})`,
  };
}
