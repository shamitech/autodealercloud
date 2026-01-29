'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Tenant {
  id: string;
  businessName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  businessSlug: string;
}

interface TenantListProps {
  refreshTrigger?: number;
}

export default function TenantList({ refreshTrigger = 0 }: TenantListProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tenants');

        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }

        const data = await response.json();
        setTenants(data);
        setError('');
      } catch (err) {
        setError('Failed to load tenants');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, [refreshTrigger]);

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading tenants...</div>;
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-3 text-red-700">{error}</div>;
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-md bg-gray-50 p-8 text-center text-gray-500">
        No tenants yet. Create your first tenant to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Business Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Contact Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Business Slug
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/dashboard/tenants/${tenant.businessSlug}`}
            >
              <tr className="hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {tenant.businessName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tenant.primaryContactName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tenant.primaryContactEmail}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tenant.primaryContactPhone}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                  {tenant.businessSlug}
                </td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  );
}
