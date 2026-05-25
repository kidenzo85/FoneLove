import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')

    if (!requesterId) return NextResponse.json({ error: 'ID du demandeur requis' }, { status: 400 })

    const requester = await prisma.user.findUnique({ where: { id: requesterId }, select: { role: true, email: true } })
    if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Accès interdit. Réservé aux administrateurs.' }, { status: 403 })
    }

    const premiumUsers = await prisma.user.findMany({
      where: { isPremium: true },
      include: { photos: { where: { position: 0 } } },
      orderBy: { premiumExpiry: 'desc' }
    })

    const formattedPremium = premiumUsers.map(u => {
      let statusFr = 'Actif'
      if (u.premiumExpiry && u.premiumExpiry < new Date()) statusFr = 'Expiré'

      return {
        id: u.id,
        user: `${u.firstName} ${u.lastName || ''}`.trim(),
        userAvatar: u.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${u.gender === 'F' ? '5' : '8'}`,
        plan: 'Mensuel', // we don't have exact plan in User model, we'd need to fetch PaymentOrder
        price: 9.99,
        startDate: u.updatedAt.toLocaleDateString('fr-FR'), // Approximation
        nextBilling: u.premiumExpiry ? u.premiumExpiry.toLocaleDateString('fr-FR') : 'Inconnu',
        status: statusFr
      }
    })

    return NextResponse.json({ premium: formattedPremium })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
