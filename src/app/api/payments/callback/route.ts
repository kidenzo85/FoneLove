import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { CoolPayCallbackPayload } from '@/lib/coolpay'

export const dynamic = 'force-dynamic'

/**
 * Webhook appelé par CoolPay après un paiement
 * Gère GET et POST car certains opérateurs/passerelles utilisent différentes méthodes
 */

async function processCallback(req: NextRequest) {
  try {
    let payload: any = {}

    // 1. Extraire les données selon la méthode HTTP
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        try {
          payload = await req.json()
        } catch (e) {
          console.error('[CoolPay Callback] Failed to parse JSON', e)
        }
      } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await req.formData()
        payload = Object.fromEntries(formData.entries())
      } else {
        const text = await req.text()
        try {
          payload = JSON.parse(text)
        } catch {
          const params = new URLSearchParams(text)
          payload = Object.fromEntries(params.entries())
        }
      }
    } else {
      // GET
      payload = Object.fromEntries(req.nextUrl.searchParams.entries())
    }

    console.log(`[CoolPay Callback ${req.method}] Received:`, JSON.stringify(payload))

    // Fallbacks possibles pour les noms de champs
    const transaction_ref = payload.transaction_ref || payload.transactionRef
    const app_transaction_ref = payload.app_transaction_ref || payload.appTransactionRef || payload.orderId
    const status = payload.status || payload.transaction_status || ''

    if (!app_transaction_ref) {
      console.error('[CoolPay Callback] Missing app_transaction_ref. Available keys:', Object.keys(payload))
      // On retourne 200 pour dire à CoolPay qu'on a bien reçu, même si on ne peut rien faire
      return NextResponse.json({ message: 'Missing reference, ignored' }, { status: 200 })
    }

    // Trouver la commande correspondante
    const order = await prisma.paymentOrder.findUnique({
      where: { appTransactionRef: app_transaction_ref },
    })

    if (!order) {
      console.error('[CoolPay Callback] Order not found:', app_transaction_ref)
      return NextResponse.json({ message: 'Order not found, ignored' }, { status: 200 })
    }

    // Éviter le double traitement préliminaire (optimisation)
    if (order.status === 'success' || order.status === 'failed' || order.status === 'cancelled') {
      console.log('[CoolPay Callback] Order already processed or in final state:', order.id)
      return NextResponse.json({ message: 'Already processed' }, { status: 200 })
    }

    // Normaliser le statut CoolPay
    const normalizedStatus = (status || '').toUpperCase()

    if (normalizedStatus === 'SUCCESSFUL' || normalizedStatus === 'SUCCESS') {
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
    return NextResponse.json({ status: 'success', message: 'OK' })
  } catch (error) {
    console.error('[CoolPay Callback] Critical Error:', error)
    // Retourner 200 quand même pour éviter les retentatives infinies de la part de la passerelle
    return NextResponse.json({ message: 'Error logged' }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  return processCallback(req)
}

export async function GET(req: NextRequest) {
  // Si on reçoit des paramètres, c'est probablement un callback via GET ou une redirection webhook
  if (req.nextUrl.searchParams.has('status') || req.nextUrl.searchParams.has('transaction_ref') || req.nextUrl.searchParams.has('app_transaction_ref') || req.nextUrl.searchParams.has('orderId')) {
    return processCallback(req)
  }
  return NextResponse.json({ status: 'ok', message: 'CoolPay callback endpoint ready' })
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
  payload: any
) {
  const meta = JSON.parse(order.metadata || '{}')
  const isFoneLoveRecharge = order.packType.startsWith('fonelove_') || meta.type === 'fonelove_recharge'

  await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour la commande SEULEMENT SI elle n'est pas déjà complétée
    // C'est le verrou de concurrence optimiste
    const updateResult = await tx.paymentOrder.updateMany({
      where: { 
        id: order.id,
        status: { notIn: ['success', 'failed', 'cancelled'] } // N'est pas déjà dans un état final
      },
      data: {
        status: 'success',
        coolpayRef: payload.transaction_ref || payload.transactionRef || order.coolpayRef,
        coolpayStatus: 'SUCCESSFUL',
        paidAt: new Date(),
        metadata: JSON.stringify({
          ...meta,
          callbackPayload: payload,
          operatorRef: payload.operator_ref || payload.operatorRef,
          operator: payload.operator,
        }),
      },
    })

    // Si aucune ligne n'a été mise à jour, c'est qu'un autre webhook l'a fait juste avant nous
    if (updateResult.count === 0) {
        console.log('[CoolPay Callback] Concurrent webhook detected, skipping processing for order:', order.id)
        return; // On sort sans rien créditer
    }

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
      // Créer ou mettre à jour le wallet CC avec upsert pour éviter les UniqueConstraintViolation
      // en cas de concurrence imprévue (bien que le updateMany plus haut devrait l'empêcher)
      const wallet = await tx.wallet.upsert({
        where: { userId: order.userId },
        create: { userId: order.userId },
        update: {} // On ne fait rien si le wallet existe déjà, on le mettra à jour plus bas
      })

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
            coolpayRef: payload.transaction_ref || payload.transactionRef,
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

