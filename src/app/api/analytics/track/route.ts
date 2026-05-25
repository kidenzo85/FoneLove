import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventName, metadata, userId } = body

    if (!eventName) {
      return NextResponse.json({ error: 'eventName est requis' }, { status: 400 })
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        eventName,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userId: userId || null,
      },
    })

    return NextResponse.json({ success: true, eventId: event.id })
  } catch (error) {
    console.error('Erreur API Analytics Track:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
