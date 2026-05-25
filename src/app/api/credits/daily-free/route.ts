import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const BASE_DAILY_FREE = 3
const MAX_STREAK_BONUS = 5 // Max 1 CC per streak day, capped at 5

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const now = new Date()

    // Interactive transaction to group reads/writes and ensure atomicity/performance
    const result = await prisma.$transaction(async (tx) => {
      // 1. Concurrent Read/Create (Upsert) for Wallet and Streak
      const [wallet, dailyStreak] = await Promise.all([
        tx.wallet.upsert({
          where: { userId },
          update: {},
          create: { userId }
        }),
        tx.dailyStreak.upsert({
          where: { userId },
          update: {},
          create: { userId }
        })
      ])

      // 2. Check if already claimed today
      if (wallet.dailyFreeClaimed && wallet.lastFreeClaimAt) {
        const lastClaim = new Date(wallet.lastFreeClaimAt)
        const isSameDay =
          lastClaim.getFullYear() === now.getFullYear() &&
          lastClaim.getMonth() === now.getMonth() &&
          lastClaim.getDate() === now.getDate()

        if (isSameDay) {
          return { alreadyClaimed: true }
        }
      }

      // 3. Calculate streak
      const lastCheckIn = dailyStreak.lastCheckIn
      let newStreak = dailyStreak.currentStreak

      if (lastCheckIn) {
        const lastDate = new Date(lastCheckIn)
        
        // Use calendar days instead of exact 24h periods
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfLastCheckIn = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
        const diffMs = startOfToday.getTime() - startOfLastCheckIn.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          newStreak = dailyStreak.currentStreak + 1
        } else if (diffDays > 1) {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      const streakBonus = Math.min(newStreak - 1, MAX_STREAK_BONUS)
      const totalDailyFree = BASE_DAILY_FREE + Math.max(0, streakBonus)

      // 4. Concurrent Write (Update/Create)
      const [updatedWallet] = await Promise.all([
        tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: totalDailyFree },
            totalEarned: { increment: totalDailyFree },
            dailyFreeClaimed: true,
            dailyFreeStreak: newStreak,
            lastFreeClaimAt: now,
          },
        }),
        tx.dailyStreak.update({
          where: { id: dailyStreak.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, dailyStreak.longestStreak),
            lastCheckIn: now,
            todayBonusClaimed: true,
          },
        }),
        tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: newStreak > 1 ? 'earn_streak' : 'earn_free',
            amount: totalDailyFree,
            action: null,
            description: `CC quotidiens gratuits: ${BASE_DAILY_FREE} CC de base${streakBonus > 0 ? ` + ${streakBonus} CC bonus streak (${newStreak} jours)` : ''}`,
            metadata: JSON.stringify({
              baseAmount: BASE_DAILY_FREE,
              streakBonus,
              streakDays: newStreak,
            }),
          },
        })
      ])

      return {
        updatedWallet,
        newStreak,
        streakBonus,
        totalDailyFree
      }
    }, {
      maxWait: 10000, // 10 seconds to wait for a connection
      timeout: 20000, // 20 seconds for the entire transaction
    })

    if ('alreadyClaimed' in result) {
      return NextResponse.json(
        { error: 'already_claimed', message: 'CC quotidiens déjà réclamés aujourd\'hui' },
        { status: 200 }
      )
    }

    const { updatedWallet, newStreak, streakBonus, totalDailyFree } = result

    // TODO: Probability and amount can be made configurable from admin panel later
    const hasSharedGift = true
    const sharedGiftAmount = 3

    return NextResponse.json({
      claimed: true,
      amount: totalDailyFree,
      newBalance: updatedWallet.balance,
      streak: newStreak,
      baseAmount: BASE_DAILY_FREE,
      streakBonus,
      hasSharedGift,
      sharedGiftAmount,
    })
  } catch (error) {
    console.error('Daily free claim error:', error)
    return NextResponse.json({ error: 'Erreur lors de la réclamation des CC quotidiens' }, { status: 500 })
  }
}
