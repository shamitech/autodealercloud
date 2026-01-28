'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      setIsLoggedIn(!!token);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">AutoDealerCloud Admin</h1>
              {isLoggedIn && (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/tenants" className="text-gray-600 hover:text-gray-900">
                    Tenants
                  </Link>
                </>
              )}
            </div>
            {isLoggedIn && (
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-8 px-4">{children}</main>
      </body>
    </html>
  );
}
