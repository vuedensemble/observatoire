'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjetGroupeWithMentions } from '@/lib/types';
import ProjetGroupEditor from './ProjetGroupEditor';

interface AdminGroupListProps {
  groups: ProjetGroupeWithMentions[];
}

export default function AdminGroupList({ groups }: AdminGroupListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);
  const [mergeName, setMergeName] = useState('');
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter: semicolons = OR between clauses, spaces = AND within a clause
  // Example: "centre aquatique ; rénovation stade" → (centre AND aquatique) OR (rénovation AND stade)
  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const clauses = search
      .split(';')
      .map((clause) => clause.trim().toLowerCase().split(/\s+/).filter(Boolean))
      .filter((words) => words.length > 0);
    if (clauses.length === 0) return groups;
    return groups.filter((g) => {
      const haystack = [g.nom_canonique, ...g.mentions.map((m) => m.nom)]
        .join(' ')
        .toLowerCase();
      return clauses.some((words) => words.every((w) => haystack.includes(w)));
    });
  }, [groups, search]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((g) => g.id)));
    }
  }

  function openMergeDialog() {
    // Default merge name: the canonical name of the group with most mentions
    const selectedGroups = groups.filter((g) => selected.has(g.id));
    selectedGroups.sort((a, b) => b.mentions.length - a.mentions.length);
    setMergeName(selectedGroups[0]?.nom_canonique || '');
    setShowMergeDialog(true);
  }

  async function handleMerge() {
    setLoading(true);
    try {
      const ids = [...selected];
      const res = await fetch('/api/admin/groupes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'merge', groupe_ids: ids, nom_canonique: mergeName }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSelected(new Set());
      setShowMergeDialog(false);
      setMergeName('');
      router.refresh();
    } catch (err) {
      alert(`Erreur: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  const totalMentionsSelected = groups
    .filter((g) => selected.has(g.id))
    .reduce((acc, g) => acc + g.mentions.length, 0);

  return (
    <div>
      {/* Toolbar: search + selection actions */}
      <div className="sticky top-0 z-10 bg-[var(--creme)] pb-4 pt-1">
        {/* Search bar */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutre)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer : espace = ET, point-virgule = OU"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-[var(--violet)] focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutre)] hover:text-black"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Selection bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="flex items-center gap-2 text-sm text-[var(--neutre)] hover:text-[var(--violet)] transition-colors"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                selected.size > 0 && selected.size === filtered.length
                  ? 'bg-[var(--violet)] border-[var(--violet)]'
                  : selected.size > 0
                  ? 'bg-[var(--violet)]/30 border-[var(--violet)]'
                  : 'border-gray-300'
              }`}>
                {selected.size > 0 && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {selected.size === 0
                ? 'Tout sélectionner'
                : selected.size === filtered.length
                ? 'Tout désélectionner'
                : `${selected.size} sélectionné${selected.size > 1 ? 's' : ''}`}
            </button>

            {selected.size > 0 && (
              <span className="text-xs text-[var(--neutre)]">
                ({totalMentionsSelected} mentions)
              </span>
            )}
          </div>

          {selected.size >= 2 && (
            <button
              onClick={openMergeDialog}
              className="px-4 py-1.5 bg-[var(--violet)] text-white text-sm font-medium rounded-md hover:bg-[var(--violet)]/90 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h2m10-2h4m0 0v4m0-4L11 11" />
              </svg>
              Grouper ({selected.size})
            </button>
          )}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-xs text-[var(--neutre)] mt-2">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} sur {groups.length}
          </p>
        )}
      </div>

      {/* Merge dialog */}
      {showMergeDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-black mb-1">
              Grouper {selected.size} groupes
            </h3>
            <p className="text-sm text-[var(--neutre)] mb-4">
              Les mentions de ces groupes seront fusionnées sous un seul nom canonique.
            </p>

            {/* Preview selected groups */}
            <div className="mb-4 max-h-40 overflow-y-auto space-y-1 p-3 bg-gray-50 rounded-lg">
              {groups
                .filter((g) => selected.has(g.id))
                .sort((a, b) => b.mentions.length - a.mentions.length)
                .map((g) => (
                  <div key={g.id} className="text-sm flex items-center justify-between">
                    <span className="text-black truncate">{g.nom_canonique}</span>
                    <span className="text-[var(--neutre)] text-xs ml-2 flex-shrink-0">{g.mentions.length} mentions</span>
                  </div>
                ))}
            </div>

            <label className="text-sm font-medium text-black block mb-1.5">
              Nom canonique du groupe fusionné
            </label>
            <input
              type="text"
              value={mergeName}
              onChange={(e) => setMergeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[var(--violet)] focus:outline-none mb-5"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowMergeDialog(false)}
                disabled={loading}
                className="px-4 py-2 text-sm text-[var(--neutre)] hover:text-black transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleMerge}
                disabled={loading || !mergeName.trim()}
                className="px-5 py-2 bg-[var(--violet)] text-white text-sm font-medium rounded-md hover:bg-[var(--violet)]/90 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Fusion...' : 'Fusionner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group list */}
      <div className="space-y-3">
        {filtered.map((group) => (
          <div key={group.id} className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={() => toggleSelect(group.id)}
              className="mt-5 flex-shrink-0"
            >
              <span className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                selected.has(group.id)
                  ? 'bg-[var(--violet)] border-[var(--violet)]'
                  : 'border-gray-300 hover:border-[var(--violet)]'
              }`}>
                {selected.has(group.id) && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
            </button>

            {/* Group card */}
            <div className="flex-1 min-w-0">
              <ProjetGroupEditor group={group} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-[var(--neutre)] text-center py-8 text-sm">
          {search ? 'Aucun groupe ne correspond à votre recherche.' : 'Aucun groupe en attente.'}
        </p>
      )}
    </div>
  );
}
