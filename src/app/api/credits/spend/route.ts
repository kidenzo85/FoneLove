import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const ACTION_COSTS: Record<string, number> = {
  super_request: 10,
  rose_connect: 7,
  boost: 5,
  extra_request: 5,
  see_visitors: 3,
  read_receipt: 2,
  filters_plus: 2,
  ghost_mode: 3,
  undo_pass: 1,
  theme_flame: 10,
  theme_star: 15,
  theme_aura: 20,
  custom_badge: 8,
  request_animation: 5,
}

const COSMETIC_ACTIONS = new Set(['theme_flame', 'theme_star', 'theme_aura', 'custom_badge', 'request_animation'])

const ACTION_LABELS: Record<string, string> = {
  super_request: 'Super Demande',
  rose_connect: 'Rose Connect',
  boost: 'Boost Visibilité',
  extra_request: 'Demande supplémentaire',
  see_visitors: 'Voir les visiteurs',
  read_receipt: 'Accusé de lecture',
  filters_plus: 'Filtres Connect+',
  ghost_mode: 'Mode Fantôme',
  undo_pass: 'Annuler un pass',
  theme_flame: 'Thème Flamme',
  theme_star: 'Thème Étoile',
  theme_aura: 'Thème Aura',
  custom_badge: 'Badge personnalisé',
  request_animation: 'Animation de demande',
}

// Default durations in minutes (used if no admin config exists)
const DEFAULT_DURATIONS: Record<string, number> = {
  boost: 30,
  super_request: 2880,      // 48h
  rose_connect: 2880,       // 48h
  extra_request: 1440,      // 24h
  undo_pass: 1440,          // 24h
  see_visitors: 1440,       // 24h
  read_receipt: 1440,       // 24h
  ghost_mode: 1440,         // 24h
  filters_plus: 1440,       // 24h
  theme_flame: 10080,       // 7 days
  theme_star: 10080,        // 7 days
  theme_aura: 10080,        // 7 days
  custom_badge: 10080,      // 7 days
  request_animation: 10080, // 7 days
}

/**
 * Get the admin-configured duration for an action, falling back to defaults.
 */
async function getActionDuration(action: string): Promise<number> {
  try {
    const config = await prisma.premiumActionConfig.findUnique({
      where: { action },
    })
    if (config && config.isEnabled) {
      return config.durationMinutes
    }
  } catch {
    // Config table might not exist yet — use defaults
  }
  return DEFAULT_DURATIONS[action] ?? 1440
}

/**
 * Activate the functional effect of a premium action.
 * All logic is server-side to prevent client manipulation.
 */
