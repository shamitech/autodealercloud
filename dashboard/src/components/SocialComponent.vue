<template>
  <div class="social-component">
    <div class="component-form">
      <div class="social-links-list">
        <div v-if="socialLinks.length === 0" class="empty-state">
          <p>No social links added yet. Click "+ Add Social Link" to get started.</p>
        </div>

        <div v-else class="links-container">
          <div v-for="(link, index) in socialLinks" :key="index" class="social-link-item">
            <div class="link-header">
              <span class="platform">{{ link.platform }}</span>
              <button
                class="btn-remove"
                @click="removeSocialLink(index)"
                title="Remove"
              >
                ✕
              </button>
            </div>
            <input 
              v-model="link.url" 
              type="url" 
              placeholder="https://..."
              @change="updateData"
            />
          </div>
        </div>

        <div class="add-social-section">
          <h4>Available Platforms</h4>
          <div class="platform-buttons">
            <button 
              v-for="platform in availablePlatforms"
              :key="platform"
              class="platform-btn"
              @click="addSocialLink(platform)"
              :disabled="hasPlatform(platform)"
            >
              {{ getPlatformEmoji(platform) }} {{ platform }}
            </button>
          </div>
        </div>
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="openInNewTab" @change="updateData" />
          <span>Open in new tab</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const availablePlatforms = [
  'Facebook',
  'Twitter',
  'Instagram',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Pinterest',
  'WhatsApp',
]

const platformEmojis = {
  Facebook: '👤',
  Twitter: '𝕏',
  Instagram: '📷',
  LinkedIn: '💼',
  YouTube: '▶️',
  TikTok: '🎵',
  Pinterest: '📌',
  WhatsApp: '💬',
}

const socialLinks = ref(props.modelValue || [])
const openInNewTab = ref(true)

function getPlatformEmoji(platform) {
  return platformEmojis[platform] || '🔗'
}

function hasPlatform(platform) {
  return socialLinks.value.some(link => link.platform === platform)
}

function addSocialLink(platform) {
  socialLinks.value.push({
    platform: platform,
    url: '',
  })
  updateData()
}

function removeSocialLink(index) {
  socialLinks.value.splice(index, 1)
  updateData()
}

function updateData() {
  emit('update:modelValue', socialLinks.value.map(link => ({
    platform: link.platform,
    url: link.url,
    openInNewTab: openInNewTab.value,
  })))
}

watch(() => props.modelValue, (newVal) => {
  socialLinks.value = newVal || []
}, { deep: true })
</script>

<style scoped>
.social-component {
  padding: 1rem;
  background: #f9fafb;
}

.component-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-links-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.links-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-link-item {
  padding: 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #fecaca;
}

.social-link-item input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: inherit;
}

.add-social-section {
  padding: 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.add-social-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.platform-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.platform-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s;
}

.platform-btn:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.platform-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-label input {
  width: auto;
  cursor: pointer;
}
</style>
