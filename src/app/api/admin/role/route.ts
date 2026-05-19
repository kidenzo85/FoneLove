import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/admin/role
 * Promotes or demotes a user.
 * RESTRICTED STRICTLY TO SUPER_ADMIN (fabricewilliam73@gmail.com).
 */
export async function POST(req: NextRequest) {
  try {
    const { requesterId, targetUserId, newRole } = await req.json()

    if (!requesterId || !targetUserId || !newRole) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (newRole !== 'user' && newRole !== 'admin') {
      return NextResponse.json({ error: 'Rôle invalide. Seuls "user" et "admin" sont autorisés.' }, { status: 400 })
    }

    // 1. Secure check: Fetch requester details
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true, email: true },
    })

    if (!requester || (requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Action refusée. Seul le Super Administrateur (fabricewilliam73@gmail.com) peut modifier les rôles.' }, { status: 403 })
    }

    // 2. Fetch target user details
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true, email: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur cible non trouvé' }, { status: 404 })
    }

    // 3. Prevent demoting the super_admin
    if (targetUser.email === 'fabricewilliam73@gmail.com' || targetUser.role === 'super_admin') {
      return NextResponse.json({ error: 'Impossible de modifier le rôle du Super Administrateur principal.' }, { status: 400 })
    }

    // 4. Update the user role in the database
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: newRole,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    })

    console.log(`[Role Change] User ${updatedUser.firstName} ${updatedUser.lastName} role updated to ${updatedUser.role} by ${requester.email}`)

    return NextResponse.json({
      success: true,
      message: `Le rôle de ${updatedUser.firstName} a été mis à jour avec succès en "${newRole}".`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Admin role update error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
