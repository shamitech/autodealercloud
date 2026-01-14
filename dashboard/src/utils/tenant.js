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
 * Validate if tenant exists by checking if API is accessible with tenant context
 */
export async function validateTenant(subdomain) {
  if (!subdomain) {
    return true // No subdomain means platform/main domain
  }

  try {
    // Call the validation endpoint - returns {exists: true/false}
    const response = await fetch(`https://api.autodealercloud.com/api/tenant/check?subdomain=${subdomain}`)
    
    if (!response.ok) {
      // If API is down, fail open (allow access)
      return true
    }
    
    const data = await response.json()
    return data.exists === true
  } catch (error) {
    console.error('Failed to validate tenant:', error)
    // On network error, fail open (allow access)
    return true
  }
}
