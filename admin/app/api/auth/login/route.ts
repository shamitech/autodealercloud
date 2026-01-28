import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Missing credentials' },
      { status: 400 }
    );
  }

  // TODO: Validate credentials against backend API
  // For now, accept any login
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  session.userId = '1';
  session.username = username;
  session.isLoggedIn = true;

  await session.save();

  return NextResponse.redirect(new URL('/dashboard', request.url), {
    status: 302,
  });
}
