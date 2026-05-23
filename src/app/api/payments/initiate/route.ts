import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createPaylink, PACK_PRICES_XAF, generateOrderRef } from '@/lib/coolpay'

/**
 * POST /api/payments/initiate
 * Crée une commande de paiement et retourne l'URL CoolPay
 * 
 * Body: { userId, packType, customerPhone?, customerEmail? }
 * Response: { orderId, paymentUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, packType, customerPhone, customerEmail } = await req.json()

    if (!userId || !packType) {
      return NextResponse.json(
        { error: 'userId et packType sont requis' },
        { status: 400 }
      )
    }

    // Vérifier le pack
    const packInfo = await prisma.packConfig.findUnique({
      where: { packKey: packType }
    })
    if (!packInfo || !packInfo.isActive || packInfo.currency !== 'CC') {
      return NextResponse.json(
        { error: 'Pack invalide ou inactif.' },
        { status: 400 }
      )
    }
    const priceXafNum = packInfo.priceXaf ? Number(packInfo.priceXaf) : null;
    const priceEurNum = packInfo.priceEur ? Number(packInfo.priceEur) : 0;
    const amountXAF = priceXafNum ?? Math.round(priceEurNum * 655.96);
    
    if (amountXAF <= 0 || isNaN(amountXAF)) {
      return NextResponse.json(
        { error: 'Le prix du pack n\'est pas défini correctement.' },
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

    // Vérifier qu'il n'y a pas de commande pending récente (anti-spam, 2 min)
    const recentOrder = await prisma.paymentOrder.findFirst({
      where: {
        userId,
        packType,
        status: 'pending',
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentOrder && recentOrder.paymentUrl) {
      // Réutiliser la commande existante
      return NextResponse.json({
        orderId: recentOrder.id,
        appTransactionRef: recentOrder.appTransactionRef,
        paymentUrl: recentOrder.paymentUrl,
        amount: recentOrder.amountXAF,
        ccAmount: recentOrder.ccAmount,
      })
    }

    // Calculer le bonus première commande
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    let firstPurchaseBonus = 0
    if (wallet) {
      const previousPurchases = await prisma.transaction.count({
        where: { walletId: wallet.id, type: 'purchase' },
      })
      if (previousPurchases === 0) {
        firstPurchaseBonus = 20
      }
    } else {
      firstPurchaseBonus = 20 // Pas de wallet = première commande
    }

    const totalCC = packInfo.amount + packInfo.bonusAmount + firstPurchaseBonus
    const appTransactionRef = generateOrderRef()

    // Créer la commande en base
    const order = await prisma.paymentOrder.create({
      data: {
        userId,
        packType,
        amountXAF: amountXAF,
        ccAmount: totalCC,
        bonusCC: packInfo.bonusAmount + firstPurchaseBonus,
        status: 'pending',
        appTransactionRef,
        customerPhone: customerPhone || user.phone,
        customerEmail: customerEmail || user.email,
        metadata: JSON.stringify({
          packLabel: packInfo.name,
          baseCC: packInfo.amount,
          bonusCC: packInfo.bonusAmount,
          firstPurchaseBonus,
        }),
      },
    })

    // Appeler CoolPay pour créer le paylink
    try {
      const coolpayResponse = await createPaylink({
        amountXAF: amountXAF,
        reason: `FoneLove - ${packInfo.name} (${totalCC} CC)`,
        appTransactionRef,
        customerName: user.firstName,
        customerPhone: customerPhone || user.phone,
        customerEmail: customerEmail || user.email,
        lang: 'fr',
      })

      // Mettre à jour la commande avec les infos CoolPay
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
        appTransactionRef,
        paymentUrl: coolpayResponse.payment_url,
        amount: amountXAF,
        ccAmount: totalCC,
      })
    } catch (coolpayError) {
      // Marquer la commande comme failed si CoolPay échoue
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: 'failed', coolpayStatus: 'PAYLINK_ERROR' },
      })

      console.error('[Payments/Initiate] CoolPay error:', coolpayError)
      return NextResponse.json(
        { error: `Debug: ${(coolpayError as Error).message}` },
        { status: 502 }
      )
    }
  } catch (error) {
    console.error('[Payments/Initiate] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
