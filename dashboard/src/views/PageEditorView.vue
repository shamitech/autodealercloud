<template>
  <div class="page-editor">
    <!-- Header -->
    <header class="editor-header">
      <div class="header-left">
        <router-link to="/admin/pages" class="back-link">
          ← Back to Pages
        </router-link>
        <h1 v-if="page">{{ page.title }}</h1>
        <h1 v-else>Loading...</h1>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" @click="previewPage">
          👁️ Preview
        </button>
        <button class="btn btn-primary" @click="savePage" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Page' }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading page...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <router-link to="/admin/pages" class="btn btn-primary">Back to Pages</router-link>
    </div>

    <div v-else class="editor-content">
      <!-- Sidebar - Block Library -->
      <aside class="block-library">
        <h2>Add Blocks</h2>
        
        <div v-for="(category, categoryName) in blockTypes" :key="categoryName" class="block-category">
          <h3>{{ formatCategoryName(categoryName) }}</h3>
          <div class="block-items">
            <button
              v-for="block in category"
              :key="block.type"
              class="block-item"
              @click="addBlock(block.type)"
              draggable="true"
              @dragstart="onDragStart($event, block.type)"
            >
              <span class="block-icon">{{ block.icon }}</span>
              <span class="block-label">{{ block.label }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Canvas - Page Blocks -->
      <main class="editor-canvas">
        <div class="canvas-header">
          <h2>Page Content</h2>
          <span class="block-count">{{ blocks.length }} blocks</span>
        </div>

        <div
          v-if="blocks.length === 0"
          class="empty-canvas"
          @drop="onDrop($event, 0)"
          @dragover.prevent
        >
          <div class="empty-icon">📝</div>
          <p>Drag blocks here or click a block to add it</p>
        </div>

        <div v-else class="blocks-container">
          <div
            v-for="(block, index) in blocks"
            :key="block.id"
            class="block-wrapper"
            :class="{ selected: selectedBlock === block.id, dragging: draggingBlock === block.id }"
          >
            <!-- Drop zone above -->
            <div
              class="drop-zone"
              @drop="onDrop($event, index)"
              @dragover.prevent
              @dragenter="dragOverIndex = index"
              @dragleave="dragOverIndex = null"
              :class="{ active: dragOverIndex === index }"
            ></div>

            <div
              class="block-content"
              @click="selectBlock(block)"
              draggable="true"
              @dragstart="onBlockDragStart($event, block, index)"
              @dragend="onDragEnd"
            >
              <div class="block-header">
                <span class="block-type">{{ getBlockLabel(block.block_type) }}</span>
                <div class="block-actions">
                  <button
                    class="action-btn"
                    @click.stop="moveBlock(index, -1)"
                    :disabled="index === 0"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="moveBlock(index, 1)"
                    :disabled="index === blocks.length - 1"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="duplicateBlock(index)"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    class="action-btn delete"
                    @click.stop="removeBlock(index)"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Block Preview -->
              <div class="block-preview">
                <component
                  :is="getBlockPreviewComponent(block.block_type)"
                  :content="block.content"
                  :settings="block.settings"
                  @update:content="updateBlockContent(index, $event)"
                />
              </div>
            </div>

            <!-- Drop zone below (only for last item) -->
            <div
              v-if="index === blocks.length - 1"
              class="drop-zone"
              @drop="onDrop($event, blocks.length)"
              @dragover.prevent
              @dragenter="dragOverIndex = blocks.length"
              @dragleave="dragOverIndex = null"
              :class="{ active: dragOverIndex === blocks.length }"
            ></div>
          </div>
        </div>
      </main>

      <!-- Right Sidebar - Block Settings -->
      <aside class="block-settings" v-if="selectedBlockData">
        <header class="settings-header">
          <h2>Block Settings</h2>
          <button class="close-btn" @click="selectedBlock = null">&times;</button>
        </header>

        <div class="settings-content">
          <!-- Content Editor based on block type -->
          <div class="settings-section">
            <h3>Content</h3>
            
            <!-- Hero Block -->
            <template v-if="selectedBlockData.block_type === 'hero'">
              <div class="form-group">
                <label>Heading</label>
                <input v-model="selectedBlockData.content.heading" type="text" />
              </div>
              <div class="form-group">
                <label>Subheading</label>
                <input v-model="selectedBlockData.content.subheading" type="text" />
              </div>
              <div class="form-group">
                <label>Background Image URL</label>
                <input v-model="selectedBlockData.content.backgroundImage" type="url" />
              </div>
              <div class="form-group">
                <label>Button Text</label>
                <input v-model="selectedBlockData.content.buttonText" type="text" />
              </div>
              <div class="form-group">
                <label>Button URL</label>
                <input v-model="selectedBlockData.content.buttonUrl" type="text" />
              </div>
            </template>

            <!-- Text Block -->
            <template v-else-if="selectedBlockData.block_type === 'text'">
              <div class="form-group">
                <label>Heading (optional)</label>
                <input v-model="selectedBlockData.content.heading" type="text" />
              </div>
              <div class="form-group">
                <label>Content</label>
                <textarea v-model="selectedBlockData.content.text" rows="6"></textarea>
              </div>
            </template>

            <!-- Image Block -->
            <template v-else-if="selectedBlockData.block_type === 'image'">
              <div class="form-group">
                <label>Image URL</label>
                <input v-model="selectedBlockData.content.src" type="url" />
              </div>
              <div class="form-group">
                <label>Alt Text</label>
                <input v-model="selectedBlockData.content.alt" type="text" />
              </div>
              <div class="form-group">
                <label>Caption</label>
                <input v-model="selectedBlockData.content.caption" type="text" />
              </div>
            </template>

            <!-- Button Block -->
            <template v-else-if="selectedBlockData.block_type === 'button'">
              <div class="form-group">
                <label>Button Text</label>
                <input v-model="selectedBlockData.content.text" type="text" />
              </div>
              <div class="form-group">
                <label>URL</label>
                <input v-model="selectedBlockData.content.url" type="text" />
              </div>
              <div class="form-group">
                <label>Style</label>
                <select v-model="selectedBlockData.content.style">
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            </template>

            <!-- Inventory Grid -->
            <template v-else-if="selectedBlockData.block_type === 'inventory_grid' || selectedBlockData.block_type === 'featured_inventory'">
              <div class="form-group">
                <label>Title</label>
                <input v-model="selectedBlockData.content.title" type="text" />
              </div>
              <div class="form-group">
                <label>Products to Show</label>
                <input v-model.number="selectedBlockData.content.limit" type="number" min="1" max="24" />
              </div>
              <div class="form-group">
                <label>Category Filter</label>
                <input v-model="selectedBlockData.content.category" type="text" placeholder="Leave empty for all" />
              </div>
            </template>

            <!-- CTA Banner -->
            <template v-else-if="selectedBlockData.block_type === 'cta_banner'">
              <div class="form-group">
                <label>Heading</label>
                <input v-model="selectedBlockData.content.heading" type="text" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="selectedBlockData.content.description" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Button Text</label>
                <input v-model="selectedBlockData.content.buttonText" type="text" />
              </div>
              <div class="form-group">
                <label>Button URL</label>
                <input v-model="selectedBlockData.content.buttonUrl" type="text" />
              </div>
            </template>

            <!-- Contact Form -->
            <template v-else-if="selectedBlockData.block_type === 'contact_form'">
              <div class="form-group">
                <label>Title</label>
                <input v-model="selectedBlockData.content.title" type="text" />
              </div>
              <div class="form-group">
                <label>Submit Button Text</label>
                <input v-model="selectedBlockData.content.submitText" type="text" />
              </div>
            </template>

            <!-- Map -->
            <template v-else-if="selectedBlockData.block_type === 'map'">
              <div class="form-group">
                <label>Google Maps Embed URL</label>
                <input v-model="selectedBlockData.content.embedUrl" type="url" />
              </div>
              <div class="form-group">
                <label>Height (px)</label>
                <input v-model.number="selectedBlockData.content.height" type="number" />
              </div>
            </template>

            <!-- Spacer -->
            <template v-else-if="selectedBlockData.block_type === 'spacer'">
              <div class="form-group">
                <label>Height (px)</label>
                <input v-model.number="selectedBlockData.content.height" type="number" min="10" max="200" />
              </div>
            </template>

            <!-- HTML -->
            <template v-else-if="selectedBlockData.block_type === 'html'">
              <div class="form-group">
                <label>Custom HTML</label>
                <textarea v-model="selectedBlockData.content.html" rows="10" class="code-input"></textarea>
              </div>
            </template>

            <!-- Default for other blocks -->
            <template v-else>
              <p class="muted">Edit this block's content using the preview below.</p>
            </template>
          </div>

          <!-- Layout Settings -->
          <div class="settings-section">
            <h3>Layout</h3>
            <div class="form-row">
              <div class="form-group half">
                <label>Padding Top</label>
                <input v-model="selectedBlockData.settings.paddingTop" type="text" placeholder="40px" />
              </div>
              <div class="form-group half">
                <label>Padding Bottom</label>
                <input v-model="selectedBlockData.settings.paddingBottom" type="text" placeholder="40px" />
              </div>
            </div>
            <div class="form-group">
              <label>Background Color</label>
              <input v-model="selectedBlockData.settings.backgroundColor" type="color" />
            </div>
          </div>

          <!-- Visibility -->
          <div class="settings-section">
            <h3>Visibility</h3>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="selectedBlockData.is_visible" />
                <span>Visible</span>
              </label>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="selectedBlockData.desktop_visible" />
                <span>Show on Desktop</span>
              </label>
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="selectedBlockData.mobile_visible" />
                <span>Show on Mobile</span>
              </label>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/client'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const page = ref(null)
const blocks = ref([])
const blockTypes = ref({})
const selectedBlock = ref(null)
const draggingBlock = ref(null)
const dragOverIndex = ref(null)

const selectedBlockData = computed(() => {
  if (!selectedBlock.value) return null
  return blocks.value.find(b => b.id === selectedBlock.value)
})

// Generate unique ID for blocks
function generateId() {
  return 'block-' + Math.random().toString(36).substr(2, 9)
}

// Load page and blocks
async function loadPage() {
  const pageId = route.params.id
  loading.value = true
  error.value = null

  try {
    const [pageRes, blockTypesRes] = await Promise.all([
      api.get(`/pages/${pageId}`),
      api.get('/pages/block-types'),
    ])

    page.value = pageRes.data.data
    blocks.value = (page.value.blocks || []).map(b => ({
      ...b,
      id: b.id || generateId(),
    }))
    blockTypes.value = blockTypesRes.data.data || {}
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load page'
    console.error('Error loading page:', err)
  } finally {
    loading.value = false
  }
}

// Save page blocks
async function savePage() {
  saving.value = true
  try {
    await api.put(`/pages/${page.value.id}/blocks`, {
      blocks: blocks.value.map((b, index) => ({
        id: b.id,
        block_type: b.block_type,
        order: index,
        content: b.content,
        settings: b.settings,
        is_visible: b.is_visible,
        mobile_visible: b.mobile_visible,
        desktop_visible: b.desktop_visible,
      }))
    })
    alert('Page saved successfully!')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save page')
    console.error('Error saving page:', err)
  } finally {
    saving.value = false
  }
}

// Add a new block
function addBlock(blockType) {
  const newBlock = {
    id: generateId(),
    block_type: blockType,
    order: blocks.value.length,
    content: getDefaultContent(blockType),
    settings: { paddingTop: '40px', paddingBottom: '40px' },
    is_visible: true,
    mobile_visible: true,
    desktop_visible: true,
  }
  blocks.value.push(newBlock)
  selectBlock(newBlock)
}

// Get default content for block type
function getDefaultContent(blockType) {
  const defaults = {
    hero: { heading: 'Welcome to Our Dealership', subheading: 'Find your perfect vehicle', buttonText: 'View Inventory', buttonUrl: '/inventory' },
    text: { heading: '', text: 'Enter your content here...' },
    image: { src: '', alt: '', caption: '' },
    button: { text: 'Click Here', url: '#', style: 'primary' },
    spacer: { height: 50 },
    divider: { style: 'solid', color: '#E5E7EB' },
    featured_inventory: { title: 'Featured Vehicles', limit: 4, category: '' },
    inventory_grid: { title: 'Our Inventory', limit: 12, category: '' },
    cta_banner: { heading: 'Ready to find your next vehicle?', description: 'Contact us today!', buttonText: 'Get Started', buttonUrl: '/contact' },
    contact_form: { title: 'Contact Us', submitText: 'Send Message' },
    map: { embedUrl: '', height: 400 },
    html: { html: '' },
  }
  return defaults[blockType] || {}
}

// Select a block
function selectBlock(block) {
  selectedBlock.value = block.id
}

// Move block up or down
function moveBlock(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= blocks.value.length) return
  
  const block = blocks.value.splice(index, 1)[0]
  blocks.value.splice(newIndex, 0, block)
}

