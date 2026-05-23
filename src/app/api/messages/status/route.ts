import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Registre de saisie en mémoire vive globale (RAM) - 0% impact DB
interface TypingState {
  requestId: string
  timestamp: number
}

const globalForTyping = global as unknown as {
  typingRegistry?: Map<string, TypingState>
}

const typingRegistry = globalForTyping.typingRegistry || new Map<string, TypingState>()
if (process.env.NODE_ENV !== 'production') {
  globalForTyping.typingRegistry = typingRegistry
}

// Clean-up périodique en mémoire toutes les minutes
setInterval(() => {
  const now = Date.now()
  for (const [userId, state] of typingRegistry.entries()) {
    if (now - state.timestamp > 10000) {
      typingRegistry.delete(userId)
    }
  }
}, 60000)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const requestId = searchParams.get('requestId')

    if (!userId || !requestId) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Récupérer uniquement les ID du demandeur et destinataire (très rapide, indexé)
    const request = await prisma.numberRequest.findUnique({
      where: { id: requestId },
      select: { senderId: true, receiverId: true }
    })

    if (!request) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    const otherUserId = request.senderId === userId ? request.receiverId : request.senderId

    // 1. Vérifier si l'autre utilisateur est en train de saisir dans le registre RAM (0 DB query)
    const typingState = typingRegistry.get(otherUserId)
    const otherUserIsTyping = !!(
      typingState &&
      typingState.requestId === requestId &&
      Date.now() - typingState.timestamp < 4000 // Expiration automatique après 4 secondes
    )

    // 2. Compter le nombre de messages (requête d'indexation ultra-rapide)
    const messageCount = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }
    })

    // 3. Vérifier si le dernier message envoyé par l'utilisateur a été lu
    const lastSentMessage = await prisma.message.findFirst({
      where: {
        senderId: userId,
        receiverId: otherUserId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        isRead: true
      }
    })

    const lastMessageRead = lastSentMessage ? lastSentMessage.isRead : true

    return NextResponse.json({
      otherUserIsTyping,
      messageCount,
      lastMessageRead
    })

  } catch (error) {
    console.error('API Status GET Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, requestId, isTyping } = await req.json()

    if (!userId || !requestId) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Enregistrement uniquement en RAM - 0 DB WRITE ! Capable de supporter des millions de transactions/sec
    if (isTyping) {
      typingRegistry.set(userId, {
        requestId,
        timestamp: Date.now()
      })
    } else {
      typingRegistry.delete(userId)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API Status POST Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
