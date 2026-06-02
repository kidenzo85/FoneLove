import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createPaylink, generateOrderRef } from '@/lib/coolpay'
import { applyPsychologicalRounding, getRoundingMode } from '@/lib/currency-constants'

/**
 * POST /api/fonelove/recharge/initiate
 * Crée un lien de paiement CoolPay pour acheter des FoneLove
 *
 * Body: { userId, flAmount }
 * Response: { orderId, paymentUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, flAmount } = await req.json()

    if (!userId || !flAmount || flAmount <= 0) {
      return NextResponse.json({ error: 'userId et flAmount valide sont requis' }, { status: 400 })
    }

    // Récupérer la config globale FoneLove pour le prix unitaire
    let config = await prisma.foneLoveConfig.findFirst()
    if (!config) {
      config = await prisma.foneLoveConfig.create({ data: {} })
    }

    const unitPriceEur = config.unitPriceEur ?? 0.50
    const priceEur = flAmount * unitPriceEur

    // Convertir en XAF (taux fixe 655.96) et appliquer l'arrondi psychologique comme sur le front-end
    const rawXaf = priceEur * 655.96
    const amountXAF = Math.round(applyPsychologicalRounding(rawXaf, getRoundingMode('XAF')))

    if (amountXAF <= 0) {
      return NextResponse.json(
        { error: `Le prix calculé n'est pas valide.` },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, email: true, phone: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const packKey = `FL_${flAmount}`
    const packLabel = `${flAmount} FoneLove`

    // Anti-spam : vérifier commande récente (2 min)
    const recentOrder = await prisma.paymentOrder.findFirst({
      where: {
        userId,
        packType: packKey,
        status: 'pending',
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentOrder?.paymentUrl) {
      return NextResponse.json({
        orderId: recentOrder.id,
        paymentUrl: recentOrder.paymentUrl,
        flAmount: flAmount,
        amountXAF: amountXAF,
      })
    }

    const appTransactionRef = generateOrderRef()

    // Créer la commande en base (ccAmount = 0 pour FoneLove)
    const order = await prisma.paymentOrder.create({
      data: {
        userId,
        packType: packKey,
        amountXAF: amountXAF,
        ccAmount: 0,       // Pas de CC — c'est du FoneLove
        bonusCC: 0,
        status: 'pending',
        appTransactionRef,
        customerPhone: user.phone,
        customerEmail: user.email,
        metadata: JSON.stringify({
          type: 'fonelove_recharge',
          flAmount: flAmount,
          packLabel: packLabel,
        }),
      },
    })

    // Créer le lien CoolPay
    try {
      const coolpayResponse = await createPaylink({
        amountXAF: amountXAF,
        reason: `FoneLove - ${packLabel}`,
        appTransactionRef,
        customerName: user.firstName,
        customerPhone: user.phone || undefined,
        customerEmail: user.email || undefined,
        lang: 'fr',
      })

      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          coolpayRef: coolpayResponse.transaction_ref,
          paymentUrl: coolpayResponse.payment_url,
          status: 'processing',
        },
      })

      return NextResponse.json({
        orderId: order.id,
        paymentUrl: coolpayResponse.payment_url,
        flAmount: flAmount,
        amountXAF: amountXAF,
      })
    } catch (coolpayError) {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: 'failed', coolpayStatus: 'PAYLINK_ERROR' },
      })

      console.error('[FoneLove Recharge/Initiate] CoolPay error:', coolpayError)
      return NextResponse.json(
        { error: `Debug: ${(coolpayError as Error).message}` },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('[FoneLove Recharge/Initiate] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
