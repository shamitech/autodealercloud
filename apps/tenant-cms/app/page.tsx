'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TenantCMS() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    
    if (!token) {
      // Redirect to login if not authenticated
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Show nothing while checking auth or redirecting
  if (isAuthenticated === null) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main style={{ padding: '40px', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        Tenant CMS & Web Builder
      </h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
        Welcome to your CMS dashboard. This is a simple test version.
      </p>
      <p style={{ fontSize: '14px', color: '#999' }}>
        If you can see this page, the Next.js routing and dynamic rendering is working correctly.
      </p>
    </main>
  )
}
