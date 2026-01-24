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
    try {
      const response = await apiClient.get<any>('/custom-domains')
      // API returns { success: true, data: [...] }
      if (!response || !response.data) {
        console.warn('Invalid response from getCustomDomains:', response)
        return []
      }
      const domains = Array.isArray(response.data) ? response.data : []
      // Filter out any undefined or invalid items
      return domains.filter((d: any) => d && d.id && d.domain)
    } catch (error) {
      console.error('Error fetching custom domains:', error)
      return []
    }
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
    try {
      const response = await apiClient.get<any>('/auth-domains')
      if (!response || !response.data) return []
      const domains = Array.isArray(response.data) ? response.data : []
      return domains.filter((d: any) => d && d.id && d.domain)
    } catch (error) {
      console.error('Error fetching auth domains:', error)
      return []
    }
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
    try {
      const response = await apiClient.get<any>('/publish-domains')
      if (!response || !response.data) return []
      const domains = Array.isArray(response.data) ? response.data : []
      return domains.filter((d: any) => d && d.id && d.domain)
    } catch (error) {
      console.error('Error fetching publish domains:', error)
      return []
    }
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
