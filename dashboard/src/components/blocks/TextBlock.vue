<template>
  <section class="py-12" :style="{ backgroundColor: colors.background }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="block.content?.text" :style="{ fontFamily: typography.bodyFont, color: colors.text }" class="prose prose-lg max-w-none">
        <div v-html="block.content.text" />
      </div>
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
