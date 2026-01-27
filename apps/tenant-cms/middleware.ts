import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the X-Tenant-Domain header from nginx
  const customDomain = request.headers.get('x-tenant-domain')
  const tenantId = request.headers.get('x-tenant-id')
  const host = request.headers.get('host')

  // If request came through a custom domain (has X-Tenant-Domain header), route to published view
  if (customDomain && tenantId) {
    // Rewrite to the published view which will fetch from the API
    const url = request.nextUrl.clone()
    url.pathname = `/published/${tenantId}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Default: show CMS editor
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
