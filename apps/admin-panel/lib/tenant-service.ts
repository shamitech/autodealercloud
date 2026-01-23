import { apiClient } from './api-client'

export interface Tenant {
  id: string
  name: string
  email?: string
  slug?: string
  plan?: string
  status?: 'active' | 'suspended' | 'cancelled'
  createdAt: string
  updatedAt?: string
}

export interface TenantResponse {
  success: boolean
  data: Tenant | Tenant[]
}

class TenantService {
  async getTenants(): Promise<Tenant[]> {
    const response = await apiClient.get<TenantResponse>('/tenants')
    return Array.isArray(response.data) ? response.data : [response.data]
  }

  async getTenant(id: string): Promise<Tenant> {
    const response = await apiClient.get<TenantResponse>(`/tenants/${id}`)
    return Array.isArray(response.data) ? response.data[0] : response.data
  }

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.post<TenantResponse>('/tenants', data)
    return Array.isArray(response.data) ? response.data[0] : response.data
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.put<TenantResponse>(`/tenants/${id}`, data)
    return Array.isArray(response.data) ? response.data[0] : response.data
  }

  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`)
  }
}

export const tenantService = new TenantService()
