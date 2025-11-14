import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Code Catalyst - Full Stack Learning Platform',
  description: 'Learn HTML, CSS, JavaScript and more',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



