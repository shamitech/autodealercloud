import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const permissions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const canAccess = (permission) => {
    return permissions.value.includes(permission)
  }

  async function login(email, password) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const { user: userData, token: authToken } = response.data
      
      token.value = authToken
      user.value = userData
      localStorage.setItem('auth_token', authToken)
      
      // Fetch permissions
      await fetchPermissions()
      
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPermissions() {
    try {
      const response = await apiClient.get('/auth/permissions')
      permissions.value = response.data.permissions || []
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data
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
      permissions.value = []
      localStorage.removeItem('auth_token')
    }
  }

  return {
    user,
    token,
    permissions,
    isLoading,
    error,
    isAuthenticated,
    canAccess,
    login,
    fetchPermissions,
    fetchCurrentUser,
    logout,
  }
})
