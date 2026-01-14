<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Forgot Password?</h1>
        <p class="text-gray-600 mt-2">Enter your email to receive a reset link</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ success }}
      </div>

      <!-- Form -->
      <form v-if="!success" @submit.prevent="handleRequest" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="your@email.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
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
import { ref } from 'vue'
import apiClient from '@/api/client'

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRequest = async () => {
  loading.value = true
  error.value = ''

  try {
    await apiClient.post('/password/request-reset', {
      email: email.value,
    })

    success.value = 'If an account exists with this email, you will receive a password reset link shortly.'
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send reset link. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
