/**
 * ConnectPhone — Supabase Credits Integration
 * 
 * Ce module remplace TOUTE la logique Prisma/SQLite du système de crédits
 * par des appels Supabase RPC (PostgreSQL functions) et requêtes directes.
 * 
 * Architecture:
 * - Opérations atomiques → RPC (SECURITY DEFINER, transactionnelles)
 * - Lectures simples → Requêtes Supabase directes (avec RLS)
 * - API externe → Edge Functions (Frankfurter, IP geolocation)
 * 
 * Client selection:
 * - Côté serveur (API routes) → adminClient (service_role, bypass RLS)
 * - Côté navigateur (stores) → browserClient (anon key, respecte RLS)
 * - Les RPC SECURITY DEFINER contournent les RLS quel que soit le client
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  PACKS, PACK_MAP, ACTION_COSTS, COSMETIC_ACTIONS,
  LEVEL_THRESHOLDS, STREAK_MILESTONES, FIRST_PURCHASE_BONUS,
  type PackType, type PremiumAction,
} from './connectcoin-constants'
import {
  CURRENCIES, getPPPGroup, PPP_MULTIPLIER,
  DEFAULT_CURRENCY, DEFAULT_COUNTRY,
} from './currency-constants'

// ===== Types =====

export interface WalletInfo {
  balance: number
  totalEarned: number
  totalSpent: number
  dailyFreeClaimed: boolean
  dailyFreeStreak: number
  freeBoostClaimed: boolean
  firstPurchaseMade: boolean
  currentStreak: number
  longestStreak: number
  todayBonusClaimed: boolean
  levelIndex: number
  levelName: string
  nextThreshold: number | null
  progress: number
}

export interface ClaimResult {
  success: boolean
  amount: number
  newBalance: number
  streakDays: number
  baseCC: number
  streakBonus: number
  message: string
}

export interface SpendResult {
  success: boolean
  transactionId: string | null
  amount: number
  newBalance: number
  message: string
}

export interface PurchaseResult {
  success: boolean
  transactionId: string
  totalCC: number
  effectivePrice: number
  firstPurchaseBonus: number
  promoBonusCC: number
  promoDiscountPercent: number
  newBalance: number
  message: string
}

export interface StreakResult {
  success: boolean
  currentStreak: number
  longestStreak: number
  streakContinued: boolean
  milestoneDay: number | null
  milestoneBonusCC: number
  milestoneReward: string | null
  newBalance: number
  message: string
}

export interface ChallengeWithProgress {
  id: string
  type: string
  title: string
  description: string
  targetCount: number
  reward: number
  resetsAt: string
  progress: number
  completed: boolean
  claimed: boolean
}

export interface PromoInfo {
  type: string
  title: string
  description: string
  discountPercent?: number
  bonusCC?: number
  bonusAction?: string
  packType?: string
  isActive: boolean
  expiresAt?: string
}

export interface TransactionInfo {
  id: string
  type: string
  amount: number
  action: string | null
  packType: string | null
  description: string
  metadata: Record<string, unknown> | null
  date: string
}

export interface CosmeticInfo {
  id: string
  type: string
  isActive: boolean
  customText: string | null
  colorChoice: string | null
}

export interface CurrencyDetection {
  currencyCode: string
  countryCode: string
  countryName: string
  source: string
  supported: boolean
}

export interface ExchangeRateInfo {
  baseCurrency: string
  targetCurrency: string
  rate: number
  source: string
  fetchedAt: string | null
}

// ===== Supabase Client Factories =====

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** Client serveur avec service_role (bypass RLS) — pour les API routes */
export function createCreditsAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** Client navigateur avec anon key (respecte RLS) — pour le client direct */
export function createCreditsBrowserClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// ===== Singleton navigateur =====
let browserClient: SupabaseClient | null = null

export function getCreditsBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createCreditsBrowserClient()
  }
  return browserClient
}

