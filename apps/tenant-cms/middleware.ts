import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const customDomain = request.headers.get('x-tenant-domain')
  const tenantId = request.headers.get('x-tenant-id')
  const host = request.headers.get('host') || ''
  
  // Debug: log all headers
  console.log('[Middleware DEBUG] Headers:', {
    host,
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'x-real-ip': request.headers.get('x-real-ip'),
  })

  console.log('[Middleware] Host:', host, 'CustomDomain:', customDomain, 'TenantId:', tenantId)

  // If request came through a custom domain (has X-Tenant-Domain header), route to published view
  if (customDomain && tenantId) {
    console.log('[Middleware] Custom domain detected, routing to published view')
    const url = request.nextUrl.clone()
    url.pathname = `/published/${tenantId}${url.pathname === '/' ? '' : url.pathname}`
    console.log('[Middleware] Rewriting to:', url.pathname)
    return NextResponse.rewrite(url)
  }

  // Check for tenant CMS subdomain (e.g., jared-auto.autodealercloud.com)
  const hostname = host.split(':')[0] // Remove port if present
  if (hostname.endsWith('.autodealercloud.com') && hostname !== 'tenant.autodealercloud.com') {
    const subdomain = hostname.replace('.autodealercloud.com', '')
    console.log('[Middleware] Tenant subdomain detected:', subdomain)
    
    try {
      // Fetch tenant by subdomain
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autodealercloud.com'
      const response = await fetch(`${apiUrl}/api/v1/tenants?cmsSubdomain=${subdomain}`)
      
      if (response.ok) {
        const tenants = await response.json()
        if (tenants && tenants.length > 0) {
          const tenant = tenants[0]
          console.log('[Middleware] Found tenant:', tenant.id, tenant.name)
          
          // Set tenant ID in request headers for downstream use
          const requestHeaders = new Headers(request.headers)
          requestHeaders.set('x-tenant-subdomain', subdomain)
          requestHeaders.set('x-tenant-id', tenant.id)
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
        } else {
          console.log('[Middleware] No tenant found for subdomain:', subdomain)
        }
      }
    } catch (error) {
      console.error('[Middleware] Error fetching tenant:', error)
    }
  }

  // Default: show CMS editor
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
