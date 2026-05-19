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
    const { userId, content, mediaUrl, type } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const moment = await prisma.moment.create({
      data: {
        userId,
        content: content || null,
        mediaUrl: mediaUrl || null,
        type: type || 'photo',
        expiresAt,
      },
    })

    return NextResponse.json({ moment })
  } catch (error) {
    console.error('Moment POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
