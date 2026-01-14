<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-600">Loading...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ successMessage }}
    </div>

    <!-- Profile Form -->
    <div v-if="!isLoading" class="bg-white rounded-lg shadow p-6 max-w-2xl">
      <form @submit.prevent="updateProfile" class="space-y-6">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Email (Read-only) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            :value="form.email"
            type="email"
            disabled
            class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            v-model="form.bio"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Role (Read-only) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div class="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
            {{ form.role }}
          </div>
          <p class="text-xs text-gray-500 mt-1">Contact an administrator to change your role</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isUpdating"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
        >
          {{ isUpdating ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>

    <!-- Account Info Section -->
    <div class="bg-white rounded-lg shadow p-6 max-w-2xl mt-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-600">User ID</p>
          <p class="font-semibold">{{ authStore.user?.id }}</p>
        </div>
        <div>
          <p class="text-gray-600">Role</p>
          <p class="font-semibold">{{ authStore.user?.role }}</p>
        </div>
        <div>
          <p class="text-gray-600">Created At</p>
          <p class="font-semibold">{{ formatDate(authStore.user?.created_at) }}</p>
        </div>
        <div>
          <p class="text-gray-600">Account Status</p>
          <p class="font-semibold">{{ authStore.user?.is_active ? '✓ Active' : '✗ Inactive' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'

const authStore = useAuthStore()
const isLoading = ref(false)
const isUpdating = ref(false)
const error = ref(null)
const successMessage = ref(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  bio: '',
  role: '',
})

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name || ''
    form.email = authStore.user.email || ''
    form.phone = authStore.user.phone || ''
    form.bio = authStore.user.bio || ''
    form.role = authStore.user.role || ''
  }
})

async function updateProfile() {
  isUpdating.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await apiClient.put('/users/' + authStore.user.id, {
      name: form.name,
      phone: form.phone,
      bio: form.bio,
    })

    // Update auth store with new user data
    authStore.user = response.data.data || response.data
    successMessage.value = 'Profile updated successfully!'

    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to update profile'
  } finally {
    isUpdating.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}
</script>
