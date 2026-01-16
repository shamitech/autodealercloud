<template>
  <section class="py-20" :style="{ backgroundColor: block.settings?.background_color || colors.primary, color: 'white' }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4" :style="{ fontFamily: typography.headingFont }">
        {{ block.content?.heading }}
      </h1>
      <p class="text-lg md:text-xl opacity-90 mb-8" :style="{ fontFamily: typography.bodyFont }">
        {{ block.content?.subheading }}
      </p>
      <button
        v-if="block.content?.cta_text"
        class="px-8 py-3 rounded-lg font-semibold transition hover:opacity-90"
        :style="{ backgroundColor: colors.accent, color: 'white' }"
      >
        {{ block.content?.cta_text }}
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
