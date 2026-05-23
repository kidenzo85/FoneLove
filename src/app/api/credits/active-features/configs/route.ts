import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/credits/active-features/configs
 * Returns all premium action configurations (durations, costs, enabled state).
 * Used by the frontend store and admin panel.
 */
export async function GET() {
  try {
    let configs = await prisma.premiumActionConfig.findMany({
      orderBy: { action: 'asc' },
    })

    // Seed default configs if none exist
    if (configs.length === 0) {
      const defaults = [
        { action: 'boost', durationMinutes: 30, costCC: 5, label: 'Boost Visibilité', emoji: '🚀' },
        { action: 'super_request', durationMinutes: 2880, costCC: 10, label: 'Super Demande', emoji: '⭐' },
        { action: 'rose_connect', durationMinutes: 2880, costCC: 7, label: 'Rose Connect', emoji: '🌹' },
        { action: 'extra_request', durationMinutes: 1440, costCC: 5, label: 'Demande supplémentaire', emoji: '📱' },
        { action: 'undo_pass', durationMinutes: 1440, costCC: 1, label: 'Annuler un pass', emoji: '↩️' },
        { action: 'see_visitors', durationMinutes: 1440, costCC: 3, label: 'Voir les visiteurs', emoji: '👁️' },
        { action: 'read_receipt', durationMinutes: 1440, costCC: 2, label: 'Accusé de lecture', emoji: '✓' },
        { action: 'ghost_mode', durationMinutes: 1440, costCC: 3, label: 'Mode Fantôme', emoji: '👻' },
        { action: 'filters_plus', durationMinutes: 1440, costCC: 2, label: 'Filtres Connect+', emoji: '🔍' },
        { action: 'theme_flame', durationMinutes: 10080, costCC: 10, label: 'Thème Flamme', emoji: '🔥' },
        { action: 'theme_star', durationMinutes: 10080, costCC: 15, label: 'Thème Étoile', emoji: '⭐' },
        { action: 'theme_aura', durationMinutes: 10080, costCC: 20, label: 'Thème Aura', emoji: '✨' },
        { action: 'custom_badge', durationMinutes: 10080, costCC: 8, label: 'Badge personnalisé', emoji: '🏷️' },
        { action: 'request_animation', durationMinutes: 10080, costCC: 5, label: 'Animation de demande', emoji: '💫' },
      ]

      await prisma.premiumActionConfig.createMany({
        data: defaults.map((d) => ({
          ...d,
          isEnabled: true,
        })),
      })

      configs = await prisma.premiumActionConfig.findMany({
        orderBy: { action: 'asc' },
      })
    }

    return NextResponse.json({
      configs: configs.map((c) => ({
        action: c.action,
        durationMinutes: c.durationMinutes,
        isEnabled: c.isEnabled,
        costCC: c.costCC,
        label: c.label,
        emoji: c.emoji,
      })),
    })
  } catch (error) {
    console.error('Configs fetch error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des configurations' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { action, durationMinutes, costCC, isEnabled, requesterId } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    if (!requesterId) {
      return NextResponse.json({ error: 'Non autorisé. Identifiant requis.' }, { status: 401 })
    }

    // Verify requester has admin rights
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    })

    if (
      !requester ||
      (requester.role !== 'admin' &&
        requester.role !== 'super_admin' &&
        requester.email !== 'fabricewilliam73@gmail.com')
    ) {
      return NextResponse.json({ error: 'Non autorisé. Droits insuffisants.' }, { status: 403 })
    }

    const updated = await prisma.premiumActionConfig.update({
      where: { action },
      data: {
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(costCC !== undefined && { costCC }),
        ...(isEnabled !== undefined && { isEnabled }),
      },
    })

    return NextResponse.json({ config: updated })
  } catch (error) {
    console.error('Configs update error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}
