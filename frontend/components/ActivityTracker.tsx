'use client'

import { useActivityTracker } from '@/hooks/useActivityTracker'

export function ActivityTracker() {
  // This component just initializes the activity tracker
  useActivityTracker()
  return null
}

