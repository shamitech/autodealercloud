<template>
  <div class="product-settings">
    <header class="page-header">
      <h1>Product Display Settings</h1>
      <p class="subtitle">Configure how your inventory is displayed on your website</p>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading settings...</p>
    </div>

    <div v-else class="settings-content">
      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Display Settings -->
      <section v-show="activeTab === 'display'" class="settings-section">
        <h2>Inventory Listing</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Default View</label>
            <select v-model="displaySettings.default_view">
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </div>

          <div class="form-group">
            <label>Products Per Page</label>
            <select v-model="displaySettings.products_per_page">
              <option :value="12">12</option>
              <option :value="16">16</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
              <option :value="48">48</option>
            </select>
          </div>

          <div class="form-group">
            <label>Default Sort</label>
            <select v-model="displaySettings.default_sort">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="name_desc">Name: Z-A</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        <h3>Grid Settings</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Desktop Columns</label>
            <select v-model="displaySettings.grid_columns_desktop">
              <option :value="2">2 Columns</option>
              <option :value="3">3 Columns</option>
              <option :value="4">4 Columns</option>
              <option :value="5">5 Columns</option>
              <option :value="6">6 Columns</option>
            </select>
          </div>

          <div class="form-group">
            <label>Tablet Columns</label>
            <select v-model="displaySettings.grid_columns_tablet">
              <option :value="1">1 Column</option>
              <option :value="2">2 Columns</option>
              <option :value="3">3 Columns</option>
              <option :value="4">4 Columns</option>
            </select>
          </div>

          <div class="form-group">
            <label>Mobile Columns</label>
            <select v-model="displaySettings.grid_columns_mobile">
              <option :value="1">1 Column</option>
              <option :value="2">2 Columns</option>
            </select>
          </div>
        </div>

        <h3>Product Card Display</h3>
        <div class="checkbox-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_price" />
            <span>Show Price</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_msrp" />
            <span>Show MSRP</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_savings" />
            <span>Show Savings</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_stock_status" />
            <span>Show Stock Status</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_year" />
            <span>Show Year</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_make" />
            <span>Show Make</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_model" />
            <span>Show Model</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_condition" />
            <span>Show Condition</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_mileage" />
            <span>Show Mileage</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_vin" />
            <span>Show VIN</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_stock_number" />
            <span>Show Stock Number</span>
          </label>
        </div>
      </section>

      <!-- Pricing Settings -->
      <section v-show="activeTab === 'pricing'" class="settings-section">
        <h2>Pricing Display</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Price Prefix</label>
            <input v-model="displaySettings.price_prefix" type="text" placeholder="$" />
          </div>

          <div class="form-group">
            <label>Price Suffix</label>
            <input v-model="displaySettings.price_suffix" type="text" placeholder="or best offer" />
          </div>

          <div class="form-group full-width">
            <label>Call for Price Text</label>
            <input v-model="displaySettings.call_for_price_text" type="text" placeholder="Call for Price" />
          </div>
        </div>

        <h3>Payment Calculator</h3>
        <div class="form-grid">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="displaySettings.show_monthly_payment" />
              <span>Show Monthly Payment Estimate</span>
            </label>
          </div>

          <div class="form-group">
            <label>Default Interest Rate (%)</label>
            <input v-model.number="displaySettings.default_interest_rate" type="number" step="0.1" min="0" max="30" />
          </div>

          <div class="form-group">
            <label>Default Loan Term (months)</label>
            <select v-model="displaySettings.default_loan_term">
              <option :value="24">24 months</option>
              <option :value="36">36 months</option>
              <option :value="48">48 months</option>
              <option :value="60">60 months</option>
              <option :value="72">72 months</option>
              <option :value="84">84 months</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Detail Page Settings -->
      <section v-show="activeTab === 'detail'" class="settings-section">
        <h2>Product Detail Page</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Gallery Style</label>
            <select v-model="displaySettings.gallery_style">
              <option value="slider">Slider</option>
              <option value="grid">Grid</option>
              <option value="thumbnails">Thumbnails</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="displaySettings.show_image_zoom" />
              <span>Enable Image Zoom</span>
            </label>
          </div>
        </div>

        <h3>Similar Products</h3>
        <div class="form-grid">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="displaySettings.show_similar_products" />
              <span>Show Similar Products</span>
            </label>
          </div>

          <div class="form-group">
            <label>Number of Similar Products</label>
            <input v-model.number="displaySettings.similar_products_count" type="number" min="2" max="12" />
          </div>
        </div>

        <h3>Actions</h3>
        <div class="checkbox-grid">
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_share_buttons" />
            <span>Show Share Buttons</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_print_button" />
            <span>Show Print Button</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_call_button" />
            <span>Show Call Button</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="displaySettings.show_text_button" />
            <span>Show Text/SMS Button</span>
          </label>
        </div>

        <h3>Call-to-Action Buttons</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Primary CTA Text</label>
            <input v-model="displaySettings.primary_cta_text" type="text" placeholder="Check Availability" />
          </div>

          <div class="form-group">
            <label>Secondary CTA Text</label>
            <input v-model="displaySettings.secondary_cta_text" type="text" placeholder="Schedule Test Drive" />
          </div>
        </div>
      </section>

      <!-- Sold Products Settings -->
      <section v-show="activeTab === 'sold'" class="settings-section">
        <h2>Sold Product Behavior</h2>
        <p class="section-description">
          Configure what happens when visitors access a sold product page. This is critical for SEO - 
          properly handling sold products prevents 404 errors that can hurt your search rankings.
        </p>
        
        <div class="behavior-options">
          <label class="behavior-option" :class="{ selected: soldSettings.sold_behavior === 'archive' }">
            <input type="radio" v-model="soldSettings.sold_behavior" value="archive" />
            <div class="option-content">
              <span class="option-icon">⭐</span>
              <div>
                <strong>Archive (Recommended)</strong>
                <p>Keep the page live, mark as sold, show similar products. Best for SEO.</p>
              </div>
            </div>
          </label>

          <label class="behavior-option" :class="{ selected: soldSettings.sold_behavior === 'sold_page' }">
            <input type="radio" v-model="soldSettings.sold_behavior" value="sold_page" />
            <div class="option-content">
              <span class="option-icon">📄</span>
              <div>
                <strong>Sold Page</strong>
                <p>Show a "Vehicle Sold" page with similar inventory.</p>
              </div>
            </div>
          </label>

          <label class="behavior-option" :class="{ selected: soldSettings.sold_behavior === 'redirect_inventory' }">
            <input type="radio" v-model="soldSettings.sold_behavior" value="redirect_inventory" />
            <div class="option-content">
              <span class="option-icon">🔄</span>
              <div>
                <strong>Redirect to Inventory</strong>
                <p>301 redirect to main inventory page.</p>
              </div>
            </div>
          </label>

          <label class="behavior-option" :class="{ selected: soldSettings.sold_behavior === 'redirect_category' }">
            <input type="radio" v-model="soldSettings.sold_behavior" value="redirect_category" />
            <div class="option-content">
              <span class="option-icon">📁</span>
              <div>
                <strong>Redirect to Category</strong>
                <p>301 redirect to the product's category page.</p>
              </div>
            </div>
          </label>

          <label class="behavior-option" :class="{ selected: soldSettings.sold_behavior === 'redirect_homepage' }">
            <input type="radio" v-model="soldSettings.sold_behavior" value="redirect_homepage" />
            <div class="option-content">
              <span class="option-icon">🏠</span>
              <div>
                <strong>Redirect to Homepage</strong>
                <p>301 redirect to homepage.</p>
              </div>
            </div>
          </label>
        </div>

        <h3>Sold Badge Appearance</h3>
        <div class="form-grid">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="soldSettings.show_sold_badge" />
              <span>Show Sold Badge</span>
            </label>
          </div>

          <div class="form-group">
            <label>Badge Text</label>
            <input v-model="soldSettings.sold_badge_text" type="text" placeholder="SOLD" />
          </div>

          <div class="form-group">
            <label>Badge Color</label>
            <input v-model="soldSettings.sold_badge_color" type="color" />
          </div>
        </div>

        <h3>Sold Page Content</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Page Title</label>
            <input v-model="soldSettings.sold_page_title" type="text" placeholder="Vehicle Sold" />
          </div>

          <div class="form-group full-width">
            <label>Message</label>
            <textarea v-model="soldSettings.sold_page_message" rows="2" placeholder="This vehicle has been sold. Check out similar vehicles below."></textarea>
          </div>
        </div>

        <h3>Similar Products on Sold Page</h3>
        <div class="form-grid">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="soldSettings.show_similar_on_sold" />
              <span>Show Similar Products</span>
            </label>
          </div>

          <div class="form-group">
            <label>Number of Products</label>
            <input v-model.number="soldSettings.similar_count_on_sold" type="number" min="2" max="12" />
          </div>

          <div class="form-group">
            <label>Match By</label>
            <select v-model="soldSettings.similar_matching">
              <option value="same_category">Same Category</option>
              <option value="same_make">Same Make</option>
              <option value="price_range">Similar Price Range</option>
              <option value="featured">Featured Products</option>
            </select>
          </div>
        </div>

        <h3>SEO Settings</h3>
        <div class="seo-warning">
          <strong>⚠️ Important for SEO:</strong> These settings help maintain your search rankings when products are sold.
        </div>
        <div class="form-grid">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="soldSettings.keep_sold_indexed" />
              <span>Keep Sold Products Indexed</span>
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="soldSettings.add_sold_schema" />
              <span>Add OutOfStock Schema Markup</span>
            </label>
          </div>

          <div class="form-group">
            <label>Days Before Noindex</label>
            <input v-model.number="soldSettings.days_before_noindex" type="number" min="0" max="365" />
            <p class="help-text">Set to 0 to never add noindex. Recommended: 90 days.</p>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="soldSettings.add_canonical_to_category" />
              <span>Add Canonical to Category Page</span>
            </label>
          </div>
        </div>
      </section>

      <!-- SEO Settings -->
      <section v-show="activeTab === 'seo'" class="settings-section">
        <h2>Product Page SEO</h2>
        
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Product Title Format</label>
            <input v-model="displaySettings.product_title_format" type="text" placeholder="{year} {make} {model} | {dealership}" />
            <p class="help-text">Available: {'{year}'}, {'{make}'}, {'{model}'}, {'{trim}'}, {'{vin}'}, {'{stock}'}, {'{dealership}'}</p>
          </div>

          <div class="form-group full-width">
            <label>Meta Description Format</label>
            <textarea v-model="displaySettings.product_meta_description_format" rows="2" placeholder="Shop this {year} {make} {model} at {dealership}. {description}"></textarea>
          </div>

          <div class="form-group full-width">
            <label>Product URL Format</label>
            <select v-model="displaySettings.product_url_format">
              <option value="{year}-{make}-{model}-{id}">{'{year}'}-{'{make}'}-{'{model}'}-{'{id}'}</option>
              <option value="{make}-{model}-{stock}">{'{make}'}-{'{model}'}-{'{stock}'}</option>
              <option value="{id}">{'{id}'}</option>
              <option value="{vin}">{'{vin}'}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/client'

