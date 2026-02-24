import { NextRequest, NextResponse } from 'next/server';
import { setProjetThematiques } from '@/lib/db';
import { requireAuthAPI } from '@/lib/auth-utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authError = await requireAuthAPI(request);
  if (authError) return authError;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { thematique_ids } = body;

    if (!Array.isArray(thematique_ids)) {
      return NextResponse.json({ error: 'thematique_ids must be an array' }, { status: 400 });
    }

    await setProjetThematiques(id, thematique_ids);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
