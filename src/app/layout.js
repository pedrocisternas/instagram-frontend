import { Inter } from 'next/font/google'
import './globals.css'
import { ClientHeroProvider } from '@/components/layout/ClientHeroProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Instagram Analytics Dashboard',
  description: 'Dashboard de análisis de métricas de Instagram',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
}

// Layout del servidor (sin 'use client')
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <ClientHeroProvider>
            <div className="flex">
              <Sidebar />
              <div className="flex-1 ml-16 transition-all duration-300">
                {children}
              </div>
            </div>
          </ClientHeroProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
