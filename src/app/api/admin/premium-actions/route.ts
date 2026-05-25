import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/premium-actions
 * Fetch all premium actions configuration for the admin panel.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')

    if (!requesterId) {
      return NextResponse.json({ error: 'ID du demandeur requis' }, { status: 400 })
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true, email: true },
    })

    if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 })
    }

    let actions = await prisma.premiumActionConfig.findMany()

    // Ensure 'post_moment' exists
    if (!actions.some(a => a.action === 'post_moment')) {
      const momentConfig = await prisma.premiumActionConfig.create({
        data: {
          action: 'post_moment',
          costCC: 50,
          durationMinutes: 1440,
          isEnabled: true,
          label: 'Partager un Moment (Photo)',
          emoji: '📸',
        }
      })
      actions.push(momentConfig)
    }

    return NextResponse.json({ actions })
  } catch (error) {
    console.error('Admin PremiumActions GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/premium-actions
 * Update a premium action configuration.
 */
export async function PUT(req: NextRequest) {
  try {
    const { requesterId, action, costCC, durationMinutes, isEnabled } = await req.json()

    if (!requesterId || !action) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true, email: true },
    })

    if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 })
    }

    const updated = await prisma.premiumActionConfig.update({
      where: { action },
      data: {
        costCC,
        durationMinutes,
        isEnabled,
      },
    })

    return NextResponse.json({ success: true, action: updated })
  } catch (error) {
    console.error('Admin PremiumActions PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
