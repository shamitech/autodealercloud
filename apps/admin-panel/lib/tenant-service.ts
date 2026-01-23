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
    const data = Array.isArray(response.data) ? response.data : [response.data]
    return (data as Tenant[])
  }

  async getTenant(id: string): Promise<Tenant> {
    const response = await apiClient.get<TenantResponse>(`/tenants/${id}`)
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    return (data as Tenant)
  }

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.post<TenantResponse>('/tenants', data)
    const result = Array.isArray(response.data) ? response.data[0] : response.data
    return (result as Tenant)
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiClient.put<TenantResponse>(`/tenants/${id}`, data)
    const result = Array.isArray(response.data) ? response.data[0] : response.data
    return (result as Tenant)
  }

  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`)
  }
}

export const tenantService = new TenantService()
