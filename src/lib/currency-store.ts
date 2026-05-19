'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  CURRENCIES,
  COUNTRY_CURRENCY,
  DEFAULT_CURRENCY,
  DEFAULT_COUNTRY,
  getPPPGroup,
  PPP_MULTIPLIER,
  formatCurrency,
  convertFromEUR,
  getPackLocalPrice,
  getPricePerCC,
  applyPsychologicalRounding,
  getRoundingMode,
  type PPPGroup,
} from '@/lib/currency-constants'
import {
  PACKS,
  EURO_PER_CC,
  type PackType,
} from '@/lib/connectcoin-constants'
import {
  detectCurrency as supabaseDetectCurrency,
  fetchExchangeRate as supabaseFetchExchangeRate,
} from '@/lib/supabase-credits'

// ===== Types =====
export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  flag: string
  locale: string
  decimals: number
}

export interface PackLocalPrice {
  type: PackType
  name: string
  cc: number
  bonusCC: number
  priceFormatted: string       // e.g. "2,99 €" or "$3.29"
  pricePerCCFormatted: string  // e.g. "0,10 €/CC" or "$0.11/CC"
  bonusText: string
  icon: string
  gradient: string
  rawLocalPrice: number        // numeric local price after rounding
  pppAdjusted: boolean         // whether PPP was applied
  pppDiscount: number          // PPP discount percentage (0, 25, 45, 60)
}

interface CurrencyState {
  // User's detected/selected currency
  currencyCode: string
  countryCode: string
  pppGroup: PPPGroup

  // Exchange rates (EUR → target currency)
  exchangeRate: number
  ratesLastFetched: number | null
  ratesSource: 'live' | 'fallback'

  // Loading states
  isDetecting: boolean
  isFetchingRates: boolean

  // Computed pack prices (re-calculated when currency/rate changes)
  packPrices: PackLocalPrice[]

  // Actions — appellent directement les Edge Functions Supabase via supabase-credits.ts
  detectCurrency: () => Promise<void>
  setCurrency: (code: string, countryCode?: string) => void
  fetchRates: () => Promise<void>
  refreshPackPrices: () => void

  // Utility
  formatLocalPrice: (eurAmount: number) => string
  convertEurToLocal: (eurAmount: number) => number
  getCurrencyInfo: () => CurrencyInfo
  formatCCEquivalent: (ccAmount: number) => string
}

