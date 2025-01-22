import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Instagram Analytics Dashboard',
  description: 'Dashboard de análisis de métricas de Instagram',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Aquí irá nuestro Layout principal */}
          {children}
        </div>
      </body>
    </html>
  )
}
