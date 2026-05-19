'use client'

import { useEffect } from 'react'
import { useI18nStore } from '@/lib/i18n'

/**
 * LocaleInitializer — Auto-detects browser language on first load.
 * Sets the HTML lang attribute and initializes the i18n store.
 * Runs once on mount, respects saved preference from localStorage.
 */
export default function LocaleInitializer() {
  const initLocale = useI18nStore((s) => s.initLocale)

  useEffect(() => {
    initLocale()
  }, [initLocale])

  return null
}
