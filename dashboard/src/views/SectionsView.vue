<template>
  <div class="sections-view">
    <header class="page-header">
      <h1>Website Sections</h1>
      <p class="subtitle">Create custom sections and add components like menus, logos, and more</p>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading sections...</p>
    </div>

    <div v-else class="sections-content">
      <!-- Sections List -->
      <div class="sections-panel">
        <div class="panel-header">
          <h2>Sections</h2>
          <button class="btn btn-primary btn-sm" @click="addSection">
            + Add Section
          </button>
        </div>

        <div v-if="sections.length === 0" class="empty-sections">
          <p>No sections yet. Create your first section to get started.</p>
        </div>

        <div v-else class="sections-list">
          <div
            v-for="(section, index) in sections"
            :key="index"
            class="section-card"
            :class="{ active: activeSection === index }"
            @click="activeSection = index"
          >
            <div class="section-card-header">
              <h3>{{ section.name }}</h3>
              <span class="component-count">{{ section.components?.length || 0 }} components</span>
            </div>
            <button
              class="btn-delete"
              @click.stop="removeSection(index)"
              title="Delete section"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Section Editor -->
      <div v-if="activeSection !== null && sections[activeSection]" class="section-editor">
        <div class="editor-header">
          <h2>{{ sections[activeSection].name }}</h2>
          <div class="editor-actions">
            <button class="btn btn-secondary btn-sm" @click="editSectionName">
              ✏️ Rename
            </button>
          </div>
        </div>

        <!-- Components in this section -->
        <div class="components-section">
          <h3>Components</h3>
          <div class="available-components">
            <div class="component-option">
              <h4>Menu Items</h4>
              <p>Navigation menu with infinite tier support</p>
              <button class="btn btn-secondary btn-sm" @click="addComponentToSection('menu-items')">
                + Add
              </button>
            </div>
            <div class="component-option">
              <h4>Logo</h4>
              <p>Upload and display your business logo</p>
              <button class="btn btn-secondary btn-sm" @click="addComponentToSection('logo')" disabled>
                + Add (Coming Soon)
              </button>
            </div>
            <div class="component-option">
              <h4>Search</h4>
              <p>Add a search bar to your section</p>
              <button class="btn btn-secondary btn-sm" @click="addComponentToSection('search')" disabled>
                + Add (Coming Soon)
              </button>
            </div>
            <div class="component-option">
              <h4>Social Links</h4>
              <p>Display your social media profiles</p>
              <button class="btn btn-secondary btn-sm" @click="addComponentToSection('social')" disabled>
                + Add (Coming Soon)
              </button>
            </div>
          </div>

          <!-- Active Components -->
          <div v-if="sections[activeSection].components && sections[activeSection].components.length > 0" class="active-components">
            <h4>Active Components</h4>
            <div class="components-list">
              <div
                v-for="(component, compIndex) in sections[activeSection].components"
                :key="compIndex"
                class="component-item"
              >
                <div class="component-header">
                  <span class="component-type">{{ formatComponentType(component.type) }}</span>
                  <button
                    class="btn-remove"
                    @click="removeComponentFromSection(activeSection, compIndex)"
                    title="Remove component"
                  >
                    ✕
                  </button>
                </div>

                <!-- Menu Items Component -->
                <MenuItems
                  v-if="component.type === 'menu-items'"
                  :title="`Menu for ${sections[activeSection].name}`"
                  :model-value="component.data"
                  :pages="pages"
                  @update:model-value="updateComponentData(activeSection, compIndex, $event)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="form-actions">
          <button class="btn btn-primary" @click="saveSections" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save All Sections' }}
          </button>
        </div>
      </div>

      <!-- No section selected -->
      <div v-else class="no-selection">
        <p>Select a section or create a new one to get started</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'
import MenuItems from '../components/MenuItems.vue'

const loading = ref(true)
const saving = ref(false)
const activeSection = ref(null)
const pages = ref([])
const sections = ref([
  {
    name: 'Header Navigation',
    components: [
      {
        type: 'menu-items',
        data: [],
      },
    ],
  },
  {
    name: 'Footer',
    components: [
      {
        type: 'menu-items',
        data: [],
      },
    ],
  },
])

function generateId() {
  return 'sec-' + Math.random().toString(36).substr(2, 9)
}

