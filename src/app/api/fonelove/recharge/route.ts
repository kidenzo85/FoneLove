import { NextRequest, NextResponse } from 'next/server'

/**
 * DEPRECATED — This endpoint is DISABLED.
 * 
 * Previously allowed converting ConnectCoins (CC) into FoneLove.
 * This conversion path has been permanently removed:
 *   - FoneLove can ONLY be purchased with real money via CoolPay
 *     (/api/fonelove/recharge/initiate → CoolPay → /api/payments/callback)
 *   - ConnectCoins are an independent premium currency and cannot be
 *     exchanged for FoneLove.
 * 
 * This stub remains to prevent 404s on old client versions while they update.
 */

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'La conversion ConnectCoin → FoneLove n\'est plus disponible. Utilise le paiement mobile pour acheter des FoneLove.',
      redirect: '/api/fonelove/recharge/initiate',
    },
    { status: 410 }
  )
}
