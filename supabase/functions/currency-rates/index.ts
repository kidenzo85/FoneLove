// ============================================================
// ConnectPhone — Edge Function: currency-rates
// Remplace: GET/POST /api/currency/rates
// 
// Récupère les taux de change EUR → XXX depuis l'API BCE
// (Frankfurter.app) avec cache en base exchange_rates.
// Fallback sur les taux hardcoded si l'API est indisponible.
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Taux de fallback hardcodés (sécurité si API indisponible)
const FALLBACK_RATES: Record<string, number> = {
  EUR: 1, GBP: 0.86, CHF: 0.94, NOK: 11.5, SEK: 11.4, DKK: 7.46,
  PLN: 4.31, CZK: 25.2, HUF: 395, RON: 4.97, BGN: 1.96,
  TRY: 36.5, RUB: 98, UAH: 42,
  USD: 1.08, CAD: 1.47, MXN: 18.5, BRL: 6.05, ARS: 1100,
  COP: 4500, CLP: 980, PEN: 4.05,
  XOF: 655.96, XAF: 655.96, NGN: 1750, ZAR: 20.2, EGP: 55,
  MAD: 10.8, DZD: 145, TND: 3.38, KES: 155, GHS: 15.5, CDF: 3150,
  JPY: 163, CNY: 7.85, KRW: 1480, INR: 92, PKR: 300, BDT: 130,
  THB: 38, VND: 27500, IDR: 17800, PHP: 62, MYR: 5.0,
  SGD: 1.45, HKD: 8.45, TWD: 35,
  AED: 3.97, SAR: 4.05, QAR: 3.94, ILS: 3.95, KWD: 0.332,
  AUD: 1.68, NZD: 1.82,
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 heures
const FRANKFURTER_BASE = 'https://api.frankfurter.app'

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const url = new URL(req.url)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method === 'GET') {
      // ===== GET: Récupérer le taux pour une devise =====
      const currency = url.searchParams.get('currency') || 'EUR'

      if (currency === 'EUR') {
        return new Response(
          JSON.stringify({
            baseCurrency: 'EUR',
            targetCurrency: 'EUR',
            rate: 1,
            source: 'identity',
            fetchedAt: new Date().toISOString(),
          }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Vérifier le cache
      const { data: cached } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('base_currency', 'EUR')
        .eq('target_currency', currency)
        .single()

      const now = Date.now()
      const isStale = !cached || (now - new Date(cached.fetched_at).getTime()) > CACHE_TTL_MS

      if (cached && !isStale) {
        return new Response(
          JSON.stringify({
            baseCurrency: 'EUR',
            targetCurrency: currency,
            rate: cached.rate,
            source: cached.source,
            fetchedAt: cached.fetched_at,
          }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Fetch depuis Frankfurter
      let liveRate: number | null = null
      let source = 'fallback'

      try {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 8000)
        const response = await fetch(
          `${FRANKFURTER_BASE}/latest?from=EUR&to=${currency}`,
          { signal: controller.signal, headers: { 'Accept': 'application/json' } }
        )
        if (response.ok) {
          const data = await response.json()
          if (data.rates?.[currency]) {
            liveRate = data.rates[currency]
            source = 'frankfurter'
          }
        }
      } catch (err) {
        console.warn('Frankfurter API unavailable, using fallback:', err)
      }

      const finalRate = liveRate ?? FALLBACK_RATES[currency] ?? 1
      if (!liveRate) source = 'fallback'

      // Upsert le cache
      await supabase
        .from('exchange_rates')
        .upsert({
          base_currency: 'EUR',
          target_currency: currency,
          rate: finalRate,
          source,
          fetched_at: new Date().toISOString(),
        }, { onConflict: 'base_currency,target_currency' })

      return new Response(
        JSON.stringify({
          baseCurrency: 'EUR',
          targetCurrency: currency,
          rate: finalRate,
          source,
          fetchedAt: new Date().toISOString(),
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      // ===== POST: Bulk fetch pour plusieurs devises =====
      const body = await req.json()
      const currencies: string[] = body.currencies || []

      if (currencies.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Liste de devises requise' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Filtrer les devises supportées
      const validCurrencies = currencies.filter((c: string) => FALLBACK_RATES[c])
      if (validCurrencies.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Aucune devise valide' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      // Retirer EUR de la liste (taux = 1)
      const nonEurCurrencies = validCurrencies.filter((c: string) => c !== 'EUR')

      // Fetch bulk depuis Frankfurter
      let liveRates: Record<string, number> = {}
      if (nonEurCurrencies.length > 0) {
        try {
          const controller = new AbortController()
          setTimeout(() => controller.abort(), 10000)
          const response = await fetch(
            `${FRANKFURTER_BASE}/latest?from=EUR&to=${nonEurCurrencies.join(',')}`,
            { signal: controller.signal, headers: { 'Accept': 'application/json' } }
          )
          if (response.ok) {
            const data = await response.json()
            liveRates = data.rates || {}
          }
        } catch (err) {
          console.warn('Bulk Frankfurter fetch failed, using fallbacks:', err)
        }
      }

      // Construire la réponse et cacher chaque taux
      const results: Record<string, { rate: number; source: string }> = {}

      // EUR toujours = 1
      if (validCurrencies.includes('EUR')) {
        results['EUR'] = { rate: 1, source: 'identity' }
      }

      for (const currency of nonEurCurrencies) {
        const rate = liveRates[currency] ?? FALLBACK_RATES[currency] ?? 1
        const source = liveRates[currency] ? 'frankfurter' : 'fallback'
        results[currency] = { rate, source }

        // Cache upsert (non-bloquant)
        try {
          await supabase
            .from('exchange_rates')
            .upsert({
              base_currency: 'EUR',
              target_currency: currency,
              rate,
              source,
              fetched_at: new Date().toISOString(),
            }, { onConflict: 'base_currency,target_currency' })
        } catch {
          // Non-critique
        }
      }

      return new Response(
        JSON.stringify({ rates: results, fetchedAt: new Date().toISOString() }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Méthode non supportée' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Currency rates error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la récupération des taux' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
