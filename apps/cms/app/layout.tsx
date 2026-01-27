'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, tenant, setUser, setTenant } = useAuthStore()

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          router.push('/login')
          return
        }

        // In a real app, validate token with API
        const stored = localStorage.getItem('user')
        if (stored) {
          setUser(JSON.parse(stored))
        }
        const storedTenant = localStorage.getItem('tenant')
        if (storedTenant) {
          setTenant(JSON.parse(storedTenant))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, setUser, setTenant])

  if (!user || !tenant) {
    return null
  }

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <nav className="w-64 bg-gray-900 text-white p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold">{tenant.name}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            <ul className="space-y-2">
              <li>
                <Link
                  href="/pages"
                  className="block px-4 py-2 rounded hover:bg-gray-800"
                >
                  📄 Pages
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="block px-4 py-2 rounded hover:bg-gray-800"
                >
                  📋 Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/components"
                  className="block px-4 py-2 rounded hover:bg-gray-800"
                >
                  🧩 Components
                </Link>
              </li>
              <li>
                <Link
                  href="/users"
                  className="block px-4 py-2 rounded hover:bg-gray-800"
                >
                  👥 Users
                </Link>
              </li>
              <li>
                <Link
                  href="/assets"
                  className="block px-4 py-2 rounded hover:bg-gray-800"
                >
                  📦 Assets
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className="block px-4 py-2 rounded hover:bg-gray-800"
                >
                  ⚙️ Settings
                </Link>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-gray-700">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  localStorage.removeItem('user')
                  localStorage.removeItem('tenant')
                  router.push('/login')
                }}
                className="w-full px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
