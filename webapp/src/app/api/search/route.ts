import { NextRequest, NextResponse } from 'next/server';
import { searchProjets, searchCommunes } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query = searchParams.get('q') || '';
  const commune = searchParams.get('commune') || undefined;
  const thematique = searchParams.get('thematique') || undefined;
  const dateDebut = searchParams.get('date_debut') || undefined;
  const dateFin = searchParams.get('date_fin') || undefined;

  // Search both projets and communes
  const projets = await searchProjets({
    query,
    commune,
    thematique,
    dateDebut,
    dateFin,
  });

  const communes = query ? await searchCommunes(query) : [];

  return NextResponse.json({
    projets,
    communes,
    total: projets.length + communes.length,
  });
}
