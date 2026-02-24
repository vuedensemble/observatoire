import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCommuneBySlug, getProjetsByCommune } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminProjets({ params }: PageProps) {
  const { slug } = await params;
  const commune = await getCommuneBySlug(slug);
  if (!commune) notFound();

  const projets = await getProjetsByCommune(commune.id);

  const statutLabels: Record<string, string> = {
    en_cours: 'En cours',
    realise: 'Realise',
    abandonne: 'Abandonne',
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/${slug}`} className="text-sm text-[var(--violet)] hover:underline">
          &larr; {commune.nom}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mt-2">
          Projets - {commune.nom}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Thematiques</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Deliberations</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projets.map((projet) => (
              <tr key={projet.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{projet.nom}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    projet.statut === 'en_cours' ? 'bg-blue-50 text-blue-700' :
                    projet.statut === 'realise' ? 'bg-green-50 text-green-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {statutLabels[projet.statut]}
                  </span>
                </td>
                <td className="text-right px-4 py-3 text-gray-600">{projet.thematiques.length}</td>
                <td className="text-right px-4 py-3 text-gray-600">{projet.deliberations.length}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/${slug}/projets/${projet.id}`}
                    className="text-[var(--violet)] hover:underline text-sm"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
            {projets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Aucun projet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
