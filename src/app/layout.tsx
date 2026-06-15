// src/app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Deep Creative Marka101',
  description: 'Markanızın algı, konumlandırma ve dijital güven seviyesini ölçün.',
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="tr" className={poppins.variable}>
      <head>
        {/* Material Symbols Outlined — Stitch icon sistemi */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${poppins.className} antialiased bg-background text-on-background`}>
        {children}
      </body>
    </html>
  )
}
