<template>
  <div class="site-settings">
    <header class="page-header">
      <h1>Site Settings</h1>
      <p class="subtitle">Customize your website branding, colors, and business information</p>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading settings...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadSettings" class="btn btn-primary">Retry</button>
    </div>

    <form v-else @submit.prevent="saveSettings" class="settings-form">
      <!-- Tabs Navigation -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Business Information -->
      <section v-show="activeTab === 'business'" class="settings-section">
        <h2>Business Information</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="business_name">Business Name</label>
            <input
              id="business_name"
              v-model="form.business_name"
              type="text"
              placeholder="Your Dealership Name"
            />
          </div>

          <div class="form-group">
            <label for="tagline">Tagline</label>
            <input
              id="tagline"
              v-model="form.tagline"
              type="text"
              placeholder="Your trusted automotive partner"
            />
          </div>

          <div class="form-group full-width">
            <label for="description">Business Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              placeholder="Tell visitors about your business..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="phone">Primary Phone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="(555) 123-4567"
            />
          </div>

          <div class="form-group">
            <label for="phone_secondary">Secondary Phone</label>
            <input
              id="phone_secondary"
              v-model="form.phone_secondary"
              type="tel"
              placeholder="(555) 987-6543"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="sales@yourdealership.com"
            />
          </div>

          <div class="form-group full-width">
            <label for="address">Street Address</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              placeholder="123 Main Street"
            />
          </div>

          <div class="form-group">
            <label for="city">City</label>
            <input
              id="city"
              v-model="form.city"
              type="text"
              placeholder="City"
            />
          </div>

          <div class="form-group">
            <label for="state">State</label>
            <input
              id="state"
              v-model="form.state"
              type="text"
              placeholder="State"
            />
          </div>

          <div class="form-group">
            <label for="zip">ZIP Code</label>
            <input
              id="zip"
              v-model="form.zip"
              type="text"
              placeholder="12345"
            />
          </div>
        </div>
      </section>

      <!-- Branding -->
      <section v-show="activeTab === 'branding'" class="settings-section">
        <h2>Branding</h2>

        <div class="branding-uploads">
          <div class="upload-card">
            <h3>Logo</h3>
            <div class="upload-preview" :class="{ 'has-image': form.logo_url }">
              <img v-if="form.logo_url" :src="form.logo_url" :alt="form.logo_alt_text || 'Logo'" />
              <div v-else class="upload-placeholder">
                <span class="icon">🖼️</span>
                <p>No logo uploaded</p>
              </div>
            </div>
            <input
              type="file"
              ref="logoInput"
              @change="uploadLogo"
              accept="image/*"
              hidden
            />
            <div class="upload-actions">
              <button type="button" class="btn btn-secondary" @click="$refs.logoInput.click()">
                {{ form.logo_url ? 'Change Logo' : 'Upload Logo' }}
              </button>
              <button v-if="form.logo_url" type="button" class="btn btn-danger" @click="removeLogo">
                Remove
              </button>
            </div>
            <div class="form-group">
              <label for="logo_alt_text">Logo Alt Text</label>
              <input
                id="logo_alt_text"
                v-model="form.logo_alt_text"
                type="text"
                placeholder="Your Business Name Logo"
              />
            </div>
          </div>

          <div class="upload-card">
            <h3>Favicon</h3>
            <div class="upload-preview favicon-preview" :class="{ 'has-image': form.favicon_url }">
              <img v-if="form.favicon_url" :src="form.favicon_url" alt="Favicon" />
              <div v-else class="upload-placeholder">
                <span class="icon">🔖</span>
                <p>No favicon uploaded</p>
              </div>
            </div>
            <input
              type="file"
              ref="faviconInput"
              @change="uploadFavicon"
              accept=".ico,.png,.svg"
              hidden
            />
            <div class="upload-actions">
              <button type="button" class="btn btn-secondary" @click="$refs.faviconInput.click()">
                {{ form.favicon_url ? 'Change Favicon' : 'Upload Favicon' }}
              </button>
            </div>
            <p class="help-text">Recommended: 32x32 PNG or ICO file</p>
          </div>
        </div>
      </section>

      <!-- Colors -->
      <section v-show="activeTab === 'colors'" class="settings-section">
        <h2>Color Scheme</h2>
        <p class="section-description">Define your brand colors for a consistent look across your website</p>

        <div class="color-grid">
          <div class="color-group">
            <h3>Primary Colors</h3>
            <div class="color-inputs">
              <div class="form-group color-picker">
                <label for="primary_color">Primary Color</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="primary_color"
                    v-model="form.primary_color"
                  />
                  <input
                    type="text"
                    v-model="form.primary_color"
                    placeholder="#2563EB"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-group color-picker">
                <label for="secondary_color">Secondary Color</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="secondary_color"
                    v-model="form.secondary_color"
                  />
                  <input
                    type="text"
                    v-model="form.secondary_color"
                    placeholder="#64748B"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-group color-picker">
                <label for="accent_color">Accent Color</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="accent_color"
                    v-model="form.accent_color"
                  />
                  <input
                    type="text"
                    v-model="form.accent_color"
                    placeholder="#F59E0B"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h3>Text & Background</h3>
            <div class="color-inputs">
              <div class="form-group color-picker">
                <label for="text_color">Text Color</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="text_color"
                    v-model="form.text_color"
                  />
                  <input
                    type="text"
                    v-model="form.text_color"
                    placeholder="#1F2937"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-group color-picker">
                <label for="background_color">Background Color</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="background_color"
                    v-model="form.background_color"
                  />
                  <input
                    type="text"
                    v-model="form.background_color"
                    placeholder="#FFFFFF"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h3>Header Colors</h3>
            <div class="color-inputs">
              <div class="form-group color-picker">
                <label for="header_bg_color">Header Background</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="header_bg_color"
                    v-model="form.header_bg_color"
                  />
                  <input
                    type="text"
                    v-model="form.header_bg_color"
                    placeholder="#1F2937"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-group color-picker">
                <label for="header_text_color">Header Text</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="header_text_color"
                    v-model="form.header_text_color"
                  />
                  <input
                    type="text"
                    v-model="form.header_text_color"
                    placeholder="#FFFFFF"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="color-group">
            <h3>Footer Colors</h3>
            <div class="color-inputs">
              <div class="form-group color-picker">
                <label for="footer_bg_color">Footer Background</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="footer_bg_color"
                    v-model="form.footer_bg_color"
                  />
                  <input
                    type="text"
                    v-model="form.footer_bg_color"
                    placeholder="#111827"
                    maxlength="7"
                  />
                </div>
              </div>

              <div class="form-group color-picker">
                <label for="footer_text_color">Footer Text</label>
                <div class="color-input-wrapper">
                  <input
                    type="color"
                    id="footer_text_color"
                    v-model="form.footer_text_color"
                  />
                  <input
                    type="text"
                    v-model="form.footer_text_color"
                    placeholder="#9CA3AF"
                    maxlength="7"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Color Preview -->
        <div class="color-preview">
          <h3>Preview</h3>
          <div class="preview-container" :style="previewStyles">
            <div class="preview-header" :style="headerStyles">
              <span>Your Header</span>
              <nav>Home | Inventory | Contact</nav>
            </div>
            <div class="preview-content">
              <h4>Sample Content</h4>
              <p>This is how your website colors will look.</p>
              <button class="preview-btn" :style="buttonStyles">View Inventory</button>
            </div>
            <div class="preview-footer" :style="footerStyles">
              <span>Footer content goes here</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Typography -->
      <section v-show="activeTab === 'typography'" class="settings-section">
        <h2>Typography</h2>
        <p class="section-description">Choose fonts that match your brand personality</p>

        <div class="form-grid">
          <div class="form-group">
            <label for="heading_font">Heading Font</label>
            <select id="heading_font" v-model="form.heading_font">
              <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="heading_font_weight">Heading Weight</label>
            <select id="heading_font_weight" v-model="form.heading_font_weight">
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi-bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="body_font">Body Font</label>
            <select id="body_font" v-model="form.body_font">
              <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="body_font_weight">Body Weight</label>
            <select id="body_font_weight" v-model="form.body_font_weight">
              <option value="300">Light (300)</option>
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="base_font_size">Base Font Size</label>
            <select id="base_font_size" v-model="form.base_font_size">
              <option value="14px">Small (14px)</option>
              <option value="16px">Normal (16px)</option>
              <option value="18px">Large (18px)</option>
            </select>
          </div>
        </div>

        <!-- Font Preview -->
        <div class="font-preview" :style="fontPreviewStyles">
          <h3 :style="{ fontFamily: form.heading_font, fontWeight: form.heading_font_weight }">
            Heading Preview - {{ form.heading_font }}
          </h3>
          <p :style="{ fontFamily: form.body_font, fontWeight: form.body_font_weight, fontSize: form.base_font_size }">
            Body text preview - This is what your paragraph text will look like using {{ form.body_font }} font.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </section>

      <!-- Social Media -->
      <section v-show="activeTab === 'social'" class="settings-section">
        <h2>Social Media</h2>
        <p class="section-description">Connect your social media accounts</p>

        <div class="form-grid">
          <div class="form-group">
            <label for="facebook_url">
              <span class="social-icon">📘</span> Facebook
            </label>
            <input
              id="facebook_url"
              v-model="form.facebook_url"
              type="url"
              placeholder="https://facebook.com/yourdealership"
            />
          </div>

          <div class="form-group">
            <label for="instagram_url">
              <span class="social-icon">📷</span> Instagram
            </label>
            <input
              id="instagram_url"
              v-model="form.instagram_url"
              type="url"
              placeholder="https://instagram.com/yourdealership"
            />
          </div>

          <div class="form-group">
            <label for="youtube_url">
              <span class="social-icon">🎬</span> YouTube
            </label>
            <input
              id="youtube_url"
              v-model="form.youtube_url"
              type="url"
              placeholder="https://youtube.com/@yourdealership"
            />
          </div>

          <div class="form-group">
            <label for="twitter_url">
              <span class="social-icon">🐦</span> Twitter/X
            </label>
            <input
              id="twitter_url"
              v-model="form.twitter_url"
              type="url"
              placeholder="https://twitter.com/yourdealership"
            />
          </div>

          <div class="form-group">
            <label for="linkedin_url">
              <span class="social-icon">💼</span> LinkedIn
            </label>
            <input
              id="linkedin_url"
              v-model="form.linkedin_url"
              type="url"
              placeholder="https://linkedin.com/company/yourdealership"
            />
          </div>

          <div class="form-group">
            <label for="tiktok_url">
              <span class="social-icon">🎵</span> TikTok
            </label>
            <input
              id="tiktok_url"
              v-model="form.tiktok_url"
              type="url"
              placeholder="https://tiktok.com/@yourdealership"
            />
          </div>

          <div class="form-group">
            <label for="ebay_url">
              <span class="social-icon">🛒</span> eBay Motors
            </label>
            <input
              id="ebay_url"
              v-model="form.ebay_url"
              type="url"
              placeholder="https://ebay.com/usr/yourdealership"
            />
          </div>
        </div>
      </section>

      <!-- SEO -->
      <section v-show="activeTab === 'seo'" class="settings-section">
        <h2>SEO Settings</h2>
        <p class="section-description">Default SEO settings for your website</p>

        <div class="form-grid">
          <div class="form-group full-width">
            <label for="meta_title">
              Default Meta Title
              <span class="char-count" :class="{ warning: (form.meta_title?.length || 0) > 60 }">
                {{ form.meta_title?.length || 0 }}/70
              </span>
            </label>
            <input
              id="meta_title"
              v-model="form.meta_title"
              type="text"
              maxlength="70"
              placeholder="Your Dealership | Quality Pre-Owned Vehicles"
            />
          </div>

          <div class="form-group full-width">
            <label for="meta_description">
              Default Meta Description
              <span class="char-count" :class="{ warning: (form.meta_description?.length || 0) > 150 }">
                {{ form.meta_description?.length || 0 }}/160
              </span>
            </label>
            <textarea
              id="meta_description"
              v-model="form.meta_description"
              rows="3"
              maxlength="160"
              placeholder="Browse our selection of quality pre-owned vehicles. Competitive financing available."
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="meta_keywords">Meta Keywords</label>
            <input
              id="meta_keywords"
              v-model="form.meta_keywords"
              type="text"
              placeholder="used cars, car dealer, financing, auto sales"
            />
            <p class="help-text">Comma-separated keywords (less important for modern SEO)</p>
          </div>

          <div class="form-group full-width">
            <label for="og_image_url">Default Social Share Image</label>
            <input
              id="og_image_url"
              v-model="form.og_image_url"
              type="url"
              placeholder="https://yourdomain.com/social-image.jpg"
            />
            <p class="help-text">Recommended: 1200x630 pixels</p>
          </div>
        </div>
      </section>

      <!-- Analytics -->
      <section v-show="activeTab === 'analytics'" class="settings-section">
        <h2>Analytics & Tracking</h2>
        <p class="section-description">Connect your analytics and tracking tools</p>

        <div class="form-grid">
          <div class="form-group">
            <label for="google_analytics_id">Google Analytics ID</label>
            <input
              id="google_analytics_id"
              v-model="form.google_analytics_id"
              type="text"
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div class="form-group">
            <label for="google_tag_manager_id">Google Tag Manager ID</label>
            <input
              id="google_tag_manager_id"
              v-model="form.google_tag_manager_id"
              type="text"
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div class="form-group">
            <label for="facebook_pixel_id">Facebook Pixel ID</label>
            <input
              id="facebook_pixel_id"
              v-model="form.facebook_pixel_id"
              type="text"
              placeholder="XXXXXXXXXXXXXXXX"
            />
          </div>
        </div>

        <div class="code-injection">
          <h3>Custom Code Injection</h3>
          <p class="section-description">Add custom code to your website (use with caution)</p>

          <div class="form-group full-width">
            <label for="custom_head_code">Custom Head Code</label>
            <textarea
              id="custom_head_code"
              v-model="form.custom_head_code"
              rows="4"
              placeholder="<!-- Add custom scripts or styles to the <head> -->"
              class="code-input"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="custom_body_start_code">Custom Body Start Code</label>
            <textarea
              id="custom_body_start_code"
              v-model="form.custom_body_start_code"
              rows="4"
              placeholder="<!-- Add custom code after opening <body> tag -->"
              class="code-input"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="custom_body_end_code">Custom Body End Code</label>
            <textarea
              id="custom_body_end_code"
              v-model="form.custom_body_end_code"
              rows="4"
              placeholder="<!-- Add custom code before closing </body> tag -->"
              class="code-input"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTenantAuthStore } from '../stores/tenantAuth'
