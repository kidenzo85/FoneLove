'use client'

import { useEffect, useRef } from 'react'
import { useCurrencyStore } from '@/lib/currency-store'

/**
 * CurrencyInitializer — auto-detects user's currency on first app load.
 * Place this component once in the root layout.
 * It runs detection only once per session (unless the store has no data).
 */
export default function CurrencyInitializer() {
  const { detectCurrency, currencyCode, exchangeRate, ratesSource } = useCurrencyStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Only auto-detect if we don't have a persisted currency preference
    // or if the rates are stale (fallback source)
    const shouldDetect = ratesSource === 'fallback' || !exchangeRate || exchangeRate === 1

    if (shouldDetect) {
      detectCurrency().catch((err) => {
        console.warn('Currency auto-detection failed:', err)
      })
    }
  }, [detectCurrency, ratesSource, exchangeRate])

  // This component renders nothing
  return null
}
