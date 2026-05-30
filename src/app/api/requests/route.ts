import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, message, isSuper } = await req.json()

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: 'senderId et receiverId requis' }, { status: 400 })
    }

    // Check if a pending request already exists
    const existing = await prisma.numberRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: 'pending',
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Demande déjà envoyée' }, { status: 400 })
    }

    // Create number request
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    const request = await prisma.numberRequest.create({
      data: {
        senderId,
        receiverId,
        message: message || null,
        isSuper: isSuper || false,
        status: 'pending',
        expiresAt,
      },
    })

    // Fetch sender and receiver info
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      include: {
        photos: { orderBy: { position: 'asc' } },
        badges: true,
      },
    })

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: {
        photos: { orderBy: { position: 'asc' } },
        badges: true,
      },
    })

    // Send push notification safely
    if (sender) {
      try {
        // 1. In-App Notification
        await prisma.appNotification.create({
          data: {
            userId: receiverId,
            type: 'number_request',
            title: '📞 Demande de numéro !',
            body: `${sender.firstName} aimerait avoir ton numéro.`,
            url: '/?tab=requests',
          }
        })

        // 2. Push Notification
        const { sendPushToUser } = await import('@/lib/push-service')
        await sendPushToUser(receiverId, {
          title: '📞 Demande de numéro !',
          body: `${sender.firstName} aimerait avoir ton numéro.`,
          type: 'request',
          url: '/?tab=requests'
        })
      } catch (err) {
        console.error('[Requests API] Push trigger failed:', err)
      }
    }

    return NextResponse.json({
      request: {
        ...mapRequest(request),
        sender: sender ? mapUserBasic(sender) : null,
        receiver: receiver ? mapUserBasic(receiver) : null,
      },
    })
  } catch (error) {
    console.error('Request POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'received'

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    if (type === 'received') {
      const requests = await prisma.numberRequest.findMany({
        where: { receiverId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            include: {
              photos: { orderBy: { position: 'asc' } },
              profile: true,
              badges: true,
              prompts: true,
            },
          },
        },
      })

      const result = {
        requests: requests.map((r) => ({
          ...mapRequest(r),
          sender: r.sender ? {
            ...mapUserDetailed(r.sender),
            phone: r.status === 'accepted' ? (r.sender as any).phone : null
          } : null,
        })),
      };
      console.log('Returning received requests:', JSON.stringify(result).substring(0, 100));
      return NextResponse.json(result)
    } else {
      const requests = await prisma.numberRequest.findMany({
        where: { senderId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          receiver: {
            include: {
              photos: { orderBy: { position: 'asc' } },
              profile: true,
              badges: true,
              prompts: true,
            },
          },
        },
      })

      const result = {
        requests: requests.map((r) => ({
          ...mapRequest(r),
          receiver: r.receiver ? {
            ...mapUserDetailed(r.receiver),
            phone: r.status === 'accepted' ? (r.receiver as any).phone : null
          } : null,
        })),
      };
      console.log('Returning sent requests:', JSON.stringify(result).substring(0, 100));
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Request GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: (error as any).message, stack: (error as any).stack }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { requestId, status } = await req.json()

    if (!requestId || !status) {
      return NextResponse.json({ error: 'requestId et status requis' }, { status: 400 })
    }

    // Update the request status
    const request = await prisma.numberRequest.update({
      where: { id: requestId },
      data: {
        status,
        respondedAt: new Date(),
      },
    })

    let senderPhone: string | null = null
    let receiverPhone: string | null = null

    // If accepted, create a connection and first message
    if (status === 'accepted') {
      const sender = await prisma.user.findUnique({
        where: { id: request.senderId },
        select: { phone: true, firstName: true },
      })

      const receiver = await prisma.user.findUnique({
        where: { id: request.receiverId },
        select: { phone: true, firstName: true },
      })

      senderPhone = sender?.phone ?? null
      receiverPhone = receiver?.phone ?? null

      await prisma.connection.create({
        data: {
          user1Id: request.senderId,
          user2Id: request.receiverId,
          requestId: request.id,
          phoneNumber1: senderPhone,
          phoneNumber2: receiverPhone,
        },
      })

      // Create first message
      await prisma.message.create({
        data: {
          senderId: request.receiverId,
          receiverId: request.senderId,
          requestId: request.id,
          content: 'Numéro accepté ! Ravi(e) de faire ta connaissance 😊',
          type: 'text',
        },
      })
    }

    // Send push notification safely for status updates
    try {
      const receiver = await prisma.user.findUnique({
        where: { id: request.receiverId },
        select: { firstName: true }
      })
      if (receiver) {
        const { sendPushToUser } = await import('@/lib/push-service')
        if (status === 'accepted') {
          await prisma.appNotification.create({
            data: {
              userId: request.senderId,
              type: 'request_accepted',
              title: '🎉 Demande acceptée !',
              body: `${receiver.firstName} a partagé son numéro avec toi !`,
              url: '/?tab=requests',
            }
          })

          await sendPushToUser(request.senderId, {
            title: '🎉 Demande acceptée !',
            body: `${receiver.firstName} a partagé son numéro avec toi !`,
            type: 'request',
            url: '/?tab=requests'
          })
        } else if (status === 'declined') {
          await prisma.appNotification.create({
            data: {
              userId: request.senderId,
              type: 'request_declined',
              title: '📞 Demande de numéro',
              body: `Ta demande auprès de ${receiver.firstName} n'a pas abouti.`,
              url: '/?tab=requests',
            }
          })

          await sendPushToUser(request.senderId, {
            title: '📞 Demande de numéro',
            body: `Ta demande auprès de ${receiver.firstName} n'a pas abouti.`,
            type: 'request',
            url: '/?tab=requests'
          })
        }
      }
    } catch (err) {
      console.error('[Requests PUT API] Push trigger failed:', err)
    }

    return NextResponse.json({
      request: mapRequest(request),
      // Include phone numbers so the client can display them
      senderPhone,
      receiverPhone,
    })
  } catch (error) {
    console.error('Request PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function mapRequest(r: {
  id: string
  senderId: string
  receiverId: string
  message: string | null
  isSuper: boolean
  status: string
  createdAt: Date
  respondedAt: Date | null
  expiresAt: Date | null
}) {
  return {
    id: r.id,
    senderId: r.senderId,
    receiverId: r.receiverId,
    message: r.message,
    isSuper: r.isSuper,
    status: r.status,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    expiresAt: r.expiresAt,
  }
}

