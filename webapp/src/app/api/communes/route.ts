import { NextRequest, NextResponse } from 'next/server';
import { getAllCommunes, searchCommunes } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (query) {
    const results = await searchCommunes(query);
    return NextResponse.json(results);
  }

  const communes = await getAllCommunes();
  return NextResponse.json(communes);
}
