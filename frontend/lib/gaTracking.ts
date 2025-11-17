/**
 * Google Analytics Tracking Helper
 * Provides reliable event tracking using both gtag and Measurement Protocol API
 */

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

interface GAEventParams {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: any
}

/**
 * Send event using gtag (standard method)
 */
export const sendGAEvent = (eventName: string, params: GAEventParams = {}) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Analytics not initialized')
    return false
  }

  try {
    window.gtag('event', eventName, params)
    return true
  } catch (error) {
    console.error(`Error sending GA event ${eventName}:`, error)
    return false
  }
}

/**
 * Send event using Measurement Protocol API (more reliable for exit events)
 * This uses sendBeacon which works even when page is closing
 */
export const sendGAEventViaMP = (
  eventName: string,
  params: GAEventParams = {}
): boolean => {
  if (typeof window === 'undefined') return false

  const measurementId = process.env.NEXT_PUBLIC_GA_ID
  const apiSecret = process.env.NEXT_PUBLIC_GA_API_SECRET

  if (!measurementId || !apiSecret) {
    // Fallback to gtag if MP not configured
    return sendGAEvent(eventName, params)
  }

  if (!navigator.sendBeacon) {
    // Fallback to gtag if sendBeacon not available
    return sendGAEvent(eventName, params)
  }

  try {
    // Prepare event data
    const eventData = {
      name: eventName,
      params: {
        ...params,
        // Convert numeric values to strings for MP API
        ...(params.value !== undefined && { value: params.value.toString() }),
        ...(params.time_on_page !== undefined && {
          time_on_page: params.time_on_page.toString(),
        }),
        ...(params.scroll_depth !== undefined && {
          scroll_depth: params.scroll_depth.toString(),
        }),
        ...(params.engagement_time_msec !== undefined && {
          engagement_time_msec: params.engagement_time_msec.toString(),
        }),
      },
    }

    // Create URL with measurement_id and api_secret
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`

    // Create FormData for sendBeacon
    const formData = new FormData()
    formData.append('events', JSON.stringify([eventData]))

    // Send via sendBeacon (reliable even when page is closing)
    const sent = navigator.sendBeacon(url, formData)

    if (!sent) {
      // If sendBeacon fails, try gtag as fallback
      return sendGAEvent(eventName, params)
    }

    return true
  } catch (error) {
    console.error(`Error sending GA event via MP ${eventName}:`, error)
    // Fallback to gtag
    return sendGAEvent(eventName, params)
  }
}

/**
 * Send event with automatic fallback (gtag -> MP -> gtag)
 * Use this for critical exit events
 */
export const sendGAEventReliable = (
  eventName: string,
  params: GAEventParams = {},
  useMP: boolean = false
): boolean => {
  if (useMP) {
    // Try MP first, fallback to gtag
    return sendGAEventViaMP(eventName, params) || sendGAEvent(eventName, params)
  } else {
    // Try gtag first, fallback to MP
    return sendGAEvent(eventName, params) || sendGAEventViaMP(eventName, params)
  }
}

/**
 * Track page view
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  })
}

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('set', 'user_properties', properties)
}

/**
 * Set user ID
 */
export const setUserId = (userId: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('set', 'user_properties', { user_id: userId })
}