async function activateActionEffect(
  userId: string,
  action: string,
  walletId: string,
  durationMinutes: number,
  metadata?: Record<string, unknown>
): Promise<{ effect: string; detail?: string; expiresAt: string }> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)
  const expiresAtStr = expiresAt.toISOString()

  switch (action) {
    case 'boost': {
      await prisma.user.update({
        where: { id: userId },
        data: { dailyBoostUsed: true },
      })
      await prisma.wallet.update({
        where: { id: walletId },
        data: { lastBoostAt: now },
      })
      return {
        effect: 'boost_activated',
        detail: `Profil en tête des résultats pendant ${durationMinutes} minutes`,
        expiresAt: expiresAtStr,
      }
    }

    case 'super_request': {
      await prisma.user.update({
        where: { id: userId },
        data: { superRequestsLeft: { increment: 1 } },
      })
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { superRequestsLeft: true } })
      return {
        effect: 'super_request_added',
        detail: `Tu as maintenant ${user?.superRequestsLeft ?? 1} super demande(s) disponible(s)`,
        expiresAt: expiresAtStr,
      }
    }

    case 'extra_request': {
      await prisma.user.update({
        where: { id: userId },
        data: { superRequestsLeft: { increment: 1 } },
      })
      return {
        effect: 'extra_request_added',
        detail: '1 demande supplémentaire ajoutée',
        expiresAt: expiresAtStr,
      }
    }

    case 'ghost_mode': {
      await prisma.user.update({
        where: { id: userId },
        data: { isIncognito: true },
      })
      return {
        effect: 'ghost_mode_activated',
        detail: `Mode Fantôme actif pendant ${Math.round(durationMinutes / 60)}h`,
        expiresAt: expiresAtStr,
      }
    }

    case 'see_visitors': {
      return {
        effect: 'see_visitors_activated',
        detail: `Tu peux voir qui a visité ton profil pendant ${Math.round(durationMinutes / 60)}h`,
        expiresAt: expiresAtStr,
      }
    }

    case 'read_receipt': {
      return {
        effect: 'read_receipt_activated',
        detail: `Accusés de lecture activés pendant ${Math.round(durationMinutes / 60)}h`,
        expiresAt: expiresAtStr,
      }
    }

    case 'filters_plus': {
      return {
        effect: 'filters_plus_activated',
        detail: `Filtres avancés débloqués pendant ${Math.round(durationMinutes / 60)}h`,
        expiresAt: expiresAtStr,
      }
    }

    case 'rose_connect': {
      return {
        effect: 'rose_connect_added',
        detail: '1 Rose Connect ajoutée à ton inventaire',
        expiresAt: expiresAtStr,
      }
    }

    case 'undo_pass': {
      return {
        effect: 'undo_pass_added',
        detail: 'Tu peux annuler ton dernier pass',
        expiresAt: expiresAtStr,
      }
    }

    default:
      return { effect: 'credits_spent', expiresAt: expiresAtStr }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, action, metadata } = await req.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId et action sont requis' }, { status: 400 })
    }

    const cost = ACTION_COSTS[action]
    if (cost === undefined) {
      return NextResponse.json(
        { error: `Action invalide. Actions acceptées: ${Object.keys(ACTION_COSTS).join(', ')}` },
        { status: 400 }
      )
    }

    // Check if action is enabled in admin config
    try {
      const config = await prisma.premiumActionConfig.findUnique({ where: { action } })
      if (config && !config.isEnabled) {
        return NextResponse.json(
          { error: 'Cette action est temporairement désactivée' },
          { status: 400 }
        )
      }
    } catch {
      // Config not seeded yet — allow by default
    }

    // Get wallet — server-side balance check
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Portefeuille introuvable.' }, { status: 404 })
    }

    // SECURITY: Server-side balance validation
    if (wallet.balance < cost) {
      return NextResponse.json(
        { error: `Solde insuffisant. Requis: ${cost} CC, Disponible: ${wallet.balance} CC` },
        { status: 400 }
      )
    }

    // Get admin-configured duration
    const durationMinutes = await getActionDuration(action)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)

    // ===== 1. Record the transaction =====
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'spend',
        amount: -cost,
        action,
        description: `${ACTION_LABELS[action] || action} - ${cost} CC`,
        metadata: JSON.stringify({
          ...(metadata || {}),
          activatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          durationMinutes,
        }),
      },
    })

    // ===== 2. Create ActivePremiumFeature record =====
    const activeFeature = await prisma.activePremiumFeature.create({
      data: {
        userId,
        action,
        activatedAt: now,
        expiresAt,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isConsumed: false,
      },
    })

    // ===== 3. Activate the functional effect (server-side) =====
    let activatedEffect: { effect: string; detail?: string; expiresAt: string } = {
      effect: 'credits_spent',
      expiresAt: expiresAt.toISOString(),
    }

    // For cosmetic purchases, create CosmeticItem record
    if (COSMETIC_ACTIONS.has(action)) {
      const cosmeticData: {
        userId: string
        type: string
        isActive: boolean
        customText?: string
        colorChoice?: string
      } = {
        userId,
        type: action,
        isActive: true,
      }

      // Deactivate other items of the same type
      await prisma.cosmeticItem.updateMany({
        where: { userId, type: action, isActive: true },
        data: { isActive: false },
      })

      // Add custom fields based on metadata
      if (metadata) {
        if (metadata.customText && action === 'custom_badge') {
          cosmeticData.customText = String(metadata.customText).substring(0, 20)
        }
        if (metadata.colorChoice && action === 'theme_aura') {
          cosmeticData.colorChoice = String(metadata.colorChoice)
        }
      }

      await prisma.cosmeticItem.create({
        data: cosmeticData,
      })

      activatedEffect = {
        effect: `cosmetic_${action}_activated`,
        detail: `${ACTION_LABELS[action]} activé sur ton profil`,
        expiresAt: expiresAt.toISOString(),
      }
    } else {
      // Non-cosmetic actions: activate the real functional effect
      activatedEffect = await activateActionEffect(
        userId, action, wallet.id, durationMinutes, metadata as Record<string, unknown>
      )
    }

    // ===== 4. Debit the wallet =====
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: cost },
        totalSpent: { increment: cost },
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        action,
        amount: -cost,
        description: transaction.description,
      },
      balance: updatedWallet.balance,
      activatedEffect,
      activeFeature: {
        id: activeFeature.id,
        action: activeFeature.action,
        activatedAt: activeFeature.activatedAt.toISOString(),
        expiresAt: activeFeature.expiresAt.toISOString(),
        metadata: activeFeature.metadata,
      },
    })
  } catch (error) {
    console.error('Spend error:', error)
    return NextResponse.json({ error: 'Erreur lors de la dépense' }, { status: 500 })
  }
}
