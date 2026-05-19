'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import fr from '@/lib/translations/fr'
import en from '@/lib/translations/en'
import type { Translations } from '@/lib/translations/fr'

// ===== Locale types =====
export type Locale = 'fr' | 'en'
export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

// ===== Translation dictionaries =====
const dictionaries: Record<Locale, Translations> = { fr, en }

// ===== Auto-detect locale from browser =====
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const lang = navigator.language?.toLowerCase() || ''
  // French locales: fr, fr-FR, fr-CA, fr-BE, etc.
  if (lang.startsWith('fr')) return 'fr'
  // Default fallback: English
  return 'en'
}

// ===== Resolve nested key like "feedback.matchTitle" =====
function resolve(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

// ===== Interpolate {key} placeholders in strings =====
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key]
    return val !== undefined ? String(val) : `{${key}}`
  })
}

// ===== Plural support: {count} item{s} → 1 item / 5 items =====
function handlePlural(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}(\w*)\{(\w+)\}/g, (match, beforeWord, between, afterWord) => {
    // Pattern: {count}word{s} — if beforeWord is a placeholder key
    const countVal = params[beforeWord]
    if (countVal === undefined) return match
    const n = Number(countVal)
    if (isNaN(n)) return match
    // If n <= 1, omit the {afterWord} part; if n > 1, include it
    return n <= 1 ? `{${beforeWord}}${between}` : `{${beforeWord}}${between}${afterWord}`
  })
}

// ===== Main t() function =====
export function t(key: string, params?: Record<string, string | number>, locale?: Locale): string {
  const loc = locale || useI18nStore.getState().locale
  const dict = dictionaries[loc] || dictionaries.en
  let value = resolve(dict as unknown as Record<string, unknown>, key)

  // Fallback to English if key not found in current locale
  if (value === undefined && loc !== 'en') {
    value = resolve(dictionaries.en as unknown as Record<string, unknown>, key)
  }

  // If still not found, return the key itself
  if (value === undefined) return key

  // If it's a string, interpolate and handle plurals
  if (typeof value === 'string') {
    const withPlurals = handlePlural(value, params)
    return interpolate(withPlurals, params)
  }

  // If it's an array (e.g., level benefits), return joined string
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return String(value)
}

// ===== Get a nested object from translations (for arrays like benefits) =====
export function tArray(key: string, locale?: Locale): string[] {
  const loc = locale || useI18nStore.getState().locale
  const dict = dictionaries[loc] || dictionaries.en
  let value = resolve(dict as unknown as Record<string, unknown>, key)
  if (!Array.isArray(value) && loc !== 'en') {
    value = resolve(dictionaries.en as unknown as Record<string, unknown>, key)
  }
  return Array.isArray(value) ? value : []
}

// ===== i18n Zustand Store =====
interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  initLocale: () => void
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'en', // Default, will be overridden by initLocale
      setLocale: (locale: Locale) => {
        set({ locale })
        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = locale
        }
      },
      initLocale: () => {
        const current = get().locale
        // Only auto-detect if no saved preference
        if (current === 'en') {
          const detected = detectLocale()
          set({ locale: detected })
          if (typeof document !== 'undefined') {
            document.documentElement.lang = detected
          }
        } else {
          if (typeof document !== 'undefined') {
            document.documentElement.lang = current
          }
        }
      },
    }),
    {
      name: 'connectphone-locale',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
)

// ===== React hook for components =====
export function useTranslation() {
  const locale = useI18nStore((s) => s.locale)
  const setLocale = useI18nStore((s) => s.setLocale)

  return {
    locale,
    setLocale,
    t: (key: string, params?: Record<string, string | number>) => t(key, params, locale),
    tArray: (key: string) => tArray(key, locale),
    isFrench: locale === 'fr',
    isEnglish: locale === 'en',
  }
}

// ===== Locale info for display =====
export function getLocaleInfo(locale: Locale) {
  return LOCALES.find((l) => l.code === locale) || LOCALES[1] // fallback to EN
}
