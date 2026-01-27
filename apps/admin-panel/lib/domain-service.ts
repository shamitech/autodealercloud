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
    try {
      const response = await apiClient.post<any>('/custom-domains', {
        tenantId,
        domain,
      })
      
      // API returns { success: true, data: {...} }
      const domainData = response?.data
      
      if (domainData && domainData.id && domainData.domain) {
        return domainData
      }
      
      console.error('Invalid domain response structure:', response)
      throw new Error('API returned invalid domain data')
    } catch (error) {
      console.error('Error creating custom domain:', error)
      throw error
    }
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
    try {
      const response = await apiClient.post<any>('/auth-domains', {
        domain,
        description,
      })
      if (response && response.data) {
        return response.data
      }
      throw new Error('Invalid response from API')
    } catch (error) {
      console.error('Error creating auth domain:', error)
      throw error
    }
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
    try {
      const response = await apiClient.post<any>('/publish-domains', {
        domain,
        description,
      })
      if (response && response.data) {
        return response.data
      }
      throw new Error('Invalid response from API')
    } catch (error) {
      console.error('Error creating publish domain:', error)
      throw error
    }
  }

  async deletePublishDomain(id: string): Promise<void> {
    await apiClient.delete(`/publish-domains/${id}`)
  }

  async previewCustomDomainConfig(id: string): Promise<{ domain: string; baseDomain: string; config: string }> {
    try {
      const response = await apiClient.get<any>(`/custom-domains/${id}/preview-config`)
      
      // API returns { success: true, domain, baseDomain, config }
      if (response?.error) {
        throw new Error(response.error)
      }
      
      if (response?.domain && response?.config) {
        return {
          domain: response.domain,
          baseDomain: response.baseDomain || response.domain,
          config: response.config,
        }
      }
      
      throw new Error('Invalid response from API')
    } catch (error) {
      console.error('Error previewing config:', error)
      throw error
    }
  }

  async deployCustomDomain(id: string): Promise<{ success: boolean; message?: string; ssl?: string; error?: string }> {
    try {
      const response = await apiClient.post<any>(`/custom-domains/${id}/deploy`, {})
      if (response && response.data) {
        return response.data
      }
      return response || { success: false, error: 'Unknown error' }
    } catch (error) {
      console.error('Error deploying domain:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Deployment failed' }
    }
  }

  async redeployCustomDomain(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post<any>(`/custom-domains/${id}/redeploy`, {})
      if (response && response.data) {
        return response.data
      }
      return response || { success: false, error: 'Unknown error' }
    } catch (error) {
      console.error('Error redeploying domain:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Redeployment failed' }
    }
  }

  async generateDnsRecord(id: string): Promise<{ success: boolean; dnsRecord?: string; dnsName?: string; error?: string }> {
    try {
      const response = await apiClient.post<any>(`/custom-domains/${id}/generate-dns`, {})
      if (response && response.data) {
        return response.data
      }
      return response || { success: false, error: 'Unknown error' }
    } catch (error) {
      console.error('Error generating DNS record:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate DNS record' }
    }
  }

  async verifyDnsRecord(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.post<any>(`/custom-domains/${id}/verify-dns`, {})
      if (response && response.data) {
        return response.data
      }
      return response || { success: false, error: 'Unknown error' }
    } catch (error) {
      console.error('Error verifying DNS record:', error)
      return { success: false, error: error instanceof Error ? error.message : 'DNS verification failed' }
    }
  }
}

export const domainService = new DomainService()