function mapUserBasic(u: {
  id: string
  firstName: string
  photos: Array<{ id: string; url: string; position: number; isPrimary: boolean }>
  badges: Array<{ id: string; type: string; earnedAt: Date }>
}) {
  return {
    id: u.id,
    firstName: u.firstName,
    photos: u.photos.map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
    badges: u.badges.map((b) => ({ id: b.id, type: b.type, earnedAt: b.earnedAt })),
  }
}

function mapUserDetailed(u: {
  id: string
  firstName: string
  lastName: string | null
  bio: string | null
  mood: string | null
  photos: Array<{ id: string; url: string; position: number; isPrimary: boolean }>
  prompts: Array<{ id: string; question: string; answer: string }>
  badges: Array<{ id: string; type: string; earnedAt: Date }>
  profile: {
    interests: string | null
    city: string | null
    jobTitle: string | null
    company: string | null
    education: string | null
  } | null
}) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    bio: u.bio,
    mood: u.mood,
    photos: (u.photos || []).map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
    prompts: (u.prompts || []).map((p) => ({ id: p.id, question: p.question, answer: p.answer })),
    badges: (u.badges || []).map((b) => ({ id: b.id, type: b.type, earnedAt: b.earnedAt })),
    interests: u.profile?.interests ? parseInterests(u.profile.interests) : [],
    city: u.profile?.city ?? null,
    jobTitle: u.profile?.jobTitle ?? null,
    company: u.profile?.company ?? null,
    education: u.profile?.education ?? null,
  }
}

function parseInterests(interestsStr: string) {
  try {
    return JSON.parse(interestsStr)
  } catch (e) {
    console.error('Failed to parse interests:', interestsStr)
    return []
  }
}
