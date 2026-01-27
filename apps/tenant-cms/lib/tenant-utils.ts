import { headers } from 'next/headers'

export async function getTenantFromRequest(): Promise<string | null> {
  try {
    const headersList = await headers()
    
    // First check for X-Tenant-ID header (set by Nginx)
    const tenantIdHeader = headersList.get('X-Tenant-ID')
    if (tenantIdHeader) {
      return tenantIdHeader
    }

    // Fall back to extracting from Host header
    const host = headersList.get('host') || ''
    
    // Extract subdomain from host
    // e.g., "mydealer.autodealercloud.com" -> "mydealer"
    const parts = host.split('.')
    
    if (parts.length >= 3) {
      const subdomain = parts[0]
      // If it's not "tenant" or "www", it's a custom tenant subdomain
      if (subdomain !== 'tenant' && subdomain !== 'www' && subdomain !== 'api') {
        return subdomain
      }
    }

    // If accessing via tenant.autodealercloud.com, get tenant from session/auth
    return null
  } catch (error) {
    console.error('Error getting tenant from request:', error)
    return null
  }
}

export function getSubdomainFromHost(host: string): string | null {
  const parts = host.split('.')
  if (parts.length >= 3) {
    return parts[0]
  }
  return null
}
