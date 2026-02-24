'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Thematique } from '@/lib/types';

interface ThematiqueEditorProps {
  thematiques: Thematique[];
}

export default function ThematiqueEditor({ thematiques }: ThematiqueEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState(thematiques.map((t) => ({ ...t, editing: false })));
  const [newNom, setNewNom] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCouleur, setNewCouleur] = useState('#6B5CE7');
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function handleUpdate(thematique: Thematique) {
    setLoading(thematique.id);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/thematiques/${thematique.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: thematique.nom,
          description: thematique.description,
          couleur: thematique.couleur,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage(`"${thematique.nom}" sauvegardee`);
      setItems((prev) => prev.map((t) => t.id === thematique.id ? { ...t, editing: false } : t));
      router.refresh();
    } catch (err) {
      setMessage(`Erreur: ${err}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette thematique ?')) return;
    setLoading(id);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/thematiques/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => prev.filter((t) => t.id !== id));
      setMessage('Supprimee');
      router.refresh();
    } catch (err) {
      setMessage(`Erreur: ${err}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleCreate() {
    if (!newNom.trim()) return;
    setLoading('new');
    setMessage('');

    const id = `them-${newNom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

    try {
      const res = await fetch('/api/admin/thematiques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nom: newNom, description: newDescription, couleur: newCouleur }),
      });
      if (!res.ok) throw new Error(await res.text());
      setItems((prev) => [...prev, { id, nom: newNom, description: newDescription, couleur: newCouleur, editing: false }]);
      setNewNom('');
      setNewDescription('');
      setNewCouleur('#6B5CE7');
      setMessage(`"${newNom}" creee`);
      router.refresh();
    } catch (err) {
      setMessage(`Erreur: ${err}`);
    } finally {
      setLoading(null);
    }
  }

  function updateItem(id: string, field: string, value: string) {
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 text-sm rounded-md ${message.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {items.map((t) => (
        <div key={t.id} className="bg-white rounded-lg border border-gray-200 p-4">
          {t.editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                  <input
                    type="text"
                    value={t.nom}
                    onChange={(e) => updateItem(t.id, 'nom', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={t.description}
                    onChange={(e) => updateItem(t.id, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={t.couleur}
                      onChange={(e) => updateItem(t.id, 'couleur', e.target.value)}
                      className="h-8 w-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={t.couleur}
                      onChange={(e) => updateItem(t.id, 'couleur', e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setItems((prev) => prev.map((x) => x.id === t.id ? { ...thematiques.find((o) => o.id === t.id)!, editing: false } : x))}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUpdate(t)}
                  disabled={loading === t.id}
                  className="px-3 py-1.5 text-sm text-white bg-[var(--violet)] rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading === t.id ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.couleur }} />
                <div>
                  <span className="font-medium text-[var(--violet-fonce)]">{t.nom}</span>
                  <span className="text-sm text-gray-500 ml-2">{t.description}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setItems((prev) => prev.map((x) => x.id === t.id ? { ...x, editing: true } : x))}
                  className="text-sm text-[var(--violet)] hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={loading === t.id}
                  className="text-sm text-red-500 hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add new thematique */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Ajouter une thematique</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
            <input
              type="text"
              value={newNom}
              onChange={(e) => setNewNom(e.target.value)}
              placeholder="Ex: Sante"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Couleur</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={newCouleur}
                onChange={(e) => setNewCouleur(e.target.value)}
                className="h-8 w-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={newCouleur}
                onChange={(e) => setNewCouleur(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={loading === 'new' || !newNom.trim()}
            className="px-4 py-1.5 text-sm text-white bg-[var(--vert)] rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading === 'new' ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
