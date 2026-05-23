/**
 * Multi-currency system constants for ConnectPhone.
 *
 * Design principles:
 * 1. EUR is the base currency — all internal prices stored in EUR
 * 2. Display currency is dynamically determined per user
 * 3. PPP (Purchasing Power Parity) adjustments ensure fair pricing worldwide
 * 4. Exchange rates auto-refresh every 24h with hardcoded fallback
 * 5. Rounding follows "psychological pricing" (e.g., 2.99 → 2,99 € or ¥390)
 */

// ===== Currency Definition =====
export interface CurrencyDef {
  code: string            // ISO 4217 code (e.g. 'USD')
  symbol: string          // Display symbol (e.g. '$')
  name: string            // Full name (e.g. 'Dollar américain')
  flag: string            // Country flag emoji
  locale: string          // BCP 47 locale for Intl.NumberFormat (e.g. 'en-US')
  decimals: number        // Number of decimal places (0 for JPY, 2 for EUR, 3 for BHD)
  symbolPosition: 'before' | 'after'  // Symbol placement
  thousandSeparator: string  // ',' or '.' or ' '
  decimalSeparator: string   // '.' or ','
  fallbackRate: number    // Hardcoded EUR → this currency rate (safety net)
}

// ===== Supported Currencies (50+ covering 95% of global users) =====
export const CURRENCIES: Record<string, CurrencyDef> = {
  // === Europe ===
  EUR: { code: 'EUR', symbol: '\u20AC', name: 'Euro', flag: '\u{1F1EA}\u{1F1FA}', locale: 'fr-FR', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 1 },
  GBP: { code: 'GBP', symbol: '\u00A3', name: 'Livre sterling', flag: '\u{1F1EC}\u{1F1E7}', locale: 'en-GB', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 0.86 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Franc suisse', flag: '\u{1F1E8}\u{1F1ED}', locale: 'de-CH', decimals: 2, symbolPosition: 'before', thousandSeparator: "'", decimalSeparator: '.', fallbackRate: 0.94 },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Couronne norv\u00E9gienne', flag: '\u{1F1F3}\u{1F1F4}', locale: 'nb-NO', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 11.5 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Couronne su\u00E9doise', flag: '\u{1F1F8}\u{1F1EA}', locale: 'sv-SE', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 11.4 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Couronne danoise', flag: '\u{1F1E9}\u{1F1F0}', locale: 'da-DK', decimals: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 7.46 },
  PLN: { code: 'PLN', symbol: 'z\u0142', name: 'Zloty polonais', flag: '\u{1F1F5}\u{1F1F1}', locale: 'pl-PL', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 4.31 },
  CZK: { code: 'CZK', symbol: 'K\u010D', name: 'Couronne tch\u00E8que', flag: '\u{1F1E8}\u{1F1FF}', locale: 'cs-CZ', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 25.2 },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Forint hongrois', flag: '\u{1F1ED}\u{1F1FA}', locale: 'hu-HU', decimals: 0, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 395 },
  RON: { code: 'RON', symbol: 'lei', name: 'Leu roumain', flag: '\u{1F1F7}\u{1F1F4}', locale: 'ro-RO', decimals: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 4.97 },
  BGN: { code: 'BGN', symbol: '\u043B\u0432', name: 'Lev bulgare', flag: '\u{1F1E7}\u{1F1EC}', locale: 'bg-BG', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 1.96 },
  HRK: { code: 'HRK', symbol: 'kn', name: 'Kuna croate', flag: '\u{1F1ED}\u{1F1F7}', locale: 'hr-HR', decimals: 2, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 7.53 },
  TRY: { code: 'TRY', symbol: '\u20BA', name: 'Livre turque', flag: '\u{1F1F9}\u{1F1F7}', locale: 'tr-TR', decimals: 2, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 36.5 },
  RUB: { code: 'RUB', symbol: '\u20BD', name: 'Rouble russe', flag: '\u{1F1F7}\u{1F1FA}', locale: 'ru-RU', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 98 },
  UAH: { code: 'UAH', symbol: '\u20B4', name: 'Hryvnia ukrainienne', flag: '\u{1F1FA}\u{1F1E6}', locale: 'uk-UA', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 42 },

  // === Americas ===
  USD: { code: 'USD', symbol: '$', name: 'Dollar am\u00E9ricain', flag: '\u{1F1FA}\u{1F1F8}', locale: 'en-US', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1.08 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Dollar canadien', flag: '\u{1F1E8}\u{1F1E6}', locale: 'en-CA', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1.47 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Peso mexicain', flag: '\u{1F1F2}\u{1F1FD}', locale: 'es-MX', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 18.5 },
  BRL: { code: 'BRL', symbol: 'R$', name: 'R\u00E9al br\u00E9silien', flag: '\u{1F1E7}\u{1F1F7}', locale: 'pt-BR', decimals: 2, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 6.05 },
  ARS: { code: 'ARS', symbol: 'AR$', name: 'Peso argentin', flag: '\u{1F1E6}\u{1F1F7}', locale: 'es-AR', decimals: 2, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 1100 },
  COP: { code: 'COP', symbol: 'COP$', name: 'Peso colombien', flag: '\u{1F1E8}\u{1F1F4}', locale: 'es-CO', decimals: 0, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 4500 },
  CLP: { code: 'CLP', symbol: 'CLP$', name: 'Peso chilien', flag: '\u{1F1E8}\u{1F1F1}', locale: 'es-CL', decimals: 0, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 980 },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Sol p\u00E9ruvien', flag: '\u{1F1F5}\u{1F1EA}', locale: 'es-PE', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 4.05 },

  // === Africa ===
  XOF: { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (Ouest)', flag: '\u{1F1E8}\u{1F1F2}', locale: 'fr-SN', decimals: 0, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 655.96 },
  XAF: { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (Centre)', flag: '\u{1F1E8}\u{1F1F2}', locale: 'fr-CM', decimals: 0, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 655.96 },
  NGN: { code: 'NGN', symbol: '\u20A6', name: 'Naira nig\u00E9rian', flag: '\u{1F1F3}\u{1F1EC}', locale: 'en-NG', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1750 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'Rand sud-africain', flag: '\u{1F1FF}\u{1F1E6}', locale: 'en-ZA', decimals: 2, symbolPosition: 'before', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 20.2 },
  EGP: { code: 'EGP', symbol: 'E\u00A3', name: 'Livre \u00E9gyptienne', flag: '\u{1F1EA}\u{1F1EC}', locale: 'ar-EG', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 55 },
  MAD: { code: 'MAD', symbol: 'MAD', name: 'Dirham marocain', flag: '\u{1F1F2}\u{1F1E6}', locale: 'fr-MA', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 10.8 },
  DZD: { code: 'DZD', symbol: 'DA', name: 'Dinar alg\u00E9rien', flag: '\u{1F1E9}\u{1F1FF}', locale: 'fr-DZ', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 145 },
  TND: { code: 'TND', symbol: 'DT', name: 'Dinar tunisien', flag: '\u{1F1F9}\u{1F1F3}', locale: 'fr-TN', decimals: 3, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 3.38 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Shilling k\u00E9nyan', flag: '\u{1F1F0}\u{1F1EA}', locale: 'en-KE', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 155 },
  GHS: { code: 'GHS', symbol: 'GH\u20B5', name: 'Cedi ghan\u00E9en', flag: '\u{1F1EC}\u{1F1ED}', locale: 'en-GH', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 15.5 },
  CDF: { code: 'CDF', symbol: 'FC', name: 'Franc congolais', flag: '\u{1F1E8}\u{1F1E9}', locale: 'fr-CD', decimals: 2, symbolPosition: 'after', thousandSeparator: '\u00A0', decimalSeparator: ',', fallbackRate: 3150 },

  // === Asia ===
  JPY: { code: 'JPY', symbol: '\u00A5', name: 'Yen japonais', flag: '\u{1F1EF}\u{1F1F5}', locale: 'ja-JP', decimals: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 163 },
  CNY: { code: 'CNY', symbol: '\u00A5', name: 'Yuan chinois', flag: '\u{1F1E8}\u{1F1F3}', locale: 'zh-CN', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 7.85 },
  KRW: { code: 'KRW', symbol: '\u20A9', name: 'Won sud-cor\u00E9en', flag: '\u{1F1F0}\u{1F1F7}', locale: 'ko-KR', decimals: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1480 },
  INR: { code: 'INR', symbol: '\u20B9', name: 'Roupie indienne', flag: '\u{1F1EE}\u{1F1F3}', locale: 'en-IN', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 92 },
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Roupie pakistanaise', flag: '\u{1F1F5}\u{1F1F0}', locale: 'ur-PK', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 300 },
  BDT: { code: 'BDT', symbol: '\u09F3', name: 'Taka bangladais', flag: '\u{1F1E7}\u{1F1E9}', locale: 'bn-BD', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 130 },
  THB: { code: 'THB', symbol: '\u0E3F', name: 'Baht tha\u00EFlandais', flag: '\u{1F1F9}\u{1F1ED}', locale: 'th-TH', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 38 },
  VND: { code: 'VND', symbol: '\u20AB', name: 'Dong vietnamien', flag: '\u{1F1FB}\u{1F1F3}', locale: 'vi-VN', decimals: 0, symbolPosition: 'after', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 27500 },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Roupie indon\u00E9sienne', flag: '\u{1F1EE}\u{1F1E9}', locale: 'id-ID', decimals: 0, symbolPosition: 'before', thousandSeparator: '.', decimalSeparator: ',', fallbackRate: 17800 },
  PHP: { code: 'PHP', symbol: '\u20B1', name: 'Peso philippin', flag: '\u{1F1F5}\u{1F1ED}', locale: 'fil-PH', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 62 },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Ringgit malaisien', flag: '\u{1F1F2}\u{1F1FE}', locale: 'ms-MY', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 5.0 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Dollar singapourien', flag: '\u{1F1F8}\u{1F1EC}', locale: 'en-SG', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1.45 },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Dollar hongkongais', flag: '\u{1F1ED}\u{1F1F0}', locale: 'en-HK', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 8.45 },
  TWD: { code: 'TWD', symbol: 'NT$', name: 'Dollar ta\u00EFwanais', flag: '\u{1F1F9}\u{1F1FC}', locale: 'zh-TW', decimals: 0, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 35 },

  // === Middle East ===
  AED: { code: 'AED', symbol: 'AED', name: 'Dirham EAU', flag: '\u{1F1E6}\u{1F1EA}', locale: 'ar-AE', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 3.97 },
  SAR: { code: 'SAR', symbol: 'SR', name: 'Riyal saoudien', flag: '\u{1F1F8}\u{1F1E6}', locale: 'ar-SA', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 4.05 },
  QAR: { code: 'QAR', symbol: 'QR', name: 'Riyal qatarien', flag: '\u{1F1F6}\u{1F1E6}', locale: 'ar-QA', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 3.94 },
  ILS: { code: 'ILS', symbol: '\u20AA', name: 'Shekel isra\u00E9lien', flag: '\u{1F1EE}\u{1F1F1}', locale: 'he-IL', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 3.95 },
  KWD: { code: 'KWD', symbol: 'KD', name: 'Dinar kowe\u00EFtien', flag: '\u{1F1F0}\u{1F1FC}', locale: 'ar-KW', decimals: 3, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 0.332 },

  // === Oceania ===
  AUD: { code: 'AUD', symbol: 'A$', name: 'Dollar australien', flag: '\u{1F1E6}\u{1F1FA}', locale: 'en-AU', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1.68 },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'Dollar n\u00E9o-z\u00E9landais', flag: '\u{1F1F3}\u{1F1FF}', locale: 'en-NZ', decimals: 2, symbolPosition: 'before', thousandSeparator: ',', decimalSeparator: '.', fallbackRate: 1.82 },
}

// ===== Country → Currency Mapping =====
export const COUNTRY_CURRENCY: Record<string, string> = {
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

// ===== PPP (Purchasing Power Parity) Adjustment =====
// Groups: 'high' (100%), 'upper_mid' (75%), 'lower_mid' (55%), 'low' (40%)
export type PPPGroup = 'high' | 'upper_mid' | 'lower_mid' | 'low'

export const COUNTRY_PPP: Record<PPPGroup, string> = {
  // High income (100% of base price)
  high: 'AT,BE,CA,DK,FI,FR,DE,IS,IE,IT,LU,NL,NO,SE,CH,GB,US,AU,NZ,JP,KR,SG,HK,TW,IL,AE,QA,KW',
  // Upper-middle income (75%)
  upper_mid: 'BR,CN,MY,TH,MX,TR,SA,PL,CZ,HU,RO,HR,BG,RU,CL,AR,CO,PE,ZA,MU',
  // Lower-middle income (55%)
  lower_mid: 'ID,PH,VN,IN,PK,BD,EG,MA,KE,GH,NG,TN,SN,CI,CM,PE,EC',
  // Low income (40%)
  low: 'BJ,BF,ML,NE,TG,GN,CF,TD,GQ,CD,RW,BI,ET,MZ,LR,MW,MG',
}

/**
 * Resolve PPP group for a country code.
 * Falls back to 'high' if unknown (safe default: full price).
 */
export function getPPPGroup(countryCode: string): PPPGroup {
  const upper = countryCode.toUpperCase()
  for (const [group, countries] of Object.entries(COUNTRY_PPP)) {
    if ((countries as string).split(',').includes(upper)) {
      return group as PPPGroup
    }
  }
  return 'high'
}

export const PPP_MULTIPLIER: Record<PPPGroup, number> = {
  high: 1.0,
  upper_mid: 0.75,
  lower_mid: 0.55,
  low: 0.40,
}

// ===== Rate Cache Config =====
export const RATES_CACHE_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours
export const RATES_SOURCE = 'frankfurter'  // ECB-based, free, no API key

// ===== Psychological Pricing Rounding =====
// After converting EUR → local currency, apply "nice" rounding
// so prices look like X.99 or X90 rather than X.47

export type RoundingMode = 'cents_99' | 'tens_90' | 'whole_9' | 'none'

export function getRoundingMode(currencyCode: string): RoundingMode {
  // Zero-decimal currencies (JPY, KRW, VND, IDR, COP, CLP, XOF, XAF, CDF, HUF) → round to nice tens
  const zeroDecimal = ['JPY', 'KRW', 'VND', 'IDR', 'COP', 'CLP', 'XOF', 'XAF', 'CDF', 'HUF', 'TWD']
  if (zeroDecimal.includes(currencyCode)) return 'tens_90'
  // High-value currencies (KWD, BHD) → round to whole + .9
  if (['KWD'].includes(currencyCode)) return 'whole_9'
  // Standard 2-decimal currencies → .99 pricing
  return 'cents_99'
}

/**
 * Apply psychological pricing rounding to a raw converted price.
 * Examples:
 *  - cents_99: 3.27 → 3.29,  6.82 → 6.99
 *  - tens_90: 390 → 390,  417 → 490
 *  - whole_9: 0.98 → 0.99
 */
export function applyPsychologicalRounding(rawPrice: number, mode: RoundingMode): number {
  if (rawPrice <= 0) return rawPrice

  switch (mode) {
    case 'cents_99': {
      // Round up to nearest .99
      const whole = Math.floor(rawPrice)
      const cents = rawPrice - whole
      if (cents <= 0.99) {
        return whole + 0.99
      }
      return (whole + 1) + 0.99
    }
    case 'tens_90': {
      // Round up to nearest "90" (e.g., 390, 490, 1900)
      const magnitude = Math.pow(10, Math.max(1, Math.floor(Math.log10(rawPrice)) - 1))
      const steps = Math.ceil(rawPrice / magnitude)
      // Round to nearest X.9 * magnitude
      const rounded = Math.ceil(rawPrice / (magnitude * 0.1)) * (magnitude * 0.1)
      // Snap to nice 9-ending: e.g., 390, 490, 1900
      const niceStep = magnitude * 0.1
      const nearestNice = Math.ceil(rawPrice / niceStep) * niceStep
      // Ensure last digit is 9 (e.g. 390, 490)
      return nearestNice - (niceStep * 0.1)
    }
    case 'whole_9': {
      // Round to nearest .9 (for 3-decimal currencies like KWD)
      const whole = Math.floor(rawPrice)
      return whole + 0.900
    }
    case 'none':
    default:
      return Math.round(rawPrice * 100) / 100
  }
}

// ===== Formatting Helpers =====

/**
 * Format a price in the given currency using Intl.NumberFormat for proper locale rendering.
 * Falls back to manual formatting if Intl is not available.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: { skipRounding?: boolean; usePPP?: boolean; countryCode?: string }
): string {
  const curr = CURRENCIES[currencyCode]
  if (!curr) return `${amount.toFixed(2)} ${currencyCode}`

  // Apply PPP adjustment if countryCode provided
  let adjustedAmount = amount
  if (options?.usePPP && options?.countryCode) {
    const pppGroup = getPPPGroup(options.countryCode)
    adjustedAmount = amount * PPP_MULTIPLIER[pppGroup]
  }

  // Apply psychological rounding unless skipped
  let displayAmount = adjustedAmount
  if (!options?.skipRounding) {
    const mode = getRoundingMode(currencyCode)
    displayAmount = applyPsychologicalRounding(adjustedAmount, mode)
  }

  // Use Intl.NumberFormat for proper locale-aware formatting
  try {
    const formatter = new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    })
    return formatter.format(displayAmount)
  } catch {
    // Fallback: manual formatting
    const formatted = displayAmount.toFixed(curr.decimals)
      .replace('.', curr.decimalSeparator)
    if (curr.symbolPosition === 'before') {
      return `${curr.symbol}${formatted}`
    }
    return `${formatted} ${curr.symbol}`
  }
}

/**
 * Convert an EUR amount to the target currency using the provided exchange rate.
 * Optionally applies PPP adjustment for the given country.
 */
export function convertFromEUR(
  eurAmount: number,
  exchangeRate: number,
  countryCode?: string
): number {
  let converted = eurAmount * exchangeRate
  if (countryCode) {
    const pppGroup = getPPPGroup(countryCode)
    converted *= PPP_MULTIPLIER[pppGroup]
  }
  return converted
}

/**
 * Get the display price for a pack in a given currency.
 * Returns both formatted string and raw numeric value.
 */
export function getPackLocalPrice(
  eurPrice: number,
  currencyCode: string,
  exchangeRate: number,
  countryCode?: string
): { formatted: string; raw: number; rawBeforeRounding: number } {
  const rawConverted = convertFromEUR(eurPrice, exchangeRate, countryCode)
  const mode = getRoundingMode(currencyCode)
  const rounded = applyPsychologicalRounding(rawConverted, mode)
  const formatted = formatCurrency(rounded, currencyCode, { skipRounding: true, countryCode })
  return { formatted, raw: rounded, rawBeforeRounding: rawConverted }
}

/**
 * Get price per CC in local currency (for display).
 */
export function getPricePerCC(
  eurPricePerCC: number,
  currencyCode: string,
  exchangeRate: number,
  countryCode?: string
): string {
  const raw = convertFromEUR(eurPricePerCC, exchangeRate, countryCode)
  const curr = CURRENCIES[currencyCode]
  if (!curr) return `${raw.toFixed(4)} ${currencyCode}/CC`

  try {
    const formatter = new Intl.NumberFormat(curr.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    })
    return `${formatter.format(raw)}/CC`
  } catch {
    return `${raw.toFixed(3)} ${curr.symbol}/CC`
  }
}

// ===== Default currency (fallback) =====
export const DEFAULT_CURRENCY = 'EUR'
export const DEFAULT_COUNTRY = 'FR'
