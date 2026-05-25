import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_DAILY_FREE = 3
const MAX_STREAK_BONUS = 5

async function run() {
  try {
    const userId = "cmpd5tirc0000l504g7gjdqsq" // The one from the UI

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      console.log('User not found')
      return
    }

    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({ where: { userId } })
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId } })
      }

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

      let dailyStreak = await tx.dailyStreak.findUnique({ where: { userId } })
      if (!dailyStreak) {
        dailyStreak = await tx.dailyStreak.create({ data: { userId } })
      }

      const lastCheckIn = dailyStreak.lastCheckIn
      let newStreak = dailyStreak.currentStreak

      if (lastCheckIn) {
        const lastDate = new Date(lastCheckIn)
        const diffMs = now.getTime() - lastDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

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

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: totalDailyFree },
          totalEarned: { increment: totalDailyFree },
          dailyFreeClaimed: true,
          dailyFreeStreak: newStreak,
          lastFreeClaimAt: now,
        },
      })

      await tx.dailyStreak.update({
        where: { id: dailyStreak.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, dailyStreak.longestStreak),
          lastCheckIn: now,
          todayBonusClaimed: true,
        },
      })

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: newStreak > 1 ? 'earn_streak' : 'earn_free',
          amount: totalDailyFree,
          action: null,
          description: `CC quotidiens gratuits`,
          metadata: JSON.stringify({ baseAmount: BASE_DAILY_FREE }),
        },
      })

      return {
        updatedWallet,
        newStreak,
        streakBonus,
        totalDailyFree
      }
    })

    console.log("Success:", result)
  } catch (err) {
    console.error("Prisma error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

run()
