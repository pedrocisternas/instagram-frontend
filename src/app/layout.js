import { Inter } from 'next/font/google'
import './globals.css'
import { ClientHeroProvider } from '@/components/layout/ClientHeroProvider'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Instagram Analytics Dashboard',
  description: 'Dashboard de análisis de métricas de Instagram',
}

// Layout del servidor (sin 'use client')
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientHeroProvider>{children}</ClientHeroProvider>
      </body>
    </html>
  )
}
