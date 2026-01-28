'use client'

import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [slug, setSlug] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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

      localStorage.setItem('sessionToken', data.sessionToken)
      localStorage.setItem('tenantId', data.tenantId)
      window.location.href = `https://${slug}.autodealercloud.com/dashboard`
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px',
        padding: '48px 32px',
        border: 'none'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', textAlign: 'center', color: '#1a202c' }}>
          Tenant CMS
        </h1>
        <p style={{ fontSize: '14px', color: '#718096', textAlign: 'center', margin: '0 0 32px 0' }}>
          Enter your password to sign in
        </p>

        {error && (
          <div style={{
            background: '#fed7d7',
            border: '1px solid #fc8181',
            color: '#c53030',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#2d3748'
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #cbd5e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !slug}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              fontWeight: '600',
              background: loading || !slug ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !slug ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: '#718096', textAlign: 'center', margin: '24px 0 0 0' }}>
          Contact your admin for credentials
        </p>
      </div>
    </div>
  )
}


