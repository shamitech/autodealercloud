import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './lib/session'

export async function middleware(request: NextRequest) {
  const session = await getSession()

  // If user is logged in and tries to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && session.isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not logged in and tries to access protected routes, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
