import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Login - Tenant CMS',
}

export default function LoginPage() {
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Tenant CMS Login</h1>
      <form method="POST" action="/api/login" style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
        <h2>Sign In</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input type="email" name="email" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input type="password" name="password" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sign In</button>
      </form>
      <p>Demo: Enter any credentials to continue</p>
    </div>
  )
}


