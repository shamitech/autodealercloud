<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantAuthStore } from '@/stores/tenantAuth'
import { getCurrentSubdomain } from '@/utils/tenant'

const router = useRouter()
const platformAuthStore = useAuthStore()
const tenantAuthStore = useTenantAuthStore()

const email = ref('')
const password = ref('')
const currentSubdomain = ref(null)

onMounted(() => {
  currentSubdomain.value = getCurrentSubdomain()
})

const getAuthStore = () => {
  return currentSubdomain.value ? tenantAuthStore : platformAuthStore
}

const handleLogin = async () => {
  const authStore = getAuthStore()
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/')
  }
}

const getErrorMessage = () => {
  const authStore = getAuthStore()
  return authStore.error
}

const isLoading = () => {
  const authStore = getAuthStore()
  return authStore.isLoading
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">AutoDealer</h1>
        <p class="text-gray-600 mt-2">Dealer Management Dashboard</p>
      </div>

      <!-- Error Message -->
      <div v-if="getErrorMessage()" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ getErrorMessage() }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
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

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading()"
          class="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {{ isLoading() ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Forgot password link -->
      <div class="mt-4 text-center">
        <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700">
          Forgot your password?
        </router-link>
      </div>
    </div>
  </div>
</template>
