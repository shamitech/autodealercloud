import { headers } from 'next/headers'

export function getTenantFromRequest() {
  const headersList = headers()
  const tenantSlug = headersList.get('x-tenant-slug')
  
  if (!tenantSlug) {
    throw new Error('Tenant slug not found in request headers')
  }
  
  return tenantSlug
}
