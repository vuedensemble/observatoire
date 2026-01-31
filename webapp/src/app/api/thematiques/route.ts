import { NextResponse } from 'next/server';
import { getAllThematiques } from '@/lib/db';

export async function GET() {
  const thematiques = getAllThematiques();
  return NextResponse.json(thematiques);
}
