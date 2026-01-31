import { NextRequest, NextResponse } from 'next/server';
import { getCommuneById, getCommuneBySlug, getProjetsByCommune } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find commune by ID or slug
  let commune = getCommuneById(id);
  if (!commune) {
    commune = getCommuneBySlug(id);
  }

  if (!commune) {
    return NextResponse.json({ error: 'Commune not found' }, { status: 404 });
  }

  const projets = getProjetsByCommune(commune.id);
  return NextResponse.json(projets);
}
