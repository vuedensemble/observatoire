'use client';

import { useState } from 'react';
import { ConseilWithDeliberations } from '@/lib/types';
import { formatDateLong } from '@/lib/utils';
import DeliberationCard from './DeliberationCard';

interface ConseilAccordionProps {
  conseils: ConseilWithDeliberations[];
}

export default function ConseilAccordion({ conseils }: ConseilAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="space-y-2">
      {conseils.map((conseil) => {
        const isOpen = openItems.has(conseil.id);
        return (
          <div key={conseil.id} className="bg-white rounded-lg border border-[var(--border)]">
            <button
              onClick={() => toggleItem(conseil.id)}
              className="accordion-header w-full"
              aria-expanded={isOpen}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                <span className="font-medium text-[var(--violet-dark)]">
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
              <div className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  {conseil.deliberations.map((delib) => (
                    <DeliberationCard
                      key={delib.id}
                      deliberation={{ ...delib, conseil }}
                      showPdfLink={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
