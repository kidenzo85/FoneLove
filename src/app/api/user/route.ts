import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  try {
    const { userId, onboardingStep, onboardingDone } = await req.json()

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Build profile updates object
    const profileUpdates: Record<string, unknown> = {}
    if (onboardingStep !== undefined) profileUpdates.onboardingStep = onboardingStep
    if (onboardingDone !== undefined) profileUpdates.onboardingDone = onboardingDone

    // Upsert profile with onboarding data
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileUpdates,
      create: {
        userId,
        ...profileUpdates,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Get current streak and increment
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true },
    })

    const currentStreak = user?.streakDays ?? 0

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { streakDays: currentStreak + 1 },
      select: { streakDays: true },
    })

    return NextResponse.json({ streakDays: updatedUser.streakDays })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Delete user from Prisma.
    // Thanks to onDelete: Cascade on all relations in Prisma schema,
    // this will cleanly remove all associated user data (Profile, Photos, Messages, etc).
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true, message: 'Compte supprimé avec succès' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du compte' }, { status: 500 })
  }
}
