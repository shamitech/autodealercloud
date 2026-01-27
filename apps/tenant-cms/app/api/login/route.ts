import { headers } from 'next/headers'

export async function GET() {
  return new Response('Not found', { status: 404 })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const headersList = await headers()
    const tenantId = headersList.get('x-tenant-id')

    if (!email || !password) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=empty',
        },
      })
    }

    if (!tenantId) {
      // In production, extract from subdomain via middleware
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=tenant',
        },
      })
    }

    try {
      // Call the backend API to authenticate
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autodealercloud.com'
      const authResponse = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          tenantId,
        }),
      })

      if (!authResponse.ok) {
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/login?error=invalid',
          },
        })
      }

      const authData = await authResponse.json()

      // Create session with auth token from API
      const response = new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `auth=${authData.token}; Path=/; Secure; SameSite=Strict; Max-Age=86400`,
        },
      })
      return response
    } catch (apiError) {
      console.error('API auth error:', apiError)
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=server',
        },
      })
    }
  } catch (error: any) {
    console.error('Login error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/login?error=server',
      },
    })
  }
}
