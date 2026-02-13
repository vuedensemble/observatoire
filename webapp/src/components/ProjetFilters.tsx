'use client';

import { useState } from 'react';
import { ProjetWithRelations, Thematique } from '@/lib/types';
import ProjetCard from './ProjetCard';
import SidePanel from './SidePanel';
import ProjetDetail from './ProjetDetail';

interface ProjetFiltersProps {
  projets: ProjetWithRelations[];
  thematiques: Thematique[];
}

const ANNEES = ['2024', '2023', '2022', '2021', '2020'];

const DEFAULT_LIMIT = 3;

export default function ProjetFilters({ projets, thematiques }: ProjetFiltersProps) {
  const [selectedThematiques, setSelectedThematiques] = useState<string[]>([]);
  const [selectedAnnees, setSelectedAnnees] = useState<string[]>([]);
  const [selectedConseils, setSelectedConseils] = useState<string[]>([]);
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

  const addThematique = (id: string) => {
    if (id && !selectedThematiques.includes(id)) {
      setSelectedThematiques([...selectedThematiques, id]);
    }
  };

  const addAnnee = (annee: string) => {
    if (annee && !selectedAnnees.includes(annee)) {
      setSelectedAnnees([...selectedAnnees, annee]);
    }
  };

  const addConseil = (conseil: string) => {
    if (conseil && !selectedConseils.includes(conseil)) {
      setSelectedConseils([...selectedConseils, conseil]);
    }
  };

  const removeThematique = (id: string) => {
    setSelectedThematiques(selectedThematiques.filter((t) => t !== id));
  };

  const removeAnnee = (annee: string) => {
    setSelectedAnnees(selectedAnnees.filter((a) => a !== annee));
  };

  const removeConseil = (conseil: string) => {
    setSelectedConseils(selectedConseils.filter((c) => c !== conseil));
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

    return matchThematique && matchAnnee && matchConseil;
  });

  const hasActiveFilters =
    selectedThematiques.length > 0 ||
    selectedAnnees.length > 0 ||
    selectedConseils.length > 0;

  return (
    <div>
      {/* Ligne 1 : Dropdowns */}
      <div className="flex items-center gap-3 mb-3">
        <select
          value=""
          onChange={(e) => addThematique(e.target.value)}
          className="px-4 py-2 rounded-md border border-[var(--border)] bg-white text-[var(--violet-dark)] text-sm focus:outline-none focus:border-[var(--violet)]"
        >
          <option value="">Thématique</option>
          {thematiques
            .filter((t) => !selectedThematiques.includes(t.id))
            .map((thematique) => (
              <option key={thematique.id} value={thematique.id}>
                {thematique.nom}
              </option>
            ))}
        </select>

        <select
          value=""
          onChange={(e) => addAnnee(e.target.value)}
          className="px-4 py-2 rounded-md border border-[var(--border)] bg-white text-[var(--violet-dark)] text-sm focus:outline-none focus:border-[var(--violet)]"
        >
          <option value="">Année</option>
          {ANNEES.filter((a) => !selectedAnnees.includes(a)).map((annee) => (
            <option key={annee} value={annee}>
              {annee}
            </option>
          ))}
        </select>

        <select
          value=""
          onChange={(e) => addConseil(e.target.value)}
          className="px-4 py-2 rounded-md border border-[var(--border)] bg-white text-[var(--violet-dark)] text-sm focus:outline-none focus:border-[var(--violet)]"
        >
          <option value="">Conseil municipal</option>
          {conseils
            .filter((c) => !selectedConseils.includes(c))
            .map((conseil) => (
              <option key={conseil} value={conseil}>
                {conseil}
              </option>
            ))}
        </select>
      </div>

      {/* Ligne 2 : Chips des sélections */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {selectedThematiques.map((id) => {
            const thematique = thematiques.find((t) => t.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
              >
                {thematique?.nom}
                <button
                  onClick={() => removeThematique(id)}
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
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
            >
              {annee}
              <button
                onClick={() => removeAnnee(annee)}
                className="text-[var(--neutre)] hover:text-[var(--violet-dark)]"
              >
                ×
              </button>
            </span>
          ))}
          {selectedConseils.map((conseil) => (
            <span
              key={conseil}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-[var(--violet-dark)]"
            >
              {conseil}
              <button
                onClick={() => removeConseil(conseil)}
                className="text-[var(--neutre)] hover:text-[var(--violet-dark)]"
              >
                ×
              </button>
            </span>
          ))}
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
