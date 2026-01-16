<template>
  <section class="py-12" :style="boxStyle1">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-12 text-center" :style="headingStyle">
        {{ block.content?.title }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="(feature, index) in block.content?.features || []" :key="index" class="text-center">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl" :style="iconStyle">
            {{ feature.icon }}
          </div>
          <h3 class="font-semibold mb-2" :style="featureTitleStyle">
            {{ feature.title }}
          </h3>
          <p :style="featureTextStyle">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  block: Object,
  colors: Object,
  typography: Object,
})

const boxStyle1 = computed(() => ({ backgroundColor: props.colors.background }))
const headingStyle = computed(() => ({ 
  fontFamily: props.typography.headingFont, 
  color: props.colors.primary 
}))
const iconStyle = computed(() => ({ backgroundColor: props.colors.accent }))
const featureTitleStyle = computed(() => ({ color: props.colors.primary }))
const featureTextStyle = computed(() => ({ color: props.colors.text }))
</script>
