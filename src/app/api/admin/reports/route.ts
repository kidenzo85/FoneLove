import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')

    if (!requesterId) return NextResponse.json({ error: 'ID du demandeur requis' }, { status: 400 })

    const requester = await prisma.user.findUnique({ where: { id: requesterId }, select: { role: true, email: true } })
    if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin' && requester.email !== 'fabricewilliam73@gmail.com')) {
      return NextResponse.json({ error: 'Accès interdit. Réservé aux administrateurs.' }, { status: 403 })
    }

    const reports = await prisma.report.findMany({
      include: {
        reporter: { include: { photos: { where: { position: 0 } } } },
        reported: { include: { photos: { where: { position: 0 } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedReports = reports.map(r => {
      // In this app, status might not be on the Report model yet (it has no status field in schema.prisma)
      // So we just default to "En cours"
      return {
        id: r.id,
        reporter: `${r.reporter.firstName} ${r.reporter.lastName || ''}`.trim(),
        reporterAvatar: r.reporter.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${r.reporter.gender === 'F' ? '5' : '8'}`,
        reported: `${r.reported.firstName} ${r.reported.lastName || ''}`.trim(),
        reportedAvatar: r.reported.photos?.[0]?.url || `https://i.pravatar.cc/100?img=${r.reported.gender === 'F' ? '5' : '8'}`,
        reason: r.reason || r.description || 'Comportement inapproprié',
        date: r.createdAt.toLocaleDateString('fr-FR'),
        status: 'En cours' // Can be updated if we add a status field
      }
    })

    return NextResponse.json({ reports: formattedReports })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', details: (error as Error).message }, { status: 500 })
  }
}
