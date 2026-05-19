'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { translations, type Locale } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  localeStr: string // For date formatting: 'fr-FR' or 'en-US'
}

const I18nContext = createContext<I18nContextType>({
  locale: 'fr',
  setLocale: () => {},
  t: (key) => key,
  localeStr: 'fr-FR',
})

export function useTranslation() {
  return useContext(I18nContext)
}

// Shorthand for convenience
export function useT() {
  return useContext(I18nContext)
}

const STORAGE_KEY = 'connectphone-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'fr') return stored
  } catch {}
  return 'fr'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {}
    // Update html lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }, [])

  // Set initial html lang
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale] || translations.fr
      let value = dict[key] || translations.fr[key] || key

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          const placeholder = `{${k}}`
          value = value.replace(placeholder, String(v))
        })
      }

      // Handle plural {s} pattern: e.g. "message{s}" → "message" (1) or "messages" (>1)
      // This is a simple pattern: {s} is replaced with "s" if the preceding number > 1, else ""
      value = value.replace(/(\d+)\s*(\w+)\{s\}/g, (match, num, word) => {
        return `${num} ${word}${Number(num) !== 1 ? 's' : ''}`
      })

      return value
    },
    [locale]
  )

  const localeStr = locale === 'fr' ? 'fr-FR' : 'en-US'

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, localeStr }}>
      {children}
    </I18nContext.Provider>
  )
}
