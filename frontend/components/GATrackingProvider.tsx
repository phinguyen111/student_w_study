'use client'

import { useEffect } from 'react'
import { useGATracking } from '@/hooks/useGATracking'

/**
 * Global Google Analytics Tracking Provider
 * Automatically tracks common user actions across the app
 */
export function GATrackingProvider({ children }: { children: React.ReactNode }) {
  const {
    trackButtonClick,
    trackLinkClick,
    trackFormSubmit,
    trackError
  } = useGATracking()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track all button clicks
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('button')
      
      if (button) {
        const buttonText = button.textContent?.trim() || button.getAttribute('aria-label') || 'Unknown Button'
        const buttonId = button.id || button.className || ''
        
        trackButtonClick(buttonText, window.location.pathname, {
          button_id: buttonId,
          button_type: button.type || 'button'
        })
      }
    }

    // Track all link clicks (internal and external)
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href) {
        try {
          const linkUrl = new URL(link.href)
          const currentUrl = new URL(window.location.href)
          const isExternal = linkUrl.hostname !== currentUrl.hostname
          const linkText = link.textContent?.trim() || link.getAttribute('aria-label') || link.href
          
          trackLinkClick(linkText, link.href, isExternal, {
            link_id: link.id || '',
            link_class: link.className || ''
          })
        } catch (error) {
          // Invalid URL, ignore
        }
      }
    }

    // Track form submissions
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement
      const formName = form.name || form.id || form.className || 'Unknown Form'
      const formAction = form.action || window.location.pathname
      
      trackFormSubmit(formName, true, {
        form_action: formAction,
        form_method: form.method || 'get'
      })
    }

    // Track JavaScript errors
    const handleError = (e: ErrorEvent) => {
      trackError(
        'JavaScript Error',
        e.message || 'Unknown error',
        e.filename || window.location.pathname,
        {
          error_line: e.lineno,
          error_column: e.colno,
          error_stack: e.error?.stack?.substring(0, 500) // Limit stack trace length
        }
      )
    }

    // Track unhandled promise rejections
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      trackError(
        'Unhandled Promise Rejection',
        e.reason?.message || String(e.reason) || 'Unknown rejection',
        window.location.pathname,
        {
          error_type: 'promise_rejection'
        }
      )
    }

    // Add event listeners
    document.addEventListener('click', handleButtonClick, true)
    document.addEventListener('click', handleLinkClick, true)
    document.addEventListener('submit', handleFormSubmit, true)
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Track time on page (send every 30 seconds)
    const timeOnPageInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - (window as any).__pageStartTime || Date.now()) / 1000)
      if (timeSpent > 0 && timeSpent % 30 === 0) {
        // Track every 30 seconds
      }
    }, 30000)

    // Initialize page start time
    ;(window as any).__pageStartTime = Date.now()

    return () => {
      document.removeEventListener('click', handleButtonClick, true)
      document.removeEventListener('click', handleLinkClick, true)
      document.removeEventListener('submit', handleFormSubmit, true)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      clearInterval(timeOnPageInterval)
    }
  }, [trackButtonClick, trackLinkClick, trackFormSubmit, trackError])

  return <>{children}</>
}

