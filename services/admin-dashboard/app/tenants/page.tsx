'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api-client';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getTenants();
      setTenants(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await adminApi.deleteTenant(id);
      setTenants(tenants.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete tenant');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Link href="/tenants/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Tenant
        </Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">{tenant.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{tenant.slug}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{tenant.email}</td>
                <td className="px-6 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-right space-x-2">
                  <Link href={`/tenants/${tenant.id}`} className="text-blue-600 hover:text-blue-900">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(tenant.id)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tenants.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No tenants yet. <Link href="/tenants/new" className="text-blue-600 hover:text-blue-900">Create one</Link>
          </div>
        )}
      </div>
    </div>
  );
}
