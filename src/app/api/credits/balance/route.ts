import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const LEVEL_THRESHOLDS = [
  { name: 'Bronze', threshold: 0, nextThreshold: 50 },
  { name: 'Argent', threshold: 50, nextThreshold: 200 },
  { name: 'Or', threshold: 200, nextThreshold: 500 },
  { name: 'Platine', threshold: 500, nextThreshold: 1500 },
  { name: 'Diamant', threshold: 1500, nextThreshold: null },
]

function getLevelInfo(totalSpent: number) {
  let currentLevel = LEVEL_THRESHOLDS[0]
  for (const level of LEVEL_THRESHOLDS) {
    if (totalSpent >= level.threshold) {
      currentLevel = level
    }
  }
  return currentLevel
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      console.warn(`Balance fetch: User ${userId} not found in database. Returning defaults.`)
      return NextResponse.json({
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        level: 0,
        levelName: 'Bronze',
        nextLevelAt: 50,
        streak: 0,
        dailyFreeClaimed: false,
        freeBoostClaimed: false,
      })
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

    // Get streak info
    const dailyStreak = await prisma.dailyStreak.findUnique({
      where: { userId },
    })

    // Calculate level
    const levelInfo = getLevelInfo(wallet.totalSpent)
    const levelIndex = LEVEL_THRESHOLDS.findIndex((l) => l.name === levelInfo.name)

    // Robust daily claim check
    const now = new Date()
    const isToday = (date: Date | null) => {
      if (!date) return false
      const d = new Date(date)
      return d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() &&
             d.getDate() === now.getDate()
    }

    const dailyFreeClaimed = isToday(wallet.lastFreeClaimAt)
    const freeBoostClaimed = isToday(wallet.lastBoostAt)

    return NextResponse.json({
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      level: levelIndex,
      levelName: levelInfo.name,
      nextLevelAt: levelInfo.nextThreshold,
      streak: dailyStreak?.currentStreak ?? 0,
      dailyFreeClaimed,
      freeBoostClaimed,
    })
  } catch (error) {
    console.error('Balance fetch error [CRITICAL]:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du solde',
      details: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}

