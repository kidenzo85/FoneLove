import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/payments/status?orderId=xxx
 * Vérifie le statut d'une commande de paiement
 * Utilisé par le frontend pour polling après redirection
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId')
    const appRef = req.nextUrl.searchParams.get('ref')

    if (!orderId && !appRef) {
      return NextResponse.json(
        { error: 'orderId ou ref requis' },
        { status: 400 }
      )
    }

    const order = await prisma.paymentOrder.findFirst({
      where: orderId
        ? { id: orderId }
        : { appTransactionRef: appRef! },
      select: {
        id: true,
        userId: true,
        packType: true,
        amountXAF: true,
        ccAmount: true,
        bonusCC: true,
        status: true,
        appTransactionRef: true,
        paidAt: true,
        createdAt: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      packType: order.packType,
      amountXAF: order.amountXAF,
      ccAmount: order.ccAmount,
      bonusCC: order.bonusCC,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
    })
  } catch (error) {
    console.error('[Payments/Status] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    )
  }
}
