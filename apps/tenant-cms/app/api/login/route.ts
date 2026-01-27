export async function GET() {
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>Login - Tenant CMS</title>
  <style>
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
  </style>
</head>
<body>
  <h1>Tenant CMS Login</h1>
  <form method="POST" action="/api/auth">
    <h2>Sign In</h2>
    <label>Email:</label>
    <input type="email" name="email" required />
    <label>Password:</label>
    <input type="password" name="password" required />
    <button type="submit">Sign In</button>
  </form>
  <p>Demo: Enter any credentials to continue</p>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  )
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  // For demo purposes, accept any email/password
  if (email && password) {
    // Redirect to home or dashboard
    return Response.redirect('/dashboard', 302)
  }

  return Response.redirect('/login', 302)
}
