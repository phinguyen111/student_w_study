import { useEffect, useRef } from 'react'
import api from '@/lib/api'
import { useAuth } from './useAuth'

export function useTimeTracker() {
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { isAuthenticated } = useAuth()

  const startTracking = () => {
    if (!isAuthenticated) return
    startTimeRef.current = Date.now()

    // Update every minute
    intervalRef.current = setInterval(async () => {
      if (startTimeRef.current) {
        const minutes = Math.floor((Date.now() - startTimeRef.current) / 60000)
        if (minutes > 0) {
          try {
            await api.post('/progress/time', { minutes: 1 })
            startTimeRef.current = Date.now() // Reset after update
          } catch (error) {
            console.error('Error updating study time:', error)
          }
        }
      }
    }, 60000) // Check every minute
  }

  const stopTracking = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (startTimeRef.current && isAuthenticated) {
      const minutes = Math.floor((Date.now() - startTimeRef.current) / 60000)
      if (minutes > 0) {
        try {
          await api.post('/progress/time', { minutes })
        } catch (error) {
          console.error('Error updating study time:', error)
        }
      }
      startTimeRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [])

  return { startTracking, stopTracking }
}



