/**
 * ConnectPhone — Push Notification Client Service
 * 
 * Manages push subscription lifecycle:
 * - Register with VAPID key
 * - Save subscription to Supabase
 * - Handle unsubscribe
 * - Send notifications via Edge Function
 * 
 * Aligned with actual notification_preferences schema
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

// Push notification types
export type NotificationType = 'info' | 'marketing' | 'alert' | 'match' | 'message' | 'request' | 'connection' | 'streak' | 'challenge' | 'promo' | 'boost' | 'credit' | 'moment' | 'system'

export interface PushNotificationPayload {
  title: string
  body: string
  image?: string
  icon?: string
  url?: string
  tag?: string
  type?: NotificationType
  actions?: Array<{ action: string; title: string; icon?: string }>
}

export interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
}

export interface NotificationPreference {
  pushEnabled: boolean
  requestReceived: boolean
  requestAccepted: boolean
  requestDeclined: boolean
  messageReceived: boolean
  matchNotif: boolean
  connectionEstablished: boolean
  boostExpired: boolean
  creditUpdates: boolean
  streakMilestones: boolean
  challengeCompleted: boolean
  promoAvailable: boolean
  profileLiked: boolean
  profileVisited: boolean
  newMoment: boolean
  marketing: boolean
  systemNotif: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
  quietHoursTimezone: string | null
  digestEnabled: boolean
  digestFrequency: string | null
}

// Convert VAPID key to Uint8Array for the Push API
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Detect device type (matching DB constraint: web, android, ios, mobile, desktop, tablet, unknown)
function detectDeviceType(): 'web' | 'android' | 'ios' | 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  const ua = navigator.userAgent
  if (/android.*mobile/i.test(ua)) return 'android'
  if (/iphone|ipod/i.test(ua)) return 'ios'
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile/i.test(ua)) return 'mobile'
  return 'web'
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

/**
 * Request notification permission and subscribe to push
 */
export async function subscribeToPush(userId: string): Promise<{
  success: boolean
  subscription?: PushSubscriptionData
  error?: string
}> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications not supported' }
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, error: 'VAPID public key not configured' }
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { success: false, error: `Permission ${permission}` }
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready
    
    // Subscribe with VAPID key
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    // Extract subscription data
    const subData = subscription.toJSON()
    const pushData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      p256dh: subData.keys?.p256dh || '',
      auth: subData.keys?.auth || '',
    }

    if (!pushData.p256dh || !pushData.auth) {
      return { success: false, error: 'Invalid subscription keys' }
    }

    // Save to server via API route
    const res = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        endpoint: pushData.endpoint,
        p256dh: pushData.p256dh,
        auth: pushData.auth,
        userAgent: navigator.userAgent,
        deviceType: detectDeviceType(),
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { success: false, error: errData.error || 'Failed to save subscription' }
    }

    return { success: true, subscription: pushData }
  } catch (error) {
    console.error('Push subscription error:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      const endpoint = subscription.endpoint
      
      // Unsubscribe from push manager
      await subscription.unsubscribe()
      
      // Remove from server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, endpoint }),
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreference> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await supabase.rpc('get_notification_prefs', { p_user_id: userId })

  if (error || !data || data.length === 0) {
    return {
      pushEnabled: true,
      requestReceived: true,
      requestAccepted: true,
      requestDeclined: true,
      messageReceived: true,
      matchNotif: true,
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
      systemNotif: true,
      quietHoursEnabled: false,
      quietHoursStart: null,
      quietHoursEnd: null,
      quietHoursTimezone: null,
      digestEnabled: false,
      digestFrequency: null,
    }
  }

  const pref = data[0]
  return {
    pushEnabled: pref.push_enabled ?? true,
    requestReceived: pref.request_received ?? true,
    requestAccepted: pref.request_accepted ?? true,
    requestDeclined: pref.request_declined ?? true,
    messageReceived: pref.message_received ?? true,
    matchNotif: pref.match_notif ?? true,
    connectionEstablished: pref.connection_established ?? true,
    boostExpired: pref.boost_expired ?? true,
    creditUpdates: pref.credit_updates ?? true,
    streakMilestones: pref.streak_milestones ?? true,
    challengeCompleted: pref.challenge_completed ?? true,
    promoAvailable: pref.promo_available ?? true,
    profileLiked: pref.profile_liked ?? true,
    profileVisited: pref.profile_visited ?? true,
    newMoment: pref.new_moment ?? true,
    marketing: pref.marketing ?? false,
    systemNotif: pref.system_notif ?? true,
    quietHoursEnabled: pref.quiet_hours_enabled ?? false,
    quietHoursStart: pref.quiet_hours_start ?? null,
    quietHoursEnd: pref.quiet_hours_end ?? null,
    quietHoursTimezone: pref.quiet_hours_timezone ?? null,
    digestEnabled: pref.digest_enabled ?? false,
    digestFrequency: pref.digest_frequency ?? null,
  }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreference>
): Promise<boolean> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { error } = await supabase.rpc('update_notification_prefs', {
    p_user_id: userId,
    p_push_enabled: prefs.pushEnabled,
    p_request_received: prefs.requestReceived,
    p_request_accepted: prefs.requestAccepted,
    p_request_declined: prefs.requestDeclined,
    p_message_received: prefs.messageReceived,
    p_match: prefs.matchNotif,
    p_connection_established: prefs.connectionEstablished,
    p_boost_expired: prefs.boostExpired,
    p_credit_updates: prefs.creditUpdates,
    p_streak_milestones: prefs.streakMilestones,
    p_challenge_completed: prefs.challengeCompleted,
    p_promo_available: prefs.promoAvailable,
    p_profile_liked: prefs.profileLiked,
    p_profile_visited: prefs.profileVisited,
    p_new_moment: prefs.newMoment,
    p_marketing: prefs.marketing,
    p_system: prefs.systemNotif,
    p_quiet_hours_enabled: prefs.quietHoursEnabled,
    p_quiet_hours_start: prefs.quietHoursStart,
    p_quiet_hours_end: prefs.quietHoursEnd,
    p_quiet_hours_timezone: prefs.quietHoursTimezone,
    p_digest_enabled: prefs.digestEnabled,
    p_digest_frequency: prefs.digestFrequency,
  })

  return !error
}

/**
 * Send a push notification to a specific user (server-side only)
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload,
  campaignId?: string
): Promise<{ success: boolean; sent?: number; error?: string }> {
  const res = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, payload, campaignId }),
  })

  return res.json()
}

/**
 * Send a push notification campaign (admin only, server-side)
 */
export async function sendCampaign(
  campaignId: string
): Promise<{ success: boolean; sent?: number; total?: number; error?: string }> {
  const res = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send_campaign', campaignId }),
  })

  return res.json()
}

/**
 * Check if user is currently subscribed to push
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false
  
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}
