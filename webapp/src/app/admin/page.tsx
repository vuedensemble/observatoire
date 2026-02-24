import Link from 'next/link';
import { getAllCommunes, getConseilsByCommune, getDeliberationsByCommune, getProjetsByCommune } from '@/lib/db';

export default async function AdminDashboard() {
  const allCommunes = await getAllCommunes();

  // Sort alphabetically
  const sorted = [...allCommunes].sort((a, b) => a.nom.localeCompare(b.nom));

  // Fetch deliberation counts in parallel
  const delibCounts = await Promise.all(
    sorted.map((c) => getDeliberationsByCommune(c.id).then((d) => d.length))
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mb-6">
        Communes
      </h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Commune</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Population</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Conseils</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Deliberations</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Projets</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((commune, i) => (
              <tr key={commune.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/${commune.slug}`}
                    className="text-[var(--violet)] font-medium hover:underline"
                  >
                    {commune.nom}
                  </Link>
                </td>
                <td className="text-right px-4 py-3 text-gray-600">
                  {commune.population.toLocaleString('fr-FR')}
                </td>
                <td className="text-right px-4 py-3 text-gray-600">
                  {commune.nombre_conseils}
                </td>
                <td className="text-right px-4 py-3 text-gray-600">
                  {delibCounts[i]}
                </td>
                <td className="text-right px-4 py-3 text-gray-600">
                  {commune.nombre_projets}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