// Duplicate block
function duplicateBlock(index) {
  const block = blocks.value[index]
  const newBlock = {
    ...JSON.parse(JSON.stringify(block)),
    id: generateId(),
  }
  blocks.value.splice(index + 1, 0, newBlock)
}

// Remove block
function removeBlock(index) {
  if (confirm('Are you sure you want to remove this block?')) {
    const block = blocks.value[index]
    if (selectedBlock.value === block.id) {
      selectedBlock.value = null
    }
    blocks.value.splice(index, 1)
  }
}

// Update block content
function updateBlockContent(index, content) {
  blocks.value[index].content = { ...blocks.value[index].content, ...content }
}

// Drag and drop handlers
function onDragStart(event, blockType) {
  event.dataTransfer.setData('blockType', blockType)
  event.dataTransfer.effectAllowed = 'copy'
}

function onBlockDragStart(event, block, index) {
  event.dataTransfer.setData('blockId', block.id)
  event.dataTransfer.setData('blockIndex', index.toString())
  event.dataTransfer.effectAllowed = 'move'
  draggingBlock.value = block.id
}

function onDragEnd() {
  draggingBlock.value = null
  dragOverIndex.value = null
}

function onDrop(event, targetIndex) {
  event.preventDefault()
  
  const blockType = event.dataTransfer.getData('blockType')
  const blockId = event.dataTransfer.getData('blockId')
  const fromIndex = parseInt(event.dataTransfer.getData('blockIndex'))
  
  if (blockType) {
    // Adding new block from library
    const newBlock = {
      id: generateId(),
      block_type: blockType,
      order: targetIndex,
      content: getDefaultContent(blockType),
      settings: { paddingTop: '40px', paddingBottom: '40px' },
      is_visible: true,
      mobile_visible: true,
      desktop_visible: true,
    }
    blocks.value.splice(targetIndex, 0, newBlock)
    selectBlock(newBlock)
  } else if (blockId && !isNaN(fromIndex)) {
    // Moving existing block
    const block = blocks.value.splice(fromIndex, 1)[0]
    const adjustedIndex = targetIndex > fromIndex ? targetIndex - 1 : targetIndex
    blocks.value.splice(adjustedIndex, 0, block)
  }
  
  dragOverIndex.value = null
  draggingBlock.value = null
}

