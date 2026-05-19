import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser-side client (uses anon key, respects RLS)
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side admin client (uses service role key, bypasses RLS)
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Singleton for browser usage
let browserClient: ReturnType<typeof createClient> | null = null

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

// Type helpers for our database schema
export interface DatabaseUser {
  id: string
  email: string
  phone: string
  password: string
  first_name: string
  last_name: string | null
  birth_date: string | null
  gender: string | null
  astrological_sign: string | null
  height: number | null
  relationship_status: string | null
  looking_for: string | null
  bio: string | null
  mood: string | null
  spotify_anthem: string | null
  is_verified: boolean
  is_photo_verified: boolean
  is_active: boolean
  is_premium: boolean
  premium_expiry: string | null
  is_incognito: boolean
  is_paused: boolean
  profile_score: number
  daily_boost_used: boolean
  super_requests_left: number
  streak_days: number
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface DatabaseProfile {
  id: string
  user_id: string
  job_title: string | null
  company: string | null
  education: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  interests: string | null // JSON array
  values: string | null // JSON array
  lifestyle: string | null // JSON array
  onboarding_step: number
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export interface DatabasePhoto {
  id: string
  user_id: string
  url: string
  position: number
  is_primary: boolean
  created_at: string
}

export interface DatabasePrompt {
  id: string
  user_id: string
  question: string
  answer: string
  created_at: string
}

export interface DatabaseNumberRequest {
  id: string
  sender_id: string
  receiver_id: string
  message: string | null
  is_super: boolean
  status: string // pending, accepted, declined
  created_at: string
  responded_at: string | null
  expires_at: string | null
}

export interface DatabaseMessage {
  id: string
  sender_id: string
  receiver_id: string
  request_id: string | null
  content: string
  type: string // text, voice, emoji_reaction
  voice_url: string | null
  is_read: boolean
  expires_at: string | null
  created_at: string
}

export interface DatabaseConnection {
  id: string
  user1_id: string
  user2_id: string
  request_id: string | null
  phone_number1: string | null
  phone_number2: string | null
  created_at: string
}

export interface DatabaseLike {
  id: string
  sender_id: string
  receiver_id: string
  is_mutual: boolean
  created_at: string
}

export interface DatabaseMoment {
  id: string
  user_id: string
  content: string | null
  media_url: string | null
  type: string
  poll_options: string | null
  expires_at: string
  created_at: string
}

export interface DatabaseProfileVisit {
  id: string
  visitor_id: string
  profile_id: string
  created_at: string
}

export interface DatabaseReport {
  id: string
  reporter_id: string
  reported_id: string
  reason: string
  description: string | null
  created_at: string
}

export interface DatabaseBadge {
  id: string
  user_id: string
  type: string
  earned_at: string
}

export interface DatabaseEventSignup {
  id: string
  user_id: string
  event_id: string
  created_at: string
}
