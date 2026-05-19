import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET /api/notifications/campaigns - List campaigns or count subs
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status')
    const countType = req.nextUrl.searchParams.get('count')
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Special endpoint: count active push subscriptions
    if (countType === 'subs') {
      const { count, error } = await supabase
        .from('push_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ totalSubs: count || 0 })
    }

    let query = supabase
      .from('notification_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map to a consistent format
    const campaigns = (data || []).map((c: any) => ({
      id: c.id,
      title: c.name || c.title_fr || '',
      body: c.body_fr || '',
      imageUrl: c.image_url,
      type: c.category || 'info',
      targetAudience: typeof c.target_audience === 'string' ? c.target_audience : (typeof c.target_audience === 'object' ? JSON.stringify(c.target_audience) : 'all'),
      status: c.status || 'draft',
      totalSent: c.total_sent || 0,
      totalDelivered: c.total_delivered || 0,
      totalClicked: c.total_clicked || 0,
      totalTargets: c.total_targets || 0,
      url: c.action_url || '/',
      scheduledAt: c.scheduled_at,
      sentAt: c.sent_at,
      createdAt: c.created_at,
    }))

    return NextResponse.json({ campaigns })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/notifications/campaigns - Create campaign
export async function POST(req: NextRequest) {
  try {
    const campaign = await req.json()

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Map to existing table structure
    const insertData: Record<string, unknown> = {
      name: campaign.title || campaign.name,
      title_fr: campaign.title || campaign.title_fr,
      title_en: campaign.title_en || campaign.title || campaign.title_fr,
      body_fr: campaign.body || campaign.body_fr,
      body_en: campaign.body_en || campaign.body || campaign.body_fr,
      image_url: campaign.imageUrl || null,
      action_url: campaign.url || '/',
      action_text_fr: campaign.actionText || 'Ouvrir',
      action_text_en: campaign.actionTextEn || 'Open',
      category: campaign.type || 'info',
      target_audience: campaign.targetAudience || 'all',
      status: campaign.sendNow ? 'sending' : 'draft',
      scheduled_at: campaign.scheduledAt || null,
      created_by: campaign.createdBy || null,
    }

    const { data, error } = await supabase
      .from('notification_campaigns')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const campaignId = data?.id

    // If send now, trigger the Edge Function
    if (campaign.sendNow && campaignId) {
      try {
        await supabase.functions.invoke('push-notification', {
          method: 'POST',
          body: {
            action: 'send_campaign',
            campaignId,
          },
        })
      } catch (sendErr) {
        console.error('Failed to send campaign:', sendErr)
      }
    }

    return NextResponse.json({ campaignId, sent: !!campaign.sendNow })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// PUT /api/notifications/campaigns - Update campaign
export async function PUT(req: NextRequest) {
  try {
    const { campaignId, ...updates } = await req.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (updates.title) { updateData.name = updates.title; updateData.title_fr = updates.title; updateData.title_en = updates.title }
    if (updates.body) { updateData.body_fr = updates.body; updateData.body_en = updates.body }
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.url) updateData.action_url = updates.url
    if (updates.type) updateData.category = updates.type
    if (updates.targetAudience) updateData.target_audience = updates.targetAudience
    if (updates.status) updateData.status = updates.status

    const { error } = await supabase
      .from('notification_campaigns')
      .update(updateData)
      .eq('id', campaignId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/notifications/campaigns - Delete campaign
export async function DELETE(req: NextRequest) {
  try {
    const campaignId = req.nextUrl.searchParams.get('id')

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabase
      .from('notification_campaigns')
      .delete()
      .eq('id', campaignId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