import api from '../api/client'

const auth = useTenantAuthStore()

const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const activeTab = ref('business')

const fonts = ref([
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Source Sans Pro', 'Raleway', 'Nunito', 'Playfair Display',
  'Oswald', 'Merriweather', 'PT Sans', 'Ubuntu', 'Rubik',
  'Work Sans', 'Quicksand', 'Barlow', 'DM Sans', 'Outfit'
])

const tabs = [
  { id: 'business', label: 'Business Info', icon: '🏢' },
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'colors', label: 'Colors', icon: '🌈' },
  { id: 'typography', label: 'Typography', icon: '🔤' },
  { id: 'social', label: 'Social Media', icon: '📱' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
]

const form = ref({
  business_name: '',
  tagline: '',
  description: '',
  phone: '',
  phone_secondary: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  logo_url: '',
  logo_alt_text: '',
  favicon_url: '',
  primary_color: '#2563EB',
  secondary_color: '#64748B',
  accent_color: '#F59E0B',
  text_color: '#1F2937',
  background_color: '#FFFFFF',
  header_bg_color: '#1F2937',
  header_text_color: '#FFFFFF',
  footer_bg_color: '#111827',
  footer_text_color: '#9CA3AF',
  heading_font: 'Inter',
  body_font: 'Inter',
  heading_font_weight: '700',
  body_font_weight: '400',
  base_font_size: '16px',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  twitter_url: '',
  linkedin_url: '',
  tiktok_url: '',
  ebay_url: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_image_url: '',
  google_analytics_id: '',
  google_tag_manager_id: '',
  facebook_pixel_id: '',
  custom_head_code: '',
  custom_body_start_code: '',
  custom_body_end_code: '',
})