// ===== Smart Client Selection =====
// Détecte si on est côté serveur ou navigateur et choisit le bon client.
// Côté navigateur: le service_role n'existe pas, on utilise l'anon key.
// Côté serveur: on préfère le service_role pour bypass RLS.

function isServerSide(): boolean {
  return typeof window === 'undefined'
}

function getClient(): SupabaseClient {
  if (isServerSide()) {
    // Côté serveur: utiliser l'admin client si la clé est disponible
    if (supabaseServiceRoleKey) {
      return createCreditsAdminClient()
    }
    // Sinon fallback sur le client navigateur (avec RLS)
    return getCreditsBrowserClient()
  }
  // Côté navigateur: toujours utiliser l'anon key (RLS)
  return getCreditsBrowserClient()
}

// ===== CRUD Operations =====

/**
 * Récupère le solde complet avec infos de niveau et streak.
 * Appelle la RPC get_user_balance (SECURITY DEFINER → bypass RLS).
 */
export async function getBalance(userId: string): Promise<WalletInfo> {
  const supabase = getClient()
  
  const { data, error } = await supabase.rpc('get_user_balance', {
    p_user_id: userId,
  })

  if (error) {
    console.error('getBalance RPC error:', error)
    return {
      balance: 0, totalEarned: 0, totalSpent: 0,
      dailyFreeClaimed: false, dailyFreeStreak: 0,
      freeBoostClaimed: false, firstPurchaseMade: false,
      currentStreak: 0, longestStreak: 0, todayBonusClaimed: false,
      levelIndex: 0, levelName: 'Bronze', nextThreshold: 50, progress: 0,
    }
  }

  return {
    balance: data.balance ?? 0,
    totalEarned: data.total_earned ?? 0,
    totalSpent: data.total_spent ?? 0,
    dailyFreeClaimed: data.daily_free_claimed ?? false,
    dailyFreeStreak: data.daily_free_streak ?? 0,
    freeBoostClaimed: data.free_boost_claimed ?? false,
    firstPurchaseMade: data.first_purchase_made ?? false,
    currentStreak: data.current_streak ?? 0,
    longestStreak: data.longest_streak ?? 0,
    todayBonusClaimed: data.today_bonus_claimed ?? false,
    levelIndex: data.level_index ?? 0,
    levelName: data.level_name ?? 'Bronze',
    nextThreshold: data.next_threshold,
    progress: data.progress ?? 0,
  }
}

/**
 * Réclame les CC gratuits quotidiens.
 * Appelle la RPC claim_daily_free (SECURITY DEFINER → bypass RLS).
 */
export async function claimDailyFree(userId: string): Promise<ClaimResult> {
  const supabase = getClient()
  
  const { data, error } = await supabase.rpc('claim_daily_free', {
    p_user_id: userId,
  })

  if (error) {
    return {
      success: false, amount: 0, newBalance: 0,
      streakDays: 0, baseCC: 3, streakBonus: 0,
      message: error.message || 'Erreur lors de la réclamation',
    }
  }

  return {
    success: data.success ?? false,
    amount: data.amount ?? 0,
    newBalance: data.new_balance ?? 0,
    streakDays: data.streak_days ?? 0,
    baseCC: data.base_cc ?? 3,
    streakBonus: data.streak_bonus ?? 0,
    message: data.message ?? '',
  }
}

/**
 * Dépense des CC pour une action premium.
 * Appelle la RPC spend_credits (SECURITY DEFINER → bypass RLS).
 */
export async function spendCredits(
  userId: string,
  action: PremiumAction,
  metadata?: Record<string, unknown>
): Promise<SpendResult> {
  const supabase = getClient()
  const cost = ACTION_COSTS[action]

  if (cost === undefined) {
    return {
      success: false, transactionId: null,
      amount: 0, newBalance: 0,
      message: `Action invalide: ${action}`,
    }
  }

  const { data, error } = await supabase.rpc('spend_credits', {
    p_user_id: userId,
    p_action: action,
    p_amount: cost,
    p_metadata: metadata ?? {},
  })

  if (error) {
    return {
      success: false, transactionId: null,
      amount: cost, newBalance: 0,
      message: error.message || 'Erreur lors de la dépense',
    }
  }

  return {
    success: data.success ?? false,
    transactionId: data.transaction_id,
    amount: data.amount ?? -cost,
    newBalance: data.new_balance ?? 0,
    message: data.message ?? '',
  }
}

