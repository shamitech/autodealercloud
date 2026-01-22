import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Tenant CMS - AutoDealerCloud',
  description: 'Web builder and CMS for your auto dealer website',
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
