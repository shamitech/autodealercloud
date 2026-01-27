'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TenantCMS() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    if (!token) {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [router])

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
