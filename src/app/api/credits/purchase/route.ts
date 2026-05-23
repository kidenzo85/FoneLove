import { NextRequest, NextResponse } from 'next/server'

/**
 * DEPRECATED — This endpoint is DISABLED for security reasons.
 * 
 * It previously allowed direct wallet crediting without payment gateway verification.
 * All real-money purchases MUST go through:
 *   /api/payments/initiate → CoolPay → /api/payments/callback
 * 
 * This stub remains to prevent 404s on old client versions while they update.
 */

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'Cet endpoint est désactivé. Utilise le paiement mobile pour acheter des ConnectCoin.',
      redirect: '/api/payments/initiate',
    },
    { status: 410 }
  )
}
