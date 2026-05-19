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

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
      })
    }

    // Check if already claimed today
    if (wallet.dailyFreeClaimed && wallet.lastFreeClaimAt) {
      const lastClaim = new Date(wallet.lastFreeClaimAt)
      const now = new Date()
      const isSameDay =
        lastClaim.getFullYear() === now.getFullYear() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getDate() === now.getDate()

      if (isSameDay) {
        return NextResponse.json(
          { error: 'already_claimed', message: 'CC quotidiens déjà réclamés aujourd\'hui' },
          { status: 200 }
        )
      }
    }

    // Get or create daily streak
    let dailyStreak = await prisma.dailyStreak.findUnique({
      where: { userId },
    })

    if (!dailyStreak) {
      dailyStreak = await prisma.dailyStreak.create({
        data: { userId },
      })
    }

    // Calculate streak
    const now = new Date()
    const lastCheckIn = dailyStreak.lastCheckIn

    let newStreak = dailyStreak.currentStreak
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn)
      const diffMs = now.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day
        newStreak = dailyStreak.currentStreak + 1
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1
      }
      // If diffDays === 0, same day check-in, keep current streak
    } else {
      // First ever check-in
      newStreak = 1
    }

    const streakBonus = Math.min(newStreak - 1, MAX_STREAK_BONUS)
    const totalDailyFree = BASE_DAILY_FREE + Math.max(0, streakBonus)

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: totalDailyFree },
        totalEarned: { increment: totalDailyFree },
        dailyFreeClaimed: true,
        dailyFreeStreak: newStreak,
        lastFreeClaimAt: now,
      },
    })

    // Update daily streak
    await prisma.dailyStreak.update({
      where: { id: dailyStreak.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, dailyStreak.longestStreak),
        lastCheckIn: now,
        todayBonusClaimed: true,
      },
    })

    // Create transaction
    await prisma.transaction.create({
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

    // TODO: Probability and amount can be made configurable from admin panel later
    const hasSharedGift = true
    const sharedGiftAmount = 50

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
