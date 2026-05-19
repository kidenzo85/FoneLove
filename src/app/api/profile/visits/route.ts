import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Check if the user has the 'see_visitors' feature active
    const now = new Date()
    const activeSeeVisitors = await prisma.activePremiumFeature.findFirst({
      where: {
        userId,
        action: 'see_visitors',
        expiresAt: { gt: now },
        isConsumed: false,
      },
    })
    const canSeeVisitors = !!activeSeeVisitors

    const visits = await prisma.profileVisit.findMany({
      where: { profileId: userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            bio: true,
            mood: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const formatted = visits.map((v) => {
      const visitor = v.user
      
      // If they don't have the premium feature, obfuscate the visitor data
      if (!canSeeVisitors) {
        return {
          id: visitor.id,
          firstName: '?????',
          bio: null,
          mood: null,
          photos: [], // Hide photos
          city: null,
          jobTitle: null,
          visitedAt: v.createdAt,
          isHidden: true,
        }
      }

      return {
        id: visitor.id,
        firstName: visitor.firstName,
        bio: visitor.bio,
        mood: visitor.mood,
        photos: visitor.photos.map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
        city: visitor.profile?.city,
        jobTitle: visitor.profile?.jobTitle,
        visitedAt: v.createdAt,
        isHidden: false,
      }
    })

    return NextResponse.json({ 
      visits: formatted,
      hasPremiumAccess: canSeeVisitors 
    })
  } catch (error) {
    console.error('Profile visits GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { visitorId, profileId } = await req.json()

    if (!visitorId || !profileId) {
      return NextResponse.json({ error: 'visitorId et profileId requis' }, { status: 400 })
    }

    // Check if the visitor has 'ghost_mode' active
    const now = new Date()
    const activeGhostMode = await prisma.activePremiumFeature.findFirst({
      where: {
        userId: visitorId,
        action: 'ghost_mode',
        expiresAt: { gt: now },
        isConsumed: false,
      },
    })

    // If ghost mode is active, do not record the visit
    if (activeGhostMode) {
      return NextResponse.json({ success: true, ghostMode: true })
    }

    const visit = await prisma.profileVisit.create({
      data: {
        visitorId,
        profileId,
      },
    })

    return NextResponse.json({ visit })
  } catch (error) {
    console.error('Profile visit POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
