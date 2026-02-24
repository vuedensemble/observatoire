import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function requireAuthAPI(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