/**
 * Achète un pack ConnectCoin.
 * Appelle la RPC purchase_pack (SECURITY DEFINER → bypass RLS).
 */
export async function purchasePack(
  userId: string,
  packType: PackType,
  currencyCode: string = 'EUR',
  countryCode: string = 'FR',
  exchangeRate: number = 1
): Promise<PurchaseResult> {
  const supabase = getClient()
  const pack = PACK_MAP[packType]

  if (!pack) {
    return {
      success: false, transactionId: '', totalCC: 0,
      effectivePrice: 0, firstPurchaseBonus: 0,
      promoBonusCC: 0, promoDiscountPercent: 0,
      newBalance: 0, message: `Pack invalide: ${packType}`,
    }
  }

  const pppGroup = getPPPGroup(countryCode)
  const pppMultiplier = PPP_MULTIPLIER[pppGroup]
  const priceLocal = exchangeRate !== 1 ? pack.price * exchangeRate * pppMultiplier : null

  const { data, error } = await supabase.rpc('purchase_pack', {
    p_user_id: userId,
    p_pack_type: packType,
    p_pack_cc: pack.cc,
    p_pack_bonus_cc: pack.bonusCC,
    p_pack_price_eur: pack.price,
    p_pack_free_rose: pack.freeRose,
    p_pack_free_theme: pack.freeTheme,
    p_currency_code: currencyCode,
    p_country_code: countryCode,
    p_ppp_group: pppGroup,
    p_ppp_multiplier: pppMultiplier,
    p_price_local: priceLocal,
  })

  if (error) {
    return {
      success: false, transactionId: '', totalCC: 0,
      effectivePrice: 0, firstPurchaseBonus: 0,
      promoBonusCC: 0, promoDiscountPercent: 0,
      newBalance: 0, message: error.message || "Erreur lors de l'achat",
    }
  }

  return {
    success: data.success ?? false,
    transactionId: data.transaction_id ?? '',
    totalCC: data.total_cc ?? 0,
    effectivePrice: data.effective_price ?? pack.price,
    firstPurchaseBonus: data.first_purchase_bonus ?? 0,
    promoBonusCC: data.promo_bonus_cc ?? 0,
    promoDiscountPercent: data.promo_discount_percent ?? 0,
    newBalance: data.new_balance ?? 0,
    message: data.message ?? '',
  }
}

/**
 * Check-in quotidien du streak.
 * Appelle la RPC check_in_streak (SECURITY DEFINER → bypass RLS).
 */
export async function checkInStreak(userId: string): Promise<StreakResult> {
  const supabase = getClient()
  
  const { data, error } = await supabase.rpc('check_in_streak', {
    p_user_id: userId,
  })

  if (error) {
    return {
      success: false, currentStreak: 0, longestStreak: 0,
      streakContinued: false, milestoneDay: null,
      milestoneBonusCC: 0, milestoneReward: null,
      newBalance: 0, message: error.message || 'Erreur lors du check-in',
    }
  }

  return {
    success: data.success ?? false,
    currentStreak: data.current_streak ?? 0,
    longestStreak: data.longest_streak ?? 0,
    streakContinued: data.streak_continued ?? false,
    milestoneDay: data.milestone_day,
    milestoneBonusCC: data.milestone_bonus_cc ?? 0,
    milestoneReward: data.milestone_reward,
    newBalance: data.new_balance ?? 0,
    message: data.message ?? '',
  }
}

/**
 * Récupère les infos de streak.
 * Utilise le client adapté (admin côté serveur, browser côté navigateur).
 */
