import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@entrepreneur/shared/ui'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Public Portal',
  description: 'Profile management portal for public users',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
