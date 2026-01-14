import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/client'

export const useTenantAuthStore = defineStore('tenantAuth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('tenant_auth_token') || null)
  const tenant = ref(null)
  const permissions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isTenantAdmin = computed(() => user.value?.role === 'admin')
  const isMember = computed(() => user.value?.role === 'member')

  const canAccess = (permission) => {
    return permissions.value.includes(permission)
  }

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      // Use tenant-specific auth endpoint
      const response = await apiClient.post('/auth/login', { email, password })
      const { user: userData, access_token: authToken } = response.data
      
      token.value = authToken
      user.value = userData
      localStorage.setItem('tenant_auth_token', authToken)
      
      // Fetch tenant info and permissions
      await fetchTenantInfo()
      await fetchPermissions()
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTenantInfo() {
    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data.user || response.data
    } catch (err) {
      console.error('Failed to fetch tenant info:', err)
    }
  }

  async function fetchPermissions() {
    try {
      const response = await apiClient.get('/auth/permissions')
      if (response.data && Array.isArray(response.data)) {
        permissions.value = response.data
      } else if (response.data && response.data.permissions) {
        permissions.value = response.data.permissions
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data.user || response.data
      await fetchPermissions()
      return true
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      logout()
      return false
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      tenant.value = null
      permissions.value = []
      localStorage.removeItem('tenant_auth_token')
    }
  }

  return {
    user,
    token,
    tenant,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    isTenantAdmin,
    isMember,
    canAccess,
    login,
    fetchTenantInfo,
    fetchPermissions,
    fetchCurrentUser,
    logout,
  }
})
