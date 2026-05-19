import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Use Prisma/SQLite directly
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        photos: { orderBy: { position: 'asc' } },
        prompts: true,
        badges: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Simple password check
    if (user.password !== password) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    const profileData = formatProfile(user)
    return NextResponse.json({ user: profileData })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 })
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
  profile: { interests: string | null; city: string | null; jobTitle: string | null; company: string | null; education: string | null } | null
  photos: Array<{ id: string; url: string; position: number; isPrimary: boolean }>
  prompts: Array<{ id: string; question: string; answer: string }>
  badges: Array<{ id: string; type: string; earnedAt: Date | null }>
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
    photos: user.photos.map((p) => ({
      id: p.id,
      url: p.url,
      position: p.position,
      isPrimary: p.isPrimary,
    })),
    prompts: user.prompts.map((p) => ({
      id: p.id,
      question: p.question,
      answer: p.answer,
    })),
    badges: user.badges.map((b) => ({
      id: b.id,
      type: b.type,
      earnedAt: b.earnedAt ? b.earnedAt.toISOString() : null,
    })),
    interests: user.profile?.interests ? JSON.parse(user.profile.interests) : [],
    city: user.profile?.city,
    jobTitle: user.profile?.jobTitle,
    company: user.profile?.company,
    education: user.profile?.education,
  }
}
