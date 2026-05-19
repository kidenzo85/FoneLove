import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { firstName, email, phone, gender, birthDate, password } = await req.json()
    const userPassword = password || 'demo123'
    const userPhone = phone || `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        phone: userPhone,
        password: userPassword,
        firstName: firstName || 'Utilisateur',
        gender: gender || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        profileScore: 10,
        isActive: true,
      },
    })

    // Create profile
    await prisma.profile.create({
      data: {
        userId: newUser.id,
        onboardingStep: 1,
        onboardingDone: false,
      },
    })

    // Create wallet
    await prisma.wallet.create({
      data: { userId: newUser.id },
    })

    // Fetch complete user data
    const fullUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        profile: true,
        photos: { orderBy: { position: 'asc' } },
        prompts: true,
        badges: true,
      },
    })

    const profileData = formatProfile(fullUser!)
    return NextResponse.json({ user: profileData })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: "Erreur d'inscription" }, { status: 500 })
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
