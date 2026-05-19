import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/credits/active-features/consume
 * Marks a one-shot feature (like undo_pass) as consumed.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, featureId } = await req.json()

    if (!userId || !featureId) {
      return NextResponse.json(
        { error: 'userId et featureId sont requis' },
        { status: 400 }
      )
    }

    // Verify the feature belongs to the user and is not already consumed
    const feature = await prisma.activePremiumFeature.findFirst({
      where: {
        id: featureId,
        userId,
        isConsumed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature non trouvée ou déjà utilisée' },
        { status: 404 }
      )
    }

    // Mark as consumed
    await prisma.activePremiumFeature.update({
      where: { id: featureId },
      data: { isConsumed: true },
    })

    return NextResponse.json({ success: true, action: feature.action })
  } catch (error) {
    console.error('Consume feature error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la consommation de la feature' },
      { status: 500 }
    )
  }
}
