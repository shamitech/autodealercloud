<template>
  <div class="navigation-view">
    <header class="page-header">
      <h1>Navigation</h1>
      <p class="subtitle">Manage your header and footer navigation menus</p>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading navigation...</p>
    </div>

    <div v-else class="navigation-content">
      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Navigation Editor -->
      <div class="nav-editor">
        <div class="nav-items-panel">
          <div class="panel-header">
            <h2>{{ activeTab === 'header' ? 'Header' : 'Footer' }} Menu Items</h2>
            <button class="btn btn-primary btn-sm" @click="addItem">
              + Add Item
            </button>
          </div>

          <div v-if="currentItems.length === 0" class="empty-nav">
            <p>No menu items yet. Add your first item to get started.</p>
          </div>

          <draggable
            v-else
            v-model="currentItems"
            item-key="tempId"
            handle=".drag-handle"
            ghost-class="ghost"
            @end="onDragEnd"
            class="nav-items-list"
          >
            <template #item="{ element, index }">
              <div class="nav-item" :class="{ expanded: expandedItem === element.tempId }">
                <div class="nav-item-header">
                  <span class="drag-handle">⋮⋮</span>
                  <span class="item-label">{{ element.label }}</span>
                  <span class="item-type">{{ formatLinkType(element.link_type) }}</span>
                  <div class="item-actions">
                    <button
                      class="action-btn"
                      @click="toggleExpand(element.tempId)"
                      :title="expandedItem === element.tempId ? 'Collapse' : 'Edit'"
                    >
                      {{ expandedItem === element.tempId ? '▲' : '▼' }}
                    </button>
                    <button
                      class="action-btn delete"
                      @click="removeItem(index)"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Expanded Edit Form -->
                <div v-if="expandedItem === element.tempId" class="nav-item-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label>Label</label>
                      <input v-model="element.label" type="text" placeholder="Menu item label" />
                    </div>

                    <div class="form-group">
                      <label>Link Type</label>
                      <select v-model="element.link_type" @change="onLinkTypeChange(element)">
                        <option value="url">External URL</option>
                        <option value="page">Internal Page</option>
                        <option value="inventory">Inventory Page</option>
                        <option value="dropdown">Dropdown Menu</option>
                        <option value="anchor">Anchor Link</option>
                      </select>
                    </div>

                    <div v-if="element.link_type === 'url'" class="form-group full-width">
                      <label>URL</label>
                      <input v-model="element.url" type="url" placeholder="https://example.com" />
                    </div>

                    <div v-if="element.link_type === 'page'" class="form-group full-width">
                      <label>Page</label>
                      <select v-model="element.page_id">
                        <option value="">-- Select Page --</option>
                        <option v-for="page in pages" :key="page.id" :value="page.id">
                          {{ page.title }}
                        </option>
                      </select>
                    </div>

                    <div v-if="element.link_type === 'inventory'" class="form-group full-width">
                      <label>Category Filter (optional)</label>
                      <input v-model="element.inventory_filters.category" type="text" placeholder="e.g. SUV, Sedan" />
                    </div>

                    <div v-if="element.link_type === 'anchor'" class="form-group full-width">
                      <label>Anchor ID</label>
                      <div class="anchor-input">
                        <span>#</span>
                        <input v-model="element.url" type="text" placeholder="section-id" />
                      </div>
                    </div>

                    <div class="form-group checkbox-group">
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="element.open_in_new_tab" />
                        <span>Open in new tab</span>
                      </label>
                    </div>

                    <div class="form-group checkbox-group">
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="element.is_highlighted" />
                        <span>Highlight (CTA style)</span>
                      </label>
                    </div>
                  </div>

                  <!-- Dropdown Children -->
                  <div v-if="element.link_type === 'dropdown'" class="dropdown-children">
                    <h4>Dropdown Items</h4>
                    <div v-if="!element.children || element.children.length === 0" class="empty-dropdown">
                      <p>No dropdown items yet.</p>
                    </div>
                    <div v-else class="dropdown-items">
                      <div v-for="(child, childIndex) in element.children" :key="childIndex" class="dropdown-item">
                        <input v-model="child.label" type="text" placeholder="Label" />
                        <input v-model="child.url" type="text" placeholder="URL" />
                        <button class="action-btn delete" @click="removeChild(element, childIndex)">×</button>
                      </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" @click="addChild(element)">
                      + Add Dropdown Item
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Preview Panel -->
        <div class="preview-panel">
          <h2>Preview</h2>
          <div class="preview-container">
            <div v-if="activeTab === 'header'" class="header-preview">
              <div class="preview-logo">Your Logo</div>
              <nav class="preview-nav">
                <template v-for="item in currentItems" :key="item.id">
                  <div v-if="item.link_type === 'dropdown'" class="preview-dropdown">
                    <span class="preview-link">{{ item.label }} ▼</span>
                    <div class="preview-dropdown-menu">
                      <a v-for="(child, idx) in item.children" :key="idx" href="#">
                        {{ child.label }}
                      </a>
                    </div>
                  </div>
                  <a
                    v-else
                    href="#"
                    class="preview-link"
                    :class="{ highlighted: item.is_highlighted }"
                  >
                    {{ item.label }}
                  </a>
                </template>
              </nav>
            </div>

            <div v-else class="footer-preview">
              <div class="footer-links">
                <a
                  v-for="item in currentItems"
                  :key="item.id"
                  href="#"
                  class="footer-link"
                >
                  {{ item.label }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveNavigation" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Navigation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import api from '../api/client'

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('header')
const expandedItem = ref(null)
const headerItems = ref([])
const footerItems = ref([])
const pages = ref([])

const tabs = [
  { id: 'header', label: 'Header Menu', icon: '🔝' },
  { id: 'footer', label: 'Footer Menu', icon: '🔽' },
]

const currentItems = computed({
  get() {
    return activeTab.value === 'header' ? headerItems.value : footerItems.value
  },
  set(val) {
    if (activeTab.value === 'header') {
      headerItems.value = val
    } else {
      footerItems.value = val
    }
  },
})

function generateId() {
  return 'nav-' + Math.random().toString(36).substr(2, 9)
}

function addItem() {
  const newItem = {
    tempId: generateId(), // For React key only, not sent to backend
    label: 'New Item',
    link_type: 'url',
    url: '',
    page_id: '',
    inventory_filters: {},
    is_visible: true,
    open_in_new_tab: false,
    is_highlighted: false,
    children: [],
  }
  currentItems.value.push(newItem)
  expandedItem.value = newItem.tempId
}

function removeItem(index) {
  if (confirm('Are you sure you want to remove this menu item?')) {
    currentItems.value.splice(index, 1)
  }
}

function toggleExpand(id) {
  expandedItem.value = expandedItem.value === id ? null : id
}

function onLinkTypeChange(item) {
  // Reset fields based on link type
  if (item.link_type !== 'dropdown') {
    item.children = []
  }
  if (item.link_type !== 'page') {
    item.page_id = ''
  }
  if (item.link_type !== 'inventory') {
    item.inventory_filters = {}
  } else {
    item.inventory_filters = { category: '' }
  }
}

function addChild(parent) {
  if (!parent.children) parent.children = []
  parent.children.push({
    label: 'Dropdown Item',
    link_type: 'url',
    url: '',
  })
}

function removeChild(parent, index) {
  parent.children.splice(index, 1)
}

function onDragEnd() {
  // Items are already updated via v-model
}

function formatLinkType(type) {
  const types = {
    url: 'URL',
    page: 'Page',
    inventory: 'Inventory',
    dropdown: 'Dropdown',
    anchor: 'Anchor',
  }
  return types[type] || type
}

async function loadNavigation() {
  loading.value = true
  try {
    const [navRes, pagesRes] = await Promise.all([
      api.get('/navigation'),
      api.get('/pages'),
    ])

    const items = navRes.data.data || []
    headerItems.value = items
      .filter(i => i.location === 'header')
      .map(i => ({
        ...i,
        tempId: i.id || generateId(), // Add tempId for Vue key
        children: i.children || [],
        inventory_filters: i.inventory_filters || {},
        is_visible: i.is_visible ?? true,
        open_in_new_tab: i.open_in_new_tab ?? false,
        is_highlighted: i.is_highlighted ?? false,
        highlight_color: i.highlight_color || null,
      }))
    footerItems.value = items
      .filter(i => i.location === 'footer')
      .map(i => ({
        ...i,
        tempId: i.id || generateId(), // Add tempId for Vue key
        children: i.children || [],
        inventory_filters: i.inventory_filters || {},
        is_visible: i.is_visible ?? true,
        open_in_new_tab: i.open_in_new_tab ?? false,
        is_highlighted: i.is_highlighted ?? false,
        highlight_color: i.highlight_color || null,
      }))
    pages.value = pagesRes.data.data || []
  } catch (err) {
    console.error('Error loading navigation:', err)
    alert('Failed to load navigation')
  } finally {
    loading.value = false
  }
}

async function saveNavigation() {
  saving.value = true
  try {
    const headerPayload = {
      location: 'header',
      items: headerItems.value.map((item, index) => ({
        label: item.label,
        link_type: item.link_type,
        page_id: item.page_id || null,
        url: item.url || null,
        inventory_filters: item.inventory_filters || null,
        order: index,
        is_visible: item.is_visible ?? true,
        open_in_new_tab: item.open_in_new_tab ?? false,
        is_highlighted: item.is_highlighted ?? false,
        highlight_color: item.highlight_color || null,
        children: item.children || [],
      })),
    }
    
    const footerPayload = {
      location: 'footer',
      items: footerItems.value.map((item, index) => ({
        label: item.label,
        link_type: item.link_type,
        page_id: item.page_id || null,
        url: item.url || null,
        inventory_filters: item.inventory_filters || null,
        order: index,
        is_visible: item.is_visible ?? true,
        open_in_new_tab: item.open_in_new_tab ?? false,
        is_highlighted: item.is_highlighted ?? false,
        highlight_color: item.highlight_color || null,
        children: item.children || [],
      })),
    }
    
    console.log('Sending header payload:', headerPayload)
    console.log('Sending footer payload:', footerPayload)
    console.log('Header items count:', headerItems.value.length)
    console.log('Footer items count:', footerItems.value.length)
    console.log('Full header items:', JSON.stringify(headerItems.value, null, 2))
    console.log('Full footer items:', JSON.stringify(footerItems.value, null, 2))
    
    // Save header navigation
    await api.post('/navigation/bulk-save', headerPayload)

    // Save footer navigation
    await api.post('/navigation/bulk-save', footerPayload)

    alert('Navigation saved successfully!')
  } catch (err) {
    console.error('Error saving navigation:', err)
    console.error('Response status:', err.response?.status)
    console.error('Full response:', err.response)
    console.error('Response data:', err.response?.data)
    console.log('Response data JSON:', JSON.stringify(err.response?.data, null, 2))
    
    // Extract validation errors
    let errorMessage = 'Failed to save navigation'
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors
      console.log('Extracted errors object:', errors)
      const errorList = Object.entries(errors)
        .map(([key, messages]) => `${key}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('\n')
      errorMessage = `Validation errors:\n${errorList}`
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    }
    
    alert(errorMessage)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadNavigation()
})
</script>

<style scoped>
.navigation-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.page-header .subtitle {
  color: #6B7280;
  margin: 0 0 2rem 0;
}

.loading-state {
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

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #F9FAFB;
}

.tab-btn.active {
  background: #2563EB;
  color: #fff;
  border-color: #2563EB;
}

.nav-editor {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
}

.nav-items-panel {
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E5E7EB;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.empty-nav {
  padding: 2rem;
  text-align: center;
  color: #6B7280;
}

.nav-items-list {
  padding: 0.5rem;
}

.nav-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.nav-item.expanded {
  border-color: #2563EB;
}

.nav-item.ghost {
  opacity: 0.5;
  background: #DBEAFE;
}

.nav-item-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
}

.drag-handle {
  cursor: grab;
  color: #9CA3AF;
  font-size: 0.875rem;
  user-select: none;
}

.item-label {
  flex: 1;
  font-weight: 500;
}

.item-type {
  font-size: 0.75rem;
  color: #6B7280;
  background: #E5E7EB;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
}

.action-btn:hover {
  background: #F3F4F6;
}

.action-btn.delete:hover {
  background: #FEE2E2;
  border-color: #DC2626;
}

.nav-item-form {
  padding: 1rem;
  border-top: 1px solid #E5E7EB;
  background: #fff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563EB;
}

.anchor-input {
  display: flex;
  align-items: center;
}

.anchor-input span {
  padding: 0.5rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-right: none;
  border-radius: 0.375rem 0 0 0.375rem;
  color: #6B7280;
}

.anchor-input input {
  border-radius: 0 0.375rem 0.375rem 0;
  flex: 1;
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
  font-size: 0.875rem;
}

.dropdown-children {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.dropdown-children h4 {
  font-size: 0.8125rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.empty-dropdown {
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 0.25rem;
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.dropdown-items {
  margin-bottom: 0.75rem;
}

.dropdown-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.dropdown-item input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
}

.dropdown-item .action-btn {
  width: 24px;
  height: 24px;
  font-size: 1rem;
}

/* Preview Panel */
.preview-panel {
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  padding: 1.25rem;
}

.preview-panel h2 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.preview-container {
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  overflow: hidden;
}

.header-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #1F2937;
  color: #fff;
}

.preview-logo {
  font-weight: 600;
}

.preview-nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.preview-link {
  color: #D1D5DB;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
}

.preview-link:hover {
  color: #fff;
}

.preview-link.highlighted {
  background: #2563EB;
  color: #fff;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
}

.preview-dropdown {
  position: relative;
}

.preview-dropdown:hover .preview-dropdown-menu {
  display: block;
}

.preview-dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #374151;
  border-radius: 0.25rem;
  padding: 0.5rem 0;
  min-width: 150px;
  z-index: 10;
}

.preview-dropdown-menu a {
  display: block;
  padding: 0.5rem 1rem;
  color: #D1D5DB;
  text-decoration: none;
  font-size: 0.8125rem;
}

.preview-dropdown-menu a:hover {
  background: #4B5563;
  color: #fff;
}

.footer-preview {
  padding: 1.5rem;
  background: #111827;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.footer-link {
  color: #9CA3AF;
  text-decoration: none;
  font-size: 0.875rem;
}

.footer-link:hover {
  color: #fff;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
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

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .nav-editor {
    grid-template-columns: 1fr;
  }
}
</style>