function addSection() {
  const sectionName = prompt('Enter section name:')
  if (sectionName) {
    sections.value.push({
      name: sectionName,
      components: [],
    })
  }
}

function removeSection(index) {
  if (confirm(`Remove section "${sections.value[index].name}"?`)) {
    sections.value.splice(index, 1)
    if (activeSection.value === index) {
      activeSection.value = null
    } else if (activeSection.value > index) {
      activeSection.value--
    }
  }
}

function editSectionName() {
  if (activeSection.value === null) return
  const newName = prompt('Enter new section name:', sections.value[activeSection.value].name)
  if (newName) {
    sections.value[activeSection.value].name = newName
  }
}

function addComponentToSection(type) {
  if (activeSection.value === null) return
  
  if (!sections.value[activeSection.value].components) {
    sections.value[activeSection.value].components = []
  }

  const component = {
    id: generateId(),
    type: type,
    data: type === 'menu-items' ? [] : {},
  }

  sections.value[activeSection.value].components.push(component)
}

function removeComponentFromSection(sectionIndex, componentIndex) {
  if (confirm('Remove this component?')) {
    sections.value[sectionIndex].components.splice(componentIndex, 1)
  }
}

function updateComponentData(sectionIndex, componentIndex, newData) {
  sections.value[sectionIndex].components[componentIndex].data = newData
}

function formatComponentType(type) {
  const types = {
    'menu-items': '📋 Menu Items',
    'logo': '🏷️ Logo',
    'search': '🔍 Search',
    'social': '👥 Social Links',
  }
  return types[type] || type
}

async function loadPages() {
  try {
    const res = await api.get('/pages')
    pages.value = res.data.data || []
  } catch (err) {
    console.error('Error loading pages:', err)
  }
}

async function loadSections() {
  loading.value = true
  try {
    // TODO: Load sections from API
    // For now, we'll use the default sections initialized above
    await loadPages()
  } catch (err) {
    console.error('Error loading sections:', err)
    alert('Failed to load sections')
  } finally {
    loading.value = false
  }
}

async function saveSections() {
  saving.value = true
  try {
    // Save each section's components to the appropriate API endpoints
    for (const section of sections.value) {
      for (const component of section.components || []) {
        if (component.type === 'menu-items') {
          // Save menu items using the navigation endpoint
          // We'll use the section name as the location identifier
          const location = section.name.toLowerCase().replace(/\s+/g, '-')
          
          const headerPayload = {
            location: location,
            items: component.data.map((item, index) => ({
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
          
          await api.post('/navigation/bulk-save', headerPayload)
        }
      }
    }

    alert('Sections saved successfully!')
  } catch (err) {
    console.error('Error saving sections:', err)
    console.error('Response:', err.response?.data)
    alert('Failed to save sections: ' + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSections()
  if (sections.value.length > 0) {
    activeSection.value = 0
  }
})
</script>

<style scoped>
.sections-view {
  min-height: 100vh;
  background: #F9FAFB;
}

.page-header {
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
  padding: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.page-header .subtitle {
  margin: 0;
  color: #6B7280;
  font-size: 0.95rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #6B7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sections-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 0;
  min-height: calc(100vh - 140px);
}

.sections-panel {
  background: #fff;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.empty-sections {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #9CA3AF;
  font-size: 0.875rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  flex: 1;
  overflow-y: auto;
}

.section-card {
  position: relative;
  padding: 1rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.section-card:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.section-card.active {
  background: #EFF6FF;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.section-card-header {
  margin-bottom: 0.5rem;
}

.section-card-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.component-count {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #E0E7FF;
  color: #4338CA;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-delete {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.section-card:hover .btn-delete {
  opacity: 1;
}

.section-editor {
  padding: 2rem;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.components-section {
  margin-bottom: 2rem;
}

.components-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.available-components {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.component-option {
  padding: 1rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
}

.component-option h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.component-option p {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #6B7280;
}

.active-components {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E5E7EB;
}

.active-components h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.components-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.component-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  overflow: hidden;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #F3F4F6;
  border-bottom: 1px solid #E5E7EB;
}

.component-type {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #EF4444;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #FEE2E2;
  border-radius: 0.25rem;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #9CA3AF;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E5E7EB;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563EB;
}

.btn-secondary {
  background: #E5E7EB;
  color: #111827;
}

.btn-secondary:hover:not(:disabled) {
  background: #D1D5DB;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}
</style>
