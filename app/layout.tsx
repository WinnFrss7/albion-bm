import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata = {
  title: 'Albion Black Market - Item Finder',
  description: 'Find items by tier, slot type, and enchantment level for Albion Online',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
