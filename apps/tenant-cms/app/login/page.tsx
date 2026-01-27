import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Login - Tenant CMS',
}

export default function LoginPage() {
  return redirect('/api/login')
}


