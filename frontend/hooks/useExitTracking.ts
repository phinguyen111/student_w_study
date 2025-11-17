'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

interface ExitTrackingOptions {
  enabled?: boolean
  trackExternalLinks?: boolean
  trackBeforeUnload?: boolean
  trackUnload?: boolean
  trackVisibilityChange?: boolean
}

// Declare gtag function
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: {
        [key: string]: any
      }
    ) => void
    dataLayer?: any[]
  }
}

import { sendGAEventReliable } from '@/lib/gaTracking'

// Helper function to send event reliably using sendBeacon or gtag
const sendExitEvent = (eventName: string, eventParams: Record<string, any>, useMP: boolean = false) => {
  sendGAEventReliable(eventName, eventParams, useMP)
}

export function useExitTracking(options: ExitTrackingOptions = {}) {
  const {
    enabled = true,
    trackExternalLinks = true,
    trackBeforeUnload = true,
    trackUnload = true,
    trackVisibilityChange = true,
  } = options

  // Get pathname safely - use hook, fallback to window.location
  const navPathname = usePathname()
  const [pathname, setPathname] = useState<string>(
    navPathname || (typeof window !== 'undefined' ? window.location.pathname : '/')
  )
  
  // Update pathname when navigation pathname changes
  useEffect(() => {
    if (navPathname) {
      setPathname(navPathname)
    } else if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)
    }
  }, [navPathname])
  
  const startTimeRef = useRef<number>(Date.now())
  const lastPathnameRef = useRef<string>(pathname)
  const hasTrackedExitRef = useRef<boolean>(false)
  const maxScrollDepthRef = useRef<number>(0)
  const scrollCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mouseLeaveCountRef = useRef<number>(0)
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null)

  // Track page view on pathname change
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.gtag) return

    const timeOnPage = Date.now() - startTimeRef.current

    // Track page view
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title,
        time_on_page: Math.round(timeOnPage / 1000), // in seconds
      })
    }

    // Update start time for new page
    startTimeRef.current = Date.now()
    lastPathnameRef.current = pathname
    hasTrackedExitRef.current = false
  }, [pathname, enabled])

  // Track external link clicks
  useEffect(() => {
    if (!enabled || !trackExternalLinks || typeof window === 'undefined' || !window.gtag) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement

      if (!link || !link.href) return

      try {
        const linkUrl = new URL(link.href)
        const currentUrl = new URL(window.location.href)

        // Check if it's an external link
        if (linkUrl.hostname !== currentUrl.hostname) {
          const timeOnPage = Date.now() - startTimeRef.current

          if (window.gtag) {
            window.gtag('event', 'exit_link_click', {
              event_category: 'Exit',
              event_label: linkUrl.hostname,
              link_url: link.href,
              link_text: link.textContent?.trim() || '',
              time_on_page: Math.round(timeOnPage / 1000),
              page_path: pathname,
            })
          }

          hasTrackedExitRef.current = true
        }
      } catch (error) {
        // Invalid URL, ignore
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [enabled, trackExternalLinks, pathname])

  // Track beforeunload (user trying to leave page)
  useEffect(() => {
    if (!enabled || !trackBeforeUnload || typeof window === 'undefined' || !window.gtag) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasTrackedExitRef.current) return

      const timeOnPage = Date.now() - startTimeRef.current
      const measurementId = process.env.NEXT_PUBLIC_GA_ID

      const exitData = {
        event_category: 'Exit',
        time_on_page: Math.round(timeOnPage / 1000),
        scroll_depth: maxScrollDepthRef.current,
        page_path: pathname,
        page_title: document.title,
        engagement_time_msec: timeOnPage,
      }

      // Use reliable tracking method (MP API with sendBeacon)
      sendExitEvent('exit_beforeunload', exitData, true)

      hasTrackedExitRef.current = true
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, trackBeforeUnload, pathname])

  // Track unload (page is being unloaded)
  useEffect(() => {
    if (!enabled || !trackUnload || typeof window === 'undefined') return

    const handleUnload = () => {
      if (hasTrackedExitRef.current) return

      const timeOnPage = Date.now() - startTimeRef.current

      const exitData = {
        event_category: 'Exit',
        time_on_page: Math.round(timeOnPage / 1000),
        scroll_depth: maxScrollDepthRef.current,
        page_path: pathname,
        page_title: document.title,
        engagement_time_msec: timeOnPage,
        exit_intent_count: mouseLeaveCountRef.current,
      }

      // Use reliable tracking method (MP API with sendBeacon)
      sendExitEvent('exit_unload', exitData, true)

      hasTrackedExitRef.current = true
    }

    window.addEventListener('unload', handleUnload)
    return () => {
      window.removeEventListener('unload', handleUnload)
    }
  }, [enabled, trackUnload, pathname])

  // Track visibility change (tab switch, minimize, etc.)
  useEffect(() => {
    if (!enabled || !trackVisibilityChange || typeof window === 'undefined' || !window.gtag) return

    let hiddenTime: number | null = null

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden
        hiddenTime = Date.now()
        const timeOnPage = Date.now() - startTimeRef.current

        if (window.gtag) {
          window.gtag('event', 'exit_visibility_hidden', {
            event_category: 'Exit',
            time_on_page: Math.round(timeOnPage / 1000),
            page_path: pathname,
          })
        }
      } else {
        // Page became visible again
        if (hiddenTime) {
          const hiddenDuration = Date.now() - hiddenTime
          if (window.gtag) {
            window.gtag('event', 'exit_visibility_visible', {
              event_category: 'Exit',
              hidden_duration: Math.round(hiddenDuration / 1000),
              page_path: pathname,
            })
          }
          hiddenTime = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, trackVisibilityChange, pathname])

  // Track pagehide (more reliable than unload on mobile)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handlePageHide = (e: PageTransitionEvent) => {
      if (hasTrackedExitRef.current) return

      const timeOnPage = Date.now() - startTimeRef.current

      const exitData = {
        event_category: 'Exit',
        time_on_page: Math.round(timeOnPage / 1000),
        scroll_depth: maxScrollDepthRef.current,
        page_path: pathname,
        page_title: document.title,
        engagement_time_msec: timeOnPage,
        exit_intent_count: mouseLeaveCountRef.current,
        persisted: e.persisted ? 'true' : 'false', // Page is cached
      }

      // Use reliable tracking method (MP API with sendBeacon) - especially important for mobile
      sendExitEvent('exit_pagehide', exitData, true)

      hasTrackedExitRef.current = true
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [enabled, pathname])

  // Track focus/blur events
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.gtag) return

    const handleBlur = () => {
      const timeOnPage = Date.now() - startTimeRef.current
      if (window.gtag) {
        window.gtag('event', 'exit_window_blur', {
          event_category: 'Exit',
          time_on_page: Math.round(timeOnPage / 1000),
          page_path: pathname,
          scroll_depth: maxScrollDepthRef.current,
        })
      }
    }

    const handleFocus = () => {
      if (window.gtag) {
        window.gtag('event', 'exit_window_focus', {
          event_category: 'Exit',
          page_path: pathname,
        })
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled, pathname])

  // Track scroll depth
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.gtag) return

    const trackScrollDepth = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      
      if (scrollableHeight > 0) {
        const scrollPercentage = Math.round((scrollTop / scrollableHeight) * 100)
        maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, scrollPercentage)
        
        // Track milestone scroll depths (25%, 50%, 75%, 100%)
        const milestones = [25, 50, 75, 100]
        milestones.forEach(milestone => {
          if (scrollPercentage >= milestone && scrollPercentage < milestone + 5) {
            if (window.gtag) {
              window.gtag('event', 'scroll_depth', {
                event_category: 'Engagement',
                event_label: `${milestone}%`,
                value: milestone,
                page_path: pathname,
              })
            }
          }
        })
      }
    }

    // Check scroll depth periodically
    scrollCheckIntervalRef.current = setInterval(trackScrollDepth, 500)
    window.addEventListener('scroll', trackScrollDepth, { passive: true })

    return () => {
      if (scrollCheckIntervalRef.current) {
        clearInterval(scrollCheckIntervalRef.current)
      }
      window.removeEventListener('scroll', trackScrollDepth)
    }
  }, [enabled, pathname])

  // Track copy/paste events (potential content theft)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.gtag) return

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || ''
      if (selection.length > 0 && window.gtag) {
        window.gtag('event', 'content_copy', {
          event_category: 'User Action',
          event_label: 'Copy',
          value: selection.length,
          page_path: pathname,
          time_on_page: Math.round((Date.now() - startTimeRef.current) / 1000),
        })
      }
    }

    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || ''
      if (pastedText.length > 0 && window.gtag) {
        window.gtag('event', 'content_paste', {
          event_category: 'User Action',
          event_label: 'Paste',
          value: pastedText.length,
          page_path: pathname,
        })
      }
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [enabled, pathname])

  // Track right-click (context menu)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.gtag) return

    const handleContextMenu = (e: MouseEvent) => {
      if (window.gtag) {
        window.gtag('event', 'right_click', {
          event_category: 'User Action',
          event_label: 'Context Menu',
          page_path: pathname,
          time_on_page: Math.round((Date.now() - startTimeRef.current) / 1000),
        })
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [enabled, pathname])

  // Track exit intent (mouse leaving viewport at top)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.gtag) return

    const handleMouseLeave = (e: MouseEvent) => {
      // Only track if mouse is leaving from the top of the page (exit intent)
      if (e.clientY <= 0) {
        mouseLeaveCountRef.current += 1
        const timeOnPage = Date.now() - startTimeRef.current
        
        if (window.gtag) {
          window.gtag('event', 'exit_intent', {
            event_category: 'Exit',
            event_label: 'Mouse Leave Top',
            value: mouseLeaveCountRef.current,
            time_on_page: Math.round(timeOnPage / 1000),
            scroll_depth: maxScrollDepthRef.current,
            page_path: pathname,
          })
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [enabled, pathname])

  // Enhanced external link tracking with destination URL
  useEffect(() => {
    if (!enabled || !trackExternalLinks || typeof window === 'undefined' || !window.gtag) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement

      if (!link || !link.href) return

      try {
        const linkUrl = new URL(link.href)
        const currentUrl = new URL(window.location.href)

        // Check if it's an external link
        if (linkUrl.hostname !== currentUrl.hostname) {
          const timeOnPage = Date.now() - startTimeRef.current

          // Track with detailed information
          if (window.gtag) {
            window.gtag('event', 'exit_link_click', {
              event_category: 'Exit',
              event_label: linkUrl.hostname,
              link_url: link.href,
              link_text: link.textContent?.trim()?.substring(0, 100) || '',
              destination_domain: linkUrl.hostname,
              destination_path: linkUrl.pathname,
              time_on_page: Math.round(timeOnPage / 1000),
              scroll_depth: maxScrollDepthRef.current,
              page_path: pathname,
              page_title: document.title,
            })
          }

          hasTrackedExitRef.current = true
        }
      } catch (error) {
        // Invalid URL, ignore
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [enabled, trackExternalLinks, pathname])

  // Enhanced beforeunload with more details
  useEffect(() => {
    if (!enabled || !trackBeforeUnload || typeof window === 'undefined' || !window.gtag) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasTrackedExitRef.current) return

      const timeOnPage = Date.now() - startTimeRef.current
      const measurementId = process.env.NEXT_PUBLIC_GA_ID

      // Enhanced exit data
      const exitData = {
        event_category: 'Exit',
        time_on_page: Math.round(timeOnPage / 1000),
        scroll_depth: maxScrollDepthRef.current,
        page_path: pathname,
        page_title: document.title,
        engagement_time_msec: timeOnPage,
        exit_intent_count: mouseLeaveCountRef.current,
      }

      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon && measurementId) {
        try {
          const data = new URLSearchParams({
            measurement_id: measurementId,
            api_secret: process.env.NEXT_PUBLIC_GA_API_SECRET || '',
            events: JSON.stringify([{
              name: 'exit_beforeunload',
              params: {
                ...exitData,
                time_on_page: exitData.time_on_page.toString(),
                scroll_depth: exitData.scroll_depth.toString(),
                engagement_time_msec: exitData.engagement_time_msec.toString(),
              }
            }])
          })

          navigator.sendBeacon(
            `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${process.env.NEXT_PUBLIC_GA_API_SECRET || ''}`,
            data
          )
        } catch (error) {
          // Fallback to gtag
          if (window.gtag) {
            window.gtag('event', 'exit_beforeunload', exitData)
          }
        }
      } else {
        // Fallback to gtag if sendBeacon not available
        try {
          if (window.gtag) {
            window.gtag('event', 'exit_beforeunload', exitData)
          }
        } catch (error) {
          console.error('Error tracking beforeunload:', error)
        }
      }

      hasTrackedExitRef.current = true
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, trackBeforeUnload, pathname])

  // Reset tracking when pathname changes
  useEffect(() => {
    startTimeRef.current = Date.now()
    lastPathnameRef.current = pathname
    hasTrackedExitRef.current = false
    maxScrollDepthRef.current = 0
    mouseLeaveCountRef.current = 0
  }, [pathname])
}

