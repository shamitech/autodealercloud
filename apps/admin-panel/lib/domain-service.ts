import { apiClient } from './api-client'

export interface CustomDomain {
  id: string
  tenantId: string
  domain: string
  deployed: boolean
  dnsVerified: boolean
  dnsRecord?: string
  createdAt: string
}

export interface AuthDomain {
  id: string
  domain: string
  description?: string
  createdAt: string
}

export interface PublishDomain {
  id: string
  domain: string
  description?: string
  createdAt: string
}

export interface DomainResponse {
  success: boolean
  data: CustomDomain | CustomDomain[] | AuthDomain | AuthDomain[] | PublishDomain | PublishDomain[]
}

class DomainService {
  async getCustomDomains(): Promise<CustomDomain[]> {
    const response = await apiClient.get<any>('/custom-domains')
    // API returns { success: true, data: [...] }
    const domains = response.data || []
    return Array.isArray(domains) ? domains : []
  }

  async createCustomDomain(tenantId: string, domain: string): Promise<CustomDomain> {
    const response = await apiClient.post<any>('/custom-domains', {
      tenantId,
      domain,
    })
    return response.data
  }

  async deleteCustomDomain(id: string): Promise<void> {
    await apiClient.delete(`/custom-domains/${id}`)
  }

  async getAuthDomains(): Promise<AuthDomain[]> {
    const response = await apiClient.get<any>('/auth-domains')
    const domains = response.data || []
    return Array.isArray(domains) ? domains : []
  }

  async createAuthDomain(domain: string, description?: string): Promise<AuthDomain> {
    const response = await apiClient.post<any>('/auth-domains', {
      domain,
      description,
    })
    return response.data
  }

  async deleteAuthDomain(id: string): Promise<void> {
    await apiClient.delete(`/auth-domains/${id}`)
  }

  async getPublishDomains(): Promise<PublishDomain[]> {
    const response = await apiClient.get<any>('/publish-domains')
    const domains = response.data || []
    return Array.isArray(domains) ? domains : []
  }

  async createPublishDomain(domain: string, description?: string): Promise<PublishDomain> {
    const response = await apiClient.post<any>('/publish-domains', {
      domain,
      description,
    })
    return response.data
  }

  async deletePublishDomain(id: string): Promise<void> {
    await apiClient.delete(`/publish-domains/${id}`)
  }

  async previewCustomDomainConfig(id: string): Promise<{ domain: string; baseDomain: string; config: string }> {
    const response = await apiClient.get<any>(`/custom-domains/${id}/preview-config`)
    return response
  }

  async deployCustomDomain(id: string): Promise<{ success: boolean; message?: string; ssl?: string; error?: string }> {
    const response = await apiClient.post<any>(`/custom-domains/${id}/deploy`, {})
    return response
  }

  async generateDnsRecord(id: string): Promise<{ success: boolean; dnsRecord?: string; dnsName?: string; error?: string }> {
    const response = await apiClient.post<any>(`/custom-domains/${id}/generate-dns`, {})
    return response
  }

  async verifyDnsRecord(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiClient.post<any>(`/custom-domains/${id}/verify-dns`, {})
    return response
  }
}

export const domainService = new DomainService()
