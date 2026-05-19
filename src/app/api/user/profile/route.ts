import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function PUT(req: NextRequest) {
  try {
    const {
      userId,
      firstName,
      gender,
      birthDate,
      bio,
      interests,
      lookingFor,
      city,
      jobTitle,
      education,
      astrologicalSign,
      height,
    } = await req.json()

    const supabase = createAdminClient()

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Calculate profile score
    const profileScore = Math.min(100,
      15 +
      (firstName ? 5 : 0) +
      (gender ? 5 : 0) +
      (birthDate ? 5 : 0) +
      (bio ? 10 : 0) +
      (interests?.length || 0) * 3 +
      (lookingFor ? 5 : 0) +
      (city ? 3 : 0) +
      (jobTitle ? 3 : 0) +
      (education ? 2 : 0) +
      (astrologicalSign ? 2 : 0) +
      (height ? 2 : 0)
    )

    // Update user table
    const userUpdates: Record<string, unknown> = {}
    if (firstName !== undefined) userUpdates.first_name = firstName
    if (gender !== undefined) userUpdates.gender = gender
    if (birthDate !== undefined) userUpdates.birth_date = birthDate
    if (bio !== undefined) userUpdates.bio = bio
    if (lookingFor !== undefined) userUpdates.looking_for = lookingFor
    if (astrologicalSign !== undefined) userUpdates.astrological_sign = astrologicalSign
    if (height !== undefined) userUpdates.height = height
    if (profileScore !== undefined) userUpdates.profile_score = profileScore

    if (Object.keys(userUpdates).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', userId)

      if (userError) {
        console.error('User update error:', userError)
      }
    }

    // Update or create profile
    const profileUpdates: Record<string, unknown> = {}
    if (interests !== undefined) profileUpdates.interests = JSON.stringify(interests)
    if (city !== undefined) profileUpdates.city = city
    if (jobTitle !== undefined) profileUpdates.job_title = jobTitle
    if (education !== undefined) profileUpdates.education = education
    profileUpdates.onboarding_done = true

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', userId)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ user_id: userId, ...profileUpdates })

      if (profileError) {
        console.error('Profile create error:', profileError)
      }
    }

    // Fetch updated user data
    const { data: fullUser } = await supabase
      .from('users')
      .select(`
        *,
        profile:profiles(*),
        photos(position, url, is_primary, id),
        prompts(id, question, answer),
        badges(id, type, earned_at)
      `)
      .eq('id', userId)
      .single()

    if (!fullUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const profileData = formatUserProfile(fullUser)

    return NextResponse.json({ user: profileData })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function formatUserProfile(user: Record<string, unknown> | null) {
  if (!user) {
    return null
  }
  const profile = user.profile as Record<string, unknown> | null
  const photos = (user.photos as Array<Record<string, unknown>> | null) ?? []
  const prompts = (user.prompts as Array<Record<string, unknown>> | null) ?? []
  const badges = (user.badges as Array<Record<string, unknown>> | null) ?? []

  return {
    id: user.id as string,
    email: user.email as string,
    phone: user.phone as string,
    firstName: user.first_name as string,
    lastName: user.last_name as string | null,
    birthDate: user.birth_date as string | null,
    gender: user.gender as string | null,
    bio: user.bio as string | null,
    isVerified: user.is_verified as boolean,
    isPremium: user.is_premium as boolean,
    profileScore: user.profile_score as number,
    streakDays: user.streak_days as number,
    dailyBoostUsed: user.daily_boost_used as boolean,
    lookingFor: user.looking_for as string | null,
    astrologicalSign: user.astrological_sign as string | null,
    height: user.height as number | null,
    spotifyAnthem: user.spotify_anthem as string | null,
    mood: user.mood as string | null,
    photos: photos
      .sort((a, b) => (a.position as number) - (b.position as number))
      .map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.is_primary })),
    prompts: prompts.map((p) => ({ id: p.id, question: p.question, answer: p.answer })),
    badges: badges.map((b) => ({ id: b.id, type: b.type, earnedAt: b.earned_at })),
    interests: profile?.interests ? JSON.parse(profile.interests as string) : [],
    city: profile?.city as string | null,
    jobTitle: profile?.job_title as string | null,
    company: profile?.company as string | null,
    education: profile?.education as string | null,
  }
}