const loading = ref(true)
const saving = ref(false)
const activeTab = ref('display')

const tabs = [
  { id: 'display', label: 'Display', icon: '🖼️' },
  { id: 'pricing', label: 'Pricing', icon: '💰' },
  { id: 'detail', label: 'Detail Page', icon: '📄' },
  { id: 'sold', label: 'Sold Products', icon: '🏷️' },
  { id: 'seo', label: 'SEO', icon: '🔍' },
]

const displaySettings = ref({
  default_view: 'grid',
  products_per_page: 12,
  default_sort: 'newest',
  grid_columns_desktop: 4,
  grid_columns_tablet: 2,
  grid_columns_mobile: 1,
  show_price: true,
  show_msrp: false,
  show_savings: true,
  show_stock_status: true,
  show_year: true,
  show_make: true,
  show_model: true,
  show_condition: true,
  show_mileage: true,
  show_vin: false,
  show_stock_number: false,
  gallery_style: 'slider',
  show_image_zoom: true,
  show_similar_products: true,
  similar_products_count: 4,
  show_share_buttons: true,
  show_print_button: true,
  price_prefix: '$',
  price_suffix: '',
  call_for_price_text: 'Call for Price',
  show_monthly_payment: true,
  default_interest_rate: 6.9,
  default_loan_term: 60,
  primary_cta_text: 'Check Availability',
  secondary_cta_text: 'Schedule Test Drive',
  show_call_button: true,
  show_text_button: true,
  product_title_format: '{year} {make} {model}',
  product_meta_description_format: '',
  product_url_format: '{year}-{make}-{model}-{id}',
})

