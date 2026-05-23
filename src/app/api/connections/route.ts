import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Get connections where user is either user1 or user2
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            mood: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
            profile: true,
            badges: {
              select: { id: true, type: true, earnedAt: true },
            },
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            mood: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
            profile: true,
            badges: {
              select: { id: true, type: true, earnedAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = connections.map((conn) => {
      const isUser1 = conn.user1Id === userId
      const otherUser = isUser1 ? conn.user2 : conn.user1
      const phone = isUser1 ? conn.phoneNumber2 : conn.phoneNumber1

      return {
        id: conn.id,
        user1Id: conn.user1Id,
        user2Id: conn.user2Id,
        createdAt: conn.createdAt,
        phone,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          bio: otherUser.bio,
          mood: otherUser.mood,
          photos: otherUser.photos.map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
          badges: otherUser.badges.map((b) => ({ id: b.id, type: b.type, earnedAt: b.earnedAt })),
          city: otherUser.profile?.city,
          jobTitle: otherUser.profile?.jobTitle,
        },
      }
    })

    return NextResponse.json({ connections: formatted })
  } catch (error) {
    console.error('Connections GET error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}
