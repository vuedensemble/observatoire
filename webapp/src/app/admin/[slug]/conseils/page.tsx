import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommuneBySlug, getConseilsByCommune } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminConseils({ params }: PageProps) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);
  if (!commune) notFound();

  const conseils = await getConseilsByCommune(commune.id);

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/${slug}`} className="text-sm text-[var(--violet)] hover:underline">
          &larr; {commune.nom}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mt-2">
          Conseils municipaux - {commune.nom}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Presents</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Absents</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Deliberations</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {conseils.map((conseil) => (
              <tr key={conseil.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{conseil.date}</td>
                <td className="text-right px-4 py-3 text-gray-600">{conseil.presents.length}</td>
                <td className="text-right px-4 py-3 text-gray-600">{conseil.absents.length}</td>
                <td className="text-right px-4 py-3 text-gray-600">{conseil.deliberations.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/${slug}/conseils/${conseil.id}`}
                    className="text-[var(--violet)] hover:underline text-sm"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {conseils.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Aucun conseil municipal
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
