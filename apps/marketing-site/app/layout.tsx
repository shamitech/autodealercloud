import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoDealerCloud - Professional Dealership Websites',
  description: 'Create stunning, fully-featured dealership websites without coding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
