/**
 * Get current subdomain from hostname
 * Returns null if on main domain (dashboard.autodealercloud.com or api.autodealercloud.com)
 */
export function getCurrentSubdomain() {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // If localhost or IP address, no subdomain
  if (hostname === 'localhost' || hostname.includes('127.0.0.1') || /^\d+/.test(hostname)) {
    return null
  }

  // Expected format: [subdomain].autodealercloud.com
  // or for localhost dev: subdomain.localhost
  if (parts.length >= 3) {
    const potentialSubdomain = parts[0]
    // If first part is 'dashboard' or 'api', it's the main domain
    if (['dashboard', 'api', 'www'].includes(potentialSubdomain)) {
      return null
    }
    return potentialSubdomain
  }

  return null
}

/**
 * Validate if tenant exists by checking same-origin API endpoint
 * Uses the tenant subdomain's own /api endpoint to avoid CORS issues
 * Retries with delay to handle database replication lag
 */
export async function validateTenant(subdomain, retries = 3) {
  if (!subdomain) {
    return true // No subdomain means platform/main domain
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Add cache-busting query parameter
      const timestamp = Date.now()
      const response = await fetch(`/api/tenant/check?subdomain=${subdomain}&t=${timestamp}`)
      
      if (!response.ok) {
        console.warn(`Tenant validation returned status ${response.status} (attempt ${attempt + 1}/${retries})`)
        // If API returns error, wait before retrying
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
        return false
      }
      
      const data = await response.json()
      if (data.exists === true) {
        return true
      }
      
      // Tenant not found yet, retry with delay
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
        continue
      }
      
      return false
    } catch (error) {
      console.error(`Failed to validate tenant (attempt ${attempt + 1}/${retries}):`, error)
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }
  
  // All retries exhausted, reject access
  return false
}
