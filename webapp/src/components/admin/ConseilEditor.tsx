'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ConseilWithDeliberations } from '@/lib/types';
import DeliberationEditor from './DeliberationEditor';

interface ConseilEditorProps {
  conseil: ConseilWithDeliberations;
}

export default function ConseilEditor({ conseil }: ConseilEditorProps) {
  const router = useRouter();
  const [date, setDate] = useState(conseil.date);
  const [presents, setPresents] = useState(conseil.presents.join('\n'));
  const [absents, setAbsents] = useState(conseil.absents.join('\n'));
  const [pdfUrl, setPdfUrl] = useState(conseil.pdf_url);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSave() {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/conseils/${conseil.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          presents: presents.split('\n').map((s) => s.trim()).filter(Boolean),
          absents: absents.split('\n').map((s) => s.trim()).filter(Boolean),
          pdf_url: pdfUrl,
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--violet-fonce)]">Conseil du {conseil.date}</h2>

        {message && (
          <div className={`p-3 text-sm rounded-md ${message.startsWith('Erreur') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL du PDF</label>
            <input
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--violet)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presents (un par ligne)
            </label>
            <textarea
              value={presents}
              onChange={(e) => setPresents(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[var(--violet)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Absents (un par ligne)
            </label>
            <textarea
              value={absents}
              onChange={(e) => setAbsents(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[var(--violet)]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[var(--violet)] text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder le conseil'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[var(--violet-fonce)] mb-4">
          Deliberations ({conseil.deliberations.length})
        </h2>
        <div className="space-y-4">
          {conseil.deliberations.map((delib) => (
            <DeliberationEditor key={delib.id} deliberation={delib} />
          ))}
        </div>
      </div>
    </div>
  );
}
