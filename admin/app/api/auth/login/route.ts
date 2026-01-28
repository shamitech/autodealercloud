import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import credentials from '@/lib/credentials.json';

export async function POST(request: NextRequest) {
  try {
    // Get content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    
    let username: string | null = null;
    let password: string | null = null;

    if (contentType.includes('application/json')) {
      // Handle JSON data
      const json = await request.json();
      username = json.username;
      password = json.password;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data
      const formData = await request.formData();
      username = formData.get('username') as string;
      password = formData.get('password') as string;
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

    // Validate credentials against the credentials file
    const adminCreds = credentials as Record<string, { username: string; password: string; email: string; role: string }>;
    const user = Object.values(adminCreds).find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions
    );

    session.userId = username;
    session.username = username;
    session.isLoggedIn = true;

    await session.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
