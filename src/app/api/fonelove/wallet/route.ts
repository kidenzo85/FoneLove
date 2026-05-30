import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch or create FoneLove wallet for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 })
  }

  try {
    // Ensure user exists first
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!userExists) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Upsert wallet — auto-create if doesn't exist
    let wallet = await prisma.foneLoveWallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      wallet = await prisma.foneLoveWallet.create({
        data: { userId },
      })
    } else if (wallet.receivedBalance > 0) {
      // Auto-migrate old receivedBalance to unified balance
      wallet = await prisma.foneLoveWallet.update({
        where: { id: wallet.id },
        data: {
          balance: wallet.balance + wallet.receivedBalance,
          receivedBalance: 0,
        },
      })
    }

    return NextResponse.json({
      balance: wallet.balance,
      totalSent: wallet.totalSent,
      totalReceived: wallet.totalReceived,
      totalWithdrawn: wallet.totalWithdrawn,
    })
  } catch (err) {
    console.error('FoneLove wallet GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
