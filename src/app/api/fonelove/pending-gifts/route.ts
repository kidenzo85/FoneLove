import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Get the oldest unseen gift
    const gift = await prisma.foneLoveGift.findFirst({
      where: {
        receiverId: userId,
        isSeen: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          include: {
            user: {
              select: { firstName: true }
            }
          }
        }
      }
    })

    if (!gift) {
      return NextResponse.json({ gift: null })
    }

    return NextResponse.json({
      gift: {
        id: gift.id,
        amount: gift.amount,
        message: gift.message,
        senderName: gift.sender?.user?.firstName || 'Quelqu\'un',
      }
    })
  } catch (error) {
    console.error('Pending gifts GET error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}
