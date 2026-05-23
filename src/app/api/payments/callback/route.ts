import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { CoolPayCallbackPayload } from '@/lib/coolpay'

/**
 * POST /api/payments/callback
 * Webhook appelé par CoolPay après un paiement
 * 
 * CoolPay envoie les données de la transaction :
 * - transaction_ref, app_transaction_ref, status (SUCCESSFUL/FAILED/CANCELLED)
 * - operator_ref, operator, transaction_amount, etc.
 * 
 * ⚠️ Ce endpoint est appelé par CoolPay, pas par le frontend.
 * Il ne nécessite pas d'authentification utilisateur mais vérifie la cohérence des données.
 */
export async function POST(req: NextRequest) {
  try {
    const payload: CoolPayCallbackPayload = await req.json()

    console.log('[CoolPay Callback] Received:', JSON.stringify(payload))

    const { transaction_ref, app_transaction_ref, status } = payload

    if (!app_transaction_ref) {
      console.error('[CoolPay Callback] Missing app_transaction_ref')
      return NextResponse.json({ error: 'Missing app_transaction_ref' }, { status: 400 })
    }

    // Trouver la commande correspondante
    const order = await prisma.paymentOrder.findUnique({
      where: { appTransactionRef: app_transaction_ref },
    })

    if (!order) {
      console.error('[CoolPay Callback] Order not found:', app_transaction_ref)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Éviter le double traitement
    if (order.status === 'success') {
      console.log('[CoolPay Callback] Order already processed:', order.id)
      return NextResponse.json({ message: 'Already processed' })
    }

    // Normaliser le statut CoolPay
    const normalizedStatus = (status || '').toUpperCase()

    if (normalizedStatus === 'SUCCESSFUL') {
      // === PAIEMENT RÉUSSI ===
      await handleSuccessfulPayment(order, payload)
    } else if (normalizedStatus === 'FAILED') {
      // === PAIEMENT ÉCHOUÉ ===
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'failed',
          coolpayRef: transaction_ref || order.coolpayRef,
          coolpayStatus: normalizedStatus,
          metadata: JSON.stringify({
            ...JSON.parse(order.metadata || '{}'),
            callbackPayload: payload,
          }),
        },
      })
      console.log('[CoolPay Callback] Payment failed for order:', order.id)
    } else if (normalizedStatus === 'CANCELLED') {
      // === PAIEMENT ANNULÉ ===
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'cancelled',
          coolpayRef: transaction_ref || order.coolpayRef,
          coolpayStatus: normalizedStatus,
        },
      })
      console.log('[CoolPay Callback] Payment cancelled for order:', order.id)
    } else {
      console.warn('[CoolPay Callback] Unknown status:', normalizedStatus)
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          coolpayStatus: normalizedStatus,
          metadata: JSON.stringify({
            ...JSON.parse(order.metadata || '{}'),
            callbackPayload: payload,
          }),
        },
      })
    }

    // CoolPay attend un 200 OK
    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('[CoolPay Callback] Error:', error)
    // Retourner 200 quand même pour éviter les retentatives infinies
    return NextResponse.json({ message: 'Error logged' })
  }
}

/**
 * Traite un paiement réussi :
 * 1. Met à jour la commande
 * 2. Selon le type (CC ou FoneLove), crédite le bon wallet
 */
async function handleSuccessfulPayment(
  order: {
    id: string
    userId: string
    packType: string
    ccAmount: number
    bonusCC: number
    amountXAF: number
    coolpayRef: string | null
    metadata: string | null
  },
  payload: CoolPayCallbackPayload
) {
  const meta = JSON.parse(order.metadata || '{}')
  const isFoneLoveRecharge = order.packType.startsWith('fonelove_') || meta.type === 'fonelove_recharge'

  await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour la commande
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'success',
        coolpayRef: payload.transaction_ref || order.coolpayRef,
        coolpayStatus: 'SUCCESSFUL',
        paidAt: new Date(),
        metadata: JSON.stringify({
          ...meta,
          callbackPayload: payload,
          operatorRef: payload.operator_ref,
          operator: payload.operator,
        }),
      },
    })

    if (isFoneLoveRecharge) {
      // ===== CRÉDIT FONELOVE =====
      const flAmount = meta.flAmount || 0
      if (flAmount <= 0) {
        console.error('[CoolPay Callback] FoneLove recharge with 0 amount:', order.id)
        return
      }

      // Créer ou mettre à jour le wallet FoneLove
      const flWallet = await tx.foneLoveWallet.upsert({
        where: { userId: order.userId },
        create: { userId: order.userId, balance: flAmount },
        update: { balance: { increment: flAmount } },
      })

      // Créer la transaction FoneLove
      await tx.foneLoveTransaction.create({
        data: {
          walletId: flWallet.id,
          type: 'recharge',
          amount: flAmount,
          description: `Achat ${meta.packLabel || flAmount + ' FoneLove'} (${order.amountXAF} FCFA via CoolPay)`,
        },
      })

      console.log('[CoolPay Callback] ✅ FoneLove credited:', {
        orderId: order.id,
        userId: order.userId,
        flCredited: flAmount,
        amountXAF: order.amountXAF,
      })
    } else {
      // ===== CRÉDIT CONNECTCOINS =====
      let wallet = await tx.wallet.findUnique({
        where: { userId: order.userId },
      })

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: order.userId },
        })
      }

      // Créer la transaction d'achat CC
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'purchase',
          amount: order.ccAmount,
          action: null,
          packType: order.packType,
          description: `${meta.packLabel || order.packType} - ${order.ccAmount} CC (${order.amountXAF} FCFA via CoolPay)`,
          metadata: JSON.stringify({
            packType: order.packType,
            baseCC: meta.baseCC || order.ccAmount - order.bonusCC,
            bonusCC: order.bonusCC,
            firstPurchaseBonus: meta.firstPurchaseBonus || 0,
            amountXAF: order.amountXAF,
            paymentMethod: 'coolpay',
            coolpayRef: payload.transaction_ref,
            operator: payload.operator,
          }),
        },
      })

      // Bonus première commande
      if (meta.firstPurchaseBonus && meta.firstPurchaseBonus > 0) {
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'earn_bonus',
            amount: meta.firstPurchaseBonus,
            description: `Bonus première commande +${meta.firstPurchaseBonus} CC 🎉`,
          },
        })
      }

      // Créditer le wallet CC
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: order.ccAmount },
          totalEarned: { increment: order.ccAmount },
        },
      })

      console.log('[CoolPay Callback] ✅ CC Payment processed:', {
        orderId: order.id,
        userId: order.userId,
        ccCredited: order.ccAmount,
        amountXAF: order.amountXAF,
      })
    }
  })
}

// Permettre aussi les GET pour les tests de connexion
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'CoolPay callback endpoint ready' })
}
