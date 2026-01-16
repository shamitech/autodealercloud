<template>
  <div class="menu-items-component">
    <div class="menu-items-header">
      <h3>{{ title }}</h3>
      <button class="btn btn-primary btn-sm" @click="addItem">
        + Add Menu Item
      </button>
    </div>

    <div v-if="items.length === 0" class="empty-state">
      <p>No menu items yet. Click "+ Add Menu Item" to get started.</p>
    </div>

    <draggable
      v-else
      v-model="items"
      item-key="tempId"
      handle=".drag-handle"
      ghost-class="ghost"
      @end="onDragEnd"
      class="menu-items-list"
    >
      <template #item="{ element, index }">
        <div class="menu-item" :class="{ expanded: expandedItem === element.tempId }">
          <div class="menu-item-header">
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
          <div v-if="expandedItem === element.tempId" class="menu-item-form">
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
                  <option value="dropdown">Submenu</option>
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

            <!-- Nested Menu Items -->
            <div v-if="element.link_type === 'dropdown'" class="nested-section">
              <div class="nested-header">
                <h4>Sub-Menu Items</h4>
                <button class="btn btn-secondary btn-sm" @click="addChild(element)">
                  + Add Sub-Menu Item
                </button>
              </div>
              <NavigationTierItem
                v-for="(child, childIndex) in element.children"
                :key="childIndex"
                :item="child"
                :depth="2"
                :pages="pages"
                @remove="removeChild(element, childIndex)"
              />
            </div>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import draggable from 'vuedraggable'
import NavigationTierItem from './NavigationTierItem.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Menu Items',
  },
  modelValue: {
    type: Array,
    required: true,
  },
  pages: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const expandedItem = ref(null)

const items = ref(props.modelValue)

function generateId() {
  return 'nav-' + Math.random().toString(36).substr(2, 9)
}

function addItem() {
  const newItem = {
    tempId: generateId(),
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
  items.value.push(newItem)
  expandedItem.value = newItem.tempId
  emit('update:modelValue', items.value)
}

function removeItem(index) {
  if (confirm('Are you sure you want to remove this menu item?')) {
    items.value.splice(index, 1)
    emit('update:modelValue', items.value)
  }
}

function toggleExpand(id) {
  expandedItem.value = expandedItem.value === id ? null : id
}

function onLinkTypeChange(item) {
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
    label: 'Sub-Menu Item',
    link_type: 'url',
    url: '',
    page_id: '',
    inventory_filters: { category: '' },
    children: [],
  })
}

function removeChild(parent, index) {
  if (parent.children) {
    parent.children.splice(index, 1)
  }
}

function onDragEnd() {
  emit('update:modelValue', items.value)
}

function formatLinkType(type) {
  const types = {
    url: 'URL',
    page: 'Page',
    inventory: 'Inventory',
    dropdown: 'Submenu',
    anchor: 'Anchor',
  }
  return types[type] || type
}
</script>

<style scoped>
.menu-items-component {
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.menu-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.menu-items-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  background: #F9FAFB;
  border-radius: 0.5rem;
  color: #6B7280;
  border: 1px dashed #D1D5DB;
}

.menu-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.menu-item {
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  background: #fff;
  overflow: hidden;
}

.menu-item.expanded {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-color: #3B82F6;
}

.menu-item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #F9FAFB;
  cursor: pointer;
  user-select: none;
}

.drag-handle {
  cursor: move;
  color: #9CA3AF;
  font-weight: bold;
  flex-shrink: 0;
}

.item-label {
  flex: 1;
  font-weight: 500;
  color: #111827;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type {
  padding: 0.25rem 0.75rem;
  background: #E0E7FF;
  color: #3730A3;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  font-size: 1rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #E5E7EB;
  color: #111827;
}

.action-btn.delete {
  color: #EF4444;
}

.action-btn.delete:hover {
  background: #FEE2E2;
}

.menu-item-form {
  padding: 1.5rem;
  background: #fff;
  border-top: 1px solid #E5E7EB;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.anchor-input {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  overflow: hidden;
}

.anchor-input span {
  padding: 0.5rem 0.75rem;
  background: #F3F4F6;
  color: #6B7280;
  font-weight: 600;
  flex-shrink: 0;
}

.anchor-input input {
  flex: 1;
  border: none;
  padding: 0.5rem 0.75rem;
}

.checkbox-group {
  grid-column: 1 / -1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-weight: 400;
}

.checkbox-label input {
  width: auto;
  cursor: pointer;
}

.nested-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.nested-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.nested-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}
</style>
