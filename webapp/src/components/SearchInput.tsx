'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CommuneWithStats } from '@/lib/types';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  placeholder = 'Rechercher ma commune (nom, code postal)',
  className = '',
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommuneWithStats[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/communes?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.slice(0, 5));
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (commune: CommuneWithStats) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/commune/${commune.slug}`);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 bg-white"
          style={{ paddingLeft: '3rem', paddingRight: '1rem' }}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutre)]"
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
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[var(--violet)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
          {results.map((commune) => (
            <li key={commune.id}>
              <button
                onClick={() => handleSelect(commune)}
                className="w-full px-4 py-3 text-left hover:bg-[var(--creme)] transition-colors flex justify-between items-center"
              >
                <span className="font-medium text-[var(--violet-dark)]">
                  {commune.nom}
                </span>
                <span className="text-sm text-[var(--neutre)]">
                  {commune.code_postal}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-[var(--border)] rounded-lg shadow-lg p-4 text-center text-[var(--neutre)]">
          Aucune commune trouvée
        </div>
      )}
    </div>
  );
}
