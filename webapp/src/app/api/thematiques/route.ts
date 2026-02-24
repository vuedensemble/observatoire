import { NextResponse } from 'next/server';
import { getAllThematiques } from '@/lib/db';

export async function GET() {
  const thematiques = await getAllThematiques();
  return NextResponse.json(thematiques);
}
