import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const PACKS = {
  decouverte: { cc: 30, bonusCC: 0, price: 2.99, freeRose: 0, freeTheme: false, label: 'Pack Découverte' },
  tendance: { cc: 80, bonusCC: 5, price: 6.99, freeRose: 0, freeTheme: false, label: 'Pack Tendance' },
  passion: { cc: 200, bonusCC: 15, price: 14.99, freeRose: 1, freeTheme: false, label: 'Pack Passion' },
  flamme: { cc: 500, bonusCC: 40, price: 29.99, freeRose: 3, freeTheme: true, label: 'Pack Flamme' },
} as const

type PackType = keyof typeof PACKS

const FIRST_PURCHASE_BONUS = 20

export async function POST(req: NextRequest) {
  try {
    const { userId, packType } = await req.json()

    if (!userId || !packType) {
      return NextResponse.json({ error: 'userId et packType sont requis' }, { status: 400 })
    }

    if (!PACKS[packType as PackType]) {
      return NextResponse.json(
        { error: 'packType invalide. Valeurs acceptées: decouverte, tendance, passion, flamme' },
        { status: 400 }
      )
    }

    const pack = PACKS[packType as PackType]

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      })
    }

    // Check for first purchase bonus
    const previousPurchases = await prisma.transaction.count({
      where: {
        walletId: wallet.id,
        type: 'purchase',
      },
    })

    const isFirstPurchase = previousPurchases === 0

    // Check for active promos
    const now = new Date()
    const activePromos = await prisma.promoOffer.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
    })

    const userPromos = await prisma.userPromo.findMany({
      where: { userId, used: false },
      include: { promo: true },
    })

    // Calculate bonus from promos
    let promoBonusCC = 0
    let promoDiscountPercent = 0
    let promoFreeActions: string[] = []
    const appliedPromos: Array<{ type: string; title: string; bonusCC: number }> = []

    for (const up of userPromos) {
      const promo = up.promo
      if (promo.packType && promo.packType !== packType) continue
      if (promo.bonusCC) {
        promoBonusCC += promo.bonusCC
      }
      if (promo.discountPercent) {
        promoDiscountPercent = Math.max(promoDiscountPercent, promo.discountPercent)
      }
      if (promo.bonusAction) {
        promoFreeActions.push(promo.bonusAction)
      }
      appliedPromos.push({ type: promo.type, title: promo.title, bonusCC: promo.bonusCC ?? 0 })

      // Mark promo as used
      await prisma.userPromo.update({
        where: { id: up.id },
        data: { used: true },
      })
    }

    // Also check for global active promos (happy hour, etc.)
    for (const promo of activePromos) {
      const alreadyClaimed = await prisma.userPromo.findUnique({
        where: { userId_promoId: { userId, promoId: promo.id } },
      })
      if (alreadyClaimed) continue

      if (promo.type === 'happy_hour') {
        if (promo.discountPercent) {
          promoDiscountPercent = Math.max(promoDiscountPercent, promo.discountPercent)
        }
        if (promo.bonusCC) {
          promoBonusCC += promo.bonusCC
        }
        appliedPromos.push({ type: promo.type, title: promo.title, bonusCC: promo.bonusCC ?? 0 })

        await prisma.userPromo.create({
          data: { userId, promoId: promo.id, used: true },
        })
      }
    }

    // Calculate total CC
    let totalCC = pack.cc + pack.bonusCC
    if (isFirstPurchase) {
      totalCC += FIRST_PURCHASE_BONUS
    }
    totalCC += promoBonusCC

    // Apply discount to effective price (for display purposes)
    const effectivePrice = pack.price * (1 - promoDiscountPercent / 100)

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'purchase',
        amount: totalCC,
        action: null,
        packType,
        description: `${pack.label} - ${totalCC} CC${isFirstPurchase ? ' (+20 CC bonus première commande)' : ''}${appliedPromos.length > 0 ? ` | Promos: ${appliedPromos.map((p) => p.title).join(', ')}` : ''}`,
        metadata: JSON.stringify({
          packType,
          baseCC: pack.cc,
          bonusCC: pack.bonusCC,
          firstPurchaseBonus: isFirstPurchase ? FIRST_PURCHASE_BONUS : 0,
          promoBonusCC,
          promoDiscountPercent,
          effectivePrice: Math.round(effectivePrice * 100) / 100,
          freeRose: pack.freeRose,
          freeTheme: pack.freeTheme,
          appliedPromos,
        }),
      },
    })

    // Create free rose transactions if applicable
    if (pack.freeRose > 0) {
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'earn_bonus',
          amount: 0,
          action: 'rose_connect',
          description: `${pack.freeRose} Rose(s) Connect offerte(s) avec ${pack.label}`,
          metadata: JSON.stringify({ freeCount: pack.freeRose, fromPack: packType }),
        },
      })
    }

    // Create free theme transaction if applicable
    if (pack.freeTheme) {
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'earn_bonus',
          amount: 0,
          action: 'theme_flame',
          description: `Thème Flamme offert avec ${pack.label}`,
          metadata: JSON.stringify({ freeTheme: true, fromPack: packType }),
        },
      })
    }

    // First purchase bonus transaction
    if (isFirstPurchase) {
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'earn_bonus',
          amount: FIRST_PURCHASE_BONUS,
          description: `Bonus première commande +${FIRST_PURCHASE_BONUS} CC`,
        },
      })
    }

    // Promo bonus transaction
    if (promoBonusCC > 0) {
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'earn_promo',
          amount: promoBonusCC,
          description: `Bonus promo +${promoBonusCC} CC`,
          metadata: JSON.stringify({ appliedPromos }),
        },
      })
    }

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: totalCC },
        totalEarned: { increment: totalCC },
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: totalCC,
        packType,
        effectivePrice: Math.round(effectivePrice * 100) / 100,
        firstPurchaseBonus: isFirstPurchase ? FIRST_PURCHASE_BONUS : 0,
        promoBonusCC,
        appliedPromos,
        freeRose: pack.freeRose,
        freeTheme: pack.freeTheme,
      },
      balance: updatedWallet.balance,
    })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'achat' }, { status: 500 })
  }
}
