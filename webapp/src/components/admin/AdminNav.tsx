'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const navLinks = [
  { href: '/admin', label: 'Communes' },
  { href: '/admin/thematiques', label: 'Thematiques' },
  { href: '/admin/projets', label: 'Dedup projets' },
  { href: '/admin/suggestions', label: 'Suggestions' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="bg-[var(--violet-fonce)] text-white px-6 py-3 flex items-center gap-6">
      <Link href="/admin" className="font-bold text-lg mr-4">
        Admin Observatoire
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-white/20 font-medium'
                  : 'hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto">
        <button
          onClick={handleLogout}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Deconnexion
        </button>
      </div>
    </nav>
  );
}
