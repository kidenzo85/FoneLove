import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const packs = await prisma.packConfig.findMany({
      where: { isActive: true },
      orderBy: [
        { currency: 'asc' },
        { amount: 'asc' }
      ]
    })
    return NextResponse.json({ packs })
  } catch (error) {
    console.error('Error fetching public packs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
