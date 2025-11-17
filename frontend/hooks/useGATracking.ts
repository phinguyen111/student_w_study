/**
 * Comprehensive Google Analytics User Action Tracking Hook
 * Tracks various user interactions across the application
 */

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { sendGAEvent, trackPageView } from '@/lib/gaTracking'

interface TrackEventOptions {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: any
}

/**
 * Hook to track user actions comprehensively
 */
export function useGATracking() {
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackPageView(pathname, document.title)
    }
  }, [pathname])

  /**
   * Track button clicks
   */
  const trackButtonClick = useCallback((
    buttonName: string,
    location?: string,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('button_click', {
      event_category: 'User Interaction',
      event_label: buttonName,
      button_name: buttonName,
      button_location: location || pathname,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track form submissions
   */
  const trackFormSubmit = useCallback((
    formName: string,
    success: boolean = true,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('form_submit', {
      event_category: 'User Interaction',
      event_label: formName,
      form_name: formName,
      form_success: success,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track link clicks
   */
  const trackLinkClick = useCallback((
    linkText: string,
    linkUrl: string,
    isExternal: boolean = false,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('link_click', {
      event_category: 'User Interaction',
      event_label: linkText,
      link_text: linkText,
      link_url: linkUrl,
      is_external: isExternal,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track search queries
   */
  const trackSearch = useCallback((
    searchQuery: string,
    resultsCount?: number,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('search', {
      event_category: 'User Interaction',
      event_label: searchQuery,
      search_term: searchQuery,
      results_count: resultsCount,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track video interactions
   */
  const trackVideo = useCallback((
    action: 'play' | 'pause' | 'complete' | 'progress',
    videoTitle: string,
    progress?: number,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('video_interaction', {
      event_category: 'Media',
      event_label: videoTitle,
      video_action: action,
      video_title: videoTitle,
      video_progress: progress,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track file downloads
   */
  const trackDownload = useCallback((
    fileName: string,
    fileType: string,
    fileSize?: number,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('file_download', {
      event_category: 'User Interaction',
      event_label: fileName,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track quiz/assignment interactions
   */
  const trackQuizAction = useCallback((
    action: 'start' | 'submit' | 'abandon' | 'question_view' | 'answer_select',
    quizId: string,
    quizTitle?: string,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('quiz_action', {
      event_category: 'Learning',
      event_label: action,
      quiz_action: action,
      quiz_id: quizId,
      quiz_title: quizTitle,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track lesson interactions
   */
  const trackLessonAction = useCallback((
    action: 'view' | 'complete' | 'start' | 'code_submit',
    lessonId: string,
    lessonTitle?: string,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('lesson_action', {
      event_category: 'Learning',
      event_label: action,
      lesson_action: action,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track authentication actions
   */
  const trackAuthAction = useCallback((
    action: 'login' | 'logout' | 'register' | 'password_reset',
    success: boolean = true,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('auth_action', {
      event_category: 'Authentication',
      event_label: action,
      auth_action: action,
      auth_success: success,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track navigation
   */
  const trackNavigation = useCallback((
    from: string,
    to: string,
    method: 'click' | 'back' | 'forward' | 'direct' = 'click',
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('navigation', {
      event_category: 'User Interaction',
      event_label: `${from} → ${to}`,
      navigation_from: from,
      navigation_to: to,
      navigation_method: method,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track custom events
   */
  const trackCustomEvent = useCallback((
    eventName: string,
    eventData?: TrackEventOptions
  ) => {
    sendGAEvent(eventName, {
      event_category: 'Custom',
      page_path: pathname,
      ...eventData
    })
  }, [pathname])

  /**
   * Track errors
   */
  const trackError = useCallback((
    errorType: string,
    errorMessage: string,
    errorLocation?: string,
    additionalData?: TrackEventOptions
  ) => {
    sendGAEvent('error', {
      event_category: 'Error',
      event_label: errorType,
      error_type: errorType,
      error_message: errorMessage,
      error_location: errorLocation || pathname,
      page_path: pathname,
      ...additionalData
    })
  }, [pathname])

  /**
   * Track time spent on page
   */
  const trackTimeOnPage = useCallback((
    timeInSeconds: number,
    pageTitle?: string
  ) => {
    sendGAEvent('time_on_page', {
      event_category: 'Engagement',
      event_label: pageTitle || document.title,
      time_seconds: timeInSeconds,
      page_path: pathname,
    })
  }, [pathname])

  return {
    trackButtonClick,
    trackFormSubmit,
    trackLinkClick,
    trackSearch,
    trackVideo,
    trackDownload,
    trackQuizAction,
    trackLessonAction,
    trackAuthAction,
    trackNavigation,
    trackCustomEvent,
    trackError,
    trackTimeOnPage
  }
}

