<template>
  <div class="pages-view">
    <header class="page-header">
      <div class="header-content">
        <h1>Pages</h1>
        <p class="subtitle">Create and manage your website pages</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <span>+</span> New Page
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading pages...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadPages" class="btn btn-primary">Retry</button>
    </div>

    <div v-else-if="pages.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h2>No pages yet</h2>
      <p>Create your first page to get started</p>
      <button class="btn btn-primary" @click="openCreateModal">Create Page</button>
    </div>

    <div v-else class="pages-list">
      <table class="pages-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>URL</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="page in pages" :key="page.id">
            <td class="title-cell">
              <div class="title-wrapper">
                <span class="page-title">{{ page.title }}</span>
                <span v-if="page.is_homepage" class="badge badge-primary">Homepage</span>
              </div>
            </td>
            <td>
              <span class="badge badge-secondary">{{ formatPageType(page.page_type) }}</span>
            </td>
            <td>
              <span class="status-badge" :class="page.status">
                {{ page.status }}
              </span>
            </td>
            <td class="url-cell">
              <code>/{{ page.slug }}</code>
            </td>
            <td class="date-cell">
              {{ formatDate(page.updated_at) }}
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <router-link
                  :to="`/admin/pages/${page.id}/edit`"
                  class="btn btn-sm btn-secondary"
                  title="Edit"
                >
                  ✏️
                </router-link>
                <button
                  class="btn btn-sm btn-secondary"
                  @click="duplicatePage(page)"
                  title="Duplicate"
                >
                  📋
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="confirmDelete(page)"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <header class="modal-header">
          <h2>{{ editingPage ? 'Edit Page' : 'Create New Page' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </header>

        <form @submit.prevent="savePage" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label for="title">Page Title *</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                placeholder="About Us"
              />
            </div>

            <div class="form-group">
              <label for="slug">URL Slug</label>
              <div class="slug-input">
                <span class="slug-prefix">/</span>
                <input
                  id="slug"
                  v-model="form.slug"
                  type="text"
                  placeholder="about-us"
                />
              </div>
              <p class="help-text">Leave empty to auto-generate from title</p>
            </div>

            <div class="form-group">
              <label for="page_type">Page Type</label>
              <select id="page_type" v-model="form.page_type">
                <option value="custom">Custom Page</option>
                <option value="home">Homepage</option>
                <option value="inventory">Inventory</option>
                <option value="product_detail">Product Detail Template</option>
                <option value="contact">Contact</option>
                <option value="about">About</option>
                <option value="services">Services</option>
                <option value="financing">Financing</option>
                <option value="sold_product">Sold Product Template</option>
              </select>
            </div>

            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" v-model="form.status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.is_homepage" />
                <span>Set as Homepage</span>
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.show_in_nav" />
                <span>Show in Navigation</span>
              </label>
            </div>
          </div>

          <div class="seo-section">
            <h3>SEO Settings</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="meta_title">
                  Meta Title
                  <span class="char-count">{{ form.meta_title?.length || 0 }}/70</span>
                </label>
                <input
                  id="meta_title"
                  v-model="form.meta_title"
                  type="text"
                  maxlength="70"
                  placeholder="Page Title | Your Business"
                />
              </div>

              <div class="form-group full-width">
                <label for="meta_description">
                  Meta Description
                  <span class="char-count">{{ form.meta_description?.length || 0 }}/160</span>
                </label>
                <textarea
                  id="meta_description"
                  v-model="form.meta_description"
                  rows="2"
                  maxlength="160"
                  placeholder="A brief description of this page..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (editingPage ? 'Update Page' : 'Create Page') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <header class="modal-header">
          <h2>Delete Page</h2>
          <button class="close-btn" @click="showDeleteModal = false">&times;</button>
        </header>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ pageToDelete?.title }}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="deletePage" :disabled="deleting">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref(null)
const pages = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingPage = ref(null)
const pageToDelete = ref(null)

const form = ref({
  title: '',
  slug: '',
  page_type: 'custom',
  status: 'draft',
  is_homepage: false,
  show_in_nav: true,
  meta_title: '',
  meta_description: '',
})

