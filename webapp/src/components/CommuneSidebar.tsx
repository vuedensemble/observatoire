'use client';

import { useEffect, useRef } from 'react';

interface CommuneSidebarProps {
  children: React.ReactNode;
}

export default function CommuneSidebar({ children }: CommuneSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const sidebar = sidebarRef.current;
    if (!footer || !sidebar) return;

    let rafId: number;

    const update = () => {
      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const overlap = viewportHeight - footerRect.top;
      sidebar.style.bottom = overlap > 0 ? `${overlap}px` : '0px';
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      {/* Mobile : bandeau normal en haut */}
      <div className="lg:hidden bg-[var(--creme)] p-8">
        {children}
      </div>

      {/* Desktop : bandeau fixe à gauche avec ascenseur */}
      <div
        ref={sidebarRef}
        className="hidden lg:block fixed left-0 bg-[var(--creme)] w-96 sidebar-scroll"
        style={{
          top: 'calc(1.75rem + 64px + 1px)',
          bottom: '0px',
          zIndex: 10,
        }}
      >
        <div className="p-8">
          {children}
        </div>
      </div>
    </>
  );
}
