import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata = {
  title: 'AO-Black Market',
  description: 'Get Profit With AO Black Market By Lbot',
  icons: {
    icon: '/favicon.ico',  
    shortcut: '/favicon.png',  
    apple: '/favicon.png',      
  },
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
