import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantAuthStore } from '@/stores/tenantAuth'
import { getCurrentSubdomain, validateTenant } from '@/utils/tenant'

// Views
import LoginView from '@/views/LoginView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PublicStorefrontView from '@/views/PublicStorefrontView.vue'
import DashboardView from '@/views/DashboardView.vue'
import PlatformDashboardView from '@/views/PlatformDashboardView.vue'
import TenantsView from '@/views/TenantsView.vue'
import UsersView from '@/views/UsersView.vue'
import DomainsView from '@/views/DomainsView.vue'
import TenantDomainsView from '@/views/TenantDomainsView.vue'
import ProductsView from '@/views/ProductsView.vue'
import LightspeedView from '@/views/LightspeedView.vue'
import ProfileView from '@/views/ProfileView.vue'
// Website Builder Views
import SiteSettingsView from '@/views/SiteSettingsView.vue'
import PagesView from '@/views/PagesView.vue'
import PageEditorView from '@/views/PageEditorView.vue'
import NavigationView from '@/views/NavigationView.vue'
import SectionsView from '@/views/SectionsView.vue'
import ProductSettingsView from '@/views/ProductSettingsView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordView,
    meta: { public: true },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { public: true },
  },
  {
    path: '/not-found',
    name: 'NotFound',
    component: NotFoundView,
    meta: { public: true, skipTenantValidation: true },
  },
  // Public storefront - accessible without login
  {
    path: '/',
    name: 'Storefront',
    component: PublicStorefrontView,
    meta: { public: true },
  },
  // Admin routes - all require authentication
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/platform',
    name: 'PlatformDashboard',
    component: PlatformDashboardView,
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/admin/tenants',
    name: 'Tenants',
    component: TenantsView,
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/admin/users',
    name: 'Users',
    component: UsersView,
    meta: { requiresAuth: true, roles: ['admin', 'superadmin'] },
  },
  {
    path: '/admin/domains',
    name: 'Domains',
    component: DomainsView,
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/admin/products',
    name: 'Products',
    component: ProductsView,
    meta: { requiresAuth: true, roles: ['admin', 'member', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/lightspeed',
    name: 'Lightspeed',
    component: LightspeedView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/tenant-domains',
    name: 'TenantDomains',
    component: TenantDomainsView,
    meta: { requiresAuth: true, roles: ['admin', 'member', 'editor'], skipTenantValidation: false },
  },
  // Website Builder Routes
  {
    path: '/admin/site-settings',
    name: 'SiteSettings',
    component: SiteSettingsView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/pages',
    name: 'Pages',
    component: PagesView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/pages/:id/edit',
    name: 'PageEditor',
    component: PageEditorView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/navigation',
    name: 'Navigation',
    component: NavigationView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/sections',
    name: 'Sections',
    component: SectionsView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/product-settings',
    name: 'ProductSettings',
    component: ProductSettingsView,
    meta: { requiresAuth: true, roles: ['admin', 'editor'], skipTenantValidation: false },
  },
  {
    path: '/admin/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const platformAuthStore = useAuthStore()
  const tenantAuthStore = useTenantAuthStore()
  const subdomain = getCurrentSubdomain()
  
  // Use the appropriate auth store based on context
  const authStore = subdomain ? tenantAuthStore : platformAuthStore

  // Check if we're on a tenant subdomain and validate it exists
  if (subdomain && !to.meta.skipTenantValidation) {
    const isTenantValid = await validateTenant(subdomain)
    if (!isTenantValid) {
      next('/not-found')
      return
    }
  }

  // Check if user is logged in
  if (!authStore.isAuthenticated && authStore.token) {
    // Token exists but user not loaded, fetch user data
    const success = await authStore.fetchCurrentUser()
    if (!success) {
      next('/login')
      return
    }
  }

  // Public routes - allow unauthenticated access
  if (to.meta.public) {
    if (authStore.isAuthenticated) {
      // Redirect authenticated users away from login to appropriate dashboard
      // Platform admins go to /admin/platform, tenant users go to /admin/dashboard
      if (!subdomain && platformAuthStore.isPlatformAdmin) {
        next('/admin/platform')
      } else if (subdomain) {
        next('/admin/dashboard')
      }
    } else {
      // Allow public access to public routes (like storefront)
      next()
    }
    return
  }

  // Protected routes
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // Role-based access
    if (to.meta.roles && to.meta.roles.length > 0) {
      const hasRequiredRole = to.meta.roles.some(
        (role) => authStore.user?.role === role
      )
      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on role
        if (!subdomain && platformAuthStore.isPlatformAdmin) {
          next('/admin/platform')
        } else if (subdomain) {
          next('/admin/dashboard')
        }
        return
      }
    }

    next()
    return
  }

  next()
})

export default router
