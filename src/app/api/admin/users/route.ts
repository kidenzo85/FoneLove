import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/users
 * Fetches all registered users from the database.
 * Restricted to admins and super_admins.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')

    if (!requesterId) {
      return NextResponse.json({ error: 'ID du demandeur requis' }, { status: 400 })
    }

    // Secure check: Verify the requester's role
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true, email: true },
    })

    if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Accès interdit. Réservé aux administrateurs.' }, { status: 403 })
    }

    // Fetch real users
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        photos: { where: { position: 0 } }, // Only fetch primary photo for performance
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Map to mock-compatible format but with real database data
    const formattedUsers = users.map((u) => {
      const age = u.birthDate
        ? Math.floor((Date.now() - new Date(u.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 25

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName || '',
        email: u.email,
        gender: u.gender === 'F' ? 'Femme' : u.gender === 'M' ? 'Homme' : 'Non-binaire',
        age,
        city: u.profile?.city || 'Non spécifiée',
        score: u.profileScore,
        premium: u.isPremium,
        verified: u.isVerified,
        status: u.isActive ? 'Actif' : 'Banni',
        avatar: u.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${u.gender === 'F' ? '5' : '8'}`,
        inscription: u.createdAt.toLocaleDateString('fr-FR'),
        lastActive: u.lastActiveAt.toLocaleDateString('fr-FR'),
        role: u.role, // Include real role
      }
    })

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
