import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from './useAuth'

export function useActivityTracker() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const lastVisibilityChangeRef = useRef<number | null>(null)
  const lastPageUrlRef = useRef<string>('')
  const isVisibleRef = useRef<boolean>(true)

  // Track activity
  const trackActivity = useCallback(async (
    action: 'tab_switch_away' | 'tab_switch_back' | 'page_leave' | 'page_visit' | 'window_blur' | 'window_focus',
    duration?: number
  ) => {
    if (!isAuthenticated) return

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
      const pageTitle = typeof document !== 'undefined' ? document.title : ''

      await api.post('/activity/track', {
        action,
        pageUrl,
        pageTitle,
        duration: duration || 0,
        metadata: {
          pathname,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Error tracking activity:', error)
    }
  }, [isAuthenticated, pathname])

  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return

    // Track initial page visit
    lastPageUrlRef.current = window.location.href
    trackActivity('page_visit')

    // Handle visibility change (tab switch, minimize window, etc.)
    const handleVisibilityChange = () => {
      const now = Date.now()

      if (document.hidden) {
        // Tab switched away or window minimized
        if (isVisibleRef.current) {
          isVisibleRef.current = false
          lastVisibilityChangeRef.current = now
          trackActivity('tab_switch_away')
        }
      } else {
        // Tab switched back or window restored
        if (!isVisibleRef.current && lastVisibilityChangeRef.current) {
          const duration = now - lastVisibilityChangeRef.current
          isVisibleRef.current = true
          lastVisibilityChangeRef.current = null
          
          // Only track if duration > 1 second
          if (duration > 1000) {
            trackActivity('tab_switch_back', duration)
          }
        }
      }
    }

    // Handle window blur/focus (when switching between windows/apps)
    const handleBlur = () => {
      if (isVisibleRef.current) {
        isVisibleRef.current = false
        lastVisibilityChangeRef.current = Date.now()
        trackActivity('window_blur')
      }
    }

    const handleFocus = () => {
      if (!isVisibleRef.current && lastVisibilityChangeRef.current) {
        const duration = Date.now() - lastVisibilityChangeRef.current
        isVisibleRef.current = true
        
        // Only track if duration > 1 second
        if (duration > 1000) {
          trackActivity('window_focus', duration)
        }
        lastVisibilityChangeRef.current = null
      }
    }

    // Handle page leave (beforeunload)
    const handleBeforeUnload = () => {
      if (isVisibleRef.current) {
        trackActivity('page_leave')
      } else if (lastVisibilityChangeRef.current) {
        // If tab was switched away, track the duration
        const duration = Date.now() - lastVisibilityChangeRef.current
        trackActivity('page_leave', duration)
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isAuthenticated, trackActivity])

  // Track page changes (pathname changes)
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return

    const currentUrl = window.location.href
    
    // If pathname changed, track the change
    if (lastPageUrlRef.current && lastPageUrlRef.current !== currentUrl) {
      // Only track page_leave if tab is visible
      if (isVisibleRef.current) {
        trackActivity('page_leave')
      }
      
      // Track new page visit after a short delay
      setTimeout(() => {
        trackActivity('page_visit')
        lastPageUrlRef.current = currentUrl
      }, 100)
    } else if (!lastPageUrlRef.current) {
      // Initial page load - already tracked in first useEffect
      lastPageUrlRef.current = currentUrl
    }
  }, [pathname, isAuthenticated, trackActivity])

  return {
    trackActivity
  }
}

