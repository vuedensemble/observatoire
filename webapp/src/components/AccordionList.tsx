'use client';

import { useState } from 'react';

interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionListProps {
  items: AccordionItem[];
  defaultOpen?: string[];
}

export default function AccordionList({ items, defaultOpen = [] }: AccordionListProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

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
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id} className="bg-white rounded-lg border border-[var(--border)]">
            <button
              onClick={() => toggleItem(item.id)}
              className="accordion-header w-full"
              aria-expanded={isOpen}
            >
              <div className="flex-1 text-left">{item.title}</div>
              <svg
                className={`w-5 h-5 text-[var(--violet)] transition-transform ${
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
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
