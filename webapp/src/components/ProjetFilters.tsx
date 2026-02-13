'use client';

import { useState } from 'react';
import { ProjetWithRelations, Thematique } from '@/lib/types';
import ProjetCard from './ProjetCard';
import SidePanel from './SidePanel';
import ProjetDetail from './ProjetDetail';
import FilterDropdown from './FilterDropdown';

interface ProjetFiltersProps {
  projets: ProjetWithRelations[];
  thematiques: Thematique[];
}

const ANNEES = ['2024', '2023', '2022', '2021', '2020'];

const STATUTS = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'realise', label: 'Réalisé' },
  { value: 'abandonne', label: 'Abandonné' },
];

const DEFAULT_LIMIT = 3;

export default function ProjetFilters({ projets, thematiques }: ProjetFiltersProps) {
  const [selectedThematiques, setSelectedThematiques] = useState<string[]>([]);
  const [selectedAnnees, setSelectedAnnees] = useState<string[]>([]);
  const [selectedConseils, setSelectedConseils] = useState<string[]>([]);
  const [selectedStatuts, setSelectedStatuts] = useState<string[]>([]);
  const [selectedProjet, setSelectedProjet] = useState<ProjetWithRelations | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Extraire les conseils uniques des projets
  const conseils = Array.from(
    new Set(
      projets.flatMap((p) =>
        p.deliberations.map((d) => d.conseil.date.slice(0, 7))
      )
    )
  ).sort().reverse();

  const toggleThematique = (id: string) => {
    setSelectedThematiques((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAnnee = (annee: string) => {
    setSelectedAnnees((prev) =>
      prev.includes(annee) ? prev.filter((a) => a !== annee) : [...prev, annee]
    );
  };

  const toggleConseil = (conseil: string) => {
    setSelectedConseils((prev) =>
      prev.includes(conseil) ? prev.filter((c) => c !== conseil) : [...prev, conseil]
    );
  };

  const toggleStatut = (statut: string) => {
    setSelectedStatuts((prev) =>
      prev.includes(statut) ? prev.filter((s) => s !== statut) : [...prev, statut]
    );
  };

  const filteredProjets = projets.filter((projet) => {
    const matchThematique =
      selectedThematiques.length === 0 ||
      projet.thematiques.some((t) => selectedThematiques.includes(t.id));

    const matchAnnee =
      selectedAnnees.length === 0 ||
      projet.deliberations.some((d) =>
        selectedAnnees.some((annee) => d.conseil.date.startsWith(annee))
      );

    const matchConseil =
      selectedConseils.length === 0 ||
      projet.deliberations.some((d) =>
        selectedConseils.includes(d.conseil.date.slice(0, 7))
      );

    const matchStatut =
      selectedStatuts.length === 0 ||
      selectedStatuts.includes(projet.statut);

    return matchThematique && matchAnnee && matchConseil && matchStatut;
  });

  const hasActiveFilters =
    selectedThematiques.length > 0 ||
    selectedAnnees.length > 0 ||
    selectedConseils.length > 0 ||
    selectedStatuts.length > 0;

  const clearAll = () => {
    setSelectedThematiques([]);
    setSelectedAnnees([]);
    setSelectedConseils([]);
    setSelectedStatuts([]);
  };

  return (
    <div>
      {/* Ligne de filtres */}
      <div className="flex items-center gap-3 mb-3">
        {/* Loupe */}
        <svg
          style={{ width: '1rem', height: '1rem', color: 'var(--neutre)', flexShrink: 0 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <FilterDropdown
          label="Thématique"
          options={thematiques.map((t) => ({ value: t.id, label: t.nom })).sort((a, b) => a.label.localeCompare(b.label, 'fr'))}
          selected={selectedThematiques}
          onToggle={toggleThematique}
        />

        <FilterDropdown
          label="Année"
          options={ANNEES.map((a) => ({ value: a, label: a }))}
          selected={selectedAnnees}
          onToggle={toggleAnnee}
        />

        <FilterDropdown
          label="Conseil municipal"
          options={conseils.map((c) => ({ value: c, label: c }))}
          selected={selectedConseils}
          onToggle={toggleConseil}
        />

        <FilterDropdown
          label="Statut"
          options={STATUTS}
          selected={selectedStatuts}
          onToggle={toggleStatut}
        />

        {/* Bouton Effacer */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--neutre)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              padding: '0.25rem 0',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--violet-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--neutre)')}
          >
            Effacer filtres
          </button>
        )}
      </div>

      {/* Chips des sélections */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6" style={{ marginLeft: 'calc(1rem + 0.75rem)' }}>
          {selectedThematiques.map((id) => {
            const thematique = thematiques.find((t) => t.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
              >
                {thematique?.nom}
                <button
                  onClick={() => toggleThematique(id)}
                  style={{ fontSize: '1.125rem', lineHeight: 1, padding: '0 0.125rem', cursor: 'pointer', background: 'none', border: 'none' }}
                  className="text-[var(--neutre)] hover:text-[var(--violet-dark)]"
                >
                  ×
                </button>
              </span>
            );
          })}
          {selectedAnnees.map((annee) => (
            <span
              key={annee}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
            >
              {annee}
              <button
                onClick={() => toggleAnnee(annee)}
                style={{ fontSize: '1.125rem', lineHeight: 1, padding: '0 0.125rem', cursor: 'pointer', background: 'none', border: 'none' }}
                className="text-[var(--neutre)] hover:text-[var(--violet-dark)]"
              >
                ×
              </button>
            </span>
          ))}
          {selectedConseils.map((conseil) => (
            <span
              key={conseil}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
            >
              {conseil}
              <button
                onClick={() => toggleConseil(conseil)}
                style={{ fontSize: '1.125rem', lineHeight: 1, padding: '0 0.125rem', cursor: 'pointer', background: 'none', border: 'none' }}
                className="text-[var(--neutre)] hover:text-[var(--violet-dark)]"
              >
                ×
              </button>
            </span>
          ))}
          {selectedStatuts.map((statut) => {
            const statutLabel = STATUTS.find((s) => s.value === statut)?.label || statut;
            return (
              <span
                key={statut}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
              >
                {statutLabel}
                <button
                  onClick={() => toggleStatut(statut)}
                  style={{ fontSize: '1.125rem', lineHeight: 1, padding: '0 0.125rem', cursor: 'pointer', background: 'none', border: 'none' }}
                  className="text-[var(--neutre)] hover:text-[var(--violet-dark)]"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Résultats */}
      {filteredProjets.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAll || hasActiveFilters ? filteredProjets : filteredProjets.slice(0, DEFAULT_LIMIT)).map((projet) => (
              <ProjetCard
                key={projet.id}
                projet={projet}
                onClick={() => setSelectedProjet(projet)}
              />
            ))}
          </div>
          {!hasActiveFilters && filteredProjets.length > DEFAULT_LIMIT && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2.5 border border-[var(--violet)] text-[var(--violet)] rounded-lg text-sm font-medium hover:bg-[var(--violet)] hover:text-white transition-colors"
              >
                {showAll ? 'Voir moins' : `Voir plus (${filteredProjets.length} projets)`}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-[var(--neutre)] text-center py-8">
          Aucun projet ne correspond aux filtres sélectionnés.
        </p>
      )}

      {/* Side Panel */}
      <SidePanel
        isOpen={selectedProjet !== null}
        onClose={() => setSelectedProjet(null)}
      >
        {selectedProjet && <ProjetDetail projet={selectedProjet} />}
      </SidePanel>
    </div>
  );
}
