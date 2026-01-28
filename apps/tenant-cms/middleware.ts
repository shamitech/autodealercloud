import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const hostname = host.split(':')[0]

  console.log('[Middleware] Host:', hostname)

  // Check for auth subdomain (e.g., testsite3-auth.autodealercloud.com)
  if (hostname.includes('-auth.autodealercloud.com')) {
    console.log('[Middleware] Auth subdomain detected, allowing login page')
    return NextResponse.next()
  }

  // Check for tenant CMS subdomain (e.g., testsite3.autodealercloud.com)
  if (hostname.endsWith('.autodealercloud.com') && hostname !== 'tenant.autodealercloud.com') {
    const subdomain = hostname.replace('.autodealercloud.com', '')
    console.log('[Middleware] Tenant subdomain detected:', subdomain)
    
    try {
      // Fetch tenant by subdomain
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autodealercloud.com'
      const response = await fetch(`${apiUrl}/api/v1/tenants?cmsSubdomain=${subdomain}`)
      
      if (response.ok) {
        const result = await response.json()
        const tenants = result.data || result
        if (tenants && tenants.length > 0) {
          const tenant = tenants[0]
          console.log('[Middleware] Found tenant:', tenant.id)
          
          const requestHeaders = new Headers(request.headers)
          requestHeaders.set('x-tenant-subdomain', subdomain)
          requestHeaders.set('x-tenant-id', tenant.id)
          
          return NextResponse.next({
            request: { headers: requestHeaders },
          })
        }
      }
    } catch (error) {
      console.error('[Middleware] Error fetching tenant:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
