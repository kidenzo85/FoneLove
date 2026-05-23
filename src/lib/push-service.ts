import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!

// Initialize web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:djomacapp@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export interface PushNotificationPayload {
  title: string
  body: string
  type: 'match' | 'message' | 'request' | 'marketing' | 'alert' | 'info' | 'connection' | 'streak' | 'challenge' | 'promo'
  url?: string
  image?: string
  campaignId?: string
}

/**
 * Sends a push notification to all active devices of a specific user.
 * Honors user notification preferences and handles quiet hours.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: boolean; sentCount: number; errors?: any[] }> {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('[PushService] VAPID keys not configured. Skipping push.')
      return { success: false, sentCount: 0 }
    }

    // 1. Fetch user's notification preferences
    const { data: prefs, error: prefsErr } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (prefsErr) {
      console.error('[PushService] Failed to fetch preferences:', prefsErr)
    }

    // Check general push setting
    if (prefs && prefs.push_enabled === false) {
      console.log(`[PushService] User ${userId} has push notifications disabled.`)
      return { success: true, sentCount: 0 }
    }

    // Check specific notification type preference
    if (prefs) {
      const typeMapping: Record<string, string> = {
        message: 'message_received',
        request: 'request_received',
        match: 'match',
        connection: 'connection_established',
        streak: 'streak_milestones',
        challenge: 'challenge_completed',
        promo: 'promo_available',
        marketing: 'marketing',
        alert: 'system',
      }

      const prefColumn = typeMapping[payload.type]
      if (prefColumn && prefs[prefColumn] === false) {
        console.log(`[PushService] User ${userId} has notification type ${payload.type} disabled.`)
        return { success: true, sentCount: 0 }
      }

      // Check quiet hours
      if (prefs.quiet_hours_enabled && prefs.quiet_hours_start && prefs.quiet_hours_end) {
        const now = new Date()
        const tz = prefs.quiet_hours_timezone || 'UTC'
        
        // Convert now to user's timezone if possible
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        
        const [userHour, userMinute] = formatter.format(now).split(':').map(Number)
        const userTimeInMinutes = userHour * 60 + userMinute

        const [startHour, startMin] = prefs.quiet_hours_start.split(':').map(Number)
        const startTimeInMinutes = startHour * 60 + startMin

        const [endHour, endMin] = prefs.quiet_hours_end.split(':').map(Number)
        const endTimeInMinutes = endHour * 60 + endMin

        let isQuietTime = false
        if (startTimeInMinutes < endTimeInMinutes) {
          isQuietTime = userTimeInMinutes >= startTimeInMinutes && userTimeInMinutes <= endTimeInMinutes
        } else {
          // Crosses midnight
          isQuietTime = userTimeInMinutes >= startTimeInMinutes || userTimeInMinutes <= endTimeInMinutes
        }

        if (isQuietTime) {
          console.log(`[PushService] Skipping push for user ${userId} due to Quiet Hours.`)
          return { success: true, sentCount: 0 }
        }
      }
    }

    // 2. Fetch all active subscriptions for the user
    const { data: subs, error: subsErr } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (subsErr || !subs || subs.length === 0) {
      return { success: true, sentCount: 0 }
    }

    // 3. Send notifications concurrently
    const notificationJson = JSON.stringify(payload)
    const promises = subs.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      }

      try {
        await webpush.sendNotification(subscription, notificationJson)
        return { success: true, endpoint: sub.endpoint }
      } catch (err: any) {
        console.error(`[PushService] Failed to send push to endpoint:`, err.statusCode, err.message)
        
        // Remove invalid/expired subscription (Status 410 Gone or 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`[PushService] Deactivating expired subscription for user ${userId}`)
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', sub.id)
        }
        return { success: false, endpoint: sub.endpoint, error: err }
      }
    })

    const results = await Promise.all(promises)
    const sentCount = results.filter((r) => r.success).length
    const errors = results.filter((r) => !r.success)

    return { success: true, sentCount, errors }
  } catch (error) {
    console.error('[PushService] Unexpected error sending push:', error)
    return { success: false, sentCount: 0, errors: [error] }
  }
}

/**
 * Sends a push notification to all active subscribers.
 * Great for broadcasts and marketing campaigns.
 */
export async function sendPushToAll(
  payload: PushNotificationPayload
): Promise<{ success: boolean; sentCount: number; errors?: any[] }> {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('[PushService] VAPID keys not configured. Skipping push.')
      return { success: false, sentCount: 0 }
    }

    const { data: subs, error: subsErr } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)

    if (subsErr || !subs || subs.length === 0) {
      return { success: true, sentCount: 0 }
    }

    const notificationJson = JSON.stringify(payload)
    const promises = subs.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      }

      try {
        await webpush.sendNotification(subscription, notificationJson)
        return { success: true, endpoint: sub.endpoint }
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', sub.id)
        }
        return { success: false, endpoint: sub.endpoint, error: err }
      }
    })

    const results = await Promise.all(promises)
    const sentCount = results.filter((r) => r.success).length
    const errors = results.filter((r) => !r.success)

    return { success: true, sentCount, errors }
  } catch (error) {
    console.error('[PushService] Unexpected error broadcasting push:', error)
    return { success: false, sentCount: 0, errors: [error] }
  }
}
