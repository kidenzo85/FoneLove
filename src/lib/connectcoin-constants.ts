/**
 * Shared constants for the ConnectCoin credit system.
 * Single source of truth used by both frontend (Zustand store) and backend (API routes).
 */

// ===== Pack Definitions =====
export type PackType = 'decouverte' | 'tendance' | 'passion' | 'flamme'

export interface PackDef {
  type: PackType
  name: string
  cc: number
  bonusCC: number
  price: number // numeric base price in EUR (always the source of truth)
  /** @deprecated Use currency-store.formatLocalPrice(pack.price) instead */
  priceDisplay: string // French formatted price string (legacy, for backward compat)
  /** @deprecated Use currency-store computed pricePerCC instead */
  pricePerCC: string // (legacy, for backward compat)
  bonusText: string
  icon: string
  freeRose: number
  freeTheme: boolean
}

export const PACKS: PackDef[] = [
  {
    type: 'decouverte',
    name: 'Découverte',
    cc: 30,
    bonusCC: 0,
    price: 2.99,
    priceDisplay: '2,99 €',
    pricePerCC: '0,100 €',
    bonusText: '',
    icon: '✨',
    freeRose: 0,
    freeTheme: false,
  },
  {
    type: 'tendance',
    name: 'Tendance',
    cc: 80,
    bonusCC: 5,
    price: 6.99,
    priceDisplay: '6,99 €',
    pricePerCC: '0,082 €',
    bonusText: '+5 CC offerts',
    icon: '🔥',
    freeRose: 0,
    freeTheme: false,
  },
  {
    type: 'passion',
    name: 'Passion',
    cc: 200,
    bonusCC: 15,
    price: 14.99,
    priceDisplay: '14,99 €',
    pricePerCC: '0,070 €',
    bonusText: '+15 CC + 1 Rose Connect',
    icon: '💎',
    freeRose: 1,
    freeTheme: false,
  },
  {
    type: 'flamme',
    name: 'Flamme',
    cc: 500,
    bonusCC: 40,
    price: 29.99,
    priceDisplay: '29,99 €',
    pricePerCC: '0,056 €',
    bonusText: '+40 CC + 3 Roses + Thème',
    icon: '👑',
    freeRose: 3,
    freeTheme: true,
  },
]

export const PACK_MAP = Object.fromEntries(PACKS.map((p) => [p.type, p])) as Record<PackType, PackDef>

// ===== Premium Action Costs =====
export type PremiumAction =
  | 'super_request' | 'rose_connect' | 'boost' | 'extra_request'
  | 'see_visitors' | 'read_receipt' | 'filters_plus' | 'ghost_mode' | 'undo_pass'
  | 'theme_flame' | 'theme_star' | 'theme_aura' | 'custom_badge' | 'request_animation'

export const ACTION_COSTS: Record<PremiumAction, number> = {
  super_request: 10,
  rose_connect: 7,
  boost: 5,
  extra_request: 5,
  see_visitors: 3,
  read_receipt: 2,
  filters_plus: 2,
  ghost_mode: 3,
  undo_pass: 1,
  theme_flame: 10,
  theme_star: 15,
  theme_aura: 20,
  custom_badge: 8,
  request_animation: 5,
}

export const COSMETIC_ACTIONS = new Set<PremiumAction>([
  'theme_flame', 'theme_star', 'theme_aura', 'custom_badge', 'request_animation',
])

