import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  user?: {
    id: string
    username: string
  }
  isLoggedIn?: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'this-is-a-very-long-secret-key-minimum-32-characters-required!',
  cookieName: 'admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 7, // 7 days
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  return session
}