export async function getStreak(userId: string) {
  const supabase = getClient()
  
  const { data, error } = await supabase
    .from('daily_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return {
      currentStreak: 0, longestStreak: 0,
      lastCheckIn: null, todayBonusClaimed: false,
      nextMilestone: 5, milestones: STREAK_MILESTONES,
    }
  }

  const milestoneDays = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b)
  const nextMilestone = milestoneDays.find(d => d > data.current_streak) ?? null

  return {
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastCheckIn: data.last_check_in,
    todayBonusClaimed: data.today_bonus_claimed,
    nextMilestone,
    milestones: STREAK_MILESTONES,
  }
}

/**
 * Récupère les défis hebdomadaires avec progression.
 */
export async function getChallenges(userId: string): Promise<{
  challenges: ChallengeWithProgress[]
  weekStart: string
  weekEnd: string
}> {
  const supabase = getClient()

  // S'assurer que les défis existent
  await supabase.rpc('ensure_weekly_challenges')

  // Récupérer les défis de la semaine
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .gte('resets_at', weekStart.toISOString())

  if (!challenges || challenges.length === 0) {
    return { challenges: [], weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() }
  }

  // Récupérer les progressions
  const challengesWithProgress: ChallengeWithProgress[] = await Promise.all(
    challenges.map(async (challenge) => {
      // Upsert la progression si inexistante
      const { data: progress } = await supabase
        .from('challenge_progress')
        .upsert(
          { user_id: userId, challenge_id: challenge.id, progress: 0, completed: false, claimed: false },
          { onConflict: 'user_id,challenge_id', ignoreDuplicates: true }
        )
        .select()
        .single()

      return {
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        targetCount: challenge.target_count,
        reward: challenge.reward,
        resetsAt: challenge.resets_at,
        progress: progress?.progress ?? 0,
        completed: progress?.completed ?? false,
        claimed: progress?.claimed ?? false,
      }
    })
  )

  return {
    challenges: challengesWithProgress,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  }
}

/**
 * Réclame la récompense d'un défi complété.
 * Appelle la RPC claim_challenge (SECURITY DEFINER → bypass RLS).
 */
export async function claimChallenge(userId: string, challengeId: string) {
  const supabase = getClient()

  const { data, error } = await supabase.rpc('claim_challenge', {
    p_user_id: userId,
    p_challenge_id: challengeId,
  })

  if (error) {
    return { success: false, reward: 0, newBalance: 0, message: error.message }
  }

  return {
    success: data.success ?? false,
    reward: data.reward ?? 0,
    newBalance: data.new_balance ?? 0,
    message: data.message ?? '',
  }
}

/**
 * Récupère les promos disponibles.
 * Appelle la RPC get_computed_promos (SECURITY DEFINER → bypass RLS).
 */
export async function getPromos(userId: string): Promise<PromoInfo[]> {
  const supabase = getClient()

  const { data, error } = await supabase.rpc('get_computed_promos', {
    p_user_id: userId,
  })

  if (error || !data) {
    return []
  }

  return (Array.isArray(data) ? data : []).map((p: Record<string, unknown>) => ({
    type: p.type as string,
    title: p.title as string,
    description: p.description as string,
    discountPercent: p.discount_percent as number | undefined,
    bonusCC: p.bonus_cc as number | undefined,
    bonusAction: p.bonus_action as string | undefined,
    packType: p.pack_type as string | undefined,
    isActive: p.is_active as boolean,
    expiresAt: p.expires_at as string | undefined,
  }))
}

/**
 * Récupère l'historique des transactions (paginé).
 * Utilise le client adapté (admin côté serveur, browser côté navigateur).
 */
