import { useCallback } from 'react'
import { useAppStore } from '@/lib/store'

export function useAnalytics() {
  const currentUser = useAppStore(state => state.currentUser)

  const trackEvent = useCallback(async (eventName: string, metadata?: Record<string, any>) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName,
          metadata,
          userId: currentUser?.id,
        }),
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement analytique:', error)
    }
  }, [currentUser])

  return { trackEvent }
}
