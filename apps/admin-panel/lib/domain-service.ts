import { apiClient } from './api-client'

export interface CustomDomain {
  id: string
  tenantId: string
  domain: string
  verified: boolean
  sslEnabled: boolean
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
    const response = await apiClient.get<DomainResponse>('/custom-domains')
    const data = Array.isArray(response.data) ? response.data : [response.data]
    return (data as CustomDomain[])
  }

  async createCustomDomain(tenantId: string, domain: string): Promise<CustomDomain> {
    const response = await apiClient.post<DomainResponse>('/custom-domains', {
      tenantId,
      domain,
    })
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    return (data as CustomDomain)
  }

  async deleteCustomDomain(id: string): Promise<void> {
    await apiClient.delete(`/custom-domains/${id}`)
  }

  async getAuthDomains(): Promise<AuthDomain[]> {
    const response = await apiClient.get<DomainResponse>('/auth-domains')
    const data = Array.isArray(response.data) ? response.data : [response.data]
    return (data as AuthDomain[])
  }

  async createAuthDomain(domain: string, description?: string): Promise<AuthDomain> {
    const response = await apiClient.post<DomainResponse>('/auth-domains', {
      domain,
      description,
    })
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    return (data as AuthDomain)
  }

  async deleteAuthDomain(id: string): Promise<void> {
    await apiClient.delete(`/auth-domains/${id}`)
  }

  async getPublishDomains(): Promise<PublishDomain[]> {
    const response = await apiClient.get<DomainResponse>('/publish-domains')
    const data = Array.isArray(response.data) ? response.data : [response.data]
    return (data as PublishDomain[])
  }

  async createPublishDomain(domain: string, description?: string): Promise<PublishDomain> {
    const response = await apiClient.post<DomainResponse>('/publish-domains', {
      domain,
      description,
    })
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    return (data as PublishDomain)
  }

  async deletePublishDomain(id: string): Promise<void> {
    await apiClient.delete(`/publish-domains/${id}`)
  }
}

export const domainService = new DomainService()
