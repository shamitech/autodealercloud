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
    <html>
      <head>
        <title>Tenant CMS Login</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: 100%; height: 100%; font-family: system-ui, -apple-system, sans-serif; }
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .login-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 400px;
            padding: 40px;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
          }
          input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
          }
          input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 10px;
          }
          button:hover:not(:disabled) { opacity: 0.9; }
          button:disabled { opacity: 0.6; cursor: not-allowed; }
          .demo-notice {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .error {
            background-color: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #fcc;
            font-size: 14px;
            display: none;
          }
          .error.show { display: block; }
        `}</style>
      </head>
      <body>
        <div className="login-container">
          <h1>Tenant CMS</h1>
          <p className="subtitle">Sign in to your account</p>
          {error && <div className="error show">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required 
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading || !slug}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="demo-notice">
            <p><strong>Contact your admin for login credentials</strong></p>
          </div>
        </div>
      </body>
    </html>
  )
}


