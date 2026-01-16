<template>
  <div class="min-h-screen" :style="{ backgroundColor: colors.background }">
    <!-- Header with Logo & Navigation -->
    <header class="sticky top-0 z-40 bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <img v-if="siteSettings.logo_url" :src="siteSettings.logo_url" :alt="siteSettings.business_name" class="h-10">
          <div class="text-xl font-bold" :style="{ color: colors.primary }">
            {{ siteSettings.business_name || tenantName }}
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="hidden md:flex gap-8">
          <router-link
            v-for="item in headerNavigation"
            :key="item.id"
            :to="`/pages/${item.page_id}`"
            class="text-sm font-medium transition hover:opacity-75"
            :style="{ color: item.color || colors.text }"
          >
            {{ item.label }}
          </router-link>
        </nav>

        <!-- Mobile Menu Button (Placeholder) -->
        <button class="md:hidden px-4 py-2 rounded" :style="{ backgroundColor: colors.primary, color: 'white' }">
          ☰
        </button>
      </div>
    </header>

    <!-- Main Content - Dynamic Page Blocks -->
    <main>
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <p class="text-gray-600 mb-4">Loading {{ tenantName }}...</p>
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4" 
               :style="{ borderColor: `${colors.primary}20`, borderTopColor: colors.primary }"></div>
        </div>
      </div>

      <!-- Page Blocks -->
      <div v-if="!isLoading">
        <!-- No content fallback -->
        <div v-if="pageBlocks.length === 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p class="text-gray-600 text-lg">Welcome to {{ tenantName }}</p>
          <p class="text-gray-500">Homepage is being configured</p>
        </div>

        <!-- Render each block -->
        <component
          v-for="(block, index) in pageBlocks"
          :key="`${block.id}-${index}`"
          :is="getBlockComponent(block.type)"
          :block="block"
          :colors="colors"
          :typography="typography"
        />
      </div>
    </main>

    <!-- Footer with Navigation -->
    <footer class="mt-16 py-8" :style="{ backgroundColor: colors.primary, color: 'white' }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Footer Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <!-- Business Info -->
          <div>
            <h4 class="font-semibold mb-4">{{ siteSettings.business_name || tenantName }}</h4>
            <p class="text-sm opacity-90">{{ siteSettings.business_address }}</p>
            <p class="text-sm opacity-90">{{ siteSettings.business_phone }}</p>
            <p class="text-sm opacity-90">{{ siteSettings.business_email }}</p>
          </div>

          <!-- Footer Menu -->
          <div>
            <h4 class="font-semibold mb-4">Menu</h4>
            <div class="flex flex-col gap-2">
              <router-link
                v-for="item in footerNavigation"
                :key="item.id"
                :to="`/pages/${item.page_id}`"
                class="text-sm opacity-90 hover:opacity-100 transition"
              >
                {{ item.label }}
              </router-link>
            </div>
          </div>

          <!-- Social Media -->
          <div>
            <h4 class="font-semibold mb-4">Follow Us</h4>
            <div class="flex gap-4 text-sm">
              <a v-if="siteSettings.social_facebook" :href="siteSettings.social_facebook" class="opacity-90 hover:opacity-100 transition">
                Facebook
              </a>
              <a v-if="siteSettings.social_instagram" :href="siteSettings.social_instagram" class="opacity-90 hover:opacity-100 transition">
                Instagram
              </a>
              <a v-if="siteSettings.social_twitter" :href="siteSettings.social_twitter" class="opacity-90 hover:opacity-100 transition">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-white border-opacity-20 pt-8 text-center text-sm opacity-90">
          <p>&copy; {{ new Date().getFullYear() }} {{ siteSettings.business_name || tenantName }}. All rights reserved.</p>
          <p class="text-xs mt-2 opacity-75">Powered by <span class="font-semibold">AutoDealerCloud</span></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCurrentSubdomain } from '@/utils/tenant'
