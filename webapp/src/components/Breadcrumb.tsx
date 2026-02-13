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
    <nav aria-label="Fil d'ariane" className="text-sm mb-6" style={{ color: 'var(--neutre)' }}>
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--neutre)' }}>
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span>&gt;</span>
            {item.href ? (
              <Link href={item.href} className="hover:opacity-70 transition-opacity" style={{ color: 'var(--neutre)' }}>
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
