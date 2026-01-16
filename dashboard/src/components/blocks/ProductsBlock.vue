<template>
  <section class="py-12" :style="{ backgroundColor: colors.background }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-8 text-center" :style="{ fontFamily: typography.headingFont, color: colors.primary }">
        {{ block.content?.title }}
      </h2>
      <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="product in block.content?.products || []" :key="product.id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-48 object-cover" />
          <div class="p-4">
            <h3 class="font-semibold mb-2" :style="{ color: colors.primary }">{{ product.name }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="font-bold" :style="{ color: colors.accent }">{{ '$' + product.price }}</span>
              <button class="px-3 py-1 rounded text-sm text-white" :style="{ backgroundColor: colors.primary }">
                View
              </button>
            </div>
          </div>
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
