<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="text-9xl font-bold text-white opacity-10 mb-4">404</div>
      <h1 class="text-4xl font-bold text-white mb-2">Tenant Not Found</h1>
      <p class="text-white mb-8 max-w-md">
        The tenant "{{ subdomain }}.autodealercloud.com" does not exist or is inactive.
      </p>
      <a href="https://dashboard.autodealercloud.com" class="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
        Go to Dashboard
      </a>
    </div>
  </div>
</template>

<script setup>
import { getCurrentSubdomain } from '@/utils/tenant'

const subdomain = getCurrentSubdomain()
</script>
