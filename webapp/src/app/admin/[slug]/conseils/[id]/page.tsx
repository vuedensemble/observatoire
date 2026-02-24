import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommuneBySlug, getConseilById } from '@/lib/db';
import ConseilEditor from '@/components/admin/ConseilEditor';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

export default async function AdminConseilEdit({ params }: PageProps) {
  const { slug, id } = await params;
  const commune = await getCommuneBySlug(slug);
  if (!commune) notFound();

  const conseil = await getConseilById(id);
  if (!conseil || conseil.commune.id !== commune.id) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/${slug}/conseils`} className="text-sm text-[var(--violet)] hover:underline">
          &larr; Conseils de {commune.nom}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mt-2">
          Conseil du {conseil.date}
        </h1>
      </div>

      <ConseilEditor conseil={conseil} />
    </div>
  );
}
