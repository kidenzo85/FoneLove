import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch FoneLove transaction history
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId requis' }, { status: 400 })
  }

  try {
    const wallet = await prisma.foneLoveWallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return NextResponse.json({ transactions: [], gifts: [] })
    }

    // Fetch transactions
    const transactions = await prisma.foneLoveTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Fetch recent gifts sent and received
    const [sentGifts, receivedGifts] = await Promise.all([
      prisma.foneLoveGift.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.foneLoveGift.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    // Enrich gifts with user names
    const allUserIds = [
      ...sentGifts.map(g => g.receiverId),
      ...receivedGifts.map(g => g.senderId),
    ]
    const uniqueUserIds = [...new Set(allUserIds)]
    const users = await prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true, firstName: true },
    })
    const userMap = new Map(users.map(u => [u.id, u.firstName]))

    const enrichedGifts = [
      ...sentGifts.map(g => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
        receiverName: userMap.get(g.receiverId) || 'Utilisateur',
        direction: 'sent' as const,
      })),
      ...receivedGifts.map(g => ({
        ...g,
        createdAt: g.createdAt.toISOString(),
        senderName: userMap.get(g.senderId) || 'Utilisateur',
        direction: 'received' as const,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      transactions: transactions.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
      })),
      gifts: enrichedGifts.slice(0, 30),
    })
  } catch (err) {
    console.error('FoneLove history error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
