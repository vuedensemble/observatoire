import { NextRequest, NextResponse } from 'next/server';
import { getCommuneById, getCommuneBySlug } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try by ID first, then by slug
  let commune = await getCommuneById(id);
  if (!commune) {
    commune = await getCommuneBySlug(id);
  }

  if (!commune) {
    return NextResponse.json({ error: 'Commune not found' }, { status: 404 });
  }

  return NextResponse.json(commune);
}
