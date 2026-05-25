import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    // Get non-expired moments, optionally excluding current user's
    const where: Record<string, unknown> = {
      expiresAt: { gt: new Date() },
    }
    if (userId) {
      where.userId = { not: userId }
    }

    const moments = await prisma.moment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const formatted = moments.map((m) => ({
      id: m.id,
      userId: m.userId,
      content: m.content,
      mediaUrl: m.mediaUrl,
      type: m.type,
      expiresAt: m.expiresAt,
      createdAt: m.createdAt,
      user: m.user ? {
        id: m.user.id,
        firstName: m.user.firstName,
        photos: m.user.photos.map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
      } : null,
    }))

    return NextResponse.json({ moments: formatted })
  } catch (error) {
    console.error('Moments GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, content, mediaUrl, mediaUrls, type } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }
    
    // Support either single mediaUrl (legacy) or array mediaUrls
    const urlsToProcess = mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0 
      ? mediaUrls 
      : (mediaUrl ? [mediaUrl] : [])

    if (urlsToProcess.length === 0 && type === 'photo') {
      return NextResponse.json({ error: 'Une ou plusieurs photos sont requises' }, { status: 400 })
    }

    // 1. Get the cost configuration for Moments
    const config = await prisma.premiumActionConfig.findUnique({
      where: { action: 'post_moment' }
    })

    if (!config || !config.isEnabled) {
      return NextResponse.json({ error: 'La publication de moments est temporairement désactivée' }, { status: 403 })
    }

    const costPerItem = config.costCC
    const numItems = urlsToProcess.length || 1
    const totalCost = costPerItem * numItems

    // 2. Check user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet || wallet.balance < totalCost) {
      return NextResponse.json({ error: 'Solde de pièces insuffisant' }, { status: 402 })
    }

    const expiresAt = new Date(Date.now() + config.durationMinutes * 60 * 1000)

    // 3. Execute transaction: deduct CC and create Moment
    const [updatedWallet, ...createdMoments] = await prisma.$transaction([
      // Deduct from wallet and update totalSpent
      prisma.wallet.update({
        where: { userId },
        data: { 
          balance: { decrement: totalCost },
          totalSpent: { increment: totalCost }
        }
      }),
      // Create transaction record
      prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'spend',
          amount: totalCost,
          action: 'post_moment',
          description: `Publication de ${numItems} photo(s) (Moment)`,
        }
      }),
      // Create the moments
      ...urlsToProcess.map((url: string) => 
        prisma.moment.create({
          data: {
            userId,
            content: content || null,
            mediaUrl: url || null,
            type: type || 'photo',
            expiresAt,
          },
        })
      )
    ])

    return NextResponse.json({ moments: createdMoments, newBalance: updatedWallet.balance })

  } catch (error) {
    console.error('Moment POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
