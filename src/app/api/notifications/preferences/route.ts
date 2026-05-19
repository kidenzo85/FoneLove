import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Use the existing notification_preferences table with its actual columns
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      // Return defaults matching the existing table structure
      return NextResponse.json({
        pushEnabled: true,
        requestReceived: true,
        requestAccepted: true,
        requestDeclined: true,
        messageReceived: true,
        match: true,
        connectionEstablished: true,
        boostExpired: true,
        creditUpdates: true,
        streakMilestones: true,
        challengeCompleted: true,
        promoAvailable: true,
        profileLiked: true,
        profileVisited: true,
        newMoment: true,
        marketing: false,
        system: true,
        quietHoursEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
      })
    }

    return NextResponse.json({
      pushEnabled: data.push_enabled,
      requestReceived: data.request_received,
      requestAccepted: data.request_accepted,
      requestDeclined: data.request_declined,
      messageReceived: data.message_received,
      match: data.match,
      connectionEstablished: data.connection_established,
      boostExpired: data.boost_expired,
      creditUpdates: data.credit_updates,
      streakMilestones: data.streak_milestones,
      challengeCompleted: data.challenge_completed,
      promoAvailable: data.promo_available,
      profileLiked: data.profile_liked,
      profileVisited: data.profile_visited,
      newMoment: data.new_moment,
      marketing: data.marketing,
      system: data.system,
      quietHoursEnabled: data.quiet_hours_enabled,
      quietHoursStart: data.quiet_hours_start,
      quietHoursEnd: data.quiet_hours_end,
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, ...prefs } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Map to existing table columns
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (prefs.pushEnabled !== undefined) updateData.push_enabled = prefs.pushEnabled
    if (prefs.requestReceived !== undefined) updateData.request_received = prefs.requestReceived
    if (prefs.requestAccepted !== undefined) updateData.request_accepted = prefs.requestAccepted
    if (prefs.requestDeclined !== undefined) updateData.request_declined = prefs.requestDeclined
    if (prefs.messageReceived !== undefined) updateData.message_received = prefs.messageReceived
    if (prefs.match !== undefined) updateData.match = prefs.match
    if (prefs.connectionEstablished !== undefined) updateData.connection_established = prefs.connectionEstablished
    if (prefs.boostExpired !== undefined) updateData.boost_expired = prefs.boostExpired
    if (prefs.creditUpdates !== undefined) updateData.credit_updates = prefs.creditUpdates
    if (prefs.streakMilestones !== undefined) updateData.streak_milestones = prefs.streakMilestones
    if (prefs.challengeCompleted !== undefined) updateData.challenge_completed = prefs.challengeCompleted
    if (prefs.promoAvailable !== undefined) updateData.promo_available = prefs.promoAvailable
    if (prefs.profileLiked !== undefined) updateData.profile_liked = prefs.profileLiked
    if (prefs.profileVisited !== undefined) updateData.profile_visited = prefs.profileVisited
    if (prefs.newMoment !== undefined) updateData.new_moment = prefs.newMoment
    if (prefs.marketing !== undefined) updateData.marketing = prefs.marketing
    if (prefs.system !== undefined) updateData.system = prefs.system
    if (prefs.quietHoursEnabled !== undefined) updateData.quiet_hours_enabled = prefs.quietHoursEnabled
    if (prefs.quietHoursStart !== undefined) updateData.quiet_hours_start = prefs.quietHoursStart
    if (prefs.quietHoursEnd !== undefined) updateData.quiet_hours_end = prefs.quietHoursEnd

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
