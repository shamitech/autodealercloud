<template>
  <div class="nested-component-view">
    <MenuItems
      v-if="component.type === 'menu-items'"
      :title="`Menu for ${parentName}`"
      :model-value="component.data"
      :pages="pages"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <LogoComponent
      v-if="component.type === 'logo'"
      :model-value="component.data"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <SearchComponent
      v-if="component.type === 'search'"
      :model-value="component.data"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <SocialComponent
      v-if="component.type === 'social'"
      :model-value="component.data"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup>
import MenuItems from './MenuItems.vue'
import LogoComponent from './LogoComponent.vue'
import SearchComponent from './SearchComponent.vue'
import SocialComponent from './SocialComponent.vue'

defineProps({
  component: {
    type: Object,
    required: true,
  },
  pages: {
    type: Array,
    default: () => [],
  },
  parentName: {
    type: String,
    default: 'Container',
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.nested-component-view {
  padding: 0.75rem 0;
}
</style>
