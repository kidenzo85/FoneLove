// ============================================================
// ConnectPhone — Edge Function: push-notification
// Sends web push notifications using VAPID keys
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// VAPID configuration
const VAPID_SUBJECT = 'mailto:contact@connectphone.fr'
const VAPID_PUBLIC_KEY = 'BLyIMGDi37xwcCSngoU8SdEE2GdbBbN4dNh9IYbl6wbXtGaoJ5mJVwsVKBLUWO8E20uVmHs5KI6_fw9-2c8dE-c'
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!

// Base64URL encode/decode helpers
function base64UrlEncode(data: Uint8Array): string {
  let binary = ''
  for (const byte of data) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function strToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// Create VAPID JWT - aud must match the push service origin
async function createVapidJwt(pushEndpoint: string): Promise<string> {
  const crypto = globalThis.crypto
  const header = { typ: 'JWT', alg: 'ES256' }
  const headerB64 = base64UrlEncode(strToUint8Array(JSON.stringify(header)))
  const now = Math.floor(Date.now() / 1000)
  // aud MUST be the origin of the push resource URL (RFC 8292)
  const pushOrigin = new URL(pushEndpoint).origin
  const payload = {
    aud: pushOrigin,
    exp: now + 12 * 3600,
    sub: VAPID_SUBJECT,
  }
  const payloadB64 = base64UrlEncode(strToUint8Array(JSON.stringify(payload)))
  const signInput = `${headerB64}.${payloadB64}`
  const signData = strToUint8Array(signInput)

  if (!VAPID_PRIVATE_KEY) throw new Error('VAPID_PRIVATE_KEY is not set')
  const privateKeyRaw = base64UrlDecode(VAPID_PRIVATE_KEY)
  if (privateKeyRaw.length < 100) throw new Error(`VAPID_PRIVATE_KEY too short: ${privateKeyRaw.length} bytes (expected PKCS8 DER ~138 bytes)`)

  const privateKey = await crypto.subtle.importKey('pkcs8', privateKeyRaw, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, signData)
  const derSig = new Uint8Array(signature)
  const rawSig = derToRaw(derSig)
  const signatureB64 = base64UrlEncode(rawSig)
  return `${signInput}.${signatureB64}`
}

function derToRaw(der: Uint8Array): Uint8Array {
  // If already raw (64 bytes for P-256), return as-is
  if (der.length === 64) return der
  // If raw with leading zeros (65 bytes starting with 0x00), strip it
  if (der.length === 65 && der[0] === 0x00) return der.slice(1)
  // Parse DER format
  if (der[0] !== 0x30) {
    throw new Error(`Invalid DER signature: expected 0x30, got 0x${der[0]?.toString(16)} (length=${der.length})`)
  }
  const rLen = der[3]
  const r = der.slice(4, 4 + rLen)
  const sLen = der[4 + rLen + 1]
  const s = der.slice(4 + rLen + 2, 4 + rLen + 2 + sLen)
  const rRaw = padTo32(removeLeadingZero(r))
  const sRaw = padTo32(removeLeadingZero(s))
  const raw = new Uint8Array(64)
  raw.set(rRaw, 0)
  raw.set(sRaw, 32)
  return raw
}

function removeLeadingZero(arr: Uint8Array): Uint8Array {
  let start = 0
  while (start < arr.length - 1 && arr[start] === 0) start++
  if (arr[start] >= 0x80 && start > 0) start--
  return arr.slice(start)
}

function padTo32(arr: Uint8Array): Uint8Array {
  const padded = new Uint8Array(32)
  if (arr.length >= 32) padded.set(arr.slice(arr.length - 32), 0)
  else padded.set(arr, 32 - arr.length)
  return padded
}

// Encrypt payload for Web Push (aes128gcm)
async function encryptPayload(payload: string, p256dhKey: string, authKey: string) {
  const crypto = globalThis.crypto
  const clientPublicKeyRaw = base64UrlDecode(p256dhKey)
  const clientPublicKey = await crypto.subtle.importKey('raw', clientPublicKeyRaw, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const authKeyRaw = base64UrlDecode(authKey)
  const ephemeralKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const sharedSecret = await crypto.subtle.deriveBits({ name: 'ECDH', public: clientPublicKey }, ephemeralKeyPair.privateKey, 256)
  const ephemeralPublicKey = new Uint8Array(await crypto.subtle.exportKey('raw', ephemeralKeyPair.publicKey))
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  const ikm = new Uint8Array(sharedSecret)
  const keyInfo = concatUint8Arrays(strToUint8Array('Content-Encoding: aes128gcm\0'), ephemeralPublicKey, clientPublicKeyRaw)
  const prk = await hkdfExtract(authKeyRaw, ikm)
  const encryptionKey = await hkdfExpand(prk, keyInfo, 16)
  const nonceInfo = strToUint8Array('Content-Encoding: nonce\0')
  const nonce = await hkdfExpand(prk, nonceInfo, 12)
  const paddedPayload = concatUint8Arrays(strToUint8Array(payload), new Uint8Array([0x02]))
  const aesKey = await crypto.subtle.importKey('raw', encryptionKey, { name: 'AES-GCM' }, false, ['encrypt'])
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, paddedPayload))
  return { encrypted, salt, serverPublicKey: ephemeralPublicKey }
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, ikm))
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const n = Math.ceil(length / 32)
  const okm = new Uint8Array(n * 32)
  let t = new Uint8Array(0)
  for (let i = 1; i <= n; i++) {
    const data = concatUint8Arrays(t, info, new Uint8Array([i]))
    t = new Uint8Array(await crypto.subtle.sign('HMAC', key, data))
    okm.set(t, (i - 1) * 32)
  }
  return okm.slice(0, length)
}

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) { result.set(arr, offset); offset += arr.length }
  return result
}

