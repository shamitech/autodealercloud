<template>
  <section class="py-12" :style="{ backgroundColor: colors.background }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-8 text-center" :style="{ fontFamily: typography.headingFont, color: colors.primary }">
        {{ block.content?.title }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(image, index) in block.content?.images || []"
          :key="index"
          class="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
        >
          <img :src="image.url" :alt="image.alt" class="w-full h-64 object-cover" />
        </div>
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
