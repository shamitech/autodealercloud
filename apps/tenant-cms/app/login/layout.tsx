import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return {
    robots: 'noindex, nofollow',
  }
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
