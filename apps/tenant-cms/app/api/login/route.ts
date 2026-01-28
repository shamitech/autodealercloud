import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slug, password } = await request.json()

    if (!slug || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    // Call backend API to validate password
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autodealercloud.com'
    const res = await fetch(`${apiUrl}/api/v1/tenant-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({ 
      sessionToken: data.sessionToken, 
      tenantId: data.tenantId,
      success: true 
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
      status: 302,
      headers: {
        'Location': '/login?error=server',
      },
    })
  }
}
