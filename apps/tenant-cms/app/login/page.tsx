'use client'

import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Extract slug from hostname (e.g., testsite3-auth.autodealercloud.com)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const match = hostname.match(/^(.*?)-auth\./)
      if (match) {
        setSlug(match[1])
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store session token and tenant ID in localStorage
      localStorage.setItem('sessionToken', data.sessionToken)
      localStorage.setItem('tenantId', data.tenantId)

      // Redirect to CMS dashboard
      window.location.href = `https://${slug}.autodealercloud.com/dashboard`
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '400px', padding: '40px' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px', fontSize: '28px' }}>Tenant CMS</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' }}>Sign in to your account</p>
      
      {error && <div style={{ backgroundColor: '#fee', color: '#c33', padding: '12px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #fcc', fontSize: '14px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: 500, fontSize: '14px' }} htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            required 
            disabled={loading}
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', fontWeight: 'normal' as const }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !slug}
          style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 600, cursor: loading || !slug ? 'not-allowed' : 'pointer', marginTop: '10px', opacity: (loading || !slug) ? 0.6 : 1 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <p><strong>Contact your admin for login credentials</strong></p>
      </div>
    </div>
  )
}


