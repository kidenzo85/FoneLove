import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/auth/sync-user
 * Ensures the user exists in the Prisma/SQLite database and has a wallet.
 * This is the final step of onboarding or triggered during profile updates.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, onboardingDone } = await req.json()

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Données utilisateur requises' }, { status: 400 })
    }

    console.log(`Syncing user: ${user.id}, onboardingDone: ${onboardingDone}`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    })

    if (!existingUser) {
      // Check if a user with the same email or phone already exists under a different ID
      const OR: any[] = []
      if (user.email) OR.push({ email: user.email })
      if (user.phone) OR.push({ phone: user.phone })

      if (OR.length > 0) {
        const conflictUser = await prisma.user.findFirst({
          where: { OR },
          include: {
            profile: true,
            photos: { orderBy: { position: 'asc' } },
            prompts: true,
            badges: true,
          }
        })

        if (conflictUser) {
          console.log(`Conflict user found: existing user with email/phone has ID ${conflictUser.id} but sync request has ID ${user.id}`)
          
          let interests = []
          try {
            if (conflictUser.profile?.interests) {
              interests = JSON.parse(conflictUser.profile.interests)
            }
          } catch (e) {
            console.error('Error parsing profile interests:', e)
          }

          const correctUser = {
            id: conflictUser.id,
            email: conflictUser.email,
            phone: conflictUser.phone,
            firstName: conflictUser.firstName,
            lastName: conflictUser.lastName || undefined,
            birthDate: conflictUser.birthDate ? conflictUser.birthDate.toISOString() : undefined,
            gender: conflictUser.gender || undefined,
            bio: conflictUser.bio || undefined,
            isVerified: conflictUser.isVerified,
            isPremium: conflictUser.isPremium,
            profileScore: conflictUser.profileScore,
            streakDays: conflictUser.streakDays,
            dailyBoostUsed: conflictUser.dailyBoostUsed,
            lookingFor: conflictUser.lookingFor || undefined,
            lookingForGender: conflictUser.lookingForGender || undefined,
            city: conflictUser.city || undefined,
            countryCode: conflictUser.countryCode || undefined,
            astrologicalSign: conflictUser.astrologicalSign || undefined,
            height: conflictUser.height || undefined,
            spotifyAnthem: conflictUser.spotifyAnthem || undefined,
            mood: conflictUser.mood || undefined,
            role: conflictUser.role,
            onboardingDone: conflictUser.profile?.onboardingDone ?? false,
            photos: (conflictUser.photos || []).map((p: any) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
            prompts: (conflictUser.prompts || []).map((p: any) => ({ id: p.id, question: p.question, answer: p.answer })),
            badges: (conflictUser.badges || []).map((b: any) => ({ id: b.id, type: b.type, earnedAt: b.earnedAt.toISOString() })),
            interests,
          }

          return NextResponse.json({
            error: 'ID_MISMATCH',
            message: 'User exists with a different ID',
            correctUser
          }, { status: 409 })
        }
      }

      // Create user if not found (should be rare if register/verify-otp worked)
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || `${user.id}@sync.local`,
          phone: user.phone || `+336${Date.now().toString().slice(-8)}`,
          password: 'synced-from-auth',
          firstName: user.firstName || 'Utilisateur',
          lastName: user.lastName || null,
          birthDate: user.birthDate ? new Date(user.birthDate) : null,
          gender: user.gender || null,
          bio: user.bio || null,
          mood: user.mood || null,
          isVerified: user.isVerified ?? false,
          isPremium: user.isPremium ?? false,
          profileScore: user.profileScore ?? 0,
          streakDays: user.streakDays ?? 0,
          dailyBoostUsed: user.dailyBoostUsed ?? false,
          lookingFor: user.lookingFor || null,
          lookingForGender: user.lookingForGender || null,
          city: user.city || null,
          countryCode: user.countryCode || null,
          isActive: true,
          role: (user.email === 'fabricewilliam73@gmail.com') ? 'super_admin' : 'user',
        },
      })
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          birthDate: user.birthDate ? new Date(user.birthDate) : null,
          bio: user.bio,
          mood: user.mood,
          lookingFor: user.lookingFor,
          lookingForGender: user.lookingForGender,
          city: user.city,
          countryCode: user.countryCode,
          profileScore: user.profileScore,
          isActive: true,
          // Guarantee that fabricewilliam73@gmail.com is promoted/kept as super_admin
          ...(user.email === 'fabricewilliam73@gmail.com' ? { role: 'super_admin' } : {}),
        }
      })
    }

    // Update/Create photos
    if (user.photos && user.photos.length > 0) {
      await prisma.photo.deleteMany({ where: { userId: user.id } })
      // Use standard create to avoid any createMany issues on specific environments
      for (const p of user.photos) {
        await prisma.photo.create({
          data: {
            userId: user.id,
            url: p.url,
            position: p.position,
            isPrimary: p.isPrimary,
          }
        })
      }
    }

    // Update/Create prompts
    if (user.prompts && user.prompts.length > 0) {
      await prisma.prompt.deleteMany({ where: { userId: user.id } })
      for (const p of user.prompts) {
        await prisma.prompt.create({
          data: {
            userId: user.id,
            question: p.question,
            answer: p.answer,
          }
        })
      }
    }

    // Ensure wallet exists
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: 10 },
    })

    // Always ensure a Profile record exists for this user
    // If onboardingDone is explicitly provided, use that value
    // Otherwise, preserve existing value or default to false for new profiles
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { onboardingDone: true, onboardingStep: true, city: true },
    })

    const profileOnboardingDone = onboardingDone !== undefined
      ? !!onboardingDone
      : existingProfile?.onboardingDone ?? false

    const profileOnboardingStep = onboardingDone !== undefined
      ? (onboardingDone ? 7 : 0)
      : existingProfile?.onboardingStep ?? 0

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        onboardingDone: profileOnboardingDone,
        onboardingStep: profileOnboardingStep,
        city: user.city || existingProfile?.city || null,
        interests: user.interests ? JSON.stringify(user.interests) : undefined,
      },
      create: {
        userId: user.id,
        onboardingDone: profileOnboardingDone,
        onboardingStep: profileOnboardingStep,
        city: user.city || null,
        interests: user.interests ? JSON.stringify(user.interests) : null,
      },
    })

    return NextResponse.json({ synced: true })
  } catch (error) {
    console.error('Sync-user error:', error)
    return NextResponse.json({ error: 'Erreur de synchronisation', details: (error as Error).message }, { status: 500 })
  }
}
