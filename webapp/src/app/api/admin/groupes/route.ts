import { NextRequest, NextResponse } from 'next/server';
import { getProjetGroupesByCommune, mergeProjetGroupes } from '@/lib/db';
import { requireAuthAPI } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  const authError = await requireAuthAPI(request);
  if (authError) return authError;

  const communeId = request.nextUrl.searchParams.get('commune');
  const statut = request.nextUrl.searchParams.get('statut');

  if (!communeId) {
    return NextResponse.json({ error: 'commune parameter required' }, { status: 400 });
  }

  let groups = await getProjetGroupesByCommune(communeId);

  if (statut) {
    groups = groups.filter((g) => g.statut === statut);
  }

  // Sort by mention count descending
  groups.sort((a, b) => b.mentions.length - a.mentions.length);

  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuthAPI(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, groupe_ids, nom_canonique } = body;

    if (action === 'merge') {
      if (!Array.isArray(groupe_ids) || groupe_ids.length < 2) {
        return NextResponse.json({ error: 'Need at least 2 groupe_ids to merge' }, { status: 400 });
      }
      if (!nom_canonique) {
        return NextResponse.json({ error: 'nom_canonique required' }, { status: 400 });
      }
      const result = await mergeProjetGroupes(groupe_ids, nom_canonique);
      return NextResponse.json({ ok: true, merged_groupe_id: result.mergedGroupeId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