function resetForm() {
  form.value = {
    title: '',
    slug: '',
    page_type: 'custom',
    status: 'draft',
    is_homepage: false,
    show_in_nav: true,
    meta_title: '',
    meta_description: '',
  }
}

function openCreateModal() {
  editingPage.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(page) {
  editingPage.value = page
  form.value = {
    title: page.title,
    slug: page.slug,
    page_type: page.page_type,
    status: page.status,
    is_homepage: page.is_homepage,
    show_in_nav: page.show_in_nav,
    meta_title: page.meta_title || '',
    meta_description: page.meta_description || '',
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPage.value = null
  resetForm()
}

async function loadPages() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/pages')
    pages.value = response.data.data || []
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load pages'
    console.error('Error loading pages:', err)
  } finally {
    loading.value = false
  }
}

async function savePage() {
  saving.value = true
  try {
    if (editingPage.value) {
      await api.put(`/pages/${editingPage.value.id}`, form.value)
    } else {
      await api.post('/pages', form.value)
    }
    await loadPages()
    closeModal()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save page')
    console.error('Error saving page:', err)
  } finally {
    saving.value = false
  }
}

async function duplicatePage(page) {
  try {
    await api.post(`/pages/${page.id}/duplicate`)
    await loadPages()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to duplicate page')
    console.error('Error duplicating page:', err)
  }
}

function confirmDelete(page) {
  pageToDelete.value = page
  showDeleteModal.value = true
}

async function deletePage() {
  if (!pageToDelete.value) return
  
  deleting.value = true
  try {
    await api.delete(`/pages/${pageToDelete.value.id}`)
    await loadPages()
    showDeleteModal.value = false
    pageToDelete.value = null
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete page')
    console.error('Error deleting page:', err)
  } finally {
    deleting.value = false
  }
}

function formatPageType(type) {
  const types = {
    custom: 'Custom',
    home: 'Homepage',
    inventory: 'Inventory',
    product_detail: 'Product Detail',
    contact: 'Contact',
    about: 'About',
    services: 'Services',
    financing: 'Financing',
    sold_product: 'Sold Product',
  }
  return types[type] || type
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  loadPages()
})
</script>

<style scoped>
.pages-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-content .subtitle {
  color: #6B7280;
  margin-top: 0.25rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6B7280;
  margin-bottom: 1.5rem;
}

/* Table */
.pages-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pages-table th,
.pages-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.pages-table th {
  background: #F9FAFB;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6B7280;
}

.pages-table tr:last-child td {
  border-bottom: none;
}

.pages-table tr:hover {
  background: #F9FAFB;
}

.title-cell .title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-title {
  font-weight: 500;
}

.url-cell code {
  background: #F3F4F6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
}

.date-cell {
  color: #6B7280;
  font-size: 0.875rem;
}

.actions-cell {
  width: 140px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary {
  background: #EFF6FF;
  color: #2563EB;
}

.badge-secondary {
  background: #F3F4F6;
  color: #4B5563;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.draft {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.published {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.archived {
  background: #E5E7EB;
  color: #4B5563;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #2563EB;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1D4ED8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border-color: #D1D5DB;
}

.btn-secondary:hover {
  background: #F9FAFB;
}

.btn-danger {
  background: #fff;
  color: #DC2626;
  border-color: #DC2626;
}

.btn-danger:hover {
  background: #FEF2F2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #fff;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6B7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.slug-input {
  display: flex;
  align-items: center;
}

.slug-prefix {
  padding: 0.625rem 0.75rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem;
  color: #6B7280;
}

.slug-input input {
  border-radius: 0 0.375rem 0.375rem 0;
  flex: 1;
}

.help-text {
  font-size: 0.75rem;
  color: #6B7280;
}

.char-count {
  font-weight: 400;
  font-size: 0.75rem;
  color: #9CA3AF;
}

.checkbox-group {
  flex-direction: row !important;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

.seo-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.seo-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.warning-text {
  color: #DC2626;
  font-size: 0.875rem;
}
</style>
