import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Get content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    
    let username: string | null = null;
    let password: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const formData = await request.formData();
      username = formData.get('username') as string;
      password = formData.get('password') as string;
    } else if (contentType.includes('application/json')) {
      // Handle JSON data
      const json = await request.json();
      username = json.username;
      password = json.password;
    } else {
      // Try form data as default
      const formData = await request.formData();
      username = formData.get('username') as string;
      password = formData.get('password') as string;
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 }
      );
    }

    // Accept any login for testing
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
