import axios from 'axios'

// Determine if we're on a tenant subdomain or platform subdomain
const getTenantSubdomain = () => {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // Exclude: localhost, 127.0.0.1, dashboard, api, www
  if (
    parts.length <= 2 || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    hostname.includes('dashboard') ||
    hostname.includes('api') ||
    hostname.includes('www')
  ) {
    return null
  }
  
  return parts[0]
}

// Use correct API URL based on environment
const getAPIURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8001/api'
  }
  
  // If on a tenant subdomain, use same-origin API to avoid CORS
  const tenantSubdomain = getTenantSubdomain()
  if (tenantSubdomain) {
    return `${window.location.protocol}//${window.location.host}/api`
  }
  
  // Dashboard accessing API via api.autodealercloud.com
  return `${window.location.protocol}//api.autodealercloud.com/api`
}

const API_BASE_URL = getAPIURL()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
