'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Deliberation } from '@/lib/types';

interface DeliberationEditorProps {
  deliberation: Deliberation;
}

export default function DeliberationEditor({ deliberation }: DeliberationEditorProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [numero, setNumero] = useState(deliberation.numero);
  const [objet, setObjet] = useState(deliberation.objet);
  const [detail, setDetail] = useState(deliberation.detail);
  const [decision, setDecision] = useState(deliberation.decision);
  const [pour, setPour] = useState(deliberation.votants?.pour ?? 0);
  const [contre, setContre] = useState(deliberation.votants?.contre ?? 0);
  const [abstention, setAbstention] = useState(deliberation.votants?.abstention ?? 0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/deliberations/${deliberation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero,
          objet,
          detail,
          decision,
          votants: { pour, contre, abstention },
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between"
      >
        <span className="text-sm font-medium text-[var(--violet-fonce)]">
          {numero} - {objet.slice(0, 80)}{objet.length > 80 ? '...' : ''}
        </span>
        <span className="text-gray-400 text-sm">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {message && (
            <div className={`p-2 text-sm rounded-md ${message.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Numero</label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Decision</label>
              <input
                type="text"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Objet</label>
            <input
              type="text"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Detail</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={4}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pour</label>
              <input
                type="number"
                value={pour}
                onChange={(e) => setPour(Number(e.target.value))}
                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contre</label>
              <input
                type="number"
                value={contre}
                onChange={(e) => setContre(Number(e.target.value))}
                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Abstention</label>
              <input
                type="number"
                value={abstention}
                onChange={(e) => setAbstention(Number(e.target.value))}
                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 bg-[var(--violet)] text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
