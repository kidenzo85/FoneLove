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
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
      }

      return NextResponse.json({ profile: formatProfile(user) })
    }

    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Browse profiles (exclude current user, only active & not paused)
    const users = await prisma.user.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
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
                  status: { in: ['pending', 'accepted'] }
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
      },
      orderBy: {
        createdAt: 'desc', // Show real/new users first
      },
    })

    const nextCursor = users.length === limit ? users[users.length - 1].id : null

    return NextResponse.json({ 
      profiles: users.map(formatProfile),
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

function formatProfile(user: {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string | null
  birthDate: Date | null
  gender: string | null
  bio: string | null
  isVerified: boolean
  isPremium: boolean
  profileScore: number
  streakDays: number
  dailyBoostUsed: boolean
  lookingFor: string | null
  astrologicalSign: string | null
  height: number | null
  spotifyAnthem: string | null
  mood: string | null
  role: string
  profile: {
    interests: string | null
    city: string | null
    jobTitle: string | null
    company: string | null
    education: string | null
  } | null
  photos: { id: string; url: string; position: number; isPrimary: boolean }[]
  prompts: { id: string; question: string; answer: string }[]
  badges: { id: string; type: string; earnedAt: Date }[]
}) {
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
    photos: (user.photos || []).map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
    prompts: (user.prompts || []).map((p) => ({ id: p.id, question: p.question, answer: p.answer })),
    badges: (user.badges || []).map((b) => ({ id: b.id, type: b.type, earnedAt: b.earnedAt.toISOString() })),
    interests: user.profile?.interests ? parseInterests(user.profile.interests) : [],
    city: user.profile?.city ?? null,
    jobTitle: user.profile?.jobTitle ?? null,
    company: user.profile?.company ?? null,
    education: user.profile?.education ?? null,
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
