import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser, sendPushToAll } from '@/lib/push-service'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, payload, campaignId, action } = body

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 1. Send campaign to all active subscribers
    if (action === 'send_campaign' && campaignId) {
      // Fetch the campaign details from the database
      const { data: campaign, error: campaignErr } = await supabase
        .from('notification_campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle()

      if (campaignErr || !campaign) {
        return NextResponse.json({ error: campaignErr?.message || 'Campaign not found' }, { status: 404 })
      }

      // Mark campaign as sending
      await supabase
        .from('notification_campaigns')
        .update({ status: 'sending', updated_at: new Date().toISOString() })
        .eq('id', campaignId)

      // Perform broadcast push
      const result = await sendPushToAll({
        title: campaign.title,
        body: campaign.body,
        type: 'marketing',
        url: campaign.target_url || '/',
        campaignId,
      })

      // Update campaign as completed
      await supabase
        .from('notification_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: result.sentCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)

      return NextResponse.json({
        success: true,
        sentCount: result.sentCount,
        errors: result.errors,
      })
    }

    // 2. Send to a specific user
    if (!userId || !payload) {
      return NextResponse.json({ error: 'Missing userId or payload' }, { status: 400 })
    }

    const result = await sendPushToUser(userId, {
      title: payload.title,
      body: payload.body,
      type: payload.type || 'info',
      url: payload.url || '/',
      campaignId,
    })

    return NextResponse.json({
      success: true,
      sentCount: result.sentCount,
      errors: result.errors,
    })
  } catch (error) {
    console.error('[Send API] Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
