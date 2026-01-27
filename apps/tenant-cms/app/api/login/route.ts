import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

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

    // Find and verify user
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
    })

    if (!user) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=invalid',
        },
      })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/login?error=invalid',
        },
      })
    }

    // Create session
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': `auth=${Buffer.from(email).toString('base64')}; Path=/; Secure; SameSite=Strict; Max-Age=86400`,
      },
    })
    return response
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