// Get block label
function getBlockLabel(blockType) {
  for (const category of Object.values(blockTypes.value)) {
    const block = category.find(b => b.type === blockType)
    if (block) return block.label
  }
  return blockType
}

// Get block preview component
function getBlockPreviewComponent(blockType) {
  // For now, return a simple preview component name
  // In a full implementation, these would be separate Vue components
  return 'div'
}

// Format category name
function formatCategoryName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// Preview page
function previewPage() {
  window.open(`/${page.value.slug}`, '_blank')
}

onMounted(() => {
  loadPage()
})
</script>

<style scoped>
.page-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F3F4F6;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #E5E7EB;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-link {
  color: #6B7280;
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  color: #374151;
}

.header-left h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

.loading-state,
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Block Library Sidebar */
.block-library {
  width: 260px;
  background: #fff;
  border-right: 1px solid #E5E7EB;
  overflow-y: auto;
  padding: 1rem;
}

.block-library h2 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
}

.block-category {
  margin-bottom: 1.5rem;
}

.block-category h3 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}

.block-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.block-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.block-item:hover {
  background: #F3F4F6;
  border-color: #E5E7EB;
}

.block-icon {
  font-size: 1.125rem;
}

.block-label {
  font-size: 0.8125rem;
  color: #374151;
}

