'use client';

import { useRouter } from 'next/navigation';
import { Commune } from '@/lib/types';

interface MapCAPBProps {
  communes: Commune[];
  className?: string;
}

export default function MapCAPB({ communes, className = '' }: MapCAPBProps) {
  const router = useRouter();

  const handleCommuneClick = (slug: string) => {
    router.push(`/commune/${slug}`);
  };

  // Coordonnées simplifiées pour quelques communes du Pays Basque (positions relatives en %)
  const communePositions: Record<string, { x: number; y: number }> = {
    bayonne: { x: 35, y: 25 },
    anglet: { x: 25, y: 35 },
    biarritz: { x: 15, y: 45 },
    bidart: { x: 20, y: 55 },
    guethary: { x: 22, y: 62 },
    'saint-jean-de-luz': { x: 28, y: 72 },
    ciboure: { x: 32, y: 75 },
    urrugne: { x: 40, y: 78 },
    hendaye: { x: 35, y: 88 },
    ascain: { x: 48, y: 72 },
    'saint-pee-sur-nivelle': { x: 55, y: 60 },
    espelette: { x: 60, y: 50 },
    'cambo-les-bains': { x: 65, y: 40 },
    hasparren: { x: 55, y: 30 },
    ustaritz: { x: 48, y: 35 },
  };

  return (
    <div className={`relative bg-[var(--vert)] rounded-2xl overflow-hidden ${className}`}>
      {/* Forme stylisée du Pays Basque */}
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Silhouette simplifiée */}
        <path
          d="M10 20 Q30 10, 50 15 Q70 20, 85 35 Q90 50, 85 70 Q75 85, 55 90 Q35 95, 20 85 Q10 70, 15 50 Q10 30, 10 20 Z"
          fill="var(--vert)"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Points des communes */}
        {communes.map((commune) => {
          const pos = communePositions[commune.slug];
          if (!pos) return null;

          return (
            <g
              key={commune.id}
              className="cursor-pointer"
              onClick={() => handleCommuneClick(commune.slug)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r="3"
                fill="white"
                className="transition-all hover:r-4"
              />
              <title>{commune.nom}</title>
            </g>
          );
        })}

        {/* Logo V.E */}
        <text
          x="75"
          y="15"
          fill="white"
          fontSize="8"
          fontWeight="bold"
          className="select-none"
        >
          V
          <tspan fill="var(--orange)">.</tspan>
          E
        </text>
      </svg>

      {/* Overlay interactif avec noms */}
      <div className="absolute inset-0 pointer-events-none">
        {communes.slice(0, 5).map((commune) => {
          const pos = communePositions[commune.slug];
          if (!pos) return null;

          return (
            <div
              key={commune.id}
              className="absolute text-white text-xs font-medium pointer-events-auto cursor-pointer hover:text-[var(--orange)] transition-colors"
              style={{
                left: `${pos.x + 3}%`,
                top: `${pos.y - 1}%`,
              }}
              onClick={() => handleCommuneClick(commune.slug)}
            >
              {commune.nom}
            </div>
          );
        })}
      </div>
    </div>
  );
}
