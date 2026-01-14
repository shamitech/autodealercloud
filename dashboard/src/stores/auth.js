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
      const response = await apiClient.post('/platform/login', { email, password })
      const { user: userData, access_token: authToken } = response.data
      
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
      // For platform users, we can derive permissions from role in user object
      // Or fetch them from a dedicated endpoint if needed
      if (user.value) {
        permissions.value = ['read', 'write'] // Basic permissions based on role
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await apiClient.get('/platform/me')
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
      await apiClient.post('/platform/logout')
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
