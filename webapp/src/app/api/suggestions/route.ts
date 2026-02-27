import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { communeSuggestions, communes } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nom, code_postal, url_deliberations } = body;

  if (!nom?.trim() || !code_postal?.trim() || !url_deliberations?.trim()) {
    return NextResponse.json(
      { error: 'Tous les champs sont requis.' },
      { status: 400 },
    );
  }

  // Check if commune already exists in the observatory (normalized name + code_postal)
  const normalized = nom.trim().toLowerCase();
  const existing = await db
    .select()
    .from(communes)
    .where(sql`LOWER(${communes.nom}) = ${normalized} AND ${communes.code_postal} = ${code_postal.trim()}`);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'Cette commune est déjà dans l\'observatoire.' },
      { status: 409 },
    );
  }

  const id = `sug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await db.insert(communeSuggestions).values({
    id,
    nom: nom.trim(),
    code_postal: code_postal.trim(),
    url_deliberations: url_deliberations.trim(),
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
