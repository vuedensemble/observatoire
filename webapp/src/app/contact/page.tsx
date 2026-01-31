'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: 'erreur',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to an API
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="section">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-16 h-16 bg-[var(--vert)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[var(--violet)] mb-4">
              Message envoyé !
            </h1>
            <p className="text-[var(--foreground)]">
              Merci pour votre message. Nous vous répondrons dans les meilleurs délais.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-4">
            Une info ?
          </h1>
          <p className="text-lg text-[var(--foreground)] mb-8">
            Vous avez repéré une erreur ? Vous souhaitez nous signaler une information ?
            Contactez-nous via ce formulaire.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-[var(--violet-dark)] mb-2">
                Votre nom
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--violet-dark)] mb-2">
                Votre email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="sujet" className="block text-sm font-medium text-[var(--violet-dark)] mb-2">
                Sujet
              </label>
              <select
                id="sujet"
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                className="w-full"
              >
                <option value="erreur">Signaler une erreur</option>
                <option value="info">Proposer une information</option>
                <option value="question">Question générale</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[var(--violet-dark)] mb-2">
                Votre message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border-2 border-[var(--border)] rounded p-3 focus:border-[var(--violet)] focus:outline-none"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
