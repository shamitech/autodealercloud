import { AnalyticsOverview } from '@/app/components/analytics-overview'

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">View platform and tenant analytics</p>
        </div>

        <AnalyticsOverview />
      </div>
    </main>
  )
}
