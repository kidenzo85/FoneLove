import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Recharge FoneLove wallet
export async function POST(req: NextRequest) {
  try {
    const { userId, amount, paymentMethod } = await req.json()

    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (amount < 1 || amount > 10000) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
    }

    // If paying with CC, check CC balance and debit
    if (paymentMethod === 'cc') {
      const ccWallet = await prisma.wallet.findUnique({
        where: { userId },
      })

      // 1 FoneLove = 5 CC (configurable)
      const config = await prisma.foneLoveConfig.findFirst()
      const ccCost = Math.ceil(amount * 5) // 5 CC per FoneLove by default

      if (!ccWallet || ccWallet.balance < ccCost) {
        return NextResponse.json({
          error: 'Solde ConnectCoin insuffisant',
          ccBalance: ccWallet?.balance ?? 0,
          ccNeeded: ccCost,
        }, { status: 400 })
      }

      // Debit CC wallet
      await prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: ccCost },
          totalSpent: { increment: ccCost },
        },
      })

      // Create CC transaction
      await prisma.transaction.create({
        data: {
          walletId: ccWallet.id,
          type: 'spend',
          amount: -ccCost,
          action: 'fonelove_recharge',
          description: `Conversion ${ccCost} CC → ${amount} FoneLove`,
        },
      })
    }
    // If external payment, simulate success (no real payment gateway)

    // Upsert FoneLove wallet and add balance
    const wallet = await prisma.foneLoveWallet.upsert({
      where: { userId },
      create: {
        userId,
        balance: amount,
      },
      update: {
        balance: { increment: amount },
      },
    })

    // Create FoneLove transaction
    await prisma.foneLoveTransaction.create({
      data: {
        walletId: wallet.id,
        type: paymentMethod === 'cc' ? 'convert_from_cc' : 'recharge',
        amount: amount,
        description: paymentMethod === 'cc'
          ? `Conversion CC → ${amount} FoneLove`
          : `Achat de ${amount} FoneLove`,
      },
    })

    return NextResponse.json({
      success: true,
      newBalance: wallet.balance,
    })
  } catch (err) {
    console.error('FoneLove recharge error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
