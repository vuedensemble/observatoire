import { NextRequest, NextResponse } from 'next/server';
import { createThematique } from '@/lib/db';
import { requireAuthAPI } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  const authError = await requireAuthAPI(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, nom, description, couleur } = body;

    if (!id || !nom || !description || !couleur) {
      return NextResponse.json({ error: 'id, nom, description, couleur required' }, { status: 400 });
    }

    await createThematique({ id, nom, description, couleur });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
