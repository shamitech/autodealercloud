'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [tenantName, setTenantName] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('sessionToken')
    const tenantId = localStorage.getItem('tenantId')
    if (!session || !tenantId) {
      router.push('/login')
    }
  }, [router])

  return (
    <main style={{ padding: '40px', background: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Dashboard</h1>
          <button
            onClick={() => {
              localStorage.clear()
              router.push('/login')
            }}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Welcome to Your CMS</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            You are now logged in. More features coming soon.
          </p>
        </div>
      </div>
    </main>
  )
}
