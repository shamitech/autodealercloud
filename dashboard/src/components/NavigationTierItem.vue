<template>
  <div class="tier-item" :class="`tier-level-${depth}`">
    <div class="tier-item-row">
      <input 
        v-model="item.label" 
        type="text" 
        :placeholder="`Tier ${depth} Label`" 
        class="tier-label"
      />
      <select 
        v-model="item.link_type" 
        class="link-type-select"
        @change="onLinkTypeChange"
      >
        <option value="url">URL</option>
        <option value="page">Page</option>
        <option value="inventory">Inventory</option>
        <option value="anchor">Anchor</option>
        <option value="dropdown">Submenu</option>
      </select>
      
      <input 
        v-if="item.link_type === 'url' || item.link_type === 'anchor'" 
        v-model="item.url" 
        type="text" 
        :placeholder="item.link_type === 'anchor' ? 'Anchor ID' : 'URL'" 
        class="tier-input"
      />
      
      <select 
        v-if="item.link_type === 'page'" 
        v-model="item.page_id"
        class="page-select"
      >
        <option value="">-- Select Page --</option>
        <option v-for="page in pages" :key="page.id" :value="page.id">
          {{ page.title }}
        </option>
      </select>
      
      <input 
        v-if="item.link_type === 'inventory'" 
        v-model="item.inventory_filters.category" 
        type="text" 
        placeholder="Category filter" 
        class="tier-input"
      />
      
      <button 
        class="action-btn delete" 
        @click="$emit('remove')"
        title="Delete"
      >
        🗑️
      </button>
    </div>
    
    <!-- Recursive children for submenu items -->
    <div v-if="item.link_type === 'dropdown'" class="tier-children">
      <div class="tier-children-header">
        <h5>Tier {{ depth + 1 }} Items</h5>
        <button class="btn btn-tertiary btn-xs" @click="addChild">
          + Add Tier {{ depth + 1 }}
        </button>
      </div>
      
      <div v-if="!item.children || item.children.length === 0" class="empty-children">
        <p>No tier {{ depth + 1 }} items yet.</p>
      </div>
      
      <div v-else class="children-list">
        <NavigationTierItem
          v-for="(child, index) in item.children"
          :key="index"
          :item="child"
          :depth="depth + 1"
          :pages="pages"
          @remove="removeChild(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, toRefs } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    required: true,
  },
  pages: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['remove'])

const { item, depth } = toRefs(props)

function addChild() {
  if (!item.value.children) item.value.children = []
  item.value.children.push({
    label: `Tier ${depth.value + 1} Item`,
    link_type: 'url',
    url: '',
    page_id: '',
    inventory_filters: { category: '' },
    children: [],
  })
}

function removeChild(index) {
  if (item.value.children) {
    item.value.children.splice(index, 1)
  }
}

function onLinkTypeChange() {
  if (item.value.link_type !== 'dropdown') {
    item.value.children = []
  } else {
    if (!item.value.children) {
      item.value.children = []
    }
  }
}
</script>

<style scoped>
.tier-item {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #F3F4F6;
  border-radius: 0.25rem;
  border-left: 3px solid #3B82F6;
}

.tier-level-2 {
  margin-left: 0.5rem;
  background: #FAFBFC;
  border-left-color: #8B5CF6;
}

.tier-level-3 {
  margin-left: 1rem;
  background: #FAFBFC;
  border-left-color: #EC4899;
}

.tier-level-4 {
  margin-left: 1.5rem;
  background: #FAFBFC;
  border-left-color: #F59E0B;
}

.tier-level-5 {
  margin-left: 2rem;
  background: #FAFBFC;
  border-left-color: #10B981;
}

.tier-level-6 {
  margin-left: 2.5rem;
  background: #FAFBFC;
  border-left-color: #06B6D4;
}

.tier-level-7 {
  margin-left: 3rem;
  background: #FAFBFC;
  border-left-color: #6366F1;
}

.tier-item-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.tier-label {
  flex: 1;
  min-width: 120px;
}

.tier-input {
  flex: 1;
  min-width: 100px;
}

.tier-label,
.tier-input,
.link-type-select,
.page-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  font-family: inherit;
}

.link-type-select {
  width: 100px;
}

.page-select {
  flex: 1;
  min-width: 100px;
}

.action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: #EF4444;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn:hover {
  background: #DC2626;
}

.action-btn.delete {
  background: #EF4444;
}

/* Tier Children Section */
.tier-children {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #D1D5DB;
}

.tier-children-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.tier-children-header h5 {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-children {
  padding: 0.5rem;
  background: #F9FAFB;
  border-radius: 0.25rem;
  color: #9CA3AF;
  font-size: 0.8125rem;
  border: 1px dashed #D1D5DB;
}

.empty-children p {
  margin: 0;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-tertiary {
  background: #6B7280;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-tertiary:hover {
  background: #4B5563;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
