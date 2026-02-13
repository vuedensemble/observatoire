'use client';

import { useState, useRef, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = selected.length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="filter-select"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          cursor: 'pointer',
          backgroundImage: 'none',
          paddingRight: '0.75rem',
          backgroundColor: open ? '#ede8fc' : undefined,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {label}
          {count > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.125rem',
                height: '1.125rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--violet)',
                color: 'white',
                fontSize: '0.6875rem',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {count}
            </span>
          )}
        </span>
        <svg
          style={{
            width: '0.75rem',
            height: '0.75rem',
            color: 'var(--neutre)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            minWidth: '12rem',
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: '0.375rem',
            boxShadow: 'none',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => onToggle(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#1a1a1a',
                  backgroundColor: isSelected ? '#f5f0ff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f9f7ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected ? '#f5f0ff' : 'transparent';
                }}
              >
                {/* Checkbox */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '0.1875rem',
                    border: isSelected ? 'none' : '1.5px solid rgba(107, 92, 231, 0.45)',
                    backgroundColor: isSelected ? 'var(--violet)' : 'white',
                    flexShrink: 0,
                    transition: 'all 0.1s ease',
                  }}
                >
                  {isSelected && (
                    <svg
                      style={{ width: '0.625rem', height: '0.625rem', color: 'white' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
