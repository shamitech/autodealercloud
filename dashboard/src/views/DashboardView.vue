<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-blue-600">{{ stats.products }}</div>
        <p class="text-gray-600">Products</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-green-600">{{ stats.domains }}</div>
        <p class="text-gray-600">Domains</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-purple-600">{{ stats.users }}</div>
        <p class="text-gray-600">Users</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-yellow-600">{{ stats.status }}</div>
        <p class="text-gray-600">Status</p>
      </div>
    </div>

    <!-- User Info -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Account</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-gray-600 text-sm">Name</p>
          <p class="font-semibold">{{ authStore.user?.name }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Email</p>
          <p class="font-semibold">{{ authStore.user?.email }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Role</p>
          <p class="font-semibold">{{ authStore.user?.role }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Phone</p>
          <p class="font-semibold">{{ authStore.user?.phone || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Permissions -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Permissions</h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="permission in authStore.permissions"
          :key="permission"
          class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
        >
          {{ permission }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const stats = ref({
  products: 0,
  domains: 0,
  users: 0,
  status: 'Active',
})

onMounted(async () => {
  try {
    const [productsRes, domainsRes] = await Promise.all([
      apiClient.get('/lightspeed/products'),
      apiClient.get('/domains'),
    ])

    stats.value.products = productsRes.data.data?.length || 0
    stats.value.domains = domainsRes.data.data?.length || 0
    stats.value.users = authStore.permissions?.length || 0
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
})
</script>
