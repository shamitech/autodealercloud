'use server';

import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function login(username: string, password: string) {
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
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  session.destroy();
  redirect('/');
}