import apiClient from '@/api/client'

// Components for different block types
const BlockComponents = {
  hero: defineAsyncComponent(() => import('@/components/blocks/HeroBlock.vue')),
  text: defineAsyncComponent(() => import('@/components/blocks/TextBlock.vue')),
  image: defineAsyncComponent(() => import('@/components/blocks/ImageBlock.vue')),
  gallery: defineAsyncComponent(() => import('@/components/blocks/GalleryBlock.vue')),
  products: defineAsyncComponent(() => import('@/components/blocks/ProductsBlock.vue')),
  testimonials: defineAsyncComponent(() => import('@/components/blocks/TestimonialsBlock.vue')),
  contact_form: defineAsyncComponent(() => import('@/components/blocks/ContactFormBlock.vue')),
  cta: defineAsyncComponent(() => import('@/components/blocks/CtaBlock.vue')),
  features: defineAsyncComponent(() => import('@/components/blocks/FeaturesBlock.vue')),
  team: defineAsyncComponent(() => import('@/components/blocks/TeamBlock.vue')),
}

const tenantName = ref('Dealership')
const siteSettings = ref({
  business_name: '',
  business_email: '',
  business_phone: '',
  business_address: '',
  logo_url: '',
  favicon_url: '',
  social_facebook: '',
  social_instagram: '',
  social_twitter: '',
  primary_color: '#3b82f6',
  secondary_color: '#1e40af',
  accent_color: '#f59e0b',
  heading_font: 'Poppins',
  body_font: 'Inter',
  background_color: '#f9fafb',
})

const colors = computed(() => ({
  primary: siteSettings.value.primary_color || '#3b82f6',
  secondary: siteSettings.value.secondary_color || '#1e40af',
  accent: siteSettings.value.accent_color || '#f59e0b',
  text: siteSettings.value.text_color || '#1f2937',
  background: siteSettings.value.background_color || '#f9fafb',
}))

const typography = computed(() => ({
  headingFont: siteSettings.value.heading_font || 'Poppins',
  bodyFont: siteSettings.value.body_font || 'Inter',
}))

const headerNavigation = ref([])
const footerNavigation = ref([])
const pageBlocks = ref([])
const isLoading = ref(true)

onMounted(async () => {
  const subdomain = getCurrentSubdomain()
  if (subdomain) {
    tenantName.value = subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
  }

  await Promise.all([
    fetchSiteSettings(),
    fetchNavigation(),
    fetchHomepage(),
  ])
  
  isLoading.value = false
})

async function fetchSiteSettings() {
  try {
    const response = await apiClient.get('/site-settings')
    if (response.data) {
      siteSettings.value = { ...siteSettings.value, ...response.data }
    }
  } catch (err) {
    console.error('Failed to fetch site settings:', err)
  }
}

async function fetchNavigation() {
  try {
    const response = await apiClient.get('/public/navigation')
    if (response.data) {
      headerNavigation.value = response.data.header || []
      footerNavigation.value = response.data.footer || []
    }
  } catch (err) {
    console.error('Failed to fetch navigation:', err)
  }
}

async function fetchHomepage() {
  try {
    const response = await apiClient.get('/public/pages/homepage')
    if (response.data && response.data.blocks) {
      pageBlocks.value = response.data.blocks
    }
  } catch (err) {
    console.error('Failed to fetch homepage:', err)
    // Fallback: try to get the first published page
    try {
      const pagesResponse = await apiClient.get('/public/pages')
      if (pagesResponse.data && pagesResponse.data.length > 0) {
        pageBlocks.value = pagesResponse.data[0].blocks || []
      }
    } catch (err2) {
      console.error('Failed to fetch pages:', err2)
    }
  }
}

function getBlockComponent(blockType) {
  return BlockComponents[blockType] || BlockComponents.text
}

import { defineAsyncComponent } from 'vue'
</script>