const previewStyles = computed(() => ({
  backgroundColor: form.value.background_color,
  color: form.value.text_color,
}))

const headerStyles = computed(() => ({
  backgroundColor: form.value.header_bg_color,
  color: form.value.header_text_color,
}))

const footerStyles = computed(() => ({
  backgroundColor: form.value.footer_bg_color,
  color: form.value.footer_text_color,
}))

const buttonStyles = computed(() => ({
  backgroundColor: form.value.primary_color,
  color: '#FFFFFF',
}))

const fontPreviewStyles = computed(() => ({
  fontFamily: form.value.body_font,
}))

async function loadSettings() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/site-settings')
    if (response.data.data) {
      Object.assign(form.value, response.data.data)
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load settings'
    console.error('Error loading settings:', err)
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await api.put('/site-settings', form.value)
    alert('Settings saved successfully!')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save settings')
    console.error('Error saving settings:', err)
  } finally {
    saving.value = false
  }
}

async function uploadLogo(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('logo', file)

  try {
    const response = await api.post('/site-settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.value.logo_url = response.data.data.logo_url
    alert('Logo uploaded successfully!')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to upload logo')
    console.error('Error uploading logo:', err)
  }
}

async function uploadFavicon(event) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('favicon', file)

  try {
    const response = await api.post('/site-settings/favicon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    form.value.favicon_url = response.data.data.favicon_url
    alert('Favicon uploaded successfully!')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to upload favicon')
    console.error('Error uploading favicon:', err)
  }
}

function removeLogo() {
  form.value.logo_url = ''
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.site-settings {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.page-header .subtitle {
  color: #6B7280;
  margin-top: 0.5rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #6B7280;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

.tab-btn.active {
  background: #EFF6FF;
  color: #2563EB;
}

.tab-icon {
  font-size: 1.1rem;
}

.settings-section {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #E5E7EB;
  margin-bottom: 1.5rem;
}

.settings-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.section-description {
  color: #6B7280;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.help-text {
  font-size: 0.75rem;
  color: #6B7280;
}

.char-count {
  font-weight: 400;
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-left: auto;
}

.char-count.warning {
  color: #F59E0B;
}

/* Branding */
.branding-uploads {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.upload-card {
  background: #F9FAFB;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.upload-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.upload-preview {
  width: 100%;
  height: 150px;
  background: #fff;
  border: 2px dashed #D1D5DB;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1rem;
}

.upload-preview.has-image {
  border-style: solid;
}

.upload-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.favicon-preview {
  height: 100px;
}

.upload-placeholder {
  text-align: center;
  color: #9CA3AF;
}

.upload-placeholder .icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.upload-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* Colors */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.color-group {
  background: #F9FAFB;
  border-radius: 0.5rem;
  padding: 1rem;
}

.color-group h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #374151;
}

.color-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.color-picker {
  gap: 0.25rem !important;
}

.color-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input-wrapper input[type="color"] {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  cursor: pointer;
}

.color-input-wrapper input[type="text"] {
  flex: 1;
  font-family: monospace;
}

.color-preview {
  margin-top: 2rem;
}

.color-preview h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.preview-container {
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #E5E7EB;
}

.preview-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header nav {
  font-size: 0.875rem;
}

.preview-content {
  padding: 2rem;
}

.preview-content h4 {
  margin: 0 0 0.5rem 0;
}

.preview-content p {
  margin: 0 0 1rem 0;
}

.preview-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.preview-footer {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Typography */
.font-preview {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
}

.font-preview h3 {
  margin: 0 0 1rem 0;
}

.font-preview p {
  margin: 0;
  line-height: 1.6;
}

/* Social */
.social-icon {
  font-size: 1rem;
}

/* Code injection */
.code-injection {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E5E7EB;
}

.code-injection h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.code-input {
  font-family: monospace;
  font-size: 0.8125rem;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background: #2563EB;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1D4ED8;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border-color: #D1D5DB;
}

.btn-secondary:hover {
  background: #F9FAFB;
}

.btn-danger {
  background: #fff;
  color: #DC2626;
  border-color: #DC2626;
}

.btn-danger:hover {
  background: #FEF2F2;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
}
</style>
