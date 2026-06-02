/**
 * In-memory token store for magic link authentication.
 * Stores magic link tokens and redeem codes with expiration.
 * In production, these should be stored in Redis or the database.
 */

interface MagicToken {
  email: string
  expiresAt: number
  used: boolean
}

interface RedeemToken {
  userId: string
  email: string
  expiresAt: number
  used: boolean
}

interface OtpEntry {
  otp: string
  expiresAt: number
  attempts: number
  lastRequestAt: number
}

const globalForTokens = globalThis as unknown as {
  magicTokens: Map<string, MagicToken>
  redeemTokens: Map<string, RedeemToken>
  otpStore: Map<string, OtpEntry>
}

// Magic link tokens: token → { email, expiresAt, used }
const magicTokens = globalForTokens.magicTokens ?? new Map<string, MagicToken>()

// Redeem codes: code → { userId, email, expiresAt, used }
const redeemTokens = globalForTokens.redeemTokens ?? new Map<string, RedeemToken>()

// OTP Codes: email -> OtpEntry
const otpStore = globalForTokens.otpStore ?? new Map<string, OtpEntry>()

if (process.env.NODE_ENV !== 'production') {
  globalForTokens.magicTokens = magicTokens
  globalForTokens.redeemTokens = redeemTokens
  globalForTokens.otpStore = otpStore
}

// Cleanup expired tokens every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of magicTokens) {
      if (val.expiresAt < now) magicTokens.delete(key)
    }
    for (const [key, val] of redeemTokens) {
      if (val.expiresAt < now) redeemTokens.delete(key)
    }
  }, 5 * 60 * 1000)
}

// === Magic Link Tokens ===

export function createMagicToken(token: string, email: string): void {
  magicTokens.set(token, {
    email,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    used: false,
  })
}

export function verifyMagicToken(token: string): { valid: boolean; email?: string } {
  const entry = magicTokens.get(token)
  if (!entry) return { valid: false }
  if (entry.used) return { valid: false }
  if (entry.expiresAt < Date.now()) {
    magicTokens.delete(token)
    return { valid: false }
  }

  // Mark as used
  entry.used = true
  return { valid: true, email: entry.email }
}

// === Redeem Tokens ===

export function createRedeemToken(code: string, userId: string, email: string): void {
  redeemTokens.set(code, {
    userId,
    email,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    used: false,
  })
}

export function verifyRedeemToken(code: string): { valid: boolean; userId?: string; email?: string } {
  const entry = redeemTokens.get(code)
  if (!entry) return { valid: false }
  if (entry.used) return { valid: false }
  if (entry.expiresAt < Date.now()) {
    redeemTokens.delete(code)
    return { valid: false }
  }

  // Mark as used (one-time)
  entry.used = true
  return { valid: true, userId: entry.userId, email: entry.email }
}

// === OTP Codes ===

// Note: OtpEntry interface and otpStore instantiation were moved to the top of the file to use globalThis.

export function storeOtp(email: string, otp: string): void {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    attempts: 0,
    lastRequestAt: Date.now(),
  })
}

export function verifyOtp(email: string, otp: string): { valid: boolean; reason?: string } {
  const entry = otpStore.get(email)
  if (!entry) return { valid: false, reason: 'no_code' }
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(email)
    return { valid: false, reason: 'expired' }
  }
  // Max 5 attempts
  entry.attempts++
  if (entry.attempts > 5) {
    otpStore.delete(email)
    return { valid: false, reason: 'too_many_attempts' }
  }
  if (entry.otp !== otp) {
    return { valid: false, reason: 'wrong_code' }
  }
  // Success — delete the OTP
  otpStore.delete(email)
  return { valid: true }
}

export function canRequestOtp(email: string): boolean {
  const entry = otpStore.get(email)
  if (!entry) return true
  // Allow new request if last one was > 60 seconds ago
  return Date.now() - entry.lastRequestAt > 60 * 1000
}
