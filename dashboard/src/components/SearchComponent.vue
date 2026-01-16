<template>
  <div class="search-component">
    <div class="component-form">
      <div class="form-group">
        <label>Placeholder Text</label>
        <input 
          v-model="placeholder" 
          type="text" 
          placeholder="e.g., Search inventory..."
          @change="updateData"
        />
      </div>

      <div class="form-group">
        <label>Search Endpoint</label>
        <select v-model="searchEndpoint" @change="updateData">
          <option value="/search">Global Search</option>
          <option value="/search/inventory">Inventory Only</option>
          <option value="/search/pages">Pages Only</option>
        </select>
      </div>

      <div class="form-group">
        <label>Button Text</label>
        <input 
          v-model="buttonText" 
          type="text" 
          placeholder="Search"
          @change="updateData"
        />
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="showIcon" @change="updateData" />
          <span>Show search icon</span>
        </label>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="openInNewTab" @change="updateData" />
          <span>Open results in new tab</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const placeholder = ref(props.modelValue.placeholder || 'Search inventory...')
const searchEndpoint = ref(props.modelValue.searchEndpoint || '/search/inventory')
const buttonText = ref(props.modelValue.buttonText || 'Search')
const showIcon = ref(props.modelValue.showIcon ?? true)
const openInNewTab = ref(props.modelValue.openInNewTab ?? false)

function updateData() {
  emit('update:modelValue', {
    placeholder: placeholder.value,
    searchEndpoint: searchEndpoint.value,
    buttonText: buttonText.value,
    showIcon: showIcon.value,
    openInNewTab: openInNewTab.value,
  })
}

watch(() => props.modelValue, (newVal) => {
  placeholder.value = newVal.placeholder || 'Search inventory...'
  searchEndpoint.value = newVal.searchEndpoint || '/search/inventory'
  buttonText.value = newVal.buttonText || 'Search'
  showIcon.value = newVal.showIcon ?? true
  openInNewTab.value = newVal.openInNewTab ?? false
}, { deep: true })
</script>

<style scoped>
.search-component {
  padding: 1rem;
  background: #f9fafb;
}

.component-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input {
  width: auto;
}
</style>
