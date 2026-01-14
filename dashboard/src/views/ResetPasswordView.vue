<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Reset Password</h1>
        <p class="text-gray-600 mt-2">Enter your new password below</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ success }}
        <p class="text-sm mt-2">Redirecting to login...</p>
      </div>

      <!-- Form -->
      <form v-if="!success" @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>

        <div>
          <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="passwordMismatch" class="text-sm text-red-600">
          Passwords do not match
        </div>

        <button
          type="submit"
          :disabled="loading || passwordMismatch"
          class="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>

      <!-- Back to login link -->
      <div class="mt-6 text-center">
        <router-link to="/login" class="text-blue-600 hover:text-blue-700 text-sm">
          Back to login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/api/client'

const route = useRoute()
const router = useRouter()

const form = ref({
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const token = computed(() => route.query.token || '')

const passwordMismatch = computed(() => {
  return form.value.password && form.value.password_confirmation && form.value.password !== form.value.password_confirmation
})

onMounted(() => {
  if (!token.value) {
    error.value = 'Invalid or missing reset token'
  }
})

const handleReset = async () => {
  if (passwordMismatch.value) {
    return
  }

  if (!form.value.password || form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await apiClient.post('/password/reset', {
      token: token.value,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })

    success.value = 'Password reset successfully! Redirecting to login...'
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
