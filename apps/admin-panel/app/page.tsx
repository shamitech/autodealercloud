import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <p className="text-gray-300 mb-8">
        Welcome to the AutoDealerCloud admin panel. This is where you manage tenants, create components, and configure the platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tenant Management */}
        <div className="bg-gray-800 p-8 rounded-lg hover:border-blue-600 border border-gray-700 transition">
          <h2 className="text-2xl font-bold mb-4">Tenant Management</h2>
          <p className="text-gray-400 mb-6">Create and manage tenant accounts</p>
          <Link href="/tenants">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded w-full">
              Manage Tenants
            </button>
          </Link>
        </div>

        {/* User Management */}
        <div className="bg-gray-800 p-8 rounded-lg hover:border-blue-600 border border-gray-700 transition">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <p className="text-gray-400 mb-6">Create and manage user accounts</p>
          <Link href="/users">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded w-full">
              Manage Users
            </button>
          </Link>
        </div>

        {/* Analytics */}
        <div className="bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Analytics</h2>
          <p className="text-gray-400 mb-6">View platform and tenant analytics</p>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
            View Analytics
          </button>
        </div>

        {/* Domain Management */}
        <div className="bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Domain Management</h2>
          <p className="text-gray-400 mb-6">Manage auth and pub domains</p>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded">
            Manage Domains
          </button>
        </div>
      </div>
    </main>
  )
}