export const ACTION_LABELS: Record<PremiumAction, { nameKey: string; descriptionKey: string; emoji: string }> = {
  super_request: { nameKey: 'actions.superRequest.name', descriptionKey: 'actions.superRequest.desc', emoji: '⭐' },
  rose_connect: { nameKey: 'actions.roseConnect.name', descriptionKey: 'actions.roseConnect.desc', emoji: '🌹' },
  boost: { nameKey: 'actions.boost.name', descriptionKey: 'actions.boost.desc', emoji: '🚀' },
  extra_request: { nameKey: 'actions.extraRequest.name', descriptionKey: 'actions.extraRequest.desc', emoji: '📱' },
  see_visitors: { nameKey: 'actions.seeVisitors.name', descriptionKey: 'actions.seeVisitors.desc', emoji: '👁️' },
  read_receipt: { nameKey: 'actions.readReceipt.name', descriptionKey: 'actions.readReceipt.desc', emoji: '✓' },
  filters_plus: { nameKey: 'actions.filtersPlus.name', descriptionKey: 'actions.filtersPlus.desc', emoji: '🔍' },
  ghost_mode: { nameKey: 'actions.ghostMode.name', descriptionKey: 'actions.ghostMode.desc', emoji: '👻' },
  undo_pass: { nameKey: 'actions.undoPass.name', descriptionKey: 'actions.undoPass.desc', emoji: '↩️' },
  theme_flame: { nameKey: 'actions.themeFlame.name', descriptionKey: 'actions.themeFlame.desc', emoji: '🔥' },
  theme_star: { nameKey: 'actions.themeStar.name', descriptionKey: 'actions.themeStar.desc', emoji: '⭐' },
  theme_aura: { nameKey: 'actions.themeAura.name', descriptionKey: 'actions.themeAura.desc', emoji: '✨' },
  custom_badge: { nameKey: 'actions.customBadge.name', descriptionKey: 'actions.customBadge.desc', emoji: '🏷️' },
  request_animation: { nameKey: 'actions.requestAnimation.name', descriptionKey: 'actions.requestAnimation.desc', emoji: '💫' },
}

// ===== Level System =====
export type LevelName = 'Bronze' | 'Argent' | 'Or' | 'Platine' | 'Diamant'

export interface LevelDef {
  name: LevelName
  threshold: number // totalSpent CC to reach this level
  nextThreshold: number | null // totalSpent CC to reach next level
  benefits: string[]
}

export const LEVEL_THRESHOLDS: LevelDef[] = [
  {
    name: 'Bronze',
    threshold: 0,
    nextThreshold: 50,
    benefits: [],  // Loaded via tArray('levels.bronzeBenefits') in UI
  },
  {
    name: 'Argent',
    threshold: 50,
    nextThreshold: 200,
    benefits: [],
  },
  {
    name: 'Or',
    threshold: 200,
    nextThreshold: 500,
    benefits: [],
  },
  {
    name: 'Platine',
    threshold: 500,
    nextThreshold: 1500,
    benefits: [],
  },
  {
    name: 'Diamant',
    threshold: 1500,
    nextThreshold: null,
    benefits: [],
  },
]

export function getLevelInfo(totalSpent: number): LevelDef & { levelIndex: number; progress: number } {
  let currentLevel = LEVEL_THRESHOLDS[0]
  let currentLevelIndex = 0

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalSpent >= LEVEL_THRESHOLDS[i].threshold) {
      currentLevel = LEVEL_THRESHOLDS[i]
      currentLevelIndex = i
      break
    }
  }

  let progress = 100
  if (currentLevel.nextThreshold !== null) {
    const rangeStart = currentLevel.threshold
    const rangeEnd = currentLevel.nextThreshold
    const range = rangeEnd - rangeStart
    progress = Math.min(100, Math.round(((totalSpent - rangeStart) / range) * 100))
  }

  return { ...currentLevel, levelIndex: currentLevelIndex, progress }
}

// ===== Daily Free CC =====
export const BASE_DAILY_FREE = 3
export const MAX_STREAK_BONUS = 5 // Max streak bonus capped at +5
export const MAX_DAILY_FREE_CAP = 9 // Absolute cap on daily free CC

// ===== Streak Milestones =====
export const STREAK_MILESTONES: Record<number, { bonusCC: number; reward: string; description: string }> = {
  5: { bonusCC: 2, reward: 'bonus_cc', description: 'Jour 5 : +2 CC bonus' },
  7: { bonusCC: 3, reward: 'free_boost', description: 'Jour 7 : +3 CC bonus + Boost gratuit' },
  14: { bonusCC: 4, reward: 'free_rose', description: 'Jour 14 : +4 CC bonus + Rose Connect gratuite' },
  30: { bonusCC: 5, reward: 'theme_legende', description: 'Jour 30 : +5 CC bonus + Thème Légende' },
}

// ===== First Purchase Bonus =====
export const FIRST_PURCHASE_BONUS = 20

// ===== Euro per CC rate (for display, based on Flamme pack) =====
export const EURO_PER_CC = 0.056

// ===== Euro price per CC for each pack (used for currency conversion) =====
export function getEurPricePerCC(pack: PackDef): number {
  return pack.price / (pack.cc + pack.bonusCC)
}
