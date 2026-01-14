<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Users</h1>
      <button
        @click="showCreateForm = true"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
      >
        + Add User
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
      <h2 class="text-xl font-semibold mb-4">Create New User</h2>
      <form @submit.prevent="createUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              v-model="newUser.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              v-model="newUser.role"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="newUser.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            :disabled="isCreating"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition"
          >
            {{ isCreating ? 'Creating...' : 'Create' }}
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

    <!-- Users Table -->
    <div v-if="!isLoading && users.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">{{ user.name }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
              <span :class="getRoleClass(user.role)" class="px-2 py-1 rounded text-sm font-semibold">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4">{{ user.phone || '-' }}</td>
            <td class="px-6 py-4">
              <button
                @click="deleteUser(user.id)"
                class="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!isLoading && users.length === 0" class="text-center py-8 bg-gray-50 rounded">
      <p class="text-gray-600">No users found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

const users = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const error = ref(null)
const showCreateForm = ref(false)
const newUser = ref({
  name: '',
  email: '',
  role: 'member',
  phone: '',
})

onMounted(fetchUsers)

async function fetchUsers() {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiClient.get('/users')
    users.value = response.data.data || response.data || []
  } catch (err) {
    error.value = 'Failed to load users'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function createUser() {
  isCreating.value = true
  error.value = null
  try {
    await apiClient.post('/users', newUser.value)
    newUser.value = { name: '', email: '', role: 'member', phone: '' }
    showCreateForm.value = false
    await fetchUsers()
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create user'
  } finally {
    isCreating.value = false
  }
}

async function deleteUser(userId) {
  if (!confirm('Are you sure?')) return
  try {
    await apiClient.delete(`/users/${userId}`)
    await fetchUsers()
  } catch (err) {
    error.value = 'Failed to delete user'
  }
}

function getRoleClass(role) {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    editor: 'bg-blue-100 text-blue-800',
    viewer: 'bg-yellow-100 text-yellow-800',
    member: 'bg-gray-100 text-gray-800',
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}
</script>
