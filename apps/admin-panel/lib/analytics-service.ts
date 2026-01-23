import { apiClient } from './api-client'

export interface AnalyticsEvent {
  id: string
  tenantId?: string
  eventType: string
  eventData?: Record<string, any>
  createdAt: string
}

export interface TenantAnalytics {
  id: string
  tenantId: string
  eventCount: number
  uniqueVisitors: number
  lastUpdated: string
}

export interface AnalyticsResponse {
  success: boolean
  data: AnalyticsEvent | AnalyticsEvent[] | TenantAnalytics | TenantAnalytics[]
}

class AnalyticsService {
  async getTenantAnalytics(): Promise<TenantAnalytics[]> {
    const response = await apiClient.get<AnalyticsResponse>('/analytics')
    const data = Array.isArray(response.data) ? response.data : [response.data]
    return (data as TenantAnalytics[])
  }

  async getTenantAnalyticsById(tenantId: string): Promise<TenantAnalytics> {
    const response = await apiClient.get<AnalyticsResponse>(`/analytics/${tenantId}`)
    const data = Array.isArray(response.data) ? response.data[0] : response.data
    return (data as TenantAnalytics)
  }

  async getEvents(limit: number = 50): Promise<AnalyticsEvent[]> {
    const response = await apiClient.get<AnalyticsResponse>(`/analytics/events?limit=${limit}`)
    return Array.isArray(response.data) ? response.data : [response.data]
  }

  async trackEvent(eventType: string, eventData?: Record<string, any>): Promise<AnalyticsEvent> {
    const response = await apiClient.post<AnalyticsResponse>('/analytics/events', {
      eventType,
      eventData,
    })
    return Array.isArray(response.data) ? response.data[0] : response.data
  }
}

export const analyticsService = new AnalyticsService()
