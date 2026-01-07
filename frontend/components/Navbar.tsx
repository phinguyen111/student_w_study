'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Moon, Sun, User, LogOut, Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import logoImage from '@/components/logo.png'
import api from '@/lib/api'
import { usePathname } from 'next/navigation'

interface QuizAssignmentSummary {
  _id: string
  isSubmitted?: boolean
  isExpired?: boolean
  canSubmit?: boolean
}

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [pendingAssignments, setPendingAssignments] = useState<number | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const fetchPendingAssignments = async () => {
      if (!isAuthenticated) {
        setPendingAssignments(null)
        return
      }

      try {
        const response = await api.get('/progress/quiz-assignments')
        const assignments: QuizAssignmentSummary[] = response.data.assignments || []

        const pendingCount = assignments.filter((assignment) => {
          if (assignment.isSubmitted) return false
          if (assignment.isExpired) return false
          if (typeof assignment.canSubmit === 'boolean') {
            return assignment.canSubmit
          }
          return true
        }).length

        setPendingAssignments(pendingCount)

        // Cache value for faster perceived load on next visits
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('pendingAssignments', String(pendingCount))
        }
      } catch (error) {
        console.error('Error fetching pending assignments for navbar:', error)
      }
    }

    // Try to restore cached value immediately for faster UI
    if (typeof window !== 'undefined') {
      const cached = window.sessionStorage.getItem('pendingAssignments')
      if (cached !== null) {
        const parsed = Number(cached)
        if (!Number.isNaN(parsed)) {
          setPendingAssignments(parsed)
        }
      }
    }

    // Then refresh from API in background
    fetchPendingAssignments()
  }, [isAuthenticated])

  useEffect(() => {
    const handleAssignmentCompleted = () => {
      setPendingAssignments((prev) => {
        if (prev === null || prev <= 0) return prev
        return prev - 1
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('quiz-assignment-completed', handleAssignmentCompleted)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('quiz-assignment-completed', handleAssignmentCompleted)
      }
    }
  }, [])

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm dark:shadow-none dark:border-border/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="relative w-9 h-9 group-hover:scale-105 transition-transform">
              <Image
                src={logoImage}
                alt="Code Catalyst Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <span className="whitespace-nowrap text-sm min-[360px]:text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] dark:from-[hsl(185_85%_55%)] dark:via-[hsl(210_65%_60%)] dark:to-[hsl(250_65%_60%)] bg-clip-text text-transparent">
              Code Catalyst
            </span>
          </Link>

          <div className="flex items-center justify-end gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:bg-accent/50"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </Button>
            )}

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/learn">
                    <Button variant="ghost">Learn</Button>
                  </Link>
                  <Link href="/assignments">
                    <Button variant="ghost" className="relative">
                      Assignments
                      {pendingAssignments !== null && pendingAssignments > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full border border-primary bg-background text-primary text-[10px] min-w-[18px] h-[18px] px-1">
                          {pendingAssignments > 9 ? '9+' : pendingAssignments}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost">
                      <User className="h-4 w-4 mr-2" />
                      <span className="max-w-[10rem] truncate sm:max-w-none">{user?.name}</span>
                    </Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="ghost">Admin</Button>
                    </Link>
                  )}
                  <Button variant="ghost" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
              )}
            </div>

            {/* Mobile nav toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
            >
              {mobileNavOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile nav panel */}
        <div
          id="mobile-nav"
          className={
            mobileNavOpen
              ? 'lg:hidden pb-3'
              : 'hidden'
          }
        >
          <div className="mt-2 rounded-xl border border-border/60 bg-card/80 p-2 shadow-sm">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link href="/learn" className="flex">
                <Button variant="ghost" className="w-full justify-start">
                  Learn
                </Button>
              </Link>
              <Link href="/assignments" className="flex">
                <Button variant="ghost" className="w-full justify-start">
                  <span className="flex-1 text-left">Assignments</span>
                  {pendingAssignments !== null && pendingAssignments > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full border border-primary bg-background text-primary text-[10px] min-w-[18px] h-[18px] px-1">
                      {pendingAssignments > 9 ? '9+' : pendingAssignments}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/profile" className="flex">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  <span className="truncate">{user?.name}</span>
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="flex">
                  <Button variant="ghost" className="w-full justify-start">
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setMobileNavOpen(false)
                  logout()
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="flex">
                <Button variant="ghost" className="w-full justify-start">
                  Login
                </Button>
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  )
}