/* Editor Canvas */
.editor-canvas {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.canvas-header h2 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.block-count {
  font-size: 0.75rem;
  color: #6B7280;
}

.empty-canvas {
  background: #fff;
  border: 2px dashed #D1D5DB;
  border-radius: 0.5rem;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.empty-canvas p {
  color: #6B7280;
  margin: 0;
}

.blocks-container {
  display: flex;
  flex-direction: column;
}

.block-wrapper {
  position: relative;
}

.block-wrapper.dragging {
  opacity: 0.5;
}

.drop-zone {
  height: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.drop-zone.active {
  height: 40px;
  background: #DBEAFE;
  border: 2px dashed #2563EB;
  margin: 0.5rem 0;
}

.block-content {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  margin: 0.25rem 0;
  cursor: pointer;
  transition: all 0.2s;
}

.block-wrapper.selected .block-content {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.block-content:hover {
  border-color: #9CA3AF;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  border-radius: 0.5rem 0.5rem 0 0;
}

.block-type {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
}

.block-actions {
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
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #F3F4F6;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-btn.delete:hover {
  background: #FEE2E2;
  border-color: #DC2626;
}

.block-preview {
  padding: 1rem;
  min-height: 60px;
}

/* Block Settings Sidebar */
.block-settings {
  width: 320px;
  background: #fff;
  border-left: 1px solid #E5E7EB;
  overflow-y: auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.settings-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6B7280;
  cursor: pointer;
  line-height: 1;
}

.settings-content {
  padding: 1rem;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  margin: 0 0 1rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563EB;
}

.form-row {
  display: flex;
  gap: 0.75rem;
}

.form-group.half {
  flex: 1;
}

.checkbox-group {
  margin-bottom: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.code-input {
  font-family: monospace;
  font-size: 0.75rem;
}

.muted {
  color: #6B7280;
  font-size: 0.875rem;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
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
</style>
