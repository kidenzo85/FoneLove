import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser, sendPushToAll } from '@/lib/push-service'

const CRON_SECRET = process.env.CRON_SECRET || 'connectphone-daily-reset-2026'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Cron trigger
    const urlSecret = req.nextUrl.searchParams.get('secret')
    const authHeader = req.headers.get('authorization')
    const bearerToken = authHeader?.replace('Bearer ', '')

    if (urlSecret !== CRON_SECRET && bearerToken !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Non autorisé. Fournissez ?secret=CRON_SECRET ou Authorization: Bearer CRON_SECRET' },
        { status: 401 }
      )
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const results: Record<string, any> = {}

    // ==========================================
    // A. TRIGGER SCHEDULED CAMPAIGNS
    // ==========================================
    const nowStr = new Date().toISOString()
    const { data: scheduledCampaigns, error: campaignErr } = await supabase
      .from('notification_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowStr)

    if (campaignErr) {
      console.error('[Cron Notifications] Fetch campaigns error:', campaignErr)
      results.campaigns = { error: campaignErr.message }
    } else if (scheduledCampaigns && scheduledCampaigns.length > 0) {
      const campaignResults: any[] = []
      
      for (const campaign of scheduledCampaigns) {
        // Mark campaign as sending
        await supabase
          .from('notification_campaigns')
          .update({ status: 'sending', updated_at: nowStr })
          .eq('id', campaign.id)

        // Perform broadcast push
        const broadcastRes = await sendPushToAll({
          title: campaign.title,
          body: campaign.body,
          type: 'marketing',
          url: campaign.target_url || '/',
          campaignId: campaign.id,
        })

        // Update campaign as completed
        await supabase
          .from('notification_campaigns')
          .update({
            status: 'sent',
            sent_at: nowStr,
            sent_count: broadcastRes.sentCount,
            updated_at: nowStr,
          })
          .eq('id', campaign.id)

        campaignResults.push({
          id: campaign.id,
          sentCount: broadcastRes.sentCount,
        })
      }
      results.campaigns = { processed: campaignResults }
    } else {
      results.campaigns = { note: 'No scheduled campaigns due' }
    }

    // ==========================================
    // B. INACTIVITY 24H RE-ENGAGEMENT
    // ==========================================
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    // Find users active between 24 and 48 hours ago
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastActiveAt: {
          lte: oneDayAgo,
          gte: twoDaysAgo,
        },
      },
      select: { id: true, firstName: true },
    })

    if (inactiveUsers.length > 0) {
      let sentCount = 0
      for (const user of inactiveUsers) {
        const pushRes = await sendPushToUser(user.id, {
          title: 'Tu nous manques ! 💕',
          body: `Salut ${user.firstName}, viens voir qui t'a envoyé un J'aime aujourd'hui !`,
          type: 'marketing',
          url: '/',
        })
        if (pushRes.sentCount > 0) sentCount++
      }
      results.inactivityAlerts = { checked: inactiveUsers.length, sent: sentCount }
    } else {
      results.inactivityAlerts = { note: 'No inactive users met criteria' }
    }

    // ==========================================
    // C. STREAK EXPIRY ALERTS (18H-24H)
    // ==========================================
    const eighteenHoursAgo = new Date(Date.now() - 18 * 60 * 60 * 1000)

    // Find users with active streaks whose last check in was between 18h and 24h ago
    const streakUsers = await prisma.dailyStreak.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastCheckIn: {
          lte: eighteenHoursAgo,
          gte: oneDayAgo, // claimed between 18 and 24 hours ago
        },
        todayBonusClaimed: true, // claimed yesterday but not today yet
      },
      include: {
        user: { select: { firstName: true } },
      },
    })

    if (streakUsers.length > 0) {
      let sentCount = 0
      for (const streak of streakUsers) {
        const pushRes = await sendPushToUser(streak.userId, {
          title: '🔥 Sauve ta série !',
          body: `Vite ${streak.user.firstName} ! Ta série de ${streak.currentStreak} jours expire bientôt. Viens réclamer tes pièces !`,
          type: 'streak',
          url: '/',
        })
        if (pushRes.sentCount > 0) sentCount++
      }
      results.streakReminders = { checked: streakUsers.length, sent: sentCount }
    } else {
      results.streakReminders = { note: 'No streak warnings due' }
    }

    return NextResponse.json({
      success: true,
      timestamp: nowStr,
      results,
    })
  } catch (error) {
    console.error('[Cron Notifications] Error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: String(error) },
      { status: 500 }
    )
  }
}
