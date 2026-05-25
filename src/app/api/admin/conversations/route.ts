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

    // Pour simuler les conversations, on groupe les messages (c'est coûteux en bdd donc on peut le faire en js pour simplifier si la db n'est pas énorme, sinon on ferait un group by)
    const recentMessages = await prisma.message.findMany({
      include: {
        sender: { include: { photos: { where: { position: 0 } } } },
        receiver: { include: { photos: { where: { position: 0 } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000 // limit to recent to avoid heavy memory load
    })

    // Group by conversation (user1Id_user2Id)
    const conversationsMap = new Map()
    for (const m of recentMessages) {
      const pair = [m.senderId, m.receiverId].sort().join('_')
      if (!conversationsMap.has(pair)) {
        conversationsMap.set(pair, {
          id: pair,
          user1: `${m.sender.firstName} ${m.sender.lastName || ''}`.trim(),
          user1Avatar: m.sender.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${m.sender.gender === 'F' ? '5' : '8'}`,
          user2: `${m.receiver.firstName} ${m.receiver.lastName || ''}`.trim(),
          user2Avatar: m.receiver.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${m.receiver.gender === 'F' ? '5' : '8'}`,
          messages: 0,
          lastMessage: m.content,
          date: m.createdAt.toLocaleDateString('fr-FR'),
          preNumber: !!m.requestId
        })
      }
      conversationsMap.get(pair).messages += 1
    }

    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json({ conversations })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
