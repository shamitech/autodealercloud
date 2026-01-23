import { DomainManagement } from '@/app/components/domain-management'

export default function DomainsPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Domain Management</h1>
          <p className="text-gray-400">Manage custom domains, auth domains, and publish domains</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <DomainManagement />
        </div>
      </div>
    </main>
  )
}
