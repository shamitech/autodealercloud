<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Lightspeed Integration</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Loading...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Connected Status -->
    <div v-if="isConnected" class="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-green-500">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-semibold text-green-700 mb-4">✓ Connected to Lightspeed</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600 text-sm">Account ID</p>
              <p class="font-semibold">{{ lightspeedStatus.account_id }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Last Sync</p>
              <p class="font-semibold">{{ formatDate(lightspeedStatus.last_sync_at) || 'Never' }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Product Count</p>
              <p class="font-semibold">{{ lightspeedStatus.product_count || 0 }}</p>
            </div>
            <div>
              <p class="text-gray-600 text-sm">Connection Type</p>
              <p class="font-semibold">{{ lightspeedStatus.auth_type || 'API Key' }}</p>
            </div>
          </div>
        </div>
        <button
          @click="disconnectLightspeed"
          :disabled="isDisconnecting"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded transition"
        >
          {{ isDisconnecting ? 'Disconnecting...' : 'Disconnect' }}
        </button>
      </div>
    </div>

    <!-- Not Connected -->
    <div v-else class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Connect to Lightspeed</h2>
      <p class="text-gray-600 mb-6">
        Connect your Lightspeed account to sync products and inventory to AutoDealerCloud.
      </p>

      <form @submit.prevent="connectLightspeed" class="space-y-4 max-w-md">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            v-model="connectionForm.api_key"
            type="password"
            placeholder="Enter your Lightspeed API Key"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
          <input
            v-model="connectionForm.api_secret"
            type="password"
            placeholder="Enter your Lightspeed API Secret"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
          <input
            v-model="connectionForm.account_id"
            type="text"
            placeholder="Your Lightspeed Account ID"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isConnecting"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
        >
          {{ isConnecting ? 'Connecting...' : 'Connect Lightspeed' }}
        </button>
      </form>

      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <p class="font-semibold mb-2">📚 How to get your credentials:</p>
        <ol class="list-decimal list-inside space-y-1 text-xs">
          <li>Log in to your Lightspeed account</li>
          <li>Go to Settings → Developer → API Keys</li>
          <li>Create a new API key or copy your existing key</li>
          <li>Copy the API Key, API Secret, and Account ID</li>
          <li>Paste them above and click "Connect Lightspeed"</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

const isLoading = ref(false)
const isConnecting = ref(false)
const isDisconnecting = ref(false)
const error = ref(null)
const isConnected = ref(false)
const lightspeedStatus = ref({})
const connectionForm = ref({
  api_key: '',
  api_secret: '',
  account_id: '',
})

onMounted(checkLightspeedStatus)

async function checkLightspeedStatus() {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/lightspeed/status')
    const status = response.data.data || response.data
    isConnected.value = status.connected
    lightspeedStatus.value = status
  } catch (err) {
    console.error('Failed to check Lightspeed status:', err)
    isConnected.value = false
  } finally {
    isLoading.value = false
  }
}

async function connectLightspeed() {
  isConnecting.value = true
  error.value = null
  try {
    await apiClient.post('/lightspeed/connect', connectionForm.value)
    connectionForm.value = { api_key: '', api_secret: '', account_id: '' }
    await checkLightspeedStatus()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to connect to Lightspeed'
  } finally {
    isConnecting.value = false
  }
}

async function disconnectLightspeed() {
  if (!confirm('Are you sure? This will disconnect your Lightspeed account.')) return
  isDisconnecting.value = true
  error.value = null
  try {
    await apiClient.post('/lightspeed/disconnect')
    await checkLightspeedStatus()
  } catch (err) {
    error.value = 'Failed to disconnect from Lightspeed'
  } finally {
    isDisconnecting.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
}
</script>
