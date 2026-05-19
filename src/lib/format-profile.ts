/**
 * Shared utility to format a Prisma User record into the UserProfile shape
 * expected by the frontend store.
 */

export interface PrismaUserWithRelations {
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
  lookingForGender?: string | null
  astrologicalSign: string | null
  height: number | null
  spotifyAnthem: string | null
  mood: string | null
  city?: string | null
  countryCode?: string | null
  profile: {
    interests: string | null
    city: string | null
    jobTitle: string | null
    company: string | null
    education: string | null
    onboardingDone: boolean
  } | null
  photos: Array<{ id: string; url: string; position: number; isPrimary: boolean }>
  prompts: Array<{ id: string; question: string; answer: string }>
  badges: Array<{ id: string; type: string; earnedAt: Date | null }>
}

export function formatProfile(user: PrismaUserWithRelations) {
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
    lookingForGender: user.lookingForGender ?? null,
    astrologicalSign: user.astrologicalSign,
    height: user.height,
    spotifyAnthem: user.spotifyAnthem,
    mood: user.mood,
    city: user.profile?.city || user.city || null,
    countryCode: user.countryCode ?? null,
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
    jobTitle: user.profile?.jobTitle,
    company: user.profile?.company,
    education: user.profile?.education,
    onboardingDone: user.profile?.onboardingDone ?? false,
  }
}

/** Prisma include clause for fetching complete user data */
export const USER_INCLUDE = {
  profile: true,
  photos: { orderBy: { position: 'asc' as const } },
  prompts: true,
  badges: true,
}
