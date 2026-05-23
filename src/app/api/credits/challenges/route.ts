import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const CHALLENGE_TEMPLATES = [
  {
    type: 'sociable',
    title: 'Sociable',
    description: 'Envoie 5 likes cette semaine',
    targetCount: 5,
    reward: 5,
  },
  {
    type: 'audacieux',
    title: 'Audacieux',
    description: 'Envoie 2 demandes de numéro',
    targetCount: 2,
    reward: 8,
  },
  {
    type: 'complet',
    title: 'Complet',
    description: 'Ajoute 3 photos + 1 prompt',
    targetCount: 4, // 3 photos + 1 prompt = 4 actions
    reward: 6,
  },
  {
    type: 'actif',
    title: 'Actif',
    description: 'Connecte-toi 5 jours sur 7',
    targetCount: 5,
    reward: 4,
  },
  {
    type: 'curieux',
    title: 'Curieux',
    description: 'Visite 20 profils cette semaine',
    targetCount: 20,
    reward: 3,
  },
]

function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
  const weekStart = new Date(now.getFullYear(), now.getMonth(), diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  return weekEnd
}

async function ensureWeeklyChallenges() {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  // Check if challenges exist for this week
  const existingChallenges = await prisma.challenge.findMany({
    where: {
      resetsAt: { gte: weekStart },
    },
  })

  if (existingChallenges.length >= CHALLENGE_TEMPLATES.length) {
    return existingChallenges
  }

  // Create challenges for this week
  const challenges: any[] = []
  for (const template of CHALLENGE_TEMPLATES) {
    const existing = existingChallenges.find((c) => c.type === template.type)
    if (existing) {
      challenges.push(existing)
      continue
    }

    const challenge = await prisma.challenge.create({
      data: {
        type: template.type,
        title: template.title,
        description: template.description,
        targetCount: template.targetCount,
        reward: template.reward,
        resetsAt: weekEnd,
      },
    })
    challenges.push(challenge)
  }

  return challenges
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
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Ensure weekly challenges exist
    const challenges = await ensureWeeklyChallenges()

    // Get user progress for each challenge
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        let progress = await prisma.challengeProgress.findUnique({
          where: {
            userId_challengeId: {
              userId,
              challengeId: challenge.id,
            },
          },
        })

        if (!progress) {
          progress = await prisma.challengeProgress.create({
            data: {
              userId,
              challengeId: challenge.id,
              progress: 0,
              completed: false,
              claimed: false,
            },
          })
        }

        return {
          id: challenge.id,
          type: challenge.type,
          title: challenge.title,
          description: challenge.description,
          targetCount: challenge.targetCount,
          reward: challenge.reward,
          resetsAt: challenge.resetsAt,
          progress: progress.progress,
          completed: progress.completed,
          claimed: progress.claimed,
        }
      })
    )

    return NextResponse.json({
      challenges: challengesWithProgress,
      weekStart: getWeekStart(),
      weekEnd: getWeekEnd(),
    })
  } catch (error) {
    console.error('Challenges GET error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des défis' }, { status: 500 })
  }
}
