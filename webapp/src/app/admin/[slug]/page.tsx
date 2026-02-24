import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommuneBySlug, getConseilsByCommune, getDeliberationsByCommune, getProjetsByCommune } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCommuneHub({ params }: PageProps) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);
  if (!commune) notFound();

  const [conseils, deliberations, projets] = await Promise.all([
    getConseilsByCommune(commune.id),
    getDeliberationsByCommune(commune.id),
    getProjetsByCommune(commune.id),
  ]);

  const sections = [
    {
      href: `/admin/${slug}/commune`,
      title: 'Commune',
      description: `Modifier les informations de ${commune.nom}`,
      count: null,
    },
    {
      href: `/admin/${slug}/conseils`,
      title: 'Conseils municipaux',
      description: 'Gerer les conseils et deliberations',
      count: conseils.length,
    },
    {
      href: `/admin/${slug}/projets`,
      title: 'Projets',
      description: 'Gerer les projets de la commune',
      count: projets.length,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="text-sm text-[var(--violet)] hover:underline">
          &larr; Toutes les communes
        </Link>
        <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mt-2">
          {commune.nom}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {commune.code_postal} &middot; {commune.population.toLocaleString('fr-FR')} habitants &middot; Maire: {commune.maire || 'Non renseigne'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:border-[var(--violet)] hover:shadow-sm transition-all"
          >
            <h2 className="text-lg font-semibold text-[var(--violet-fonce)]">
              {section.title}
              {section.count !== null && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({section.count})
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
