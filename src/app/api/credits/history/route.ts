import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const pageParam = req.nextUrl.searchParams.get('page')
    const limitParam = req.nextUrl.searchParams.get('limit')

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    const page = Math.max(1, parseInt(pageParam || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10)))
    const skip = (page - 1) * limit

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return NextResponse.json({
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      })
    }

    // Get total count
    const total = await prisma.transaction.count({
      where: { walletId: wallet.id },
    })

    // Get paginated transactions
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      action: tx.action,
      packType: tx.packType,
      description: tx.description,
      metadata: tx.metadata,
      date: tx.createdAt,
    }))

    // Get payment orders (excluding fonelove)
    const orders = await prisma.paymentOrder.findMany({
      where: { 
        userId,
        NOT: { packType: { startsWith: 'fonelove_' } }
      },
      orderBy: { createdAt: 'desc' },
      take: 30, // Just fetch the 30 most recent for now
    })

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      packType: o.packType,
      amountXAF: o.amountXAF,
      ccAmount: o.ccAmount,
      status: o.status,
      createdAt: o.createdAt,
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      orders: formattedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('History GET error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'historique' }, { status: 500 })
  }
}
