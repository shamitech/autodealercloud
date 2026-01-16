<template>
  <section class="py-12" :style="{ backgroundColor: colors.background }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <img
        v-if="block.content?.image_url"
        :src="block.content.image_url"
        :alt="block.content?.alt_text || 'Image'"
        class="w-full rounded-lg shadow-lg"
        :style="{ maxHeight: (block.settings?.height || 400) + 'px', objectFit: 'cover' }"
      />
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
