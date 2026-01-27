'use client'

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to CMS</h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your pages, templates, and components from here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📄 Pages</h3>
            <p className="text-gray-600">Create and manage your website pages</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📋 Templates</h3>
            <p className="text-gray-600">Build reusable page layouts</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">🧩 Components</h3>
            <p className="text-gray-600">Create custom UI components</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">👥 Users</h3>
            <p className="text-gray-600">Manage your team members</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📦 Assets</h3>
            <p className="text-gray-600">Upload and organize media</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
            <p className="text-gray-600">Configure your workspace</p>
          </div>
        </div>
      </div>
    </div>
  )
}
