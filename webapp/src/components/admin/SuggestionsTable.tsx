'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Suggestion {
  id: string;
  nom: string;
  code_postal: string;
  url_deliberations: string;
  created_at: string | null;
}

export default function SuggestionsTable({ suggestions }: { suggestions: Suggestion[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette suggestion ?')) return;

    setDeleting(id);
    const res = await fetch(`/api/admin/suggestions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    }
    setDeleting(null);
  }

  function formatDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Commune</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Code postal</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">URL deliberations</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {suggestions.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium">{s.nom}</td>
              <td className="px-4 py-3 text-gray-600">{s.code_postal}</td>
              <td className="px-4 py-3">
                <a
                  href={s.url_deliberations}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--violet)] hover:underline break-all"
                >
                  {s.url_deliberations}
                </a>
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(s.created_at)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deleting === s.id}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  {deleting === s.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
