<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Domains</h1>
      <button
        @click="showCreateForm = true"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
      >
        + Add Domain
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Loading...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Create Form -->
    <div v-if="showCreateForm" class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Add Custom Domain</h2>
      <form @submit.prevent="addDomain" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
          <input
            v-model="newDomain.domain"
            type="text"
            placeholder="example.com"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <strong>DNS Configuration Required:</strong> Point your domain's DNS records to our nameservers or add a CNAME record.
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="isCreating"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
          >
            {{ isCreating ? 'Adding...' : 'Add Domain' }}
          </button>
          <button
            type="button"
            @click="showCreateForm = false"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Domains Table -->
    <div v-if="!isLoading && domains.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Domain</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Verified At</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="domain in domains" :key="domain.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ domain.domain }}</td>
            <td class="px-6 py-4">
              <span
                :class="domain.verified_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                class="px-2 py-1 rounded text-sm font-semibold"
              >
                {{ domain.verified_at ? '✓ Verified' : '⏳ Pending' }}
              </span>
            </td>
            <td class="px-6 py-4">{{ domain.verified_at ? formatDate(domain.verified_at) : '-' }}</td>
            <td class="px-6 py-4 space-x-2">
              <button
                v-if="!domain.verified_at"
                @click="verifyDomain(domain.id)"
                class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                Verify
              </button>
              <button
                @click="deleteDomain(domain.id)"
                class="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading && domains.length === 0" class="text-center py-8 bg-gray-50 rounded">
      <p class="text-gray-600">No custom domains yet</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

const domains = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const error = ref(null)
const showCreateForm = ref(false)
const newDomain = ref({ domain: '' })

onMounted(fetchDomains)

async function fetchDomains() {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/domains')
    domains.value = response.data.data || response.data || []
  } catch (err) {
    error.value = 'Failed to load domains'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function addDomain() {
  isCreating.value = true
  error.value = null
  try {
    await apiClient.post('/domains', newDomain.value)
    newDomain.value = { domain: '' }
    showCreateForm.value = false
    await fetchDomains()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to add domain'
  } finally {
    isCreating.value = false
  }
}

async function verifyDomain(domainId) {
  try {
    await apiClient.post(`/domains/${domainId}/verify`)
    await fetchDomains()
  } catch (err) {
    error.value = 'Failed to verify domain'
  }
}

async function deleteDomain(domainId) {
  if (!confirm('Are you sure?')) return
  try {
    await apiClient.delete(`/domains/${domainId}`)
    await fetchDomains()
  } catch (err) {
    error.value = 'Failed to delete domain'
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}
</script>
