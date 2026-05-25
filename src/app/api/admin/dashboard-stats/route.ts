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

    // Vue d'ensemble data
    const activeUsers = await prisma.user.count({ where: { isActive: true } })
    
    // Demandes aujourd'hui
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const todayRequests = await prisma.numberRequest.count({
      where: { createdAt: { gte: startOfDay } }
    })

    const totalRequests = await prisma.numberRequest.count()
    const acceptedRequests = await prisma.numberRequest.count({ where: { status: 'accepted' } })
    const acceptanceRate = totalRequests > 0 ? Math.round((acceptedRequests / totalRequests) * 100) : 0

    // Premium Revenue (using recent active premium features or payment orders)
    // Actually we can sum payment orders with success status
    const successfulPayments = await prisma.paymentOrder.aggregate({
      _sum: { amountXAF: true },
      where: { status: 'success' }
    })
    const premiumRevenueXAF = successfulPayments._sum.amountXAF || 0
    const premiumRevenueEUR = premiumRevenueXAF / 655.957

    // Connexions ce mois
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const monthlyConnections = await prisma.connection.count({
      where: { createdAt: { gte: startOfMonth } }
    })

    // Inscriptions sur 30 jours
    const chartData: any[] = []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Doing a raw grouping could be complex, let's fetch past 30 days data and group in JS (or with a Prisma raw query if preferred, but JS grouping is fine for small scale)
    const last30DaysUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    })
    
    const last30DaysMessages = await prisma.message.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    })

    const last30DaysReqs = await prisma.numberRequest.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    })

    const last30DaysConns = await prisma.connection.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    })

    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateString = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      
      const inscriptions = last30DaysUsers.filter(u => new Date(u.createdAt).getDate() === d.getDate() && new Date(u.createdAt).getMonth() === d.getMonth()).length
      const messages = last30DaysMessages.filter(m => new Date(m.createdAt).getDate() === d.getDate() && new Date(m.createdAt).getMonth() === d.getMonth()).length
      const demandes = last30DaysReqs.filter(r => new Date(r.createdAt).getDate() === d.getDate() && new Date(r.createdAt).getMonth() === d.getMonth()).length
      const connexions = last30DaysConns.filter(c => new Date(c.createdAt).getDate() === d.getDate() && new Date(c.createdAt).getMonth() === d.getMonth()).length

      chartData.push({
        name: dateString,
        inscriptions,
        messages,
        demandes,
        connexions
      })
    }

    return NextResponse.json({
      activeUsers,
      todayRequests,
      acceptanceRate,
      premiumRevenue: premiumRevenueEUR, // or XAF if you prefer
      monthlyConnections,
      chartData
    })
  } catch (error) {
    console.error('Admin dashboard stats GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
