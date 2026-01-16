<template>
  <section class="py-16" :style="{ backgroundColor: colors.accent, color: 'white' }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4" :style="{ fontFamily: typography.headingFont }">
        {{ block.content?.heading }}
      </h2>
      <p class="text-lg mb-8 opacity-90">{{ block.content?.description }}</p>
      <button
        class="px-8 py-3 rounded-lg font-semibold transition hover:opacity-90"
        :style="{ backgroundColor: colors.primary, color: 'white' }"
      >
        {{ block.content?.button_text || 'Get Started' }}
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  block: Object,
  colors: Object,
  typography: Object,
})
</script>
