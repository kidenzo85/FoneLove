import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'orderId est requis' }, { status: 400 })
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
    }

    if (order.status === 'success') {
      return NextResponse.json({ error: 'Commande déjà traitée' }, { status: 400 })
    }

    // Reuse the success logic
    const meta = JSON.parse(order.metadata || '{}')
    const isFoneLoveRecharge = order.packType.startsWith('fonelove_') || meta.type === 'fonelove_recharge'

    await prisma.$transaction(async (tx) => {
      // 1. Update order
      await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: 'success',
          paidAt: new Date(),
          metadata: JSON.stringify({
            ...meta,
            adminResolved: true,
            resolvedAt: new Date().toISOString()
          }),
        },
      })

      if (isFoneLoveRecharge) {
        // Credit FoneLove
        const flAmount = meta.flAmount || 0
        if (flAmount > 0) {
          const flWallet = await tx.foneLoveWallet.upsert({
            where: { userId: order.userId },
            create: { userId: order.userId, balance: flAmount },
            update: { balance: { increment: flAmount } },
          })

          await tx.foneLoveTransaction.create({
            data: {
              walletId: flWallet.id,
              type: 'recharge',
              amount: flAmount,
              description: `Achat manuel ${meta.packLabel || flAmount + ' FoneLove'} (Résolu par Admin)`,
            },
          })
        }
      } else {
        // Credit CC
        let wallet = await tx.wallet.findUnique({
          where: { userId: order.userId },
        })

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: order.userId },
          })
        }

        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'purchase',
            amount: order.ccAmount,
            action: null,
            packType: order.packType,
            description: `${meta.packLabel || order.packType} - ${order.ccAmount} CC (Résolu par Admin)`,
            metadata: JSON.stringify({
              packType: order.packType,
              baseCC: meta.baseCC || order.ccAmount - order.bonusCC,
              bonusCC: order.bonusCC,
              firstPurchaseBonus: meta.firstPurchaseBonus || 0,
              paymentMethod: 'admin_resolve',
            }),
          },
        })

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

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: order.ccAmount },
            totalEarned: { increment: order.ccAmount },
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin/Payments/Resolve] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
