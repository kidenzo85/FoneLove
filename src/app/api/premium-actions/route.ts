import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const actions = await prisma.premiumActionConfig.findMany({
      where: { isEnabled: true },
    })

    return NextResponse.json({ actions })
  } catch (error) {
    console.error('Premium Actions GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
