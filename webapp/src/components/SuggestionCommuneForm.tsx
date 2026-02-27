'use client';

import { useState, FormEvent } from 'react';

export default function SuggestionCommuneForm() {
  const [nom, setNom] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [urlDeliberations, setUrlDeliberations] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(),
          code_postal: codePostal.trim(),
          url_deliberations: urlDeliberations.trim(),
        }),
      });

      if (res.status === 201) {
        setStatus('success');
        setNom('');
        setCodePostal('');
        setUrlDeliberations('');
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Une erreur est survenue.');
        setStatus('error');
      }
    } catch {
      setErrorMessage('Erreur de connexion. Veuillez réessayer.');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
      <div>
        <label htmlFor="suggestion-nom" className="block text-sm font-medium text-[var(--violet-dark)] mb-1">
          Nom de la commune
        </label>
        <input
          id="suggestion-nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-black/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)] focus:border-transparent"
          placeholder="Ex : Hendaye"
        />
      </div>

      <div>
        <label htmlFor="suggestion-cp" className="block text-sm font-medium text-[var(--violet-dark)] mb-1">
          Code postal
        </label>
        <input
          id="suggestion-cp"
          type="text"
          value={codePostal}
          onChange={(e) => setCodePostal(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-black/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)] focus:border-transparent"
          placeholder="Ex : 64700"
        />
      </div>

      <div>
        <label htmlFor="suggestion-url" className="block text-sm font-medium text-[var(--violet-dark)] mb-1">
          URL du site avec les délibérations
        </label>
        <input
          id="suggestion-url"
          type="url"
          value={urlDeliberations}
          onChange={(e) => setUrlDeliberations(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-black/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)] focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full disabled:opacity-50"
      >
        {status === 'loading' ? 'Envoi en cours...' : 'Proposer cette commune'}
      </button>

      {status === 'success' && (
        <p className="text-[var(--vert)] text-sm text-center font-medium">
          Merci ! Votre suggestion a bien été enregistrée.
        </p>
      )}

      {status === 'error' && (
        <p className="text-red-600 text-sm text-center font-medium">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
