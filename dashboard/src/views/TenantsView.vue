<template>
  <div class="tenants-view">
    <div class="view-header">
      <h1>Manage Tenants</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">
        + Create New Tenant
      </button>
    </div>

    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search tenants..."
        class="search-input"
      />
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>

    <div class="tenants-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Plan</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in filteredTenants" :key="tenant.id">
            <td>
              <strong>{{ tenant.name }}</strong>
              <br />
              <small>{{ tenant.email }}</small>
            </td>
            <td>
              <code>{{ tenant.subdomain }}.autodealercloud.com</code>
            </td>
            <td>
              <span :class="['status-badge', `status-${tenant.status}`]">
                {{ tenant.status }}
              </span>
            </td>
            <td>{{ tenant.plan }}</td>
            <td>{{ formatDate(tenant.created_at) }}</td>
            <td class="actions">
              <button class="btn-small btn-info" @click="editTenant(tenant)">
                Edit
              </button>
              <button class="btn-small btn-danger" @click="deleteTenant(tenant.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal" @click.stop>
        <h2>{{ editingTenant ? 'Edit Tenant' : 'Create New Tenant' }}</h2>
        <form @submit.prevent="saveTenant">
          <div class="form-group">
            <label>Business Name</label>
            <input v-model="formData.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="formData.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Subdomain</label>
            <input v-model="formData.subdomain" type="text" required />
          </div>
          <div class="form-group">
            <label>Plan</label>
            <select v-model="formData.plan" required>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingTenant ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '@/api/client'

const tenants = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const showCreateModal = ref(false)
const editingTenant = ref(null)

const formData = ref({
  name: '',
  email: '',
  subdomain: '',
  plan: 'starter',
})

const filteredTenants = computed(() => {
  return tenants.value.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !filterStatus.value || tenant.status === filterStatus.value

    return matchesSearch && matchesStatus
  })
})

onMounted(async () => {
  await fetchTenants()
})

const fetchTenants = async () => {
  try {
    const response = await apiClient.get('/platform/tenants')
    tenants.value = response.data.data || response.data
  } catch (err) {
    console.error('Error fetching tenants:', err)
    // Optional: show error message to user
  }
}

const editTenant = (tenant) => {
  editingTenant.value = tenant
  formData.value = { ...tenant }
  showCreateModal.value = true
}

const saveTenant = async () => {
  try {
    if (editingTenant.value) {
      await apiClient.put(`/platform/tenants/${editingTenant.value.id}`, formData.value)
    } else {
      await apiClient.post('/platform/tenants', formData.value)
    }
    showCreateModal.value = false
    editingTenant.value = null
    formData.value = { name: '', email: '', subdomain: '', plan: 'starter' }
    await fetchTenants() // Refresh list
  } catch (err) {
    console.error('Error saving tenant:', err)
    const errorMessage = err.response?.data?.errors 
      ? Object.values(err.response.data.errors).flat().join(', ')
      : err.response?.data?.message || 'Error saving tenant'
    alert(errorMessage)
  }
}

const deleteTenant = async (id) => {
  if (confirm('Are you sure you want to delete this tenant?')) {
    try {
      await apiClient.delete(`/platform/tenants/${id}`)
      await fetchTenants() // Refresh list
    } catch (err) {
      console.error('Error deleting tenant:', err)
      alert(err.response?.data?.message || 'Error deleting tenant')
    }
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.tenants-view {
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.view-header h1 {
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
}

.tenants-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f9f9f9;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #eee;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

tr:hover {
  background: #fafafa;
}

code {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

small {
  color: #999;
  display: block;
  margin-top: 0.25rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-pending {
  background: #fff3e0;
  color: #e65100;
}

.status-suspended {
  background: #ffebee;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-info {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-info:hover {
  background: #1976d2;
  color: white;
}

.btn-danger {
  background: #ffebee;
  color: #c62828;
}

.btn-danger:hover {
  background: #c62828;
  color: white;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}
</style>
