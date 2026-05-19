import prisma from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase'

/**
 * Ensures a Supabase user exists in the Prisma database.
 * Handles ID mapping between Supabase UUIDs and Prisma CUIDs.
 *
 * Strategy:
 * 1. Direct ID match → return it
 * 2. Find by email in Prisma → return Prisma ID
 * 3. Look up user in Supabase, then create/update in Prisma
 *
 * Returns the Prisma user ID, or null on failure.
 */
export async function ensureUserInPrisma(supabaseUserId: string): Promise<string | null> {
  if (!supabaseUserId) return null

  try {
    // 1. Check if the user exists in Prisma with this exact ID (already synced)
    const exactMatch = await prisma.user.findUnique({
      where: { id: supabaseUserId },
      select: { id: true },
    })

    if (exactMatch) {
      return exactMatch.id
    }

    // 2. Try to find user in Supabase
    let supabaseUser: Record<string, unknown> | null = null
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('users')
        .select('id, email, phone, password, first_name, last_name, birth_date, gender, astrological_sign, height, relationship_status, looking_for, bio, mood, spotify_anthem, is_verified, is_photo_verified, is_active, is_premium, premium_expiry, is_incognito, is_paused, profile_score, daily_boost_used, super_requests_left, streak_days, last_active_at, created_at')
        .eq('id', supabaseUserId)
        .single()

      if (!error && data) {
        supabaseUser = data as Record<string, unknown>
      }
    } catch (supabaseErr) {
      console.warn('Supabase lookup failed in ensureUserInPrisma:', supabaseErr)
    }

    if (!supabaseUser) {
      // Can't resolve without Supabase data — try email lookup as last resort
      return null
    }

    const email = supabaseUser.email as string
    const phone = (supabaseUser.phone as string) || `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`

    // 3. Find the Prisma user by email (unique in both databases)
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingByEmail) {
      // User exists in Prisma with a different ID — return the Prisma ID
      return existingByEmail.id
    }

    // 4. Check if phone is already taken by another user in Prisma
    const existingByPhone = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    })

    if (existingByPhone) {
      // Phone conflict — update the existing user's email to link them
      // This handles the case where the same user was created with different data
      await prisma.user.update({
        where: { id: existingByPhone.id },
        data: { email },
      })
      return existingByPhone.id
    }

    // 5. User doesn't exist in Prisma at all — create them with the Supabase UUID
    try {
      await prisma.user.create({
        data: {
          id: supabaseUser.id as string,
          email,
          phone,
          password: (supabaseUser.password as string) || 'demo123',
          firstName: (supabaseUser.first_name as string) || 'User',
          lastName: supabaseUser.last_name as string | null,
          birthDate: supabaseUser.birth_date ? new Date(supabaseUser.birth_date as string) : null,
          gender: supabaseUser.gender as string | null,
          astrologicalSign: supabaseUser.astrological_sign as string | null,
          height: supabaseUser.height as number | null,
          relationshipStatus: supabaseUser.relationship_status as string | null,
          lookingFor: supabaseUser.looking_for as string | null,
          bio: supabaseUser.bio as string | null,
          mood: supabaseUser.mood as string | null,
          spotifyAnthem: supabaseUser.spotify_anthem as string | null,
          isVerified: (supabaseUser.is_verified as boolean) ?? false,
          isPhotoVerified: (supabaseUser.is_photo_verified as boolean) ?? false,
          isActive: (supabaseUser.is_active as boolean) ?? true,
          isPremium: (supabaseUser.is_premium as boolean) ?? false,
          premiumExpiry: supabaseUser.premium_expiry ? new Date(supabaseUser.premium_expiry as string) : null,
          isIncognito: (supabaseUser.is_incognito as boolean) ?? false,
          isPaused: (supabaseUser.is_paused as boolean) ?? false,
          profileScore: (supabaseUser.profile_score as number) ?? 0,
          dailyBoostUsed: (supabaseUser.daily_boost_used as boolean) ?? false,
          superRequestsLeft: (supabaseUser.super_requests_left as number) ?? 0,
          streakDays: (supabaseUser.streak_days as number) ?? 0,
          lastActiveAt: supabaseUser.last_active_at ? new Date(supabaseUser.last_active_at as string) : new Date(),
          createdAt: supabaseUser.created_at ? new Date(supabaseUser.created_at as string) : new Date(),
        },
      })
      console.log(`[ensureUserInPrisma] Created user ${supabaseUserId} from Supabase`)
      return supabaseUserId
    } catch (createErr: unknown) {
      // Handle unique constraint violations gracefully
      const errMsg = createErr instanceof Error ? createErr.message : String(createErr)

      if (errMsg.includes('Unique') || errMsg.includes('unique') || errMsg.includes('UNIQUE')) {
        // Email or phone conflict — try to find the existing user
        console.warn(`[ensureUserInPrisma] Unique constraint violation, looking up by email/phone:`, errMsg)

        // Try email first
        const byEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } })
        if (byEmail) return byEmail.id

        // Then phone
        const byPhone = await prisma.user.findUnique({ where: { phone }, select: { id: true } })
        if (byPhone) return byPhone.id
      }

      console.error('[ensureUserInPrisma] Failed to create user:', createErr)
      return null
    }
  } catch (err) {
    console.error('[ensureUserInPrisma] Unexpected error:', err)
    return null
  }
}

/**
 * Syncs a user from Supabase to Prisma after login/register.
 * This is a convenience wrapper that ensures the user exists before any CC operations.
 */
export async function syncUserToPrisma(supabaseUserId: string): Promise<string | null> {
  return ensureUserInPrisma(supabaseUserId)
}
