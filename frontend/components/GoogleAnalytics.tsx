'use client'

import { useEffect } from 'react'
import Script from 'next/script'

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

interface GoogleAnalyticsProps {
  gaId?: string
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const measurementId = gaId || process.env.NEXT_PUBLIC_GA_ID

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    
    // Initialize gtag function
    window.gtag = function() {
      if (window.dataLayer) {
        window.dataLayer.push(arguments)
      }
    }

    // Enhanced configuration for better tracking
    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
      page_title: document.title,
      // Enhanced measurement settings
      send_page_view: true,
      // Track user engagement
      engagement_time_msec: 0,
      // Privacy settings
      anonymize_ip: false, // Set to true if you want to anonymize IP
      // Enhanced ecommerce (if needed)
      allow_google_signals: true,
      allow_ad_personalization_signals: true,
    })
  }, [measurementId])

  if (!measurementId) {
    return null
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        onLoad={() => {
          // Additional initialization after script loads
          if (typeof window !== 'undefined' && window.gtag) {
            // Set user properties if available
            const userId = localStorage.getItem('userId')
            if (userId && window.gtag) {
              window.gtag('set', 'user_properties', { user_id: userId })
            }
          }
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              page_title: document.title,
              send_page_view: true,
              engagement_time_msec: 0,
            });
          `,
        }}
      />
    </>
  )
}

