import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import PlatformDashboardView from '@/views/PlatformDashboardView.vue'
import TenantsView from '@/views/TenantsView.vue'
import UsersView from '@/views/UsersView.vue'
import DomainsView from '@/views/DomainsView.vue'
import ProductsView from '@/views/ProductsView.vue'
import LightspeedView from '@/views/LightspeedView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['user'] },
  },
  {
    path: '/platform',
    name: 'PlatformDashboard',
    component: PlatformDashboardView,
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/tenants',
    name: 'Tenants',
    component: TenantsView,
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/users',
    name: 'Users',
    component: UsersView,
    meta: { requiresAuth: true, roles: ['admin', 'superadmin'] },
  },
  {
    path: '/domains',
    name: 'Domains',
    component: DomainsView,
    meta: { requiresAuth: true, roles: ['superadmin', 'admin'] },
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/lightspeed',
    name: 'Lightspeed',
    component: LightspeedView,
    meta: { requiresAuth: true, roles: ['admin', 'editor', 'superadmin'] },
  },
  {
    path: '/profile',
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
  const authStore = useAuthStore()

  // Check if user is logged in
  if (!authStore.isAuthenticated && authStore.token) {
    // Token exists but user not loaded, fetch user data
    const success = await authStore.fetchCurrentUser()
    if (!success) {
      next('/login')
      return
    }
  }

  // Public routes
  if (to.meta.public) {
    if (authStore.isAuthenticated) {
      next('/')
    } else {
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
        next('/') // Redirect to dashboard if no required role
        return
      }
    }
  }

  next()
})

export default router
