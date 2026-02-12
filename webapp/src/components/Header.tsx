'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const navLinks = [
  { href: '/a-propos', label: 'Le projet' },
  { href: '/methodologie', label: 'La méthodologie' },
  { href: '/soutenir', label: 'Soutenir le projet' },
  { href: 'https://www.vuedensemble.fr#nousrejoindre', label: 'Nous rejoindre', external: true },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Barre verte - lien vers le site principal */}
      <div className="bg-[var(--vert)] text-white text-xs py-1.5">
        <div className="container flex items-center justify-center gap-1">
          <span>Un outil de</span>
          <a
            href="https://www.vuedensemble.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:opacity-80 transition-opacity"
            style={{ color: 'white' }}
          >
            Vue d&apos;Ensemble
          </a>
          <span>—</span>
          <a
            href="https://www.vuedensemble.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            style={{ color: 'white' }}
          >
            vuedensemble.fr ↗
          </a>
        </div>
      </div>

      <header className="bg-white border-b border-[var(--border)]">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Titre + logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="text-lg font-bold no-underline hover:no-underline" style={{ color: 'var(--violet)' }}>
                Observatoire citoyen des collectivités
              </Link>
              <span className="text-sm" style={{ color: 'var(--violet-dark)' }}>par</span>
              <Image
                src="/Logo-VE-color1.svg"
                alt="Vue d'Ensemble"
                width={70}
                height={17}
                className="h-3.5 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--violet-dark)] hover:text-[var(--violet)] transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-[var(--violet-dark)] hover:text-[var(--violet)] transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-[var(--violet-dark)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-[var(--border)]">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--violet-dark)] hover:text-[var(--violet)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[var(--violet-dark)] hover:text-[var(--violet)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
