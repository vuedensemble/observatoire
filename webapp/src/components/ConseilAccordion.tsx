'use client';

import { useState } from 'react';
import { ConseilWithDeliberations } from '@/lib/types';
import { formatDateLong } from '@/lib/utils';
import DeliberationCard from './DeliberationCard';

interface ConseilAccordionProps {
  conseils: ConseilWithDeliberations[];
}

const DEFAULT_LIMIT = 3;

export default function ConseilAccordion({ conseils }: ConseilAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const displayedConseils = showAll ? conseils : conseils.slice(0, DEFAULT_LIMIT);

  return (
    <div>
    <div className="space-y-3">
      {displayedConseils.map((conseil) => {
        const isOpen = openItems.has(conseil.id);
        return (
          <div key={conseil.id} className="bg-transparent border border-black/30 rounded-lg">
            <button
              onClick={() => toggleItem(conseil.id)}
              className="accordion-header w-full"
              aria-expanded={isOpen}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                <span className="font-medium text-black">
                  Conseil du {formatDateLong(conseil.date)}
                </span>
                <div className="flex items-center gap-4 text-sm text-[var(--neutre)]">
                  <span>
                    {conseil.deliberations.length} délibération
                    {conseil.deliberations.length > 1 ? 's' : ''}
                  </span>
                  {conseil.pdf_url && (
                    <a
                      href={conseil.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--violet)] hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      PDF
                    </a>
                  )}
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-[var(--violet)] transition-transform ml-4 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-5">
                {/* Documents disponibles */}
                {(() => {
                  const sourceFiles = [
                    ...new Set(
                      conseil.deliberations
                        .map((d) => d.source_file)
                        .filter((f): f is string => !!f)
                    ),
                  ];
                  const hasDocuments = conseil.pdf_url || sourceFiles.length > 0;
                  if (!hasDocuments) return null;

                  return (
                    <div className="mb-4 p-4 bg-[var(--creme)] rounded-lg">
                      <h4 className="text-sm font-semibold text-[var(--violet-dark)] mb-3">
                        Documents disponibles
                      </h4>
                      <div className="space-y-2">
                        {conseil.pdf_url && (
                          <a
                            href={conseil.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[var(--violet)] hover:underline font-medium"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Compte-rendu du conseil (PDF)
                          </a>
                        )}
                        {sourceFiles.map((file) => {
                          const delib = conseil.deliberations.find((d) => d.source_file === file);
                          return (
                            <a
                              key={file}
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-[var(--violet)] hover:underline"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Document source{delib ? ` — Délibération N°${delib.numero}` : ''}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="divide-y divide-black/10 pt-1">
                  {conseil.deliberations.map((delib, index) => (
                    <DeliberationCard
                      key={delib.id}
                      deliberation={{ ...delib, conseil }}
                      showPdfLink={false}
                      index={index + 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
    {conseils.length > DEFAULT_LIMIT && (
      <div className="text-center mt-8">
        <button
          onClick={() => setShowAll(!showAll)}
          className="px-6 py-2.5 border border-[var(--violet)] text-[var(--violet)] rounded-lg text-sm font-medium hover:bg-[var(--violet)] hover:text-white transition-colors"
        >
          {showAll ? 'Voir moins' : `Voir plus (${conseils.length} conseils)`}
        </button>
      </div>
    )}
    </div>
  );
}
