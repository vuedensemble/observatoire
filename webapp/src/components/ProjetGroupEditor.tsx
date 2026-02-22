'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjetGroupeWithMentions } from '@/lib/types';

interface ProjetGroupEditorProps {
  group: ProjetGroupeWithMentions;
}

export default function ProjetGroupEditor({ group }: ProjetGroupEditorProps) {
  const router = useRouter();
  const [nomCanonique, setNomCanonique] = useState(group.nom_canonique);
  const [description, setDescription] = useState(group.description || '');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Count unique mention names
  const nameCounts = new Map<string, number>();
  for (const m of group.mentions) {
    nameCounts.set(m.nom, (nameCounts.get(m.nom) || 0) + 1);
  }
  const sortedNames = [...nameCounts.entries()].sort((a, b) => b[1] - a[1]);

  async function handleValidate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groupes/${group.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', nom_canonique: nomCanonique, description }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      alert(`Erreur: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/groupes/${group.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      alert(`Erreur: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={nomCanonique}
            onChange={(e) => setNomCanonique(e.target.value)}
            className="w-full text-lg font-semibold text-black bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--violet)] focus:outline-none pb-1 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleValidate}
            disabled={loading}
            className="px-4 py-1.5 bg-[var(--vert)] text-white text-sm font-medium rounded-md hover:bg-[var(--vert)]/90 disabled:opacity-50 transition-colors"
          >
            Valider
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-1.5 bg-gray-100 text-[var(--neutre)] text-sm font-medium rounded-md hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
          >
            Rejeter
          </button>
        </div>
      </div>

      {/* Mention summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-[var(--neutre)] hover:text-[var(--violet)] transition-colors mb-2"
      >
        {group.mentions.length} mentions ({sortedNames.length} variantes) {expanded ? '▾' : '▸'}
      </button>

      {/* Expanded: show all mention variants */}
      {expanded && (
        <div className="mt-2 mb-3 pl-4 border-l-2 border-gray-100 space-y-1">
          {sortedNames.map(([name, count]) => (
            <div key={name} className="text-sm">
              <span className="text-black">&quot;{name}&quot;</span>
              {count > 1 && <span className="text-[var(--neutre)] ml-1">({count}x)</span>}
            </div>
          ))}

          {/* Description field */}
          <div className="mt-3">
            <label className="text-xs text-[var(--neutre)] block mb-1">Description (optionnelle)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du projet..."
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-md p-2 focus:border-[var(--violet)] focus:outline-none"
            />
          </div>

          {/* Metadata */}
          {(group.nature || group.competence) && (
            <div className="flex gap-4 mt-2 text-xs text-[var(--neutre)]">
              {group.nature && <span>Nature: {group.nature}</span>}
              {group.competence && <span>Compétence: {group.competence}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
