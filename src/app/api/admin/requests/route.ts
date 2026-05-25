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

    const requests = await prisma.numberRequest.findMany({
      include: {
        sender: { include: { photos: { where: { position: 0 } } } },
        receiver: { include: { photos: { where: { position: 0 } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedRequests = requests.map(r => {
      let statusFr = 'En attente'
      if (r.status === 'accepted') statusFr = 'Acceptée'
      if (r.status === 'declined') statusFr = 'Refusée'

      return {
        id: r.id,
        sender: `${r.sender.firstName} ${r.sender.lastName || ''}`.trim(),
        senderAvatar: r.sender.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${r.sender.gender === 'F' ? '5' : '8'}`,
        receiver: `${r.receiver.firstName} ${r.receiver.lastName || ''}`.trim(),
        receiverAvatar: r.receiver.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${r.receiver.gender === 'F' ? '5' : '8'}`,
        message: r.message || 'Demande classique',
        isSuper: r.isSuper,
        status: statusFr,
        date: r.createdAt.toLocaleDateString('fr-FR')
      }
    })

    return NextResponse.json({ requests: formattedRequests })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
