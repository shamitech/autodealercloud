import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  
  // Extract tenant from subdomain
  // Pattern: {tenantSlug}-auth.autodealershipcloud.com
  const parts = host.split('.')
  
  let tenantSlug = null
  
  if (host.includes('-auth.')) {
    // Extract tenant slug from subdomain
    const match = host.match(/^([a-z0-9-]+)-auth\./i)
    if (match) {
      tenantSlug = match[1]
    }
  }
  
  // Store tenant info in request headers for use in app
  const requestHeaders = new Headers(request.headers)
  if (tenantSlug) {
    requestHeaders.set('x-tenant-slug', tenantSlug)
  }
  requestHeaders.set('x-original-host', host)
  
  // Log for debugging
  console.log(`[CMS Middleware] Host: ${host}, Tenant: ${tenantSlug}`)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
