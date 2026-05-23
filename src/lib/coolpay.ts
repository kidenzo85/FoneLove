/**
 * My-CoolPay Payment Integration Service
 * API Docs: https://documenter.getpostman.com/view/17178321/UV5ZCx8f
 * 
 * Flow:
 * 1. Create a paylink via POST /api/{public_key}/paylink
 * 2. Redirect user to the payment_url
 * 3. Receive callback at /api/payments/callback
 * 4. Credit CC to user wallet
 */

// ===== Configuration =====

const COOLPAY_BASE_URL = 'https://my-coolpay.com/api'

export function getCoolPayPublicKey(): string {
  const key = process.env.COOLPAY_PUBLIC_KEY
  if (!key) throw new Error('COOLPAY_PUBLIC_KEY non configurée')
  return key
}

export function getCoolPayPrivateKey(): string {
  const key = process.env.COOLPAY_PRIVATE_KEY
  if (!key) throw new Error('COOLPAY_PRIVATE_KEY non configurée')
  return key
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.fonelove.com'
}

// ===== Pack Prices in XAF (FCFA) =====
// Conversion approximative EUR → XAF (1 EUR ≈ 656 XAF)
// Prix arrondis pour faciliter le paiement mobile money

export const PACK_PRICES_XAF: Record<string, {
  amountXAF: number
  cc: number
  bonusCC: number
  label: string
  priceLabel: string
}> = {
  decouverte: {
    amountXAF: 2000,
    cc: 30,
    bonusCC: 0,
    label: 'Pack Découverte',
    priceLabel: '2 000 FCFA',
  },
  tendance: {
    amountXAF: 4500,
    cc: 80,
    bonusCC: 5,
    label: 'Pack Tendance',
    priceLabel: '4 500 FCFA',
  },
  passion: {
    amountXAF: 10000,
    cc: 200,
    bonusCC: 15,
    label: 'Pack Passion',
    priceLabel: '10 000 FCFA',
  },
  flamme: {
    amountXAF: 20000,
    cc: 500,
    bonusCC: 40,
    label: 'Pack Flamme',
    priceLabel: '20 000 FCFA',
  },
}

// ===== Paylink API =====

export interface CoolPayPaylinkRequest {
  transaction_amount: number
  transaction_currency: string
  transaction_reason: string
  app_transaction_ref: string
  customer_phone_number?: string
  customer_name?: string
  customer_email?: string
  customer_lang?: string
}

export interface CoolPayPaylinkResponse {
  status: string
  transaction_ref: string
  payment_url: string
}

/**
 * Crée un lien de paiement CoolPay
 * L'utilisateur sera redirigé vers ce lien pour effectuer le paiement
 */
export async function createPaylink(params: {
  amountXAF: number
  reason: string
  appTransactionRef: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  lang?: string
}): Promise<CoolPayPaylinkResponse> {
  const publicKey = getCoolPayPublicKey()
  
  // On ajoute l'orderId en paramètre URL pour le récupérer au retour
  const url = `${COOLPAY_BASE_URL}/${publicKey}/paylink?orderId=${encodeURIComponent(params.appTransactionRef)}`

  const body: CoolPayPaylinkRequest = {
    transaction_amount: params.amountXAF,
    transaction_currency: 'XAF',
    transaction_reason: params.reason,
    app_transaction_ref: params.appTransactionRef,
    customer_name: params.customerName || 'Client FoneLove',
    // customer_phone_number: params.customerPhone || undefined,
    // customer_email: params.customerEmail || undefined,
    customer_lang: params.lang || 'fr',
  }

  console.log('[CoolPay] Creating paylink:', {
    url,
    amount: body.transaction_amount,
    ref: body.app_transaction_ref,
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[CoolPay] Paylink error:', response.status, errorText)
    throw new Error(`CoolPay API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (data.status !== 'success') {
    console.error('[CoolPay] Paylink failed:', data)
    throw new Error(`CoolPay paylink failed: ${JSON.stringify(data)}`)
  }

  console.log('[CoolPay] Paylink created successfully:', {
    ref: data.transaction_ref,
    url: data.payment_url,
  })

  return data as CoolPayPaylinkResponse
}

// ===== Callback Verification =====

/**
 * Vérifie la signature d'un callback CoolPay
 * Le callback envoie le statut de la transaction
 */
export interface CoolPayCallbackPayload {
  // Champs standards du callback CoolPay
  transaction_ref: string
  app_transaction_ref: string
  status: string // SUCCESSFUL, FAILED, CANCELLED
  operator_ref?: string
  operator?: string
  transaction_amount?: number
  transaction_currency?: string
  customer_phone_number?: string
  customer_name?: string
  customer_email?: string
  [key: string]: unknown
}

/**
 * Génère une référence unique pour une commande
 * Format: FL-{timestamp}-{random}
 */
export function generateOrderRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `FL-${timestamp}-${random}`
}
