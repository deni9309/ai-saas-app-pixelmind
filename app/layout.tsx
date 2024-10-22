import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'

import './globals.css'
import { cn } from '@/lib/utils'

const IBMPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
})

export const metadata: Metadata = {
  title: 'PixelMind',
  description: 'AI-powered Image Generator',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={cn('font-IBMPlex antialiased', IBMPlex.variable)}>{children}</body>
    </html>
  )
}
