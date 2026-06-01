import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, endpoint, p256dh, auth, userAgent, deviceType } = await req.json()

    if (!userId || !endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dhKey: p256dh,
        authKey: auth,
        userAgent: userAgent || null,
        deviceType: deviceType || 'unknown',
        isActive: true,
      },
      create: {
        userId,
        endpoint,
        p256dhKey: p256dh,
        authKey: auth,
        userAgent: userAgent || null,
        deviceType: deviceType || 'unknown',
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, subscriptionId: subscription.id })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
