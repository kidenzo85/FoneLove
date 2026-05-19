import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId } = await req.json()

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: 'senderId et receiverId requis' }, { status: 400 })
    }

    // Check if like already exists
    const existing = await prisma.like.findFirst({
      where: {
        senderId,
        receiverId,
      },
    })

    if (existing) {
      // Unlike - delete the like
      await prisma.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    }

    // Check for reverse like (mutual)
    const reverseLike = await prisma.like.findFirst({
      where: {
        senderId: receiverId,
        receiverId: senderId,
      },
    })

    const isMutual = !!reverseLike

    // Create like
    const like = await prisma.like.create({
      data: {
        senderId,
        receiverId,
        isMutual,
      },
    })

    // If mutual, update the reverse like
    if (reverseLike) {
      await prisma.like.update({
        where: { id: reverseLike.id },
        data: { isMutual: true },
      })
    }

    return NextResponse.json({ liked: true, isMutual, like })
  } catch (error) {
    console.error('Like POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Get mutual likes where user is sender or receiver
    const likes = await prisma.like.findMany({
      where: {
        isMutual: true,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
          },
        },
        receiver: {
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
    })

    return NextResponse.json({ likes })
  } catch (error) {
    console.error('Like GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
