import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyRedeemToken } from '@/lib/token-store'
import { formatProfile, USER_INCLUDE } from '@/lib/format-profile'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Code manquant' }, { status: 400 })
    }

    // Verify the one-time redeem code
    const result = verifyRedeemToken(code)
    if (!result.valid || !result.userId) {
      return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 401 })
    }

    // Fetch full user data
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      include: USER_INCLUDE,
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const profileData = formatProfile(user as any)
    return NextResponse.json({ user: profileData })
  } catch (error) {
    console.error('Redeem error:', error)
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 })
  }
}
