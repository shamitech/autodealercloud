import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Call the Fastify API to authenticate
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: response.status }
      )
    }

    // Set session
    const session = await getSession()
    session.user = data.user
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ success: true, message: 'Logged in' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}
