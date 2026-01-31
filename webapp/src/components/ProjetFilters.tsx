'use client';

import { useState } from 'react';
import { ProjetWithRelations, Thematique } from '@/lib/types';
import ProjetCard from './ProjetCard';

interface ProjetFiltersProps {
  projets: ProjetWithRelations[];
  thematiques: Thematique[];
}

const STATUTS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'vote', label: 'Voté' },
  { value: 'abandonne', label: 'Abandonné' },
];

export default function ProjetFilters({ projets, thematiques }: ProjetFiltersProps) {
  const [statutFilter, setStatutFilter] = useState('all');
  const [thematiqueFilter, setThematiqueFilter] = useState('all');

  const filteredProjets = projets.filter((projet) => {
    const matchStatut = statutFilter === 'all' || projet.statut === statutFilter;
    const matchThematique =
      thematiqueFilter === 'all' ||
      projet.thematiques.some((t) => t.id === thematiqueFilter);
    return matchStatut && matchThematique;
  });

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--violet-dark)] focus:outline-none focus:border-[var(--violet)]"
        >
          {STATUTS.map((statut) => (
            <option key={statut.value} value={statut.value}>
              {statut.label}
            </option>
          ))}
        </select>

        <select
          value={thematiqueFilter}
          onChange={(e) => setThematiqueFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-[var(--violet-dark)] focus:outline-none focus:border-[var(--violet)]"
        >
          <option value="all">Toutes les thématiques</option>
          {thematiques.map((thematique) => (
            <option key={thematique.id} value={thematique.id}>
              {thematique.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Résultats */}
      {filteredProjets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjets.map((projet) => (
            <ProjetCard key={projet.id} projet={projet} />
          ))}
        </div>
      ) : (
        <p className="text-[var(--neutre)] text-center py-8">
          Aucun projet ne correspond aux filtres sélectionnés.
        </p>
      )}
    </div>
  );
}
