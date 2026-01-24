import type { Metadata } from 'next'
import { Navigation } from './components/navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Admin Dashboard - AutoDealerCloud',
  description: 'Admin panel for AutoDealerCloud management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
