// ============================================================
// ConnectPhone — Edge Function: currency-detect
// Remplace: GET /api/currency/detect
//
// Détecte automatiquement la devise de l'utilisateur via:
// 1. IP géolocalisation (ip-api.com — gratuit, 45 req/min)
// 2. Header Accept-Language (fallback)
// 3. Défaut: EUR / France
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapping Pays → Devise (ISO 3166-1 alpha-2 → ISO 4217)
const COUNTRY_CURRENCY: Record<string, string> = {
  // Europe
  FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR',
  LT: 'EUR', MT: 'EUR', CY: 'EUR', AD: 'EUR', MC: 'EUR', SM: 'EUR', VA: 'EUR',
  GB: 'GBP', CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', PL: 'PLN', CZ: 'CZK',
  HU: 'HUF', RO: 'RON', BG: 'BGN', HR: 'HRK', TR: 'TRY', RU: 'RUB', UA: 'UAH',
  IS: 'EUR', LI: 'CHF',
  // Americas
  US: 'USD', PR: 'USD', GU: 'USD', VI: 'USD',
  CA: 'CAD', MX: 'MXN', BR: 'BRL', AR: 'ARS', CO: 'COP', CL: 'CLP', PE: 'PEN',
  UY: 'USD', PY: 'USD', BO: 'USD', EC: 'USD', SV: 'USD', PA: 'USD',
  // Africa
  SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF', BJ: 'XOF', NE: 'XOF', TG: 'XOF', GN: 'XOF',
  CM: 'XAF', GA: 'XAF', CG: 'XAF', CF: 'XAF', TD: 'XAF', GQ: 'XAF',
  NG: 'NGN', ZA: 'ZAR', EG: 'EGP', MA: 'MAD', DZ: 'DZD', TN: 'TND',
  KE: 'KES', GH: 'GHS', CD: 'CDF',
  RW: 'EUR', BI: 'EUR', DJ: 'USD', ER: 'USD', ET: 'USD', LR: 'USD', GM: 'USD',
  MZ: 'USD', AO: 'USD', NA: 'USD', SZ: 'USD', LS: 'USD', ZW: 'USD', ZM: 'USD',
  MW: 'USD', MG: 'EUR', MU: 'EUR', SC: 'EUR', KM: 'EUR',
  // Asia
  JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', PK: 'PKR', BD: 'BDT',
  TH: 'THB', VN: 'VND', ID: 'IDR', PH: 'PHP', MY: 'MYR', SG: 'SGD',
  HK: 'HKD', TW: 'TWD',
  // Middle East
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', IL: 'ILS', BH: 'USD', OM: 'USD', JO: 'USD', LB: 'USD', IQ: 'USD',
  // Oceania
  AU: 'AUD', NZ: 'NZD', FJ: 'USD', PG: 'USD', WS: 'USD', TO: 'USD', SB: 'USD', VU: 'USD',
}

// Devises supportées
const SUPPORTED_CURRENCIES = new Set([
  'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'TRY', 'RUB', 'UAH',
  'USD', 'CAD', 'MXN', 'BRL', 'ARS', 'COP', 'CLP', 'PEN',
  'XOF', 'XAF', 'NGN', 'ZAR', 'EGP', 'MAD', 'DZD', 'TND', 'KES', 'GHS', 'CDF',
  'JPY', 'CNY', 'KRW', 'INR', 'PKR', 'BDT', 'THB', 'VND', 'IDR', 'PHP', 'MYR', 'SGD', 'HKD', 'TWD',
  'AED', 'SAR', 'QAR', 'KWD', 'ILS',
  'AUD', 'NZD',
])

const DEFAULT_CURRENCY = 'EUR'
const DEFAULT_COUNTRY = 'FR'

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    let countryCode = DEFAULT_COUNTRY
    let countryName = 'France'
    let source = 'default'

    // ===== Stratégie 1: IP Géolocalisation =====
    try {
      const forwarded = req.headers.get('x-forwarded-for')
      const realIp = req.headers.get('x-real-ip')
      const clientIp = forwarded?.split(',')[0]?.trim() || realIp || ''

      // Ignorer les IPs locales/privées
      const isPrivateIp = !clientIp ||
        clientIp === '127.0.0.1' ||
        clientIp === '::1' ||
        clientIp.startsWith('10.') ||
        clientIp.startsWith('192.168.') ||
        clientIp.startsWith('172.16.')

      if (!isPrivateIp && clientIp) {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 5000)
        const geoRes = await fetch(
          `http://ip-api.com/json/${clientIp}?fields=status,countryCode,country,currency`,
          { signal: controller.signal }
        )

        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.status === 'success' && geoData.countryCode) {
            countryCode = geoData.countryCode
            countryName = geoData.country || countryCode
            source = 'ip_geolocation'
          }
        }
      }
    } catch (err) {
      console.warn('IP geolocation failed:', err)
    }

    // ===== Stratégie 2: Accept-Language header =====
    if (source === 'default') {
      try {
        const acceptLang = req.headers.get('accept-language')
        if (acceptLang) {
          const languages = acceptLang.split(',').map((l: string) => {
            const [lang] = l.trim().split(';')
            return lang.trim()
          })

          for (const lang of languages) {
            const match = lang.match(/^[a-z]{2}-([A-Z]{2})$/i)
            if (match) {
              const detectedCountry = match[1].toUpperCase()
              if (COUNTRY_CURRENCY[detectedCountry]) {
                countryCode = detectedCountry
                source = 'accept_language'
                break
              }
            }
          }
        }
      } catch {
        // Non-critique
      }
    }

    // Mapper pays → devise
    const currencyCode = COUNTRY_CURRENCY[countryCode] || DEFAULT_CURRENCY
    const isSupported = SUPPORTED_CURRENCIES.has(currencyCode)

    return new Response(
      JSON.stringify({
        currencyCode: isSupported ? currencyCode : DEFAULT_CURRENCY,
        countryCode,
        countryName,
        source,
        supported: isSupported,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Currency detect error:', error)
    return new Response(
      JSON.stringify({
        currencyCode: DEFAULT_CURRENCY,
        countryCode: DEFAULT_COUNTRY,
        countryName: 'France',
        source: 'fallback',
        supported: true,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
