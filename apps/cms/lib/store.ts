import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
}

interface Tenant {
  id: string
  slug: string
  name: string
}

interface AuthStore {
  user: User | null
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
  
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tenant: null,
  isLoading: true,
  error: null,
  
  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, tenant: null }),
}))
