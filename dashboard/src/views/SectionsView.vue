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
      <!-- Sections List & Components -->
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
          <template v-for="(section, index) in sections" :key="index">
            <!-- Section Card -->
            <div
              class="section-card"
              :class="{ active: activeSection === index }"
              @click="activeSection === index ? activeSection = null : activeSection = index"
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

            <!-- Component Cards (shown when section is selected) -->
            <div v-if="activeSection === index" class="component-cards-container">
              <div class="component-cards">
                <div class="component-card" @click="addComponentToSection('menu-items')">
                  <div class="card-icon">📋</div>
                  <h4>Menu Items</h4>
                  <p>Navigation menu</p>
                  <button class="btn btn-sm btn-primary">+ Add</button>
                </div>
                <div class="component-card" @click="addComponentToSection('logo')">
                  <div class="card-icon">🏷️</div>
                  <h4>Logo</h4>
                  <p>Company logo</p>
                  <button class="btn btn-sm btn-primary">+ Add</button>
                </div>
                <div class="component-card" @click="addComponentToSection('search')">
                  <div class="card-icon">🔍</div>
                  <h4>Search</h4>
                  <p>Search function</p>
                  <button class="btn btn-sm btn-primary">+ Add</button>
                </div>
                <div class="component-card" @click="addComponentToSection('social')">
                  <div class="card-icon">👥</div>
                  <h4>Social</h4>
                  <p>Social links</p>
                  <button class="btn btn-sm btn-primary">+ Add</button>
                </div>
                <div class="component-card" @click="addComponentToSection('container')">
                  <div class="card-icon">📦</div>
                  <h4>Container</h4>
                  <p>Group components</p>
                  <button class="btn btn-sm btn-primary">+ Add</button>
                </div>
              </div>
            </div>
          </template>
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
          <h3>Components in this section</h3>

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
                  <div class="component-actions">
                    <button
                      class="btn-move"
                      @click="moveComponentUp(activeSection, compIndex)"
                      :disabled="compIndex === 0"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      class="btn-move"
                      @click="moveComponentDown(activeSection, compIndex)"
                      :disabled="compIndex === sections[activeSection].components.length - 1"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      class="btn-remove"
                      @click="removeComponentFromSection(activeSection, compIndex)"
                      title="Remove component"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <!-- Menu Items Component -->
                <MenuItems
                  v-if="component.type === 'menu-items'"
                  :title="`Menu for ${sections[activeSection].name}`"
                  :model-value="component.data"
                  :pages="pages"
                  @update:model-value="updateComponentData(activeSection, compIndex, $event)"
                />

                <!-- Logo Component -->
                <LogoComponent
                  v-if="component.type === 'logo'"
                  :model-value="component.data"
                  @update:model-value="updateComponentData(activeSection, compIndex, $event)"
                />

                <!-- Search Component -->
                <SearchComponent
                  v-if="component.type === 'search'"
                  :model-value="component.data"
                  @update:model-value="updateComponentData(activeSection, compIndex, $event)"
                />

                <!-- Social Component -->
                <SocialComponent
                  v-if="component.type === 'social'"
                  :model-value="component.data"
                  @update:model-value="updateComponentData(activeSection, compIndex, $event)"
                />

                <!-- Container Component -->
                <ContainerComponent
                  v-if="component.type === 'container'"
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
import LogoComponent from '../components/LogoComponent.vue'
import SearchComponent from '../components/SearchComponent.vue'
import SocialComponent from '../components/SocialComponent.vue'
import ContainerComponent from '../components/ContainerComponent.vue'

const loading = ref(true)
const saving = ref(false)
const activeSection = ref(null)
const pages = ref([])
const sections = ref([])

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
    data: type === 'menu-items' ? [] : type === 'container' ? { name: 'New Container', components: [] } : type === 'social' ? [] : {},
  }

  sections.value[activeSection.value].components.push(component)
}

function removeComponentFromSection(sectionIndex, componentIndex) {
  if (confirm('Remove this component?')) {
    sections.value[sectionIndex].components.splice(componentIndex, 1)
  }
}

function moveComponentUp(sectionIndex, componentIndex) {
  if (componentIndex === 0) return
  const components = sections.value[sectionIndex].components
  const temp = components[componentIndex]
  components[componentIndex] = components[componentIndex - 1]
  components[componentIndex - 1] = temp
}

function moveComponentDown(sectionIndex, componentIndex) {
  const components = sections.value[sectionIndex].components
  if (componentIndex === components.length - 1) return
  const temp = components[componentIndex]
  components[componentIndex] = components[componentIndex + 1]
  components[componentIndex + 1] = temp
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
    'container': '📦 Container',
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
    const res = await api.get('/sections')
    sections.value = res.data.data || []
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
    // Prepare sections data for saving
    const sectionsPayload = sections.value.map((section, index) => ({
      id: section.id || null, // Include ID if it exists (for updates)
      name: section.name,
      components: section.components || [],
      order: index,
    }))

    console.log('Saving sections payload:', JSON.stringify(sectionsPayload, null, 2))

    // Save sections structure
    const sectionsResponse = await api.post('/sections/save', { sections: sectionsPayload })
    console.log('Sections save response:', sectionsResponse.data)

    // Note: Menu items are now stored within sections.components, so we don't need to
    // save them separately to the navigation endpoint. The sections table is the source of truth.

    alert('Sections saved successfully!')
  } catch (err) {
    console.error('Error saving sections:', err)
    console.error('Response status:', err.response?.status)
    console.error('Full response data:', JSON.stringify(err.response?.data, null, 2))
    
    let errorMessage = 'Failed to save sections'
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors
      console.error('Validation errors:', errors)
      const errorList = Object.entries(errors)
        .map(([key, messages]) => `${key}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('\n')
      errorMessage = `Validation errors:\n${errorList}`
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    }
    
    console.error('Final error message:', errorMessage)
    alert(errorMessage)
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

.component-cards-container {
  padding: 0 0.5rem 0.5rem 0.5rem;
  background: #F0F4F8;
  border-radius: 0 0 0.5rem 0.5rem;
  margin: -0.5rem 0.5rem 0.5rem 0.5rem;
}

.component-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.component-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%);
  border: 2px solid #E5E7EB;
  border-radius: 0.625rem;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.component-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 8px 12px rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, #F8FBFF 0%, #EFF6FF 100%);
  transform: translateY(-2px);
}

.component-card:active {
  transform: translateY(0);
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
}

.component-card h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1F2937;
  letter-spacing: -0.3px;
}

.component-card p {
  margin: 0;
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
}

.component-card .btn {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 600;
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
  max-height: calc(100vh - 140px);
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

.component-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-move {
  width: 28px;
  height: 28px;
  border: 1px solid #D1D5DB;
  background: white;
  color: #6B7280;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-move:hover:not(:disabled) {
  background: #F0F9FF;
  border-color: #3B82F6;
  color: #3B82F6;
}

.btn-move:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-remove {
  width: 28px;
  height: 28px;
  border: 1px solid #FCA5A5;
  background: #FEE2E2;
  color: #EF4444;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #FECACA;
  border-color: #EF4444;
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