// ===== Pack gradients =====
const PACK_GRADIENTS: Record<PackType, string> = {
  decouverte: 'from-violet-500/20 to-purple-500/20',
  tendance: 'from-orange-500/20 to-amber-500/20',
  passion: 'from-rose-500/20 to-pink-500/20',
  flamme: 'from-amber-500/20 to-yellow-500/20',
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currencyCode: DEFAULT_CURRENCY,
      countryCode: DEFAULT_COUNTRY,
      pppGroup: 'high' as PPPGroup,
      exchangeRate: 1,
      ratesLastFetched: null,
      ratesSource: 'fallback' as const,
      isDetecting: false,
      isFetchingRates: false,
      packPrices: [],

      detectCurrency: async () => {
        set({ isDetecting: true })
        try {
          // Appel direct à l'Edge Function currency-detect via supabase-credits.ts
          const detection = await supabaseDetectCurrency()

          if (detection.currencyCode && CURRENCIES[detection.currencyCode]) {
            const pppGroup = getPPPGroup(detection.countryCode || DEFAULT_COUNTRY)
            set({
              currencyCode: detection.currencyCode,
              countryCode: detection.countryCode || DEFAULT_COUNTRY,
              pppGroup,
            })
          }
        } catch (err) {
          console.warn('Currency detection failed, using default:', err)
        }
        set({ isDetecting: false })

        // After detection, fetch live rates
        await get().fetchRates()
        get().refreshPackPrices()
      },

      setCurrency: (code: string, countryCode?: string) => {
        if (!CURRENCIES[code]) {
          console.warn('Unknown currency code:', code)
          return
        }
        const cc = countryCode || get().countryCode
        const pppGroup = getPPPGroup(cc)
        const curr = CURRENCIES[code]

        set({
          currencyCode: code,
          countryCode: cc,
          pppGroup,
          exchangeRate: curr.fallbackRate,
        })

        // Refresh rates for the new currency
        get().fetchRates()
        get().refreshPackPrices()
      },

      fetchRates: async () => {
        set({ isFetchingRates: true })
        try {
          const { currencyCode } = get()

          // Appel direct à l'Edge Function currency-rates via supabase-credits.ts
          const rateInfo = await supabaseFetchExchangeRate(currencyCode)

          if (rateInfo.rate && rateInfo.rate > 0) {
            set({
              exchangeRate: rateInfo.rate,
              ratesLastFetched: Date.now(),
              ratesSource: (rateInfo.source === 'frankfurter' ? 'live' : 'fallback') as 'live' | 'fallback',
            })
          }
        } catch (err) {
          console.warn('Rate fetch failed, using fallback:', err)
          // Use hardcoded fallback rate
          const curr = CURRENCIES[get().currencyCode]
          if (curr) {
            set({ exchangeRate: curr.fallbackRate, ratesSource: 'fallback' })
          }
        }
        set({ isFetchingRates: false })
      },

      refreshPackPrices: () => {
        const { currencyCode, countryCode, exchangeRate, pppGroup } = get()
        const pppMultiplier = PPP_MULTIPLIER[pppGroup]
        const pppDiscount = Math.round((1 - pppMultiplier) * 100)
        const isPPPAdjusted = pppDiscount > 0

        const packPrices = PACKS.map((pack) => {
          const { formatted, raw } = getPackLocalPrice(pack.price, currencyCode, exchangeRate)
          const pricePerCC = getPricePerCC(
            pack.price / (pack.cc + pack.bonusCC),
            currencyCode,
            exchangeRate,
            countryCode
          )

          return {
            type: pack.type,
            name: pack.name,
            cc: pack.cc,
            bonusCC: pack.bonusCC,
            priceFormatted: formatted,
            pricePerCCFormatted: pricePerCC,
            bonusText: pack.bonusText,
            icon: pack.icon,
            gradient: PACK_GRADIENTS[pack.type],
            rawLocalPrice: raw,
            pppAdjusted: isPPPAdjusted,
            pppDiscount,
          }
        })

        set({ packPrices })
      },

      formatLocalPrice: (eurAmount: number) => {
        const { currencyCode, exchangeRate, countryCode } = get()
        const converted = convertFromEUR(eurAmount, exchangeRate, countryCode)
        const mode = getRoundingMode(currencyCode)
        const rounded = applyPsychologicalRounding(converted, mode)
        return formatCurrency(rounded, currencyCode, { skipRounding: true })
      },

      convertEurToLocal: (eurAmount: number) => {
        const { exchangeRate, countryCode } = get()
        return convertFromEUR(eurAmount, exchangeRate, countryCode)
      },

      getCurrencyInfo: () => {
        const { currencyCode } = get()
        const curr = CURRENCIES[currencyCode]
        return {
          code: curr?.code || DEFAULT_CURRENCY,
          symbol: curr?.symbol || '\u20AC',
          name: curr?.name || 'Euro',
          flag: curr?.flag || '\u{1F1EA}\u{1F1FA}',
          locale: curr?.locale || 'fr-FR',
          decimals: curr?.decimals || 2,
        }
      },

      formatCCEquivalent: (ccAmount: number) => {
        const { currencyCode, exchangeRate, countryCode } = get()
        const eurEquiv = ccAmount * EURO_PER_CC
        const converted = convertFromEUR(eurEquiv, exchangeRate, countryCode)
        return formatCurrency(converted, currencyCode, { skipRounding: false })
      },
    }),
    {
      name: 'connectphone-currency',
      partialize: (state) => ({
        currencyCode: state.currencyCode,
        countryCode: state.countryCode,
        pppGroup: state.pppGroup,
        exchangeRate: state.exchangeRate,
        ratesLastFetched: state.ratesLastFetched,
        ratesSource: state.ratesSource,
      }),
    }
  )
)
