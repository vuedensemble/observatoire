import { NextRequest, NextResponse } from 'next/server';
import { requireAuthAPI } from '@/lib/auth-utils';
import { db } from '@/lib/db/index';
import { communeSuggestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAuthAPI(request);
  if (authError) return authError;

  const { id } = await params;

  await db.delete(communeSuggestions).where(eq(communeSuggestions.id, id));

  return NextResponse.json({ success: true });
}
