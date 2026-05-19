import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, payload, campaignId, action } = body

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Send campaign to all subscribers
    if (action === 'send_campaign' && campaignId) {
      const { data, error } = await supabase.functions.invoke('push-notification', {
        method: 'POST',
        body: {
          action: 'send_campaign',
          campaignId,
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Send to specific user
    if (!userId || !payload) {
      return NextResponse.json({ error: 'Missing userId or payload' }, { status: 400 })
    }

    const { data, error } = await supabase.functions.invoke('push-notification', {
      method: 'POST',
      body: {
        action: 'send_to_user',
        userId,
        payload,
        campaignId,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
