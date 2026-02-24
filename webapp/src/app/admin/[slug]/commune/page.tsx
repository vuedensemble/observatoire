import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommuneBySlug } from '@/lib/db';
import CommuneEditor from '@/components/admin/CommuneEditor';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCommuneEditPage({ params }: PageProps) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);
  if (!commune) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/${slug}`} className="text-sm text-[var(--violet)] hover:underline">
          &larr; {commune.nom}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mt-2">
          Modifier {commune.nom}
        </h1>
      </div>

      <CommuneEditor commune={commune} />
    </div>
  );
}
