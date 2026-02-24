'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Commune } from '@/lib/types';

interface CommuneEditorProps {
  commune: Commune;
}

export default function CommuneEditor({ commune }: CommuneEditorProps) {
  const router = useRouter();
  const [nom, setNom] = useState(commune.nom);
  const [slug, setSlug] = useState(commune.slug);
  const [codePostal, setCodePostal] = useState(commune.code_postal);
  const [population, setPopulation] = useState(commune.population);
  const [maire, setMaire] = useState(commune.maire);
  const [infosGenerales, setInfosGenerales] = useState(
    commune.infos_generales ? JSON.stringify(commune.infos_generales, null, 2) : ''
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setLoading(true);
    setMessage('');

    let parsedInfos: Record<string, unknown> | null = null;
    if (infosGenerales.trim()) {
      try {
        parsedInfos = JSON.parse(infosGenerales);
      } catch {
        setMessage('JSON invalide pour infos_generales');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/communes/${commune.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          slug,
          code_postal: codePostal,
          population,
          maire,
          infos_generales: parsedInfos,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
          <input
            type="text"
            value={codePostal}
            onChange={(e) => setCodePostal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
          <input
            type="number"
            value={population}
            onChange={(e) => setPopulation(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Maire</label>
          <input
            type="text"
            value={maire}
            onChange={(e) => setMaire(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Infos generales (JSON)</label>
        <textarea
          value={infosGenerales}
          onChange={(e) => setInfosGenerales(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:border-[var(--violet)]"
        />
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
