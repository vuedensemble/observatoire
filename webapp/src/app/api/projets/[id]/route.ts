import { NextRequest, NextResponse } from 'next/server';
import { getProjetById, getProjetBySlug } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try by ID first, then by slug
  let projet = await getProjetById(id);
  if (!projet) {
    projet = await getProjetBySlug(id);
  }

  if (!projet) {
    return NextResponse.json({ error: 'Projet not found' }, { status: 404 });
  }

  return NextResponse.json(projet);
}
