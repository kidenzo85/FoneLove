import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Request withdrawal of received FoneLove
export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json()

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Get config
    const config = await prisma.foneLoveConfig.findFirst()
    const minWithdraw = config?.minWithdrawAmount ?? 10
    const commission = config?.commissionPercent ?? 40
    const withdrawValue = config?.withdrawValueEur ?? 0.30

    if (amount < minWithdraw) {
      return NextResponse.json({
        error: `Minimum ${minWithdraw} FoneLove pour retirer`,
        minimum: minWithdraw,
      }, { status: 400 })
    }

    // Check received balance
    const wallet = await prisma.foneLoveWallet.findUnique({
      where: { userId },
    })

    if (!wallet || wallet.receivedBalance < amount) {
      return NextResponse.json({
        error: 'Solde FoneLove reçus insuffisant',
        receivedBalance: wallet?.receivedBalance ?? 0,
      }, { status: 400 })
    }

    // Calculate payout
    const grossValue = amount * withdrawValue
    const commissionAmount = grossValue * (commission / 100)
    const netPayout = grossValue - commissionAmount

    // Debit received balance
    await prisma.foneLoveWallet.update({
      where: { userId },
      data: {
        receivedBalance: { decrement: amount },
        totalWithdrawn: { increment: amount },
      },
    })

    // Create withdrawal transaction
    await prisma.foneLoveTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'withdraw',
        amount: -amount,
        description: `Retrait de ${amount} FoneLove → ${netPayout.toFixed(2)}€ (commission ${commission}%)`,
        metadata: JSON.stringify({
          grossValue,
          commissionAmount,
          netPayout,
          commissionPercent: commission,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      withdrawal: {
        foneLoveAmount: amount,
        grossValue,
        commission: commissionAmount,
        commissionPercent: commission,
        netPayout,
        currency: 'EUR',
      },
      newReceivedBalance: wallet.receivedBalance - amount,
    })
  } catch (err) {
    console.error('FoneLove withdraw error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