const soldSettings = ref({
  sold_behavior: 'archive',
  sold_page_title: 'Vehicle Sold',
  sold_page_message: 'This vehicle has been sold. Check out similar vehicles below.',
  show_sold_badge: true,
  sold_badge_text: 'SOLD',
  sold_badge_color: '#DC2626',
  show_similar_on_sold: true,
  similar_count_on_sold: 4,
  similar_matching: 'same_category',
  keep_sold_indexed: true,
  add_sold_schema: true,
  days_before_noindex: 90,
  add_canonical_to_category: true,
})

async function loadSettings() {
  loading.value = true
  try {
    const [displayRes, soldRes] = await Promise.all([
      api.get('/product-settings/display'),
      api.get('/product-settings/sold'),
    ])
    
    if (displayRes.data.data) {
      Object.assign(displaySettings.value, displayRes.data.data)
    }
    if (soldRes.data.data) {
      Object.assign(soldSettings.value, soldRes.data.data)
    }
  } catch (err) {
    console.error('Error loading settings:', err)
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await Promise.all([
      api.put('/product-settings/display', displaySettings.value),
      api.put('/product-settings/sold', soldSettings.value),
    ])
    alert('Settings saved successfully!')
  } catch (err) {
    console.error('Error saving settings:', err)
    alert(err.response?.data?.error || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.product-settings {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.page-header .subtitle {
  color: #6B7280;
  margin: 0 0 2rem 0;
}

.loading-state {
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
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.625rem 1rem;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #F9FAFB;
}

.tab-btn.active {
  background: #2563EB;
  color: #fff;
  border-color: #2563EB;
}

.settings-section {
  background: #fff;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.settings-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.settings-section h3:first-of-type {
  border-top: none;
  padding-top: 0;
}

.section-description {
  color: #6B7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563EB;
}

.form-group input[type="color"] {
  padding: 0.25rem;
  height: 38px;
  cursor: pointer;
}

.help-text {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.checkbox-group {
  flex-direction: row !important;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
}

/* Behavior Options */
.behavior-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.behavior-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.behavior-option:hover {
  border-color: #9CA3AF;
}

.behavior-option.selected {
  border-color: #2563EB;
  background: #EFF6FF;
}

.behavior-option input {
  margin-top: 0.25rem;
}

.option-content {
  display: flex;
  gap: 0.75rem;
}

.option-icon {
  font-size: 1.5rem;
}

.option-content strong {
  display: block;
  margin-bottom: 0.25rem;
}

.option-content p {
  color: #6B7280;
  font-size: 0.875rem;
  margin: 0;
}

.seo-warning {
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
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

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>
