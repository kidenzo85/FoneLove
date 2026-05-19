import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch FoneLove config
export async function GET() {
  try {
    let config = await prisma.foneLoveConfig.findFirst()

    // Auto-create default config if none exists
    if (!config) {
      config = await prisma.foneLoveConfig.create({
        data: {},
      })
    }

    return NextResponse.json({
      config: {
        unitPriceEur: config.unitPriceEur,
        withdrawValueEur: config.withdrawValueEur,
        commissionPercent: config.commissionPercent,
        minWithdrawAmount: config.minWithdrawAmount,
        maxDailyGiftPerUser: config.maxDailyGiftPerUser,
        isActive: config.isActive,
      },
    })
  } catch (err) {
    console.error('FoneLove config GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT: Update FoneLove config (admin only)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    let config = await prisma.foneLoveConfig.findFirst()

    if (!config) {
      config = await prisma.foneLoveConfig.create({
        data: {
          unitPriceEur: body.unitPriceEur ?? 0.50,
          withdrawValueEur: body.withdrawValueEur ?? 0.30,
          commissionPercent: body.commissionPercent ?? 40,
          minWithdrawAmount: body.minWithdrawAmount ?? 10,
          maxDailyGiftPerUser: body.maxDailyGiftPerUser ?? 100,
          isActive: body.isActive ?? true,
        },
      })
    } else {
      config = await prisma.foneLoveConfig.update({
        where: { id: config.id },
        data: {
          ...(body.unitPriceEur !== undefined && { unitPriceEur: body.unitPriceEur }),
          ...(body.withdrawValueEur !== undefined && { withdrawValueEur: body.withdrawValueEur }),
          ...(body.commissionPercent !== undefined && { commissionPercent: body.commissionPercent }),
          ...(body.minWithdrawAmount !== undefined && { minWithdrawAmount: body.minWithdrawAmount }),
          ...(body.maxDailyGiftPerUser !== undefined && { maxDailyGiftPerUser: body.maxDailyGiftPerUser }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      config: {
        unitPriceEur: config.unitPriceEur,
        withdrawValueEur: config.withdrawValueEur,
        commissionPercent: config.commissionPercent,
        minWithdrawAmount: config.minWithdrawAmount,
        maxDailyGiftPerUser: config.maxDailyGiftPerUser,
        isActive: config.isActive,
      },
    })
  } catch (err) {
    console.error('FoneLove config PUT error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
