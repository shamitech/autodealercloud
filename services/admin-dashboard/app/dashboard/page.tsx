'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Tenants</h3>
          <p className="text-4xl font-bold text-blue-600">0</p>
          <p className="text-gray-600">Active dealerships</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Pages Published</h3>
          <p className="text-4xl font-bold text-green-600">0</p>
          <p className="text-gray-600">Live pages</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <p className="text-green-600 font-semibold">Operational</p>
          <p className="text-gray-600">All services running</p>
        </div>
      </div>
    </div>
  );
}
