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

    const moments = await prisma.moment.findMany({
      include: {
        user: { include: { photos: { where: { position: 0 } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedMoments = moments.map(m => {
      let statusFr = 'Actif'
      if (m.expiresAt < new Date()) statusFr = 'Expiré'
      // If we had a specific reported flag we could set 'Signalé'
      
      return {
        id: m.id,
        user: `${m.user.firstName} ${m.user.lastName || ''}`.trim(),
        userAvatar: m.user.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${m.user.gender === 'F' ? '5' : '8'}`,
        thumbnail: m.mediaUrl || 'https://picsum.photos/300/400',
        caption: m.content || '',
        status: statusFr,
        date: m.createdAt.toLocaleDateString('fr-FR'),
        likes: 0, // We could count likes if we queried MomentLike
        comments: 0
      }
    })

    return NextResponse.json({ moments: formattedMoments })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
