import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Send FoneLove gift to another user
export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, amount, message } = await req.json()

    if (!senderId || !receiverId || !amount) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: 'Tu ne peux pas t\'envoyer un cadeau' }, { status: 400 })
    }

    if (amount < 1 || amount > 1000) {
      return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
    }

    // Check config is active
    const config = await prisma.foneLoveConfig.findFirst()
    if (config && !config.isActive) {
      return NextResponse.json({ error: 'Les FoneLove sont temporairement désactivés' }, { status: 403 })
    }

    // Ensure sender wallet exists and has enough balance
    const senderWallet = await prisma.foneLoveWallet.findUnique({
      where: { userId: senderId },
    })

    if (!senderWallet || senderWallet.balance < amount) {
      return NextResponse.json({
        error: 'Solde FoneLove insuffisant',
        balance: senderWallet?.balance ?? 0,
        needed: amount,
      }, { status: 400 })
    }

    // Check daily limit
    if (config?.maxDailyGiftPerUser) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayGifts = await prisma.foneLoveGift.aggregate({
        where: {
          senderId,
          receiverId,
          createdAt: { gte: todayStart },
        },
        _sum: { amount: true },
      })
      const todayTotal = (todayGifts._sum.amount ?? 0) + amount
      if (todayTotal > config.maxDailyGiftPerUser) {
        return NextResponse.json({
          error: `Limite quotidienne atteinte (max ${config.maxDailyGiftPerUser} par personne/jour)`,
        }, { status: 400 })
      }
    }

    // Ensure receiver wallet exists (auto-create)
    await prisma.foneLoveWallet.upsert({
      where: { userId: receiverId },
      create: { userId: receiverId },
      update: {},
    })

    // Atomic transaction: debit sender, credit receiver, create gift record
    const [updatedSender, updatedReceiver, gift] = await prisma.$transaction([
      // Debit sender
      prisma.foneLoveWallet.update({
        where: { userId: senderId },
        data: {
          balance: { decrement: amount },
          totalSent: { increment: amount },
        },
      }),
      // Credit receiver
      prisma.foneLoveWallet.update({
        where: { userId: receiverId },
        data: {
          balance: { increment: amount },
          totalReceived: { increment: amount },
        },
      }),
      // Create gift record
      prisma.foneLoveGift.create({
        data: {
          senderId,
          receiverId,
          amount,
          message: message?.slice(0, 200) || null,
        },
      }),
      // Sender transaction
      prisma.foneLoveTransaction.create({
        data: {
          walletId: senderWallet.id,
          type: 'send',
          amount: -amount,
          description: `Envoi de ${amount} FoneLove`,
        },
      }),
    ])

    // Create receiver transaction separately (need receiver wallet id)
    const receiverWallet = await prisma.foneLoveWallet.findUnique({
      where: { userId: receiverId },
    })
    if (receiverWallet) {
      await prisma.foneLoveTransaction.create({
        data: {
          walletId: receiverWallet.id,
          type: 'receive',
          amount: amount,
          description: `Reçu ${amount} FoneLove`,
        },
      })
    }

    // Auto-create Conversation if none exists
    const existingRequest = await prisma.numberRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ],
        status: { in: ['pending', 'accepted'] }
      }
    })

    let requestId = existingRequest?.id

    if (!requestId) {
      const newRequest = await prisma.numberRequest.create({
        data: {
          senderId,
          receiverId,
          status: 'pending',
          message: '🎁 FoneLove', // Optional visual indicator
        }
      })
      requestId = newRequest.id
    }

    // Create Gift Message in the conversation thread
    await prisma.message.create({
      data: {
        senderId,
        receiverId,
        requestId,
        type: 'gift',
        content: JSON.stringify({ amount, message }),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // Standard expiration
      }
    })

    // Get sender info for the response
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { firstName: true },
    })

    // Send push notification and save in-app notification safely
    if (sender) {
      try {
        // 1. Save in-app notification
        await prisma.appNotification.create({
          data: {
            userId: receiverId,
            type: 'fonelove_received',
            title: '🎁 FoneLove reçu !',
            body: `${sender.firstName} t'a envoyé ${amount} FoneLove ! ${message ? `"${message}"` : ''}`,
            url: '/?tab=messages',
          }
        })

        // 2. Send Push
        const { sendPushToUser } = await import('@/lib/push-service')
        await sendPushToUser(receiverId, {
          title: '🎁 FoneLove reçu !',
          body: `${sender.firstName} t'a envoyé ${amount} FoneLove ! ${message ? `"${message}"` : ''}`,
          type: 'message',
          url: `/?tab=messages`
        })
      } catch (err) {
        console.error('[Gifts API] Push trigger failed:', err)
      }
    }

    return NextResponse.json({
      success: true,
      gift: {
        id: gift.id,
        amount,
        message: gift.message,
        senderName: sender?.firstName,
      },
      newBalance: updatedSender.balance,
    })
  } catch (err) {
    console.error('FoneLove send error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
