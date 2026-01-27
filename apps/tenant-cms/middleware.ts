import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const customDomain = request.headers.get('x-tenant-domain')
  const tenantId = request.headers.get('x-tenant-id')
  const host = request.headers.get('host') || ''

  console.log('[Middleware] Host:', host, 'CustomDomain:', customDomain, 'TenantId:', tenantId)

  // If request came through a custom domain (has X-Tenant-Domain header), route to published view
  if (customDomain && tenantId) {
    console.log('[Middleware] Custom domain detected, routing to published view')
    const url = request.nextUrl.clone()
    url.pathname = `/published/${tenantId}${url.pathname === '/' ? '' : url.pathname}`
    console.log('[Middleware] Rewriting to:', url.pathname)
    return NextResponse.rewrite(url)
  }

  // Default: show CMS editor
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
