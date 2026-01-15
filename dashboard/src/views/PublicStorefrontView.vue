<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="text-2xl font-bold text-gray-800">{{ tenantName }}</div>
        <router-link
          to="/admin/dashboard"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Admin Dashboard
        </router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Welcome to {{ tenantName }}</h1>
        <p class="text-xl text-blue-100">Discover our premium vehicles and services</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">Loading inventory...</p>
      </div>

      <!-- Products Grid -->
      <div v-if="!isLoading && products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in products"
          :key="product.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
        >
          <!-- Product Image -->
          <div class="bg-gray-200 h-48 flex items-center justify-center">
            <span class="text-gray-400">🚗 Product Image</span>
          </div>

          <!-- Product Info -->
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>
            
            <div class="flex justify-between items-center">
              <span class="text-2xl font-bold text-blue-600">${{ product.price }}</span>
              <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && products.length === 0" class="text-center py-12">
        <p class="text-gray-600 text-lg">No products available yet</p>
        <p class="text-gray-500">Check back soon for our inventory!</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 class="font-semibold mb-4">About Us</h4>
            <p class="text-gray-400">{{ tenantName }} - Your trusted automotive partner</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Contact</h4>
            <p class="text-gray-400">Phone: (555) 000-0000</p>
            <p class="text-gray-400">Email: info@example.com</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Hours</h4>
            <p class="text-gray-400">Mon - Fri: 9AM - 6PM</p>
            <p class="text-gray-400">Sat: 10AM - 4PM</p>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} {{ tenantName }}. All rights reserved.</p>
          <p class="text-sm mt-2">Powered by <span class="font-semibold">AutoDealerCloud</span></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentSubdomain } from '@/utils/tenant'
import apiClient from '@/api/client'

const tenantName = ref('Dealership')
const products = ref([])
const isLoading = ref(false)

onMounted(async () => {
  const subdomain = getCurrentSubdomain()
  if (subdomain) {
    tenantName.value = subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
  }
  
  await fetchProducts()
})

async function fetchProducts() {
  isLoading.value = true
  try {
    const response = await apiClient.get('/products')
    products.value = response.data.data || response.data || []
  } catch (err) {
    console.error('Failed to fetch products:', err)
    products.value = []
  } finally {
    isLoading.value = false
  }
}
</script>
