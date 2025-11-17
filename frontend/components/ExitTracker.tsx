'use client'

import { useExitTracking } from '@/hooks/useExitTracking'

export function ExitTracker() {
  useExitTracking({
    enabled: true,
    trackExternalLinks: true,
    trackBeforeUnload: true,
    trackUnload: true,
    trackVisibilityChange: true,
  })

  return null
}

