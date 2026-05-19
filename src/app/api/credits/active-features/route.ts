import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/credits/active-features?userId=xxx
 * Returns all non-expired, non-consumed active premium features for a user,
 * plus inventory counts (super requests, undo tokens, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    const now = new Date()

    // Fetch all active (non-expired, non-consumed) features
    const features = await prisma.activePremiumFeature.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
      },
      orderBy: { activatedAt: 'desc' },
    })

    // Get inventory counts from user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        superRequestsLeft: true,
        isIncognito: true,
      },
    })

    // Count unconsumed undo_pass tokens
    const undoCount = features.filter(
      (f) => f.action === 'undo_pass' && !f.isConsumed
    ).length

    // Count active rose_connect tokens (not consumed)
    const roseCount = features.filter(
      (f) => f.action === 'rose_connect' && !f.isConsumed
    ).length

    // Count extra_request tokens
    const extraRequestCount = features.filter(
      (f) => f.action === 'extra_request' && !f.isConsumed
    ).length

    return NextResponse.json({
      features: features.map((f) => ({
        id: f.id,
        action: f.action,
        activatedAt: f.activatedAt.toISOString(),
        expiresAt: f.expiresAt.toISOString(),
        metadata: f.metadata,
        isConsumed: f.isConsumed,
      })),
      inventory: {
        superRequestCount: user?.superRequestsLeft ?? 0,
        undoCount,
        roseCount,
        extraRequestCount,
      },
    })
  } catch (error) {
    console.error('Active features fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des features actives' },
      { status: 500 }
    )
  }
}
