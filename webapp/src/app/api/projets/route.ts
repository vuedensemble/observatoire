import { NextRequest, NextResponse } from 'next/server';
import { getAllProjets, searchProjets } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const commune = searchParams.get('commune') || undefined;
  const thematique = searchParams.get('thematique') || undefined;
  const dateDebut = searchParams.get('date_debut') || undefined;
  const dateFin = searchParams.get('date_fin') || undefined;
  const query = searchParams.get('q') || undefined;

  // If any filters provided, use search
  if (commune || thematique || dateDebut || dateFin || query) {
    const results = await searchProjets({
      commune,
      thematique,
      dateDebut,
      dateFin,
      query,
    });
    return NextResponse.json(results);
  }

  const projets = await getAllProjets();
  return NextResponse.json(projets);
}
