import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const LEVEL_THRESHOLDS = [
  {
    name: 'Bronze',
    threshold: 0,
    nextThreshold: 50,
    benefits: ['Accès de base aux fonctionnalités', '3 CC gratuits par jour'],
  },
  {
    name: 'Argent',
    threshold: 50,
    nextThreshold: 200,
    benefits: ['Tout de Bronze', 'Voir les derniers visiteurs', 'Filtres avancés'],
  },
  {
    name: 'Or',
    threshold: 200,
    nextThreshold: 500,
    benefits: ['Tout d\'Argent', 'Mode Fantôme', 'Accusés de lecture', 'Boost quotidien bonus'],
  },
  {
    name: 'Platine',
    threshold: 500,
    nextThreshold: 1500,
    benefits: ['Tout d\'Or', 'Thème exclusif', 'Badge personnalisé', 'Priorité dans les résultats'],
  },
  {
    name: 'Diamant',
    threshold: 1500,
    nextThreshold: null,
    benefits: ['Tout de Platine', 'Tous les thèmes gratuits', 'Animations exclusives', 'Support prioritaire', '1 CC bonus quotidien supplémentaire'],
  },
]

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    const totalSpent = wallet?.totalSpent ?? 0

    // Find current level
    let currentLevel = LEVEL_THRESHOLDS[0]
    let currentLevelIndex = 0

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalSpent >= LEVEL_THRESHOLDS[i].threshold) {
        currentLevel = LEVEL_THRESHOLDS[i]
        currentLevelIndex = i
        break
      }
    }

    // Calculate progress to next level
    let progress = 0
    if (currentLevel.nextThreshold !== null) {
      const rangeStart = currentLevel.threshold
      const rangeEnd = currentLevel.nextThreshold
      const range = rangeEnd - rangeStart
      progress = Math.min(100, Math.round(((totalSpent - rangeStart) / range) * 100))
    } else {
      progress = 100 // Max level
    }

    return NextResponse.json({
      level: currentLevelIndex,
      levelName: currentLevel.name,
      currentThreshold: currentLevel.threshold,
      nextThreshold: currentLevel.nextThreshold,
      totalSpent,
      progress,
      benefits: currentLevel.benefits,
    })
  } catch (error) {
    console.error('Level GET error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du niveau' }, { status: 500 })
  }
}
