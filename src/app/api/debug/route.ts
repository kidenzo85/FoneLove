import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const realUsers = await prisma.user.findMany({
      where: {
        email: { not: { contains: 'fonelove.fr' } }
      },
      include: {
        profile: true,
        photos: true
      }
    })
    
    const discoveryCount = await prisma.user.count({
      where: {
        isActive: true,
        isPaused: false,
        profile: { onboardingDone: true },
        photos: { some: {} }
      }
    })

    // Count users missing profiles
    const usersWithoutProfile = await prisma.user.count({
      where: {
        profile: null
      }
    })

    return NextResponse.json({
      userCount,
      discoveryCount,
      usersWithoutProfile,
      realUsers: realUsers.map(u => ({
        id: u.id,
        firstName: u.firstName,
        email: u.email,
        profile: u.profile ? {
          id: u.profile.id,
          onboardingDone: u.profile.onboardingDone,
          city: u.profile.city
        } : null,
        photosCount: u.photos.length,
        isActive: u.isActive,
        isPaused: u.isPaused
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

/**
 * POST /api/debug
 * Repairs users that are missing Profile records.
 * Users with photos get onboardingDone=true (they completed onboarding but Profile wasn't saved).
 * Users without photos get onboardingDone=false (they still need to complete onboarding).
 */
export async function POST() {
  try {
    // Find all users without a Profile record
    const usersWithoutProfile = await prisma.user.findMany({
      where: {
        profile: null
      },
      include: {
        photos: true
      }
    })

    const repaired: string[] = []

    for (const user of usersWithoutProfile) {
      const hasPhotos = user.photos.length > 0
      await prisma.profile.create({
        data: {
          userId: user.id,
          onboardingDone: hasPhotos, // If they have photos, they went through onboarding
          onboardingStep: hasPhotos ? 7 : 0,
          city: user.city || null,
        }
      })
      repaired.push(`${user.firstName} (${user.email}) → onboardingDone=${hasPhotos}`)
    }

    // Also fix any users who have a profile with onboardingDone=false but actually have photos
    const incompleteProfiles = await prisma.user.findMany({
      where: {
        profile: { onboardingDone: false },
        photos: { some: {} },
        isActive: true,
      },
      include: { profile: true, photos: true }
    })

    const upgraded: string[] = []
    for (const user of incompleteProfiles) {
      if (user.profile) {
        await prisma.profile.update({
          where: { userId: user.id },
          data: { onboardingDone: true, onboardingStep: 7 }
        })
        upgraded.push(`${user.firstName} (${user.email}) → onboardingDone upgraded to true`)
      }
    }

    return NextResponse.json({
      success: true,
      repairedCount: repaired.length,
      upgradedCount: upgraded.length,
      repaired,
      upgraded,
    })
  } catch (error) {
    console.error('Debug repair error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
