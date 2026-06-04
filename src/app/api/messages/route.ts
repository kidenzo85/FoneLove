import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const requestId = searchParams.get('requestId')

    if (!userId && !requestId) return NextResponse.json({ error: 'userId ou requestId requis' }, { status: 400 })

    if (requestId) {
      const request = await prisma.numberRequest.findUnique({
        where: { id: requestId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bio: true,
              mood: true,
              photos: {
                select: { id: true, url: true, position: true, isPrimary: true },
                orderBy: { position: 'asc' },
              },
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bio: true,
              mood: true,
              photos: {
                select: { id: true, url: true, position: true, isPrimary: true },
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      })

      if (!request) return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })

      const isSender = request.senderId === (userId || '')
      const otherUser = isSender ? request.receiver : request.sender

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId || '', receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: userId || '' }
          ]
        },
        orderBy: { createdAt: 'asc' },
      })

      const conversation = {
        requestId: request.id,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          photos: otherUser.photos
            .map((p: { id: string; url: string; position: number; isPrimary: boolean }) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
          bio: otherUser.bio,
          mood: otherUser.mood,
        },
        messages: messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          content: m.content,
          type: m.type,
          isRead: m.isRead,
          createdAt: m.createdAt,
        })),
        messageCount: messages.length,
        status: request.status,
      }

      return NextResponse.json({ conversation })
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Get all accepted/pending requests for this user that have messages
    const requests = await prisma.numberRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
        status: { in: ['accepted', 'pending'] },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            mood: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            mood: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by other user
    const conversationMap = new Map()

    for (const numReq of requests) {
      const isSender = numReq.senderId === userId
      const otherUser = isSender ? numReq.receiver : numReq.sender
      const otherUserId = otherUser.id

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUser,
          primaryRequest: numReq,
          allRequestIds: [numReq.id]
        })
      } else {
        const entry = conversationMap.get(otherUserId)
        entry.allRequestIds.push(numReq.id)
        // Prefer accepted status or most recent
        if (numReq.status === 'accepted' && entry.primaryRequest.status !== 'accepted') {
          entry.primaryRequest = numReq
        }
      }
    }

    const conversations: any[] = []
    
    // Optimisation: Fetch all messages for this user in a single query to avoid N+1 and connection exhaustion
    const allMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group messages by other user id
    const messagesByOtherUser = new Map()
    for (const msg of allMessages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId
      if (!messagesByOtherUser.has(otherId)) {
        messagesByOtherUser.set(otherId, [])
      }
      messagesByOtherUser.get(otherId).push(msg)
    }

    for (const [otherUserId, data] of conversationMap.entries()) {
      const messages = messagesByOtherUser.get(otherUserId) || []

      const otherUser = data.otherUser

      conversations.push({
        requestId: data.primaryRequest.id,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          photos: otherUser.photos
            .map((p: { id: string; url: string; position: number; isPrimary: boolean }) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
          bio: otherUser.bio,
          mood: otherUser.mood,
        },
        messages: messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          content: m.content,
          type: m.type,
          isRead: m.isRead,
          createdAt: m.createdAt,
        })),
        messageCount: messages.length,
        status: data.primaryRequest.status,
      })
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: "Impossible de charger les messages. Réessaie ! 🔄" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, requestId, content, type } = await req.json()

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Check message limit (3 messages total per person before number exchange)
    if (requestId) {
      const request = await prisma.numberRequest.findUnique({
        where: { id: requestId }
      })

      if (request && request.status === 'pending') {
        const totalMessages = await prisma.message.count({
          where: {
            OR: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId }
            ]
          },
        })

        if (totalMessages >= 3) {
          return NextResponse.json({
            error: 'Limite de 3 messages atteinte. Échangez vos numéros pour continuer !',
          }, { status: 400 })
        }
      }
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    let message
    try {
      message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          requestId: requestId || null,
          content,
          type: type || 'text',
          expiresAt,
        },
      })
    } catch (dbError: any) {
      console.error('Message DB creation error:', dbError)
      if (dbError.code === 'P2003') {
        return NextResponse.json({ error: "L'utilisateur n'est plus disponible (compte supprimé)." }, { status: 400 })
      }
      return NextResponse.json({ error: "Impossible d'envoyer le message pour le moment." }, { status: 500 })
    }

    // Send push notification synchronously to avoid execution abort on serverless
    try {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { firstName: true }
      })
      if (sender) {
        const { sendPushToUser } = await import('@/lib/push-service')
        await sendPushToUser(receiverId, {
          title: `💬 ${sender.firstName}`,
          body: content.startsWith('[') && content.endsWith(']') ? 'Nouveau message' : content,
          type: 'message',
          url: `/?tab=messages`
        })
      }
    } catch (err) {
      console.error('[Messages API] Push trigger failed:', err)
    }

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        requestId: message.requestId,
        content: message.content,
        type: message.type,
        isRead: message.isRead,
        createdAt: message.createdAt,
        expiresAt: message.expiresAt,
      },
    })
  } catch (error) {
    console.error('Message POST error:', error)
    return NextResponse.json({ error: "Oups, problème de connexion. Réessaie d'envoyer ! 🔄" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { requestId, userId, otherUserId } = await req.json()

    if (!userId || (!requestId && !otherUserId)) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const where: any = {
      receiverId: userId,
      isRead: false,
    }

    if (otherUserId) {
      where.senderId = otherUserId
    } else {
      where.requestId = requestId
    }

    await prisma.message.updateMany({
      where,
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message PUT error:', error)
    return NextResponse.json({ error: "Oups, problème de connexion. Réessaie ! 🔄" }, { status: 500 })
  }
}
