import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface PromoResult {
  type: string
  title: string
  description: string
  discountPercent?: number
  bonusCC?: number
  bonusAction?: string
  packType?: string
  isActive: boolean
  expiresAt?: Date
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    const now = new Date()
    const promos: PromoResult[] = []

    // 1. Check first_purchase promo
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    let hasPurchased = false
    if (wallet) {
      const purchaseCount = await prisma.transaction.count({
        where: {
          walletId: wallet.id,
          type: 'purchase',
        },
      })
      hasPurchased = purchaseCount > 0
    }

    if (!hasPurchased) {
      promos.push({
        type: 'first_purchase',
        title: 'Première commande',
        description: 'Reçois +20 CC bonus sur ta première commande !',
        bonusCC: 20,
        isActive: true,
      })
    }

    // 2. Check happy_hour promo (Fri/Sun 20:00-23:00)
    const dayOfWeek = now.getDay() // 0=Sun, 5=Fri
    const hour = now.getHours()
    const isHappyHour = (dayOfWeek === 5 || dayOfWeek === 0) && hour >= 20 && hour < 23

    if (isHappyHour) {
      promos.push({
        type: 'happy_hour',
        title: 'Happy Hour 🎉',
        description: 'Profite de +30% CC sur tous les packs ! Valide vendredi et dimanche de 20h à 23h.',
        discountPercent: 30,
        isActive: true,
        expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0),
      })
    }

    // 3. Check match_pack promo (user has a mutual match)
    const mutualMatch = await prisma.like.findFirst({
      where: {
        isMutual: true,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    })

    if (mutualMatch) {
      promos.push({
        type: 'match_pack',
        title: 'Pack Match 🤝',
        description: 'Tu as un match ! Pack Tendance à -30%.',
        discountPercent: 30,
        packType: 'tendance',
        isActive: true,
      })
    }

    // 4. Check birthday promo
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (user?.birthDate) {
      const birthMonth = new Date(user.birthDate).getMonth()
      const currentMonth = now.getMonth()

      if (birthMonth === currentMonth) {
        promos.push({
          type: 'birthday',
          title: 'Anniversaire 🎂',
          description: 'C\'est ton mois ! Pack Passion à -25% + Rose Connect gratuite.',
          discountPercent: 25,
          packType: 'passion',
          bonusAction: 'rose_connect',
          isActive: true,
        })
      }
    }

    // 5. Check streak_reward promo (7-day streak)
    const dailyStreak = await prisma.dailyStreak.findUnique({
      where: { userId },
    })

    if (dailyStreak && dailyStreak.currentStreak >= 7) {
      // Check if already claimed this streak reward
      const alreadyClaimed = await prisma.userPromo.findFirst({
        where: {
          userId,
          promo: {
            type: 'streak_reward',
          },
          used: true,
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      })

      if (!alreadyClaimed) {
        promos.push({
          type: 'streak_reward',
          title: 'Récompense Streak 🔥',
          description: '7 jours de streak ! 5 CC + Boost gratuit.',
          bonusCC: 5,
          bonusAction: 'boost',
          isActive: true,
        })
      }
    }

    // 6. Also check for DB-stored active promos
    const activeDbPromos = await prisma.promoOffer.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        expiresAt: { gte: now },
      },
    })

    for (const dbPromo of activeDbPromos) {
      // Check if user already used this promo
      const userPromo = await prisma.userPromo.findUnique({
        where: {
          userId_promoId: {
            userId,
            promoId: dbPromo.id,
          },
        },
      })

      if (!userPromo || !userPromo.used) {
        // Avoid duplicates with computed promos
        const isDuplicate = promos.some((p) => p.type === dbPromo.type)
        if (!isDuplicate) {
          promos.push({
            type: dbPromo.type,
            title: dbPromo.title,
            description: dbPromo.description,
            discountPercent: dbPromo.discountPercent ?? undefined,
            bonusCC: dbPromo.bonusCC ?? undefined,
            bonusAction: dbPromo.bonusAction ?? undefined,
            packType: dbPromo.packType ?? undefined,
            isActive: true,
            expiresAt: dbPromo.expiresAt,
          })
        }
      }
    }

    return NextResponse.json({ promos })
  } catch (error) {
    console.error('Promos GET error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des promotions' }, { status: 500 })
  }
}