// Send a single push notification
async function sendPushNotification(
  subscription: { endpoint: string; p256dh_key: string; auth_key: string },
  payload: Record<string, unknown>
): Promise<{ success: boolean; statusCode: number; error?: string }> {
  try {
    const jwt = await createVapidJwt(subscription.endpoint)
    const payloadStr = JSON.stringify(payload)
    const { encrypted, salt, serverPublicKey } = await encryptPayload(payloadStr, subscription.p256dh_key, subscription.auth_key)

    const body = new Uint8Array(salt.length + 4 + 1 + serverPublicKey.length + encrypted.length)
    let offset = 0
    body.set(salt, offset); offset += salt.length
    const rs = encrypted.length + 16 + 1
    body[offset++] = (rs >> 24) & 0xff
    body[offset++] = (rs >> 16) & 0xff
    body[offset++] = (rs >> 8) & 0xff
    body[offset++] = rs & 0xff
    body[offset++] = serverPublicKey.length
    body.set(serverPublicKey, offset); offset += serverPublicKey.length
    body.set(encrypted, offset)

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: body.buffer as ArrayBuffer,
    })

    if (response.status >= 200 && response.status < 300) {
      return { success: true, statusCode: response.status }
    }
    const errorText = await response.text()
    if (response.status === 410 || response.status === 404) {
      return { success: false, statusCode: response.status, error: 'subscription_expired' }
    }
    return { success: false, statusCode: response.status, error: errorText }
  } catch (error) {
    return { success: false, statusCode: 0, error: (error as Error).message }
  }
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey' },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const body = await req.json()
    const { action, userId, campaignId, subscription, payload, targetAudience } = body

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // === Send to single user ===
    if (action === 'send_to_user' && userId && payload) {
      const { data: prefs } = await supabase.rpc('get_notification_prefs', { p_user_id: userId })
      if (prefs && prefs.length > 0) {
        const pref = prefs[0]
        // Check if push is globally enabled
        if (pref.push_enabled === false) {
          return new Response(JSON.stringify({ success: false, reason: 'push_disabled' }), { headers: { 'Content-Type': 'application/json' } })
        }
        const notifType = payload.type || 'info'
        // Check quiet hours
        if (pref.quiet_hours_enabled && pref.quiet_hours_start && pref.quiet_hours_end) {
          const now = new Date()
          const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
          const [startH, startM] = String(pref.quiet_hours_start).split(':').map(Number)
          const [endH, endM] = String(pref.quiet_hours_end).split(':').map(Number)
          const startMinutes = startH * 60 + startM
          const endMinutes = endH * 60 + endM
          const inQuietHours = startMinutes <= endMinutes
            ? (currentMinutes >= startMinutes && currentMinutes < endMinutes)
            : (currentMinutes >= startMinutes || currentMinutes < endMinutes)
          if (inQuietHours) {
            return new Response(JSON.stringify({ success: false, reason: 'quiet_hours' }), { headers: { 'Content-Type': 'application/json' } })
          }
        }
        // Check per-type preferences (using actual column names)
        if (notifType === 'match' && !pref.match_notif) return new Response(JSON.stringify({ success: false, reason: 'disabled_match' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'message' && !pref.message_received) return new Response(JSON.stringify({ success: false, reason: 'disabled_message' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'request' && !pref.request_received) return new Response(JSON.stringify({ success: false, reason: 'disabled_request' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'marketing' && !pref.marketing) return new Response(JSON.stringify({ success: false, reason: 'disabled_marketing' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'connection' && !pref.connection_established) return new Response(JSON.stringify({ success: false, reason: 'disabled_connection' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'streak' && !pref.streak_milestones) return new Response(JSON.stringify({ success: false, reason: 'disabled_streak' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'challenge' && !pref.challenge_completed) return new Response(JSON.stringify({ success: false, reason: 'disabled_challenge' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'promo' && !pref.promo_available) return new Response(JSON.stringify({ success: false, reason: 'disabled_promo' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'boost' && !pref.boost_expired) return new Response(JSON.stringify({ success: false, reason: 'disabled_boost' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'credit' && !pref.credit_updates) return new Response(JSON.stringify({ success: false, reason: 'disabled_credit' }), { headers: { 'Content-Type': 'application/json' } })
        if (notifType === 'moment' && !pref.new_moment) return new Response(JSON.stringify({ success: false, reason: 'disabled_moment' }), { headers: { 'Content-Type': 'application/json' } })
      }

      const { data: subscriptions } = await supabase.rpc('get_push_subscriptions', { p_user_id: userId })
      if (!subscriptions || subscriptions.length === 0) {
        return new Response(JSON.stringify({ success: false, reason: 'no_subscriptions' }), { headers: { 'Content-Type': 'application/json' } })
      }

      const results = []
      const expiredSubs = []
      for (const sub of subscriptions) {
        const result = await sendPushNotification({ endpoint: sub.endpoint, p256dh_key: sub.p256dh_key, auth_key: sub.auth_key }, payload)
        await supabase.rpc('log_notification', {
          p_user_id: userId, p_title: payload.title || 'ConnectPhone', p_body: payload.body || '',
          p_campaign_id: campaignId || null, p_subscription_id: sub.id,
          p_image_url: payload.image || null, p_type: payload.type || 'info',
          p_status: result.success ? 'sent' : 'failed',
        })
        if (result.error === 'subscription_expired') expiredSubs.push(sub.id)
        results.push(result)
      }

      for (const subId of expiredSubs) {
        await supabase.from('push_subscriptions').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', subId)
      }

      const successCount = results.filter(r => r.success).length
      return new Response(JSON.stringify({ success: successCount > 0, sent: successCount, total: results.length, expired: expiredSubs.length }), { headers: { 'Content-Type': 'application/json' } })
    }

    // === Send campaign ===
    if (action === 'send_campaign' && campaignId) {
      const { data: campaign } = await supabase.from('notification_campaigns').select('*').eq('id', campaignId).single()
      if (!campaign) return new Response(JSON.stringify({ error: 'Campaign not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

      const { data: subscriptions } = await supabase.rpc('get_push_subscriptions', { p_target_audience: campaign.target_audience || 'all' })
      if (!subscriptions || subscriptions.length === 0) {
        return new Response(JSON.stringify({ success: false, reason: 'no_subscriptions' }), { headers: { 'Content-Type': 'application/json' } })
      }

      const pushPayload = {
        title: campaign.title, body: campaign.body, image: campaign.image_url,
        icon: campaign.icon_url || '/icons/icon-192x192.png', url: campaign.url || '/',
        tag: campaign.tag || `campaign-${campaign.id}`, type: campaign.type || 'info',
        actions: campaign.actions,
      }

      let sentCount = 0, failedCount = 0
      const expiredSubs = []
      const batchSize = 50

      for (let i = 0; i < subscriptions.length; i += batchSize) {
        const batch = subscriptions.slice(i, i + batchSize)
        const batchResults = await Promise.allSettled(batch.map(async (sub: any) => {
          if (campaign.type === 'marketing') {
            const { data: userPrefs } = await supabase.rpc('get_notification_prefs', { p_user_id: sub.user_id })
            if (userPrefs && userPrefs.length > 0 && !userPrefs[0].marketing) return { success: false, reason: 'opted_out' }
          }
          const result = await sendPushNotification({ endpoint: sub.endpoint, p256dh_key: sub.p256dh_key, auth_key: sub.auth_key }, pushPayload)
          await supabase.rpc('log_notification', {
            p_user_id: sub.user_id, p_title: campaign.title, p_body: campaign.body,
            p_campaign_id: campaign.id, p_subscription_id: sub.id,
            p_image_url: campaign.image_url, p_type: campaign.type || 'info',
            p_status: result.success ? 'sent' : 'failed',
          })
          if (result.error === 'subscription_expired') expiredSubs.push(sub.id)
          return result
        }))
        for (const r of batchResults) {
          if (r.status === 'fulfilled' && r.value.success) sentCount++
          else failedCount++
        }
      }

      for (const subId of expiredSubs) {
        await supabase.from('push_subscriptions').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', subId)
      }

      await supabase.rpc('mark_campaign_sent', { p_campaign_id: campaign.id, p_total_sent: sentCount })
      return new Response(JSON.stringify({ success: true, sent: sentCount, failed: failedCount, expired: expiredSubs.length, total: subscriptions.length }), { headers: { 'Content-Type': 'application/json' } })
    }

    // === Test push ===
    if (action === 'test' && subscription && payload) {
      const result = await sendPushNotification(subscription, payload)
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Push notification error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
