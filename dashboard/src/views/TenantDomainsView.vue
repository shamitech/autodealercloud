<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Custom Domain</h1>
      <p class="text-gray-600 mt-2">Connect your own domain to your published website</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Loading your domains...</p>
    </div>

    <!-- Error -->
    <div v-if="error && !isLoading" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Your Current Domain</h2>
      <div class="bg-gray-50 rounded p-4 mb-4">
        <p class="text-sm text-gray-600 mb-2">Default subdomain:</p>
        <p class="text-2xl font-mono font-bold text-blue-600">{{ currentSubdomain }}.autodealercloud.com</p>
      </div>
      <p class="text-gray-700">
        Your website is currently published at this default subdomain. You can add your own custom domain below.
      </p>
    </div>

    <!-- Add Custom Domain Form -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Add Custom Domain</h2>
      
      <form @submit.prevent="addCustomDomain" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Your Domain</label>
          <input
            v-model="newDomain"
            type="text"
            placeholder="example.com"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-sm text-gray-500 mt-1">Enter your domain name without www or http://</p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
        >
          {{ isSubmitting ? 'Adding...' : 'Add Custom Domain' }}
        </button>
      </form>
    </div>

    <!-- DNS Configuration Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold text-blue-900 mb-4">📋 DNS Configuration Instructions</h2>
      
      <div class="space-y-4">
        <div>
          <h3 class="font-semibold text-blue-900 mb-2">Step 1: Access Your Domain Provider</h3>
          <p class="text-blue-800 text-sm">
            Log in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
          </p>
        </div>

        <div>
          <h3 class="font-semibold text-blue-900 mb-2">Step 2: Add a CNAME Record</h3>
          <p class="text-blue-800 text-sm mb-3">Look for DNS settings or DNS records and add a new CNAME record with these values:</p>
          
          <div class="bg-white rounded p-4 font-mono text-sm space-y-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">Name/Host:</span>
              <span class="font-bold text-gray-800 flex-1">www</span>
              <button
                @click="copyToClipboard('www')"
                class="text-blue-600 hover:text-blue-800 text-xs"
              >
                📋 Copy
              </button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">Points to:</span>
              <span class="font-bold text-gray-800 flex-1 break-all">{{ currentSubdomain }}.autodealercloud.com</span>
              <button
                @click="copyToClipboard(currentSubdomain + '.autodealercloud.com')"
                class="text-blue-600 hover:text-blue-800 text-xs"
              >
                📋 Copy
              </button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500 w-24">Type:</span>
              <span class="font-bold text-gray-800">CNAME</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-semibold text-blue-900 mb-2">Step 3: Wait for Propagation</h3>
          <p class="text-blue-800 text-sm">
            DNS changes can take 24-48 hours to propagate globally. Your domain should then point to your published website.
          </p>
        </div>

        <div>
          <h3 class="font-semibold text-blue-900 mb-2">⚠️ Alternative: Apex Domain (example.com)</h3>
          <p class="text-blue-800 text-sm">
            Some domain providers require an ALIAS or ANAME record for apex domains (without www). 
            Check your registrar's documentation if you want to use example.com instead of www.example.com.
          </p>
        </div>
      </div>
    </div>

    <!-- Custom Domains List -->
    <div v-if="customDomains.length > 0" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Your Custom Domains</h2>
      
      <div class="space-y-3">
        <div v-for="domain in customDomains" :key="domain.id" class="flex items-center justify-between bg-gray-50 p-4 rounded">
          <div>
            <p class="font-medium text-gray-800">{{ domain.domain }}</p>
            <p class="text-sm text-gray-500">
              Added {{ formatDate(domain.created_at) }}
            </p>
          </div>
          <button
            @click="removeCustomDomain(domain.id)"
            class="text-red-600 hover:text-red-800 text-sm font-semibold"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentSubdomain } from '@/utils/tenant'
import apiClient from '@/api/client'

const currentSubdomain = ref('')
const newDomain = ref('')
const customDomains = ref([])
const isSubmitting = ref(false)
const isLoading = ref(false)
const error = ref(null)

onMounted(() => {
  currentSubdomain.value = getCurrentSubdomain()
  fetchCustomDomains()
})

async function fetchCustomDomains() {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/domains')
    // Filter out the default subdomain from the list
    customDomains.value = (response.data.data || response.data || []).filter(
      domain => domain.domain !== `${currentSubdomain.value}.autodealercloud.com`
    )
  } catch (err) {
    error.value = 'Failed to load custom domains'
    console.error(err)
    customDomains.value = []
  } finally {
    isLoading.value = false
  }
}

async function addCustomDomain() {
  if (!newDomain.value.trim()) {
    error.value = 'Please enter a domain name'
    return
  }

  isSubmitting.value = true
  error.value = null
  try {
    await apiClient.post('/domains', { domain: newDomain.value.trim() })
    newDomain.value = ''
    await fetchCustomDomains()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add domain'
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

async function removeCustomDomain(domainId) {
  if (!confirm('Remove this custom domain?')) return
  try {
    await apiClient.delete(`/domains/${domainId}`)
    await fetchCustomDomains()
  } catch (err) {
    error.value = 'Failed to remove domain'
    console.error(err)
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Copied to clipboard!')
    })
    .catch(err => console.error('Failed to copy:', err))
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}
</script>
