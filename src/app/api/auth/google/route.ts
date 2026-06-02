import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import prisma from '@/lib/prisma'
import { formatProfile, USER_INCLUDE } from '@/lib/format-profile'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(req: NextRequest) {
    console.log('--- GOOGLE AUTH API HIT ---')
    try {
      const { credential } = await req.json()

    if (!credential) {
      console.log('Google Auth: Credential missing')
      return NextResponse.json({ error: 'Credential manquant' }, { status: 400 })
    }

    console.log('Google Auth: Verifying token...')
    // Verify the Google JWT token (with retry for Node.js fetch DNS bug)
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
    } catch (verifyError: any) {
      console.log('Google Auth: Retry verification due to error:', verifyError?.message)
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
    }

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      console.log('Google Auth: Invalid payload')
      return NextResponse.json({ error: 'Token Google invalide' }, { status: 401 })
    }

    const { email, given_name, family_name, picture, email_verified } = payload
    console.log(`Google Auth: Authenticating ${email}`)

    if (!email_verified) {
      return NextResponse.json({ error: 'Email Google non vérifié' }, { status: 401 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: USER_INCLUDE,
    })

    if (!user) {
      // Create new user from Google data
      const phone = `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`

      user = await prisma.user.create({
        data: {
          email,
          phone,
          password: `google_${Date.now()}`, // No real password for Google users
          firstName: given_name || 'Utilisateur',
          lastName: family_name || null,
          isVerified: true,
          profileScore: 15,
          isActive: true,
          profile: {
            create: {
              onboardingStep: 0,
              onboardingDone: false,
            },
          },
          wallet: {
            create: {},
          },
        },
        include: USER_INCLUDE,
      })

      // If Google provides a profile picture, save it
      if (picture && user) {
        await prisma.photo.create({
          data: {
            userId: user.id,
            url: picture,
            position: 0,
            isPrimary: true,
          },
        })

        // Re-fetch with the photo
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: USER_INCLUDE,
        })
      }
    } else {
      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      })
    }

    if (!user) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
    }

    const profileData = formatProfile(user as any)
    return NextResponse.json({ user: profileData })
  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Erreur d\'authentification Google' }, { status: 500 })
  }
}
