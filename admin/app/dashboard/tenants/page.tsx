'use client';

import { useState } from 'react';
import TenantForm from '../components/TenantForm';
import TenantList from '../components/TenantList';

export default function TenantsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTenantCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Tenants</h2>
        <p className="text-gray-600">
          Manage your tenants and their configurations
        </p>
      </div>

      <TenantForm onTenantCreated={handleTenantCreated} />

      <TenantList refreshTrigger={refreshTrigger} />
    </div>
  );
}
