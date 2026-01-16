<template>
  <section class="py-12" :style="{ backgroundColor: colors.primary, color: 'white' }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-8 text-center" :style="{ fontFamily: typography.headingFont }">
        {{ block.content?.title }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="testimonial in block.content?.testimonials || []"
          :key="testimonial.id"
          class="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur"
        >
          <p class="mb-4 italic">{{ testimonial.text }}</p>
          <div>
            <p class="font-semibold">{{ testimonial.author }}</p>
            <p class="text-sm opacity-90">{{ testimonial.title }}</p>
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
