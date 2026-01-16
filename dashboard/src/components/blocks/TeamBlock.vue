<template>
  <section class="py-12" :style="{ backgroundColor: colors.primary, color: 'white' }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-12 text-center" :style="{ fontFamily: typography.headingFont }">
        {{ block.content?.title }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="member in block.content?.members || []"
          :key="member.id"
          class="text-center"
        >
          <img
            v-if="member.image"
            :src="member.image"
            :alt="member.name"
            class="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
          />
          <h3 class="font-semibold mb-1">{{ member.name }}</h3>
          <p class="text-sm opacity-90">{{ member.title }}</p>
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
