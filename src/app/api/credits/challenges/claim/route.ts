import { NextRequest, NextResponse } from 'next/server'
import { claimChallenge } from '@/lib/supabase-credits'

export async function POST(req: NextRequest) {
  try {
    const { userId, challengeId } = await req.json()
    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'userId et challengeId sont requis' }, { status: 400 })
    }
    const result = await claimChallenge(userId, challengeId)
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      reward: result.reward,
      newBalance: result.newBalance,
    })
  } catch (error) {
    console.error('Challenge claim error:', error)
    return NextResponse.json({ error: 'Erreur lors de la réclamation du défi' }, { status: 500 })
  }
}
