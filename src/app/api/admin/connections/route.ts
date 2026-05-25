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

    const connections = await prisma.connection.findMany({
      include: {
        user1: { include: { photos: { where: { position: 0 } } } },
        user2: { include: { photos: { where: { position: 0 } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedConnections = connections.map(c => {
      return {
        id: c.id,
        user1: `${c.user1.firstName} ${c.user1.lastName || ''}`.trim(),
        user1Avatar: c.user1.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${c.user1.gender === 'F' ? '5' : '8'}`,
        user2: `${c.user2.firstName} ${c.user2.lastName || ''}`.trim(),
        user2Avatar: c.user2.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${c.user2.gender === 'F' ? '5' : '8'}`,
        date: c.createdAt.toLocaleDateString('fr-FR'),
        phone1: c.phoneNumber1 || c.user1.phone || 'Non partagé',
        phone2: c.phoneNumber2 || c.user2.phone || 'Non partagé'
      }
    })

    return NextResponse.json({ connections: formattedConnections })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
