import { getSession } from '@/lib/auth';

export default async function Dashboard() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">456</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$12.5K</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">3.2%</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-2 text-gray-600">
          Welcome to the Admin Dashboard! This is a basic layout to get you started.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Session ID: {session.userId}
        </p>
      </div>
    </div>
  );
}
