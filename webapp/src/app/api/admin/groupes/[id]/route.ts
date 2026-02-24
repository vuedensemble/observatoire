import { NextRequest, NextResponse } from 'next/server';
import { validateProjetGroupe, rejectProjetGroupe, updateProjetGroupe } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT: Update group details (nom_canonique, description, etc.)
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    await updateProjetGroupe(id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Validate or reject a group
export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === 'validate') {
      const result = await validateProjetGroupe(id, body.nom_canonique, body.description);
      return NextResponse.json({ ok: true, projet_id: result.projetId });
    } else if (action === 'reject') {
      await rejectProjetGroupe(id);
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "validate" or "reject".' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
