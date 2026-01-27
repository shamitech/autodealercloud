'use client'

import { useAuthStore } from '@/lib/store'

export default function ComponentsPage() {
  const { tenant } = useAuthStore()

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Components</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + New Component
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>Components coming soon. Create and extend reusable UI components here.</p>
      </div>
    </div>
  )
}
