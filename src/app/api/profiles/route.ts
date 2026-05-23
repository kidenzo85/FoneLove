import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const profileId = searchParams.get('id')

    // Get single profile
    if (profileId) {
      const user = await prisma.user.findUnique({
        where: { id: profileId },
        include: {
          profile: true,
          photos: { orderBy: { position: 'asc' } },
          prompts: true,
          badges: true,
          receivedRequests: userId ? {
            where: {
              senderId: userId,
            },
          } : false,
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
      }

      return NextResponse.json({ profile: formatProfile(user) })
    }

    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Browse profiles (exclude current user, only active & not paused, exclude accepted requests)
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        isPaused: false,
        profile: {
          onboardingDone: true,
        },
        photos: {
          some: {}, // Must have at least one photo for discovery
        },
        ...(userId ? {
          NOT: [
            { id: userId },
            {
              receivedRequests: {
                some: {
                  senderId: userId,
                  status: 'accepted'
                }
              }
            }
          ]
        } : {}),
      },
      include: {
        profile: true,
        photos: { orderBy: { position: 'asc' } },
        prompts: true,
        badges: true,
        activeFeatures: {
          where: {
            action: 'boost',
            expiresAt: { gt: new Date() },
          },
        },
        receivedRequests: userId ? {
          where: {
            senderId: userId,
          },
        } : false,
      },
    })

    // Sort in-memory:
    // 1. Pushed to bottom if requestStatus is 'pending' or 'declined'
    // 2. Premium/boosted users first
    // 3. Sorted by profileScore descending
    const sortedUsers = [...allUsers].sort((a: any, b: any) => {
      const aBoosted = a.activeFeatures && a.activeFeatures.length > 0
      const bBoosted = b.activeFeatures && b.activeFeatures.length > 0
      
      const aReq = a.receivedRequests && a.receivedRequests[0]
      const bReq = b.receivedRequests && b.receivedRequests[0]
      
      const aHasReq = aReq ? (aReq.status === 'pending' || aReq.status === 'declined') : false
      const bHasReq = bReq ? (bReq.status === 'pending' || bReq.status === 'declined') : false

      // 1. Push to bottom if request already sent
      if (aHasReq !== bHasReq) {
        return aHasReq ? 1 : -1
      }

      // 2. Boosted first
      if (aBoosted !== bBoosted) {
        return aBoosted ? -1 : 1
      }

      // 3. Profile Score descending
      if (b.profileScore !== a.profileScore) {
        return b.profileScore - a.profileScore
      }

      // 4. Stable order
      return a.id.localeCompare(b.id)
    })

    // Perform manual cursor-based pagination
    let startIndex = 0
    if (cursor) {
      const idx = sortedUsers.findIndex(u => u.id === cursor)
      if (idx !== -1) {
        startIndex = idx + 1
      }
    }

    const paginatedUsers = sortedUsers.slice(startIndex, startIndex + limit)
    const nextCursor = (startIndex + limit < sortedUsers.length) ? paginatedUsers[paginatedUsers.length - 1].id : null

    return NextResponse.json({ 
      profiles: paginatedUsers.map(formatProfile),
      nextCursor 
    })
  } catch (error) {
    console.error('Profiles GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...updates } = body

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    // Separate user fields from profile fields
    const {
      interests, city, jobTitle, company, education,
      firstName, lastName, birthDate, gender, bio, mood,
      lookingFor, astrologicalSign, height, spotifyAnthem,
      isPremium, isIncognito, isPaused, profileScore,
      dailyBoostUsed, superRequestsLeft, streakDays,
      ...otherFields
    } = updates

    // Build user update object (Prisma uses camelCase directly)
    const userUpdates: Record<string, unknown> = {}
    if (firstName !== undefined) userUpdates.firstName = firstName
    if (lastName !== undefined) userUpdates.lastName = lastName
    if (birthDate !== undefined) userUpdates.birthDate = birthDate ? new Date(birthDate) : null
    if (gender !== undefined) userUpdates.gender = gender
    if (bio !== undefined) userUpdates.bio = bio
    if (mood !== undefined) userUpdates.mood = mood
    if (lookingFor !== undefined) userUpdates.lookingFor = lookingFor
    if (astrologicalSign !== undefined) userUpdates.astrologicalSign = astrologicalSign
    if (height !== undefined) userUpdates.height = height
    if (spotifyAnthem !== undefined) userUpdates.spotifyAnthem = spotifyAnthem
    if (isPremium !== undefined) userUpdates.isPremium = isPremium
    if (isIncognito !== undefined) userUpdates.isIncognito = isIncognito
    if (isPaused !== undefined) userUpdates.isPaused = isPaused
    if (profileScore !== undefined) userUpdates.profileScore = profileScore
    if (dailyBoostUsed !== undefined) userUpdates.dailyBoostUsed = dailyBoostUsed
    if (superRequestsLeft !== undefined) userUpdates.superRequestsLeft = superRequestsLeft
    if (streakDays !== undefined) userUpdates.streakDays = streakDays

    // Update user if there are user fields
    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      })
    }

    // Update profile if there are profile fields
    if (interests || city || jobTitle || company || education) {
      const profileUpdates: Record<string, unknown> = {}
      if (interests) profileUpdates.interests = JSON.stringify(interests)
      if (city) profileUpdates.city = city
      if (jobTitle) profileUpdates.jobTitle = jobTitle
      if (company) profileUpdates.company = company
      if (education) profileUpdates.education = education

      // Try upsert: update if profile exists, create if not
      await prisma.profile.upsert({
        where: { userId },
        update: profileUpdates,
        create: { userId, ...profileUpdates },
      })
    }

    // Fetch updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        photos: { orderBy: { position: 'asc' } },
        prompts: true,
        badges: true,
      },
    })

    return NextResponse.json({ profile: formatProfile(updatedUser!) })
  } catch (error) {
    console.error('Profiles PUT error:', error)
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 })
  }
}

function formatProfile(user: any) {
  const req = user.receivedRequests && user.receivedRequests[0]
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    birthDate: user.birthDate ? user.birthDate.toISOString() : null,
    gender: user.gender,
    bio: user.bio,
    isVerified: user.isVerified,
    isPremium: user.isPremium,
    profileScore: user.profileScore,
    streakDays: user.streakDays,
    dailyBoostUsed: user.dailyBoostUsed,
    lookingFor: user.lookingFor,
    astrologicalSign: user.astrologicalSign,
    height: user.height,
    spotifyAnthem: user.spotifyAnthem,
    mood: user.mood,
    role: user.role,
    photos: (user.photos || []).map((p: any) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
    prompts: (user.prompts || []).map((p: any) => ({ id: p.id, question: p.question, answer: p.answer })),
    badges: (user.badges || []).map((b: any) => ({ id: b.id, type: b.type, earnedAt: b.earnedAt.toISOString() })),
    interests: user.profile?.interests ? parseInterests(user.profile.interests) : [],
    city: user.profile?.city ?? null,
    jobTitle: user.profile?.jobTitle ?? null,
    company: user.profile?.company ?? null,
    education: user.profile?.education ?? null,
    requestStatus: req ? req.status : 'none',
    requestId: req ? req.id : null,
  }
}

function parseInterests(interestsStr: string) {
  try {
    return JSON.parse(interestsStr)
  } catch (e) {
    console.error('Failed to parse interests:', interestsStr)
    return []
  }
}
