import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'ariane" className="text-sm text-[var(--neutre)] mb-6">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="hover:text-[var(--violet)]">
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-[var(--border)]">&gt;</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--violet)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--violet-dark)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