export async function getTransactionHistory(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  transactions: TransactionInfo[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const supabase = getClient()

  // D'abord trouver le wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!wallet) {
    return { transactions: [], total: 0, page, limit, totalPages: 0 }
  }

  // Compter le total
  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('wallet_id', wallet.id)

  // Récupérer la page
  const offset = (page - 1) * limit
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('wallet_id', wallet.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const total = count ?? 0

  return {
    transactions: (transactions ?? []).map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      action: tx.action,
      packType: tx.pack_type,
      description: tx.description,
      metadata: tx.metadata,
      date: tx.created_at,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Récupère les cosmétiques de l'utilisateur.
 * Utilise le client adapté (admin côté serveur, browser côté navigateur).
 */
export async function getCosmetics(userId: string): Promise<CosmeticInfo[]> {
  const supabase = getClient()

  const { data } = await supabase
    .from('cosmetic_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data ?? []).map(c => ({
    id: c.id,
    type: c.type,
    isActive: c.is_active,
    customText: c.custom_text,
    colorChoice: c.color_choice,
  }))
}

/**
 * Détecte la devise de l'utilisateur via l'Edge Function.
 * Utilise toujours le browser client (Edge Functions utilisent l'auth du caller).
 */
export async function detectCurrency(): Promise<CurrencyDetection> {
  const supabase = getCreditsBrowserClient()

  const { data, error } = await supabase.functions.invoke('currency-detect', {
    method: 'GET',
  })

  if (error || !data) {
    return {
      currencyCode: DEFAULT_CURRENCY,
      countryCode: DEFAULT_COUNTRY,
      countryName: 'France',
      source: 'fallback',
      supported: true,
    }
  }

  return data as CurrencyDetection
}

/**
 * Récupère le taux de change via l'Edge Function.
 * Utilise toujours le browser client.
 */
export async function fetchExchangeRate(currency: string): Promise<ExchangeRateInfo> {
  if (currency === 'EUR') {
    return { baseCurrency: 'EUR', targetCurrency: 'EUR', rate: 1, source: 'identity', fetchedAt: new Date().toISOString() }
  }

  const supabase = getCreditsBrowserClient()

  const { data, error } = await supabase.functions.invoke('currency-rates', {
    method: 'POST',
    body: { currencies: [currency] },
  })

  if (error || !data?.rates || !data.rates[currency]) {
    // Fallback sur le taux hardcoded
    const currDef = CURRENCIES[currency]
    return {
      baseCurrency: 'EUR',
      targetCurrency: currency,
      rate: currDef?.fallbackRate ?? 1,
      source: 'fallback',
      fetchedAt: null,
    }
  }

  const rateInfo = data.rates[currency]
  return {
    baseCurrency: 'EUR',
    targetCurrency: currency,
    rate: rateInfo.rate,
    source: rateInfo.source,
    fetchedAt: new Date().toISOString()
  }
}

/**
 * Récupère les taux de change en bulk via l'Edge Function.
 * Utilise toujours le browser client.
 */
export async function fetchBulkRates(currencies: string[]): Promise<Record<string, { rate: number; source: string }>> {
  const supabase = getCreditsBrowserClient()

  const { data, error } = await supabase.functions.invoke('currency-rates', {
    method: 'POST',
    body: { currencies },
  })

  if (error || !data?.rates) {
    // Fallback sur les taux hardcoded
    const results: Record<string, { rate: number; source: string }> = {}
    for (const currency of currencies) {
      const currDef = CURRENCIES[currency]
      if (currDef) {
        results[currency] = { rate: currDef.fallbackRate, source: 'fallback' }
      }
    }
    return results
  }

  return data.rates
}

/**
 * Incrémente la progression d'un défi (appelé quand l'utilisateur effectue une action).
 * Appelle la RPC increment_challenge_progress (SECURITY DEFINER → bypass RLS).
 */
export async function incrementChallengeProgress(
  userId: string,
  challengeType: string,
  increment: number = 1
) {
  const supabase = getClient()

  const { data, error } = await supabase.rpc('increment_challenge_progress', {
    p_user_id: userId,
    p_challenge_type: challengeType,
    p_increment: increment,
  })

  if (error) {
    console.error('incrementChallengeProgress error:', error)
    return { success: false }
  }

  return data
}

// ===== Helpers =====

function getWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(now.getFullYear(), now.getMonth(), diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  return weekEnd
}
