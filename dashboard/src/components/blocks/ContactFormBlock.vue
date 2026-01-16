<template>
  <section class="py-12" :style="{ backgroundColor: colors.background }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-8 text-center" :style="{ fontFamily: typography.headingFont, color: colors.primary }">
        {{ block.content?.title }}
      </h2>
      <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto space-y-4">
        <div v-for="field in block.content?.fields || []" :key="field.name" class="flex flex-col">
          <label :for="field.name" class="font-semibold mb-2" :style="{ color: colors.text }">
            {{ field.label }}
            <span v-if="field.required" :style="{ color: colors.accent }">*</span>
          </label>
          <textarea
            v-if="field.type === 'textarea'"
            :id="field.name"
            v-model="formData[field.name]"
            class="p-3 border rounded"
            :style="{ borderColor: colors.primary }"
            :rows="field.rows || 4"
          />
          <input
            v-else
            :id="field.name"
            v-model="formData[field.name]"
            :type="field.type || 'text'"
            class="p-3 border rounded"
            :style="{ borderColor: colors.primary }"
          />
        </div>
        <button
          type="submit"
          class="w-full py-3 rounded font-semibold text-white transition hover:opacity-90"
          :style="{ backgroundColor: colors.primary }"
        >
          {{ block.content?.submit_text || 'Submit' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  block: Object,
  colors: Object,
  typography: Object,
})

const formData = ref({})

function handleSubmit() {
  console.log('Form submitted:', formData.value)
  // Handle form submission
  alert('Thank you! We will contact you soon.')
  formData.value = {}
}
</script>
