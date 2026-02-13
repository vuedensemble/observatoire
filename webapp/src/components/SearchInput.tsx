'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CommuneWithStats } from '@/lib/types';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'header';
}

export default function SearchInput({
  placeholder = 'Rechercher ma commune (nom, code postal)',
  className = '',
  variant = 'default',
}: SearchInputProps) {
  const isHeader = variant === 'header';
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
    <div
      ref={wrapperRef}
      className={`relative ${isHeader ? 'header-search' : ''} ${className}`}
      style={isHeader ? { display: 'flex', alignItems: 'center' } : undefined}
    >
      <div style={isHeader ? { position: 'relative', display: 'flex', alignItems: 'center', height: '24px' } : undefined} className={isHeader ? '' : 'relative'}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={isHeader ? '' : 'w-full py-3 bg-white'}
          style={
            isHeader
              ? {
                  width: '100%',
                  padding: '0 0.5rem 0 1.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '24px',
                  height: '24px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: 'none',
                  boxShadow: 'none',
                  outline: 'none',
                }
              : { paddingLeft: '3rem', paddingRight: '1rem' }
          }
        />
        <svg
          className={isHeader ? '' : 'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutre)]'}
          style={
            isHeader
              ? {
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0.75rem',
                  height: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                }
              : undefined
          }
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
          <div
            className={isHeader ? '' : 'absolute right-4 top-1/2 -translate-y-1/2'}
            style={isHeader ? { position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' } : undefined}
          >
            <div className={
              isHeader
                ? 'w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin'
                : 'w-5 h-5 border-2 border-[var(--violet)] border-t-transparent rounded-full animate-spin'
            } />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          className={`absolute z-50 bg-white border border-[var(--border)] rounded-lg shadow-lg overflow-hidden ${isHeader ? 'right-0' : 'w-full mt-2'}`}
          style={isHeader ? { top: '100%', marginTop: '4px', width: '18rem' } : undefined}
        >
          {results.map((commune) => (
            <li key={commune.id}>
              <button
                onClick={() => handleSelect(commune)}
                className={`w-full px-4 text-left hover:bg-[#ede8fc] transition-colors flex justify-between items-center ${isHeader ? 'py-2 text-sm' : 'py-3 text-base'}`}
              >
                <span className="text-[var(--violet-dark)]">
                  {commune.nom}
                </span>
                <span className="text-xs text-[var(--neutre)]">
                  {commune.code_postal}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !loading && (
        <div
          className={`absolute z-50 bg-white border border-[var(--border)] rounded-lg shadow-lg text-center text-[var(--neutre)] ${isHeader ? 'right-0 text-sm' : 'w-full mt-2 text-base'}`}
          style={isHeader ? { top: '100%', marginTop: '4px', width: '18rem', padding: '0.5rem 1rem' } : { padding: '0.75rem 1rem' }}
        >
          Aucune commune trouvée
        </div>
      )}
    </div>
  );
}
