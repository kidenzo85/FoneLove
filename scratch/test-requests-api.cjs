const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function parseInterests(interestsStr) {
  try {
    return JSON.parse(interestsStr)
  } catch (e) {
    console.error('Failed to parse interests:', interestsStr)
    return []
  }
}

function mapUserDetailed(u) {
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

function mapRequest(r) {
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

async function test() {
  const userId = 'cmpd5tirc0000l504g7gjdqsq'

  console.log('Testing GET sent requests...')
  const sentRequests = await prisma.numberRequest.findMany({
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

  try {
    const result = {
      requests: sentRequests.map((r) => ({
        ...mapRequest(r),
        receiver: r.receiver ? {
          ...mapUserDetailed(r.receiver),
          phone: r.status === 'accepted' ? r.receiver.phone : null
        } : null,
      })),
    }
    console.log('Sent requests mapped successfully:', result.requests.length)
  } catch (err) {
    console.error('Error mapping sent requests:', err)
  }

  console.log('Testing GET received requests...')
  const receivedRequests = await prisma.numberRequest.findMany({
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

  try {
    const result = {
      requests: receivedRequests.map((r) => ({
        ...mapRequest(r),
        sender: r.sender ? {
          ...mapUserDetailed(r.sender),
          phone: r.status === 'accepted' ? r.sender.phone : null
        } : null,
      })),
    }
    console.log('Received requests mapped successfully:', result.requests.length)
  } catch (err) {
    console.error('Error mapping received requests:', err)
  }

  console.log('Testing Messages GET...')
  const requestsWithMessages = await prisma.numberRequest.findMany({
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

  try {
    const conversationMap = new Map()

    for (const numReq of requestsWithMessages) {
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
        if (numReq.status === 'accepted' && entry.primaryRequest.status !== 'accepted') {
          entry.primaryRequest = numReq
        }
      }
    }

    const conversations = []
    for (const [otherUserId, data] of conversationMap.entries()) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'asc' },
      })

      const otherUser = data.otherUser

      conversations.push({
        requestId: data.primaryRequest.id,
        otherUser: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          photos: otherUser.photos
            .map((p) => ({ id: p.id, url: p.url, position: p.position, isPrimary: p.isPrimary })),
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
        status: data.primaryRequest.status,
      })
    }
    console.log('Messages mapped successfully:', conversations.length)
  } catch (err) {
    console.error('Error mapping messages:', err)
  }

  await prisma.$disconnect()
}

test().catch(e => console.error(e))
