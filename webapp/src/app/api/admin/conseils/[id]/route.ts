import { NextRequest, NextResponse } from 'next/server';
import { updateConseil } from '@/lib/db';
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
    await updateConseil(id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
