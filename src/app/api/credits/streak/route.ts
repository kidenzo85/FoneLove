import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Streak milestone rewards
const STREAK_MILESTONES: Record<number, { bonusCC: number; reward: string; description: string }> = {
  5: { bonusCC: 2, reward: 'bonus_cc', description: 'Jour 5: +2 CC bonus + notification' },
  7: { bonusCC: 3, reward: 'free_boost', description: 'Jour 7: +3 CC bonus + Boost gratuit' },
  14: { bonusCC: 4, reward: 'free_rose', description: 'Jour 14: +4 CC bonus + Rose Connect gratuite' },
  30: { bonusCC: 5, reward: 'theme_legende', description: 'Jour 30: +5 CC bonus + Thème Légende' },
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    const dailyStreak = await prisma.dailyStreak.findUnique({
      where: { userId },
    })

    if (!dailyStreak) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        todayBonusClaimed: false,
        nextMilestone: 5,
        milestones: STREAK_MILESTONES,
      })
    }

    // Find next milestone
    const milestoneDays = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b)
    const nextMilestone = milestoneDays.find((d) => d > dailyStreak.currentStreak) ?? null

    // Robust todayBonusClaimed check
    const now = new Date()
    const isToday = (date: Date | null) => {
      if (!date) return false
      const d = new Date(date)
      return d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate()
    }

    const todayBonusClaimed = isToday(dailyStreak.lastCheckIn)

    return NextResponse.json({
      currentStreak: dailyStreak.currentStreak,
      longestStreak: dailyStreak.longestStreak,
      lastCheckIn: dailyStreak.lastCheckIn,
      todayBonusClaimed,
      nextMilestone,
      milestones: STREAK_MILESTONES,
    })

  } catch (error) {
    console.error('Streak GET error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du streak' }, { status: 500 })
  }
}

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

    // Get or create daily streak
    let dailyStreak = await prisma.dailyStreak.findUnique({
      where: { userId },
    })

    if (!dailyStreak) {
      dailyStreak = await prisma.dailyStreak.create({
        data: { userId },
      })
    }

    const now = new Date()

    // Check if already checked in today
    if (dailyStreak.todayBonusClaimed && dailyStreak.lastCheckIn) {
      const lastCheck = new Date(dailyStreak.lastCheckIn)
      const isSameDay =
        lastCheck.getFullYear() === now.getFullYear() &&
        lastCheck.getMonth() === now.getMonth() &&
        lastCheck.getDate() === now.getDate()

      if (isSameDay) {
        return NextResponse.json(
          { error: 'already_claimed', message: 'Check-in déjà effectué aujourd\'hui' },
          { status: 200 }
        )
      }
    }

    // Calculate if streak continues or resets
    let newStreak = dailyStreak.currentStreak
    let streakContinued = false

    if (dailyStreak.lastCheckIn) {
      const lastDate = new Date(dailyStreak.lastCheckIn)
      
      // Use calendar days instead of exact 24h periods
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfLastCheckIn = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      const diffMs = startOfToday.getTime() - startOfLastCheckIn.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        newStreak = dailyStreak.currentStreak + 1
        streakContinued = true
      } else if (diffDays > 1) {
        newStreak = 1
        streakContinued = false
      } else {
        // Same day, already handled above
        return NextResponse.json(
          { error: 'already_claimed', message: 'Check-in déjà effectué aujourd\'hui' },
          { status: 200 }
        )
      }
    } else {
      newStreak = 1
    }

    // Update streak
    const updatedStreak = await prisma.dailyStreak.update({
      where: { id: dailyStreak.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, dailyStreak.longestStreak),
        lastCheckIn: now,
        todayBonusClaimed: true,
      },
    })

    // Check for milestone rewards
    const milestone = STREAK_MILESTONES[newStreak]
    let milestoneReward: any = null

    if (milestone) {
      // Get or create wallet for rewards
      let wallet = await prisma.wallet.findUnique({
        where: { userId },
      })

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: { userId },
        })
      }

      // Award bonus CC
      if (milestone.bonusCC > 0) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: milestone.bonusCC },
            totalEarned: { increment: milestone.bonusCC },
          },
        })

        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'earn_streak',
            amount: milestone.bonusCC,
            description: milestone.description,
            metadata: JSON.stringify({ streakDay: newStreak, reward: milestone.reward }),
          },
        })
      }

      // Award special items based on milestone
      if (milestone.reward === 'free_boost') {
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'earn_bonus',
            amount: 0,
            action: 'boost',
            description: 'Boost gratuit - Récompense streak 7 jours',
            metadata: JSON.stringify({ streakDay: 7, freeBoost: true }),
          },
        })
      } else if (milestone.reward === 'free_rose') {
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'earn_bonus',
            amount: 0,
            action: 'rose_connect',
            description: 'Rose Connect gratuite - Récompense streak 14 jours',
            metadata: JSON.stringify({ streakDay: 14, freeRose: true }),
          },
        })
      } else if (milestone.reward === 'theme_legende') {
        // Deactivate other themes
        await prisma.cosmeticItem.updateMany({
          where: { userId, type: 'theme_flame', isActive: true },
          data: { isActive: false },
        })
        await prisma.cosmeticItem.create({
          data: {
            userId,
            type: 'theme_flame',
            isActive: true,
            customText: 'Légende',
          },
        })
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'earn_bonus',
            amount: 0,
            action: 'theme_flame',
            description: 'Thème Légende - Récompense streak 30 jours',
            metadata: JSON.stringify({ streakDay: 30, themeLegende: true }),
          },
        })
      }

      milestoneReward = {
        day: newStreak,
        bonusCC: milestone.bonusCC,
        reward: milestone.reward,
        description: milestone.description,
      }
    }

    return NextResponse.json({
      success: true,
      currentStreak: updatedStreak.currentStreak,
      longestStreak: updatedStreak.longestStreak,
      streakContinued,
      milestoneReward,
    })
  } catch (error) {
    console.error('Streak POST error:', error)
    return NextResponse.json({ error: 'Erreur lors du check-in' }, { status: 500 })
  }
}
