import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Login - Tenant CMS',
}

export default function LoginPage() {
  return (
    <html>
      <head>
        <title>Login - Tenant CMS</title>
        <style>{`
          body {
            font-family: Arial, sans-serif;
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
          }
          form {
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
          }
          input {
            display: block;
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
          }
          button {
            display: block;
            width: 100%;
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #0056b3;
          }
        `}</style>
      </head>
      <body>
        <h1>Tenant CMS Login</h1>
        <form method="POST" action="/api/login">
          <h2>Sign In</h2>
          <label>Email:</label>
          <input type="email" name="email" required />
          <label>Password:</label>
          <input type="password" name="password" required />
          <button type="submit">Sign In</button>
        </form>
        <p>Demo: Enter any credentials to continue</p>
      </body>
    </html>
  )
}


