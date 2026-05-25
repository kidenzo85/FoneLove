import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')

    if (!requesterId) {
      return NextResponse.json({ error: 'ID du demandeur requis' }, { status: 400 })
    }

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true, email: true },
    })

    if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Accès interdit. Réservé aux administrateurs.' }, { status: 403 })
    }

    const startStr = searchParams.get('startDate')
    const endStr = searchParams.get('endDate')

    let startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Par défaut : 30 derniers jours
    startDate.setHours(0, 0, 0, 0)
    
    let endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    if (startStr && startStr !== 'undefined' && startStr !== 'null') {
      startDate = new Date(startStr)
      startDate.setHours(0, 0, 0, 0)
    }
    if (endStr && endStr !== 'undefined' && endStr !== 'null') {
      endDate = new Date(endStr)
      endDate.setHours(23, 59, 59, 999)
    }

    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // 1. Total events
    const totalEvents = await prisma.analyticsEvent.count({ where: whereClause })

    // 2. Active users (optimized with raw SQL)
    const activeUsersResult = await prisma.$queryRaw`
      SELECT CAST(COUNT(DISTINCT "userId") AS INTEGER) as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
        AND "userId" IS NOT NULL
    ` as [{ count: number }]
    const activeUsers = activeUsersResult[0]?.count || 0

    // 3. Top Events
    const eventsGrouped = await prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      _count: { eventName: true },
      where: whereClause,
      orderBy: { _count: { eventName: 'desc' } },
      take: 10
    })
    
    const topEvents = eventsGrouped.map(e => ({
      name: e.eventName,
      value: e._count.eventName
    }))

    // 4. Recent events
    const recentEvents = await prisma.analyticsEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true, 
            photos: { where: { isPrimary: true }, take: 1, select: { url: true } }
          } 
        }
      }
    })

    // 5. Daily Chart Data (optimized with raw SQL)
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        "eventName",
        CAST(COUNT(*) AS INTEGER) as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE_TRUNC('day', "createdAt"), "eventName"
    ` as { date: Date, eventName: string, count: number }[]

    const dailyDataMap = new Map<string, Record<string, number>>()
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateString = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      dailyDataMap.set(dateString, { total: 0 })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    dailyStats.forEach(stat => {
      const d = new Date(stat.date)
      const dateString = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      if (dailyDataMap.has(dateString)) {
        const dayStats = dailyDataMap.get(dateString)!
        dayStats.total += stat.count
        dayStats[stat.eventName] = (dayStats[stat.eventName] || 0) + stat.count
      }
    })

    const chartData = Array.from(dailyDataMap.entries()).map(([date, stats]) => {
      return {
        date,
        ...stats
      }
    })

    return NextResponse.json({
      totalEvents,
      activeUsers,
      topEvents,
      recentEvents,
      chartData
    })
  } catch (error) {
    console.error('Admin analytics GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
