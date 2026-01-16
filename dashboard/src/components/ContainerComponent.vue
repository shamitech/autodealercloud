<template>
  <div class="container-component">
    <div class="container-config">
      <div class="form-group">
        <label>Container Name</label>
        <input 
          v-model="containerName" 
          type="text" 
          placeholder="e.g., Top Navigation, Bottom Section"
          @change="updateData"
        />
      </div>

      <div class="form-group">
        <label>Background Color (optional)</label>
        <div class="color-input-group">
          <input 
            v-model="containerBgColor" 
            type="color"
            @change="updateData"
          />
          <input 
            v-model="containerBgColor" 
            type="text"
            placeholder="#ffffff"
            @change="updateData"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Padding</label>
        <input 
          v-model.number="containerPadding" 
          type="number"
          placeholder="16"
          min="0"
          @change="updateData"
        />
        <span class="help-text">pixels</span>
      </div>
    </div>

    <div class="nested-components-section">
      <h4>Components in this container</h4>
      
      <div class="available-components">
        <div class="component-option">
          <h5>Menu Items</h5>
          <button class="btn btn-secondary btn-sm" @click="addNestedComponent('menu-items')">
            + Add
          </button>
        </div>
        <div class="component-option">
          <h5>Logo</h5>
          <button class="btn btn-secondary btn-sm" @click="addNestedComponent('logo')">
            + Add
          </button>
        </div>
        <div class="component-option">
          <h5>Search</h5>
          <button class="btn btn-secondary btn-sm" @click="addNestedComponent('search')">
            + Add
          </button>
        </div>
        <div class="component-option">
          <h5>Social Links</h5>
          <button class="btn btn-secondary btn-sm" @click="addNestedComponent('social')">
            + Add
          </button>
        </div>
      </div>

      <div v-if="nestedComponents.length > 0" class="nested-list">
        <div 
          v-for="(component, index) in nestedComponents" 
          :key="index"
          class="nested-item"
        >
          <div class="nested-header">
            <span class="nested-type">{{ formatComponentType(component.type) }}</span>
            <div class="nested-actions">
              <button
                class="btn-move"
                @click="moveComponentUp(index)"
                :disabled="index === 0"
                title="Move up"
              >
                ↑
              </button>
              <button
                class="btn-move"
                @click="moveComponentDown(index)"
                :disabled="index === nestedComponents.length - 1"
                title="Move down"
              >
                ↓
              </button>
              <button
                class="btn-remove"
                @click="removeNestedComponent(index)"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Nested Component Preview -->
          <div class="nested-content">
            <NestedComponentView
              :component="component"
              :pages="pages"
              :parent-name="containerName || 'Container'"
              @update:model-value="updateNestedComponentData(index, $event)"
            />
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No components added yet. Click "+ Add" above to add components to this container.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import NestedComponentView from './NestedComponentView.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ name: '', components: [], bgColor: '#ffffff', padding: 16 }),
  },
  pages: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const containerName = ref(props.modelValue?.name || '')
const containerBgColor = ref(props.modelValue?.bgColor || '#ffffff')
const containerPadding = ref(props.modelValue?.padding || 16)
const nestedComponents = ref(props.modelValue?.components || [])

function generateId() {
  return 'comp-' + Math.random().toString(36).substr(2, 9)
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

function addNestedComponent(type) {
  const component = {
    id: generateId(),
    type: type,
    data: type === 'menu-items' ? [] : {},
  }
  nestedComponents.value.push(component)
  updateData()
}

function removeNestedComponent(index) {
  if (confirm('Remove this component?')) {
    nestedComponents.value.splice(index, 1)
    updateData()
  }
}

function moveComponentUp(index) {
  if (index === 0) return
  const temp = nestedComponents.value[index]
  nestedComponents.value[index] = nestedComponents.value[index - 1]
  nestedComponents.value[index - 1] = temp
  updateData()
}

function moveComponentDown(index) {
  if (index === nestedComponents.value.length - 1) return
  const temp = nestedComponents.value[index]
  nestedComponents.value[index] = nestedComponents.value[index + 1]
  nestedComponents.value[index + 1] = temp
  updateData()
}

function updateNestedComponentData(index, newData) {
  nestedComponents.value[index].data = newData
  updateData()
}

function updateData() {
  emit('update:modelValue', {
    name: containerName.value,
    components: nestedComponents.value,
    bgColor: containerBgColor.value,
    padding: containerPadding.value,
  })
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    containerName.value = newVal.name || ''
    containerBgColor.value = newVal.bgColor || '#ffffff'
    containerPadding.value = newVal.padding || 16
    nestedComponents.value = newVal.components || []
  }
}, { deep: true })
</script>

<style scoped>
.container-component {
  padding: 1rem;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.container-config {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
}

.color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input-group input[type="color"] {
  width: 50px;
  height: 36px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-input-group input[type="text"] {
  flex: 1;
}

.help-text {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: -0.25rem;
}

.nested-components-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nested-components-section h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.available-components {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.component-option {
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.component-option h5 {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.empty-state {
  padding: 1.5rem;
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.nested-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.nested-item {
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
}

.nested-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.nested-type {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.nested-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nested-content {
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
}

.btn-move {
  width: 24px;
  height: 24px;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-move:hover:not(:disabled) {
  background: #f0f9ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-move:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
}

.btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #e5e7eb;
  color: #111827;
  border: none;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-sm {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
}
</style>
