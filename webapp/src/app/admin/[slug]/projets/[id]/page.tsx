import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommuneBySlug, getProjetById, getAllThematiques } from '@/lib/db';
import ProjetEditor from '@/components/admin/ProjetEditor';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function AdminProjetEdit({ params }: PageProps) {
  const { slug, id } = await params;
  const [commune, projet, allThematiques] = await Promise.all([
    getCommuneBySlug(slug),
    getProjetById(id),
    getAllThematiques(),
  ]);

  if (!commune || !projet) notFound();

  // Verify the projet belongs to this commune
  const belongsToCommune = projet.communes.some((c) => c.id === commune.id);
  if (!belongsToCommune) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/${slug}/projets`} className="text-sm text-[var(--violet)] hover:underline">
          &larr; Projets de {commune.nom}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mt-2">
          {projet.nom}
        </h1>
      </div>

      <ProjetEditor projet={projet} allThematiques={allThematiques} />
    </div>
  );
}
