import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendPushToUser, PushNotificationPayload } from '../src/lib/push-service'
import webpush from 'web-push'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-role-key'
process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test-vapid-public'
process.env.VAPID_PRIVATE_KEY = 'test-vapid-private'

// Mock Supabase client
const mockMaybeSingle = vi.fn()
const mockUpdateEq = vi.fn()
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))
const mockSelectEq2 = vi.fn()
const mockSelectEq1 = vi.fn(() => ({ eq: mockSelectEq2 }))
const mockSelect = vi.fn(() => ({ eq: mockSelectEq1 }))
const mockFrom = vi.fn((table: string) => {
  if (table === 'notification_preferences') {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mockMaybeSingle
        }))
      }))
    }
  } else if (table === 'push_subscriptions') {
    return {
      select: mockSelect,
      update: mockUpdate
    }
  }
  return {}
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom
  })
}))

vi.mock('web-push', () => {
  return {
    default: {
      setVapidDetails: vi.fn(),
      sendNotification: vi.fn(),
    }
  }
})

describe('Push Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const payload: PushNotificationPayload = {
    title: 'Test',
    body: 'Test body',
    type: 'message'
  }

  it('ne doit pas envoyer de push si push_enabled est false', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { push_enabled: false },
      error: null
    })

    const result = await sendPushToUser('user123', payload)
    
    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(0)
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('ne doit pas envoyer si le type de notification spécifique est désactivé', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { push_enabled: true, message_received: false },
      error: null
    })

    const result = await sendPushToUser('user123', payload)
    
    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(0)
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('doit respecter les heures silencieuses (Quiet Hours) pendant la période silencieuse', async () => {
    vi.useFakeTimers()
    // Supposons qu'il est 14:00 UTC
    vi.setSystemTime(new Date('2024-01-01T14:00:00Z'))
    
    mockMaybeSingle.mockResolvedValueOnce({
      data: { 
        push_enabled: true, 
        message_received: true,
        quiet_hours_enabled: true,
        quiet_hours_start: '13:00',
        quiet_hours_end: '15:00',
        quiet_hours_timezone: 'UTC'
      },
      error: null
    })

    const result = await sendPushToUser('user123', payload)
    
    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(0)
    expect(webpush.sendNotification).not.toHaveBeenCalled()
  })

  it('doit envoyer la notification si nous sommes en dehors des heures silencieuses', async () => {
    vi.useFakeTimers()
    // Supposons qu'il est 16:00 UTC (en dehors de 13:00-15:00)
    vi.setSystemTime(new Date('2024-01-01T16:00:00Z'))
    
    mockMaybeSingle.mockResolvedValueOnce({
      data: { 
        push_enabled: true, 
        message_received: true,
        quiet_hours_enabled: true,
        quiet_hours_start: '13:00',
        quiet_hours_end: '15:00',
        quiet_hours_timezone: 'UTC'
      },
      error: null
    })

    mockSelectEq2.mockResolvedValueOnce({
      data: [
        { id: 'sub1', endpoint: 'https://push.com/1', p256dh_key: 'p1', auth_key: 'a1', is_active: true }
      ],
      error: null
    })

    ;(webpush.sendNotification as any).mockResolvedValueOnce({})

    const result = await sendPushToUser('user123', payload)
    
    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(1)
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1)
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'https://push.com/1' }),
      JSON.stringify(payload)
    )
  })

  it('doit désactiver l\'abonnement (is_active: false) si webpush renvoie une erreur 410 ou 404', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { push_enabled: true, message_received: true },
      error: null
    })

    mockSelectEq2.mockResolvedValueOnce({
      data: [
        { id: 'sub1', endpoint: 'https://push.com/1', p256dh_key: 'p1', auth_key: 'a1', is_active: true }
      ],
      error: null
    })

    ;(webpush.sendNotification as any).mockRejectedValueOnce({ statusCode: 410, message: 'Gone' })
    mockUpdateEq.mockResolvedValueOnce({})

    const result = await sendPushToUser('user123', payload)
    
    expect(result.success).toBe(true)
    expect(result.sentCount).toBe(0)
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }))
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'sub1')
  })
})
