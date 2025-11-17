import { useEffect, useRef, useCallback, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from './useAuth'
import { sendGAEvent } from '@/lib/gaTracking'

interface QuizTrackerOptions {
  assignmentId?: string
  lessonId?: string
  quizType: 'assignment' | 'lesson'
  onSessionStart?: (sessionId: string) => void
}

export function useQuizTracker(options: QuizTrackerOptions) {
  const { assignmentId, lessonId, quizType, onSessionStart } = options
  const { isAuthenticated } = useAuth()
  
  const sessionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastVisibilityTimeRef = useRef<number | null>(null)
  const lastUrlRef = useRef<string>('')
  const isVisibleRef = useRef<boolean>(true)
  const isPageActiveRef = useRef<boolean>(true)
  const tabSwitchesRef = useRef<Array<{ url: string; timestamp: number; action: string }>>([])
  
  const [isTracking, setIsTracking] = useState(false)

  // Extract domain from URL
  const extractDomain = useCallback((url: string): string => {
    try {
      if (!url) return ''
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch (e) {
      return url
    }
  }, [])

  // Track event to backend
  const trackEvent = useCallback(async (
    action: 'switch_away' | 'switch_back' | 'window_blur' | 'window_focus',
    url?: string,
    title?: string
  ) => {
    if (!isAuthenticated || !sessionIdRef.current) return

    try {
      const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
      const pageTitle = title || (typeof document !== 'undefined' ? document.title : '')
      const timestamp = Date.now()

      await api.post('/quiz-tracking/track-event', {
        sessionId: sessionIdRef.current,
        action,
        url: currentUrl,
        title: pageTitle,
        currentUrl,
        timestamp: new Date(timestamp).toISOString()
      })

      // Store locally for reference
      tabSwitchesRef.current.push({
        url: currentUrl,
        timestamp,
        action
      })

    } catch (error) {
      // Silently fail - don't interrupt quiz experience
      console.error('Error tracking event:', error)
    }
  }, [isAuthenticated])

  // Start tracking session
  const startTracking = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await api.post('/quiz-tracking/start', {
        assignmentId,
        lessonId,
        quizType
      })

      if (response.data.sessionId) {
        sessionIdRef.current = response.data.sessionId
        startTimeRef.current = Date.now()
        lastVisibilityTimeRef.current = Date.now()
        lastUrlRef.current = typeof window !== 'undefined' ? window.location.href : ''
        isVisibleRef.current = true
        isPageActiveRef.current = true
        tabSwitchesRef.current = []
        setIsTracking(true)

        if (onSessionStart) {
          onSessionStart(response.data.sessionId)
        }
      }
    } catch (error) {
      console.error('Error starting quiz tracking:', error)
    }
  }, [isAuthenticated, assignmentId, lessonId, quizType, onSessionStart])

  // End tracking session
  const endTracking = useCallback(async (submitTime?: Date) => {
    if (!isAuthenticated || !sessionIdRef.current) return

    try {
      // Track final event if still away
      if (!isVisibleRef.current || !isPageActiveRef.current) {
        await trackEvent('switch_back')
      }

      await api.post('/quiz-tracking/end', {
        sessionId: sessionIdRef.current,
        submitTime: submitTime ? submitTime.toISOString() : new Date().toISOString()
      })

      sessionIdRef.current = null
      setIsTracking(false)
    } catch (error) {
      console.error('Error ending quiz tracking:', error)
    }
  }, [isAuthenticated, trackEvent])

  // Handle visibility change (tab switch)
  useEffect(() => {
    if (!isTracking || !isAuthenticated || typeof window === 'undefined') return

    let awayStartTime: number | null = null
    let awayStartUrl: string = ''

    const handleVisibilityChange = () => {
      const now = Date.now()
      const currentUrl = window.location.href
      const pageTitle = document.title
      const referrer = document.referrer

      if (document.hidden) {
        // Tab switched away or window minimized
        if (isVisibleRef.current) {
          isVisibleRef.current = false
          awayStartTime = now
          awayStartUrl = currentUrl
          lastVisibilityTimeRef.current = now
          
          // Track that user left quiz page
          // Note: We track the quiz page URL as "away from" URL
          trackEvent('switch_away', currentUrl, pageTitle)
        }
      } else {
        // Tab switched back
        if (!isVisibleRef.current && awayStartTime) {
          const awayDuration = now - awayStartTime
          isVisibleRef.current = true
          
          // Check if URL changed or referrer indicates navigation
          const urlChanged = currentUrl !== lastUrlRef.current
          const hasReferrer = referrer && referrer !== currentUrl && referrer !== awayStartUrl
          
          // If URL changed or has referrer, user navigated somewhere and came back
          if (urlChanged || hasReferrer) {
            // Track the URL user came back from (referrer) - this is the external website they visited
            const returnUrl = referrer || currentUrl
            // Extract route from referrer URL if available
            let route = ''
            try {
              if (referrer) {
                const referrerUrl = new URL(referrer)
                route = referrerUrl.pathname + referrerUrl.search
              }
            } catch (e) {
              // Invalid URL, ignore
            }
            trackEvent('switch_back', returnUrl, pageTitle)
          } else {
            // User switched back to same page (likely from another tab)
            trackEvent('switch_back', currentUrl, pageTitle)
          }
          
          lastUrlRef.current = currentUrl
          lastVisibilityTimeRef.current = now
          awayStartTime = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isTracking, isAuthenticated, trackEvent])

  // Handle window blur/focus (switching between windows/apps)
  useEffect(() => {
    if (!isTracking || !isAuthenticated || typeof window === 'undefined') return

    let blurStartTime: number | null = null
    let blurStartUrl: string = ''

    const handleBlur = () => {
      if (isPageActiveRef.current) {
        isPageActiveRef.current = false
        const currentUrl = window.location.href
        blurStartTime = Date.now()
        blurStartUrl = currentUrl
        trackEvent('window_blur', currentUrl, document.title)
      }
    }

    const handleFocus = () => {
      if (!isPageActiveRef.current) {
        const now = Date.now()
        isPageActiveRef.current = true
        const currentUrl = window.location.href
        const referrer = document.referrer
        
        // Check if we're still on the quiz page
        const isQuizPage = currentUrl.includes('/assignments') || currentUrl.includes('/lesson')
        const urlChanged = currentUrl !== lastUrlRef.current
        const hasReferrer = referrer && referrer !== currentUrl && referrer !== blurStartUrl
        
        if (isQuizPage && !urlChanged && !hasReferrer) {
          // Still on quiz page - just window focus
          trackEvent('window_focus', currentUrl, document.title)
          lastUrlRef.current = currentUrl
        } else if (urlChanged || hasReferrer) {
          // User navigated somewhere and came back
          const returnUrl = referrer || currentUrl
          trackEvent('switch_back', returnUrl, document.title)
          lastUrlRef.current = currentUrl
        } else {
          // User came back to same page
          trackEvent('window_focus', currentUrl, document.title)
          lastUrlRef.current = currentUrl
        }
        
        blurStartTime = null
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isTracking, isAuthenticated, trackEvent])

  // Track page navigation (for single-page apps)
  useEffect(() => {
    if (!isTracking || !isAuthenticated) return

    const handleBeforeUnload = () => {
      // Final check - if user is leaving, track it
      if (!document.hidden) {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
        trackEvent('switch_away', currentUrl, document.title)
      }
      
      // End tracking
      endTracking()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isTracking, isAuthenticated, trackEvent, endTracking])

  // Track URL changes and detect navigation away from quiz page
  useEffect(() => {
    if (!isTracking || !isAuthenticated || typeof window === 'undefined') return

    // Monitor for clipboard events or selection changes that might indicate copying
    // This is a weak signal but can help detect cheating
    const handleCopy = (e: ClipboardEvent) => {
      if (!isVisibleRef.current && isTracking && sessionIdRef.current) {
        // User copied something while away - suspicious
        // This is just for logging, not blocking
        console.log('Clipboard activity detected while away from quiz')
      }
    }

    // Monitor for paste events
    const handlePaste = (e: ClipboardEvent) => {
      if (isTracking && sessionIdRef.current) {
        // Paste detected during quiz - could be cheating
        console.log('Paste activity detected during quiz')
      }
    }

    // Track page navigation events (when user navigates to different URL)
    const handlePageHide = (e: PageTransitionEvent) => {
      if (!isTracking) return
      const currentUrl = window.location.href
      const pageTitle = document.title
      
      // User is navigating away from current page
      if (currentUrl !== lastUrlRef.current) {
        trackEvent('switch_away', currentUrl, pageTitle)
      }
    }

    const handlePageShow = (e: PageTransitionEvent) => {
      if (!isTracking) return
      const currentUrl = window.location.href
      const pageTitle = document.title
      const referrer = document.referrer
      
      // Check if user came from external website
      if (referrer && referrer !== currentUrl && referrer !== lastUrlRef.current) {
        // User navigated from external website
        trackEvent('switch_back', referrer, pageTitle)
        lastUrlRef.current = currentUrl
      } else if (currentUrl !== lastUrlRef.current) {
        // URL changed within our site
        trackEvent('switch_back', currentUrl, pageTitle)
        lastUrlRef.current = currentUrl
      }
    }

    // Check URL periodically to detect navigation
    const checkUrl = () => {
      if (!isTracking) return
      
      const currentUrl = window.location.href
      const isQuizPage = currentUrl.includes('/assignments') || currentUrl.includes('/lesson') || 
                         currentUrl.includes('/quiz') || currentUrl.includes('/code')
      
      // If URL changed and we're visible, track it
      if (currentUrl !== lastUrlRef.current && isVisibleRef.current && isPageActiveRef.current) {
        if (!isQuizPage) {
          // User navigated away from quiz page
          trackEvent('switch_away', currentUrl, document.title)
        } else {
          // User came back to quiz page (or navigated within quiz)
          trackEvent('switch_back', currentUrl, document.title)
        }
        
        lastUrlRef.current = currentUrl
      }
    }

    const interval = setInterval(checkUrl, 2000) // Check every 2 seconds
    
    // Add page navigation tracking
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)
    
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      clearInterval(interval)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [isTracking, isAuthenticated, trackEvent])

  return {
    startTracking,
    endTracking,
    isTracking,
    sessionId: sessionIdRef.current
  }
}

