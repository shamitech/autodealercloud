'use client'

import { useState, useEffect } from 'react'
import { TenantAnalytics, analyticsService } from '@/lib/analytics-service'

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<TenantAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getTenantAnalytics()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  const totalEvents = analytics.reduce((sum, a) => sum + (a.eventCount || 0), 0)
  const totalVisitors = analytics.reduce((sum, a) => sum + (a.uniqueVisitors || 0), 0)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
          <div className="text-gray-400 text-sm font-medium mb-2">Total Events</div>
          <div className="text-4xl font-bold text-white">{totalEvents.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mt-2">Across all tenants</div>
        </div>
        
        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
          <div className="text-gray-400 text-sm font-medium mb-2">Unique Visitors</div>
          <div className="text-4xl font-bold text-white">{totalVisitors.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mt-2">Platform wide</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-bold">Tenant Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-700">
                <th className="py-3 px-6 text-sm font-semibold text-gray-300">Tenant ID</th>
                <th className="py-3 px-6 text-sm font-semibold text-gray-300">Events</th>
                <th className="py-3 px-6 text-sm font-semibold text-gray-300">Visitors</th>
                <th className="py-3 px-6 text-sm font-semibold text-gray-300">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((a) => (
                <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                  <td className="py-4 px-6 text-sm font-mono text-gray-300">
                    {a.tenantId.substring(0, 12)}...
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {(a.eventCount || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-white">
                    {(a.uniqueVisitors || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-400">
                    {new Date(a.lastUpdated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No analytics data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
