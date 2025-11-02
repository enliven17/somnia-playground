import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/contexts/ToastContext'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Somnia Playground',
  description: 'Smart Contract Playground for Somnia Testnet',
  icons: {
    icon: '/playground.ico',
    shortcut: '/playground.ico',
    apple: '/playground.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ToastProvider>
            <div className="min-h-screen relative">
              {/* Animated Background Particles */}
              <div className="bg-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
              {children}
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}