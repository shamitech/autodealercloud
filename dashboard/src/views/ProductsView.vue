<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Products</h1>

    <!-- Sync Button -->
    <div class="mb-6">
      <button
        v-if="canSync"
        @click="syncProducts"
        :disabled="isSyncing"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
      >
        {{ isSyncing ? '⏳ Syncing...' : '🔄 Sync with Lightspeed' }}
      </button>
      <div v-else class="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
        <p>📦 <strong>Lightspeed not connected.</strong> Go to <router-link to="/lightspeed" class="underline font-semibold">Lightspeed settings</router-link> to connect.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Loading...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Search & Filter -->
    <div class="mb-6 space-y-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by SKU or name..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div class="text-sm text-gray-600">
        Showing {{ filteredProducts.length }} of {{ products.length }} products
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="!isLoading && filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
      >
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ product.lightspeed_data?.name || 'N/A' }}</h3>
        <div class="space-y-2 text-sm text-gray-600">
          <p><strong>SKU:</strong> {{ product.lightspeed_data?.sku || '-' }}</p>
          <p><strong>Price:</strong> ${{ (product.price || 0).toFixed(2) }}</p>
          <p><strong>Cost:</strong> ${{ (product.cost || 0).toFixed(2) }}</p>
          <p><strong>Quantity:</strong> {{ product.quantity || 0 }}</p>
        </div>
        <div class="mt-4 pt-4 border-t text-xs text-gray-500">
          ID: {{ product.lightspeed_id }}
        </div>
      </div>
    </div>

    <div v-if="!isLoading && filteredProducts.length === 0 && products.length === 0" class="text-center py-8 bg-gray-50 rounded">
      <p class="text-gray-600">No products synced yet. Click "Sync with Lightspeed" to import inventory.</p>
    </div>

    <div v-if="!isLoading && filteredProducts.length === 0 && products.length > 0" class="text-center py-8 bg-gray-50 rounded">
      <p class="text-gray-600">No products match your search.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const products = ref([])
const isLoading = ref(false)
const isSyncing = ref(false)
const error = ref(null)
const searchQuery = ref('')

const canSync = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'editor'
})

const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const query = searchQuery.value.toLowerCase()
    const sku = p.lightspeed_data?.sku || ''
    const name = p.lightspeed_data?.name || ''
    return sku.toLowerCase().includes(query) || name.toLowerCase().includes(query)
  })
})

onMounted(fetchProducts)

async function fetchProducts() {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/lightspeed/products')
    products.value = response.data.data || response.data || []
  } catch (err) {
    error.value = 'Failed to load products'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function syncProducts() {
  isSyncing.value = true
  error.value = null
  try {
    await apiClient.post('/lightspeed/sync-products')
    await fetchProducts()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to sync products'
  } finally {
    isSyncing.value = false
  }
}
</script>
