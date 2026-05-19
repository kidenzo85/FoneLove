import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/token-store'
import { formatProfile, USER_INCLUDE } from '@/lib/format-profile'
import prisma from '@/lib/prisma'

/**
 * POST /api/auth/verify-otp
 * Verifies the OTP code and returns user data.
 * Creates user if needed (first-time login).
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email et code requis' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const result = verifyOtp(normalizedEmail, otp.trim())

    if (!result.valid) {
      const messages: Record<string, string> = {
        no_code: "Aucun code en attente pour cet email. Demande un nouveau code.",
        expired: "Ce code a expiré. Demande un nouveau code.",
        too_many_attempts: "Trop de tentatives. Demande un nouveau code.",
        wrong_code: "Code incorrect. Vérifie et réessaie.",
      }
      return NextResponse.json({
        error: messages[result.reason || 'wrong_code'],
        reason: result.reason,
      }, { status: 400 })
    }

    // OTP verified — find or create user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: USER_INCLUDE,
    })

    let isNewUser = false

    if (!user) {
      // Create new user from email
      isNewUser = true
      const firstName = normalizedEmail.split('@')[0] || 'Utilisateur'

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          phone: `+336${Date.now().toString().slice(-8)}`,
          password: 'otp-auth',
          firstName,
          isActive: true,
          isVerified: true,
          profile: {
            create: {
              onboardingDone: false,
              onboardingStep: 0,
            }
          },
          wallet: {
            create: {
              balance: 10,
            }
          }
        },
        include: USER_INCLUDE,
      })
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {})

    // Format profile for client
    const profile = formatProfile(user as any)

    return NextResponse.json({
      user: {
        ...profile,
        onboardingDone: user.profile?.onboardingDone ?? false,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
