'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path ? 'bg-blue-600' : 'hover:bg-gray-700'

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400">
              AutoDealerCloud
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded text-white transition ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              href="/tenants"
              className={`px-4 py-2 rounded text-white transition ${isActive('/tenants')}`}
            >
              Tenants
            </Link>
            <Link
              href="/users"
              className={`px-4 py-2 rounded text-white transition ${isActive('/users')}`}
            >
              Users
            </Link>
            <Link
              href="/domains"
              className={`px-4 py-2 rounded text-white transition ${isActive('/domains')}`}
            >
              Domains
            </Link>
            <Link
              href="/analytics"
              className={`px-4 py-2 rounded text-white transition ${isActive('/analytics')}`}
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
