'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Extract tenant slug from subdomain (e.g., testsite3-auth.autodealercloud.com -> testsite3)
  const getTenantSlug = () => {
    if (typeof window === 'undefined') return ''
    const host = window.location.hostname
    const match = host.match(/^(.*?)-auth\./)
    return match ? match[1] : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slug = getTenantSlug()
    if (!slug) {
      setError('Invalid tenant subdomain')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/tenant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })

      const data = await res.json()

      if (res.ok && data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken)
        localStorage.setItem('tenantId', data.tenantId)
        router.push('/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', maxWidth: '400px', width: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '24px', color: '#333' }}>Tenant CMS</h1>
        <p style={{ marginBottom: '30px', color: '#666', fontSize: '14px' }}>Enter your temporary password</p>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}
