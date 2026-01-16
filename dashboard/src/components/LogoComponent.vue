<template>
  <div class="logo-component">
    <div class="component-form">
      <div class="form-group">
        <label>Logo Image</label>
        <div class="logo-input">
          <input 
            v-if="logoUrl" 
            type="text" 
            v-model="logoUrl" 
            placeholder="Logo URL"
            @change="updateData"
          />
          <input 
            v-else
            type="text" 
            placeholder="Enter logo image URL or upload one"
            @change="(e) => { logoUrl = e.target.value; updateData() }"
          />
          <div v-if="logoUrl" class="logo-preview">
            <img :src="logoUrl" alt="Logo preview" />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Logo URL (Link destination)</label>
        <input 
          v-model="logoLink" 
          type="url" 
          placeholder="Where logo links to (usually homepage)"
          @change="updateData"
        />
      </div>

      <div class="form-group">
        <label>Logo Width (px)</label>
        <input 
          v-model.number="logoWidth" 
          type="number" 
          placeholder="200"
          @change="updateData"
        />
      </div>

      <div class="form-group">
        <label>Alt Text</label>
        <input 
          v-model="altText" 
          type="text" 
          placeholder="Logo description for accessibility"
          @change="updateData"
        />
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

const logoUrl = ref(props.modelValue.logoUrl || '')
const logoLink = ref(props.modelValue.logoLink || '/')
const logoWidth = ref(props.modelValue.logoWidth || 200)
const altText = ref(props.modelValue.altText || 'Company Logo')

function updateData() {
  emit('update:modelValue', {
    logoUrl: logoUrl.value,
    logoLink: logoLink.value,
    logoWidth: logoWidth.value,
    altText: altText.value,
  })
}

watch(() => props.modelValue, (newVal) => {
  logoUrl.value = newVal.logoUrl || ''
  logoLink.value = newVal.logoLink || '/'
  logoWidth.value = newVal.logoWidth || 200
  altText.value = newVal.altText || 'Company Logo'
}, { deep: true })
</script>

<style scoped>
.logo-component {
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

.form-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.logo-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.logo-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100px;
}
</style>
