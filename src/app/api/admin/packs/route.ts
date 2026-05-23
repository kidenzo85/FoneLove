import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const packs = await prisma.packConfig.findMany({
      orderBy: [
        { currency: 'asc' },
        { amount: 'asc' }
      ]
    })
    return NextResponse.json({ packs })
  } catch (error) {
    console.error('Error fetching packs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { currency, packKey, name, amount, bonusAmount, priceEur, priceXaf, bonusText, icon, freeRose, freeTheme, isActive } = body

    if (!currency || !packKey || !name || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pack = await prisma.packConfig.create({
      data: {
        currency,
        packKey,
        name,
        amount,
        bonusAmount: bonusAmount || 0,
        priceEur: priceEur || null,
        priceXaf: priceXaf || null,
        bonusText: bonusText || null,
        icon: icon || null,
        freeRose: freeRose || 0,
        freeTheme: freeTheme || false,
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    return NextResponse.json({ pack })
  } catch (error) {
    console.error('Error creating pack:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, currency, packKey, name, amount, bonusAmount, priceEur, priceXaf, bonusText, icon, freeRose, freeTheme, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing pack ID' }, { status: 400 })
    }

    // Get current pack to check for price changes
    const currentPack = await prisma.packConfig.findUnique({ where: { id } })
    if (!currentPack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
    }

    // If price changed, record history
    if (
      (priceEur !== undefined && currentPack.priceEur !== priceEur) ||
      (priceXaf !== undefined && currentPack.priceXaf !== priceXaf)
    ) {
      // First, close previous history records
      await prisma.packPriceHistory.updateMany({
        where: { packId: id, endDate: null },
        data: { endDate: new Date() }
      })

      // Create new history record
      await prisma.packPriceHistory.create({
        data: {
          packId: id,
          priceEur: priceEur !== undefined ? priceEur : currentPack.priceEur,
          priceXaf: priceXaf !== undefined ? priceXaf : currentPack.priceXaf,
        }
      })
    }

    const pack = await prisma.packConfig.update({
      where: { id },
      data: {
        ...(currency !== undefined && { currency }),
        ...(packKey !== undefined && { packKey }),
        ...(name !== undefined && { name }),
        ...(amount !== undefined && { amount }),
        ...(bonusAmount !== undefined && { bonusAmount }),
        ...(priceEur !== undefined && { priceEur }),
        ...(priceXaf !== undefined && { priceXaf }),
        ...(bonusText !== undefined && { bonusText }),
        ...(icon !== undefined && { icon }),
        ...(freeRose !== undefined && { freeRose }),
        ...(freeTheme !== undefined && { freeTheme }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    return NextResponse.json({ pack })
  } catch (error) {
    console.error('Error updating pack:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.packConfig.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pack:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
