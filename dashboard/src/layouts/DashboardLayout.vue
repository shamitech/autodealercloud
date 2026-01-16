<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="p-6 border-b border-gray-700">
        <h1 class="text-2xl font-bold">AutoDealer</h1>
        <p class="text-sm text-gray-300">Admin Dashboard</p>
        <p class="text-xs text-gray-400 mt-2">{{ authStore.user?.name }}</p>
      </div>
      
      <nav class="flex-1 p-4 space-y-2">
        <!-- Platform Admin Section -->
        <template v-if="authStore.isPlatformAdmin">
          <div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Platform</div>
          <router-link
            to="/admin/platform"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'PlatformDashboard' }"
          >
            📊 Platform Dashboard
          </router-link>
          <router-link
            to="/admin/tenants"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'Tenants' }"
          >
            🏢 Manage Tenants
          </router-link>
          <router-link
            to="/admin/users"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'Users' }"
          >
            👥 Platform Users
          </router-link>
          <router-link
            to="/admin/domains"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'Domains' }"
          >
            🌐 Domains
          </router-link>
          <div class="border-t border-gray-700 my-2"></div>
        </template>

        <!-- Dealer/Tenant Section -->
        <template v-if="authStore.isDealerAdmin">
          <div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Management</div>
        </template>

        <router-link
          to="/admin/dashboard"
          class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          :class="{ 'bg-gray-700': route.name === 'Dashboard' }"
        >
          📊 Dashboard
        </router-link>
        
        <!-- Products - Only for tenant users, not platform admins -->
        <router-link
          v-if="!authStore.isPlatformAdmin"
          to="/admin/products"
          class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          :class="{ 'bg-gray-700': route.name === 'Products' }"
        >
          📦 Products
        </router-link>
        
        <!-- Lightspeed - Only for tenant users -->
        <router-link
          v-if="!authStore.isPlatformAdmin && (authStore.user?.role === 'admin' || authStore.user?.role === 'editor')"
          to="/admin/lightspeed"
          class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          :class="{ 'bg-gray-700': route.name === 'Lightspeed' }"
        >
          ⚡ Lightspeed
        </router-link>

        <!-- Custom Domain - Only for tenant users -->
        <router-link
          v-if="!authStore.isPlatformAdmin"
          to="/admin/tenant-domains"
          class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          :class="{ 'bg-gray-700': route.name === 'TenantDomains' }"
        >
          🌐 Custom Domain
        </router-link>

        <!-- Website Builder Section - Only for tenant users -->
        <template v-if="!authStore.isPlatformAdmin && (authStore.user?.role === 'admin' || authStore.user?.role === 'editor')">
          <div class="border-t border-gray-700 my-2"></div>
          <div class="px-4 py-2 text-xs font-bold text-gray-400 uppercase">Website Builder</div>
          
          <router-link
            to="/admin/site-settings"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'SiteSettings' }"
          >
            🎨 Site Settings
          </router-link>
          
          <router-link
            to="/admin/pages"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'Pages' || route.name === 'PageEditor' }"
          >
            📄 Pages
          </router-link>
          
          <router-link
            to="/admin/navigation"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'Navigation' }"
          >
            🔗 Navigation
          </router-link>
          
          <router-link
            to="/admin/product-settings"
            class="block px-4 py-2 rounded hover:bg-gray-800 transition"
            :class="{ 'bg-gray-700': route.name === 'ProductSettings' }"
          >
            🏷️ Product Display
          </router-link>
        </template>
      </nav>

      <!-- Bottom Section -->
      <div class="p-4 border-t border-gray-700 space-y-2">
        <router-link
          to="/admin/profile"
          class="block px-4 py-2 rounded hover:bg-gray-800 transition"
          :class="{ 'bg-gray-700': route.name === 'Profile' }"
        >
          ⚙️ Profile
        </router-link>

        <router-link
          to="/"
          class="block px-4 py-2 rounded hover:bg-gray-800 transition text-sm text-gray-300"
        >
          👁️ View Store
        </router-link>
        
        <button
          @click="handleLogout"
          class="w-full px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">
          {{ route.meta.title || route.name }}
        </h2>
        <div class="text-sm text-gray-600">
          Role: <span class="font-semibold">{{ authStore.user?.role }}</span>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Tailwind will handle styling */
</style>
