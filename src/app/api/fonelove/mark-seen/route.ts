import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { giftId, userId } = await req.json()

    if (!giftId || !userId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    await prisma.foneLoveGift.updateMany({
      where: {
        id: giftId,
        receiverId: userId,
      },
      data: {
        isSeen: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark seen POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
