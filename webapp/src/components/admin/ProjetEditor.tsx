'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjetWithRelations, Thematique } from '@/lib/types';

interface ProjetEditorProps {
  projet: ProjetWithRelations;
  allThematiques: Thematique[];
}

export default function ProjetEditor({ projet, allThematiques }: ProjetEditorProps) {
  const router = useRouter();
  const [nom, setNom] = useState(projet.nom);
  const [slug, setSlug] = useState(projet.slug);
  const [description, setDescription] = useState(projet.description);
  const [nature, setNature] = useState(projet.nature);
  const [competence, setCompetence] = useState(projet.competence);
  const [statut, setStatut] = useState(projet.statut);
  const [montant, setMontant] = useState(projet.montant ?? '');
  const [selectedThematiques, setSelectedThematiques] = useState<Set<string>>(
    new Set(projet.thematiques.map((t) => t.id))
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function toggleThematique(id: string) {
    setSelectedThematiques((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setLoading(true);
    setMessage('');

    try {
      // Save projet fields
      const res = await fetch(`/api/admin/projets/${projet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          slug,
          description,
          nature,
          competence,
          statut,
          montant: montant === '' ? null : Number(montant),
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Save thematiques
      const themRes = await fetch(`/api/admin/projets/${projet.id}/thematiques`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thematique_ids: [...selectedThematiques] }),
      });
      if (!themRes.ok) throw new Error(await themRes.text());

      setMessage('Sauvegarde !');
      router.refresh();
    } catch (err) {
      setMessage(`Erreur: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {message && (
        <div className={`p-3 text-sm rounded-md ${message.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value as typeof statut)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          >
            <option value="en_cours">En cours</option>
            <option value="realise">Realise</option>
            <option value="abandonne">Abandonne</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
          <input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Optionnel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nature</label>
          <input
            type="text"
            value={nature}
            onChange={(e) => setNature(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Competence</label>
          <input
            type="text"
            value={competence}
            onChange={(e) => setCompetence(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thematiques</label>
        <div className="flex flex-wrap gap-2">
          {allThematiques.map((t) => (
            <label
              key={t.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-colors ${
                selectedThematiques.has(t.id)
                  ? 'border-[var(--violet)] bg-[var(--violet)]/10 text-[var(--violet)]'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedThematiques.has(t.id)}
                onChange={() => toggleThematique(t.id)}
                className="sr-only"
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: t.couleur }}
              />
              {t.nom}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-[var(--violet)] text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
