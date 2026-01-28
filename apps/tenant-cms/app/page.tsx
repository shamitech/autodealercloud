'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('sessionToken')
    if (!session) {
      router.push('/login')
    }
  }, [router])

  return (
    <div style={{ padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h1>CMS Dashboard</h1>
      <p>Welcome to your tenant CMS</p>
      <button onClick={() => { localStorage.clear(); router.push('/login'); }} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  )
}
