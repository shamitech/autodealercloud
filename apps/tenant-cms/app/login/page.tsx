import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function LoginForm() {
  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .subtitle {
          text-align: center;
          color: #666;
          margin: 0 0 30px 0;
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
        button:hover { opacity: 0.9; }
        .demo-notice {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      `}</style>

      <div className="login-container">
        <h1>Tenant CMS</h1>
        <p className="subtitle">Sign in to your account</p>
        
        <form method="POST" action="/api/auth/login">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              placeholder="you@example.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit">Sign In</button>
        </form>
        
        <div className="demo-notice">
          <p><strong>Contact your admin for login credentials</strong></p>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}


