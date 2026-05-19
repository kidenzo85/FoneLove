'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export type LevelName = 'Bronze' | 'Argent' | 'Or' | 'Platine' | 'Diamant'
export type PackType = 'decouverte' | 'tendance' | 'passion' | 'flamme'
export type PremiumAction = 'super_request' | 'rose_connect' | 'boost' | 'extra_request' | 'see_visitors' | 'read_receipt' | 'filters_plus' | 'ghost_mode' | 'undo_pass' | 'theme_flame' | 'theme_star' | 'theme_aura' | 'custom_badge' | 'request_animation'

export interface PackInfo {
  type: PackType
  name: string
  cc: number
  bonusCC: number
  price: string
  pricePerCC: string
  bonusText: string
  icon: string
  gradient: string
}

export interface TransactionItem {
  id: string
  type: string
  amount: number
  action?: string | null
  description?: string | null
  createdAt: string
}

export interface ChallengeItem {
  id: string
  type: string
  title: string
  description: string
  targetCount: number
  reward: number
  progress: number
  completed: boolean
  claimed: boolean
}

export interface PromoItem {
  id: string
  type: string
  title: string
  description: string
  discountPercent?: number
  bonusCC?: number
  bonusAction?: string
  packType?: string
  expiresAt?: string
}

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  todayBonusClaimed: boolean
  lastCheckIn: string | null
  nextMilestone: number | null
  milestones: Record<number, { bonusCC: number; reward: string; description: string }>
}

export interface LevelInfo {
  level: number
  levelName: LevelName
  totalSpent: number
  nextLevelAt: number | null
  progress: number
  benefits: string[]
}

interface ConnectCoinState {
  balance: number
  totalEarned: number
  totalSpent: number
  level: LevelInfo | null
  streak: StreakInfo | null
  dailyFreeClaimed: boolean
  freeBoostClaimed: boolean
  transactions: TransactionItem[]
  challenges: ChallengeItem[]
  promos: PromoItem[]
  showCreditStore: boolean
  showSpendConfirm: { action: PremiumAction; cost: number; onConfirm: () => void } | null
  showInsufficientBalance: { action: PremiumAction; cost: number } | null
  selectedPackType: PackType | 'packs' | 'starter' | null
  isLoading: boolean

  // Actions
  fetchBalance: (userId: string) => Promise<void>
  purchasePack: (userId: string, packType: PackType) => Promise<boolean>
  spendCredits: (userId: string, action: PremiumAction, metadata?: Record<string, string>) => Promise<boolean>
  claimDailyFree: (userId: string) => Promise<{ amount: number; hasSharedGift?: boolean; sharedGiftAmount?: number } | null>
  checkInStreak: (userId: string) => Promise<void>
  fetchChallenges: (userId: string) => Promise<void>
  fetchPromos: (userId: string) => Promise<void>
  fetchHistory: (userId: string, page?: number) => Promise<void>
  setShowCreditStore: (show: boolean, packType?: PackType | 'packs' | 'starter' | null) => void
  setShowSpendConfirm: (confirm: { action: PremiumAction; cost: number; onConfirm: () => void } | null) => void
  setShowInsufficientBalance: (info: { action: PremiumAction; cost: number } | null) => void
  setSelectedPackType: (packType: PackType | 'packs' | 'starter' | null) => void
  trySpendAction: (action: PremiumAction, onConfirm: () => void) => void
}

// Pack definitions
export const PACKS: PackInfo[] = [
  {
    type: 'decouverte',
    name: 'Découverte',
    cc: 30,
    bonusCC: 0,
    price: '2,99 €',
    pricePerCC: '0,100 €',
    bonusText: '',
    icon: '✨',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    type: 'tendance',
    name: 'Tendance',
    cc: 80,
    bonusCC: 5,
    price: '6,99 €',
    pricePerCC: '0,082 €',
    bonusText: '+5 CC offerts',
    icon: '🔥',
    gradient: 'from-orange-500/20 to-amber-500/20',
  },
  {
    type: 'passion',
    name: 'Passion',
    cc: 200,
    bonusCC: 15,
    price: '14,99 €',
    pricePerCC: '0,070 €',
    bonusText: '+15 CC + 1 Rose Connect',
    icon: '💎',
    gradient: 'from-rose-500/20 to-pink-500/20',
  },
  {
    type: 'flamme',
    name: 'Flamme',
    cc: 500,
    bonusCC: 40,
    price: '29,99 €',
    pricePerCC: '0,056 €',
    bonusText: '+40 CC + 3 Roses + Thème',
    icon: '👑',
    gradient: 'from-amber-500/20 to-yellow-500/20',
  },
]

// Action costs
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

export const ACTION_LABELS: Record<PremiumAction, { name: string; description: string; emoji: string }> = {
  super_request: { name: 'Super Demande', description: 'Demande de numéro mise en avant avec badge doré', emoji: '⭐' },
  rose_connect: { name: 'Rose Connect', description: "Signal d'intérêt premium avec animation unique", emoji: '🌹' },
  boost: { name: 'Boost Visibilité', description: 'Profil en tête des résultats pendant 30 min', emoji: '🚀' },
  extra_request: { name: 'Demande supplémentaire', description: 'Demande de numéro au-delà du quota gratuit', emoji: '📱' },
  see_visitors: { name: 'Voir les visiteurs', description: 'Révélation des profils ayant visité votre profil', emoji: '👁️' },
  read_receipt: { name: 'Accusé de lecture', description: 'Voir si votre message a été lu', emoji: '✓' },
  filters_plus: { name: 'Filtres Connect+', description: 'Filtres avancés : taille, signe, études (24h)', emoji: '🔍' },
  ghost_mode: { name: 'Mode Fantôme', description: 'Naviguer invisiblement sans laisser de traces (24h)', emoji: '👻' },
  undo_pass: { name: 'Annuler un pass', description: 'Revenir sur un swipe gauche accidentel', emoji: '↩️' },
  theme_flame: { name: 'Thème Flamme', description: 'Cadre animé flamme autour de votre photo', emoji: '🔥' },
  theme_star: { name: 'Thème Étoile', description: 'Effet scintillant sur votre photo de profil', emoji: '⭐' },
  theme_aura: { name: 'Thème Aura', description: 'Halo lumineux personnalisé', emoji: '✨' },
  custom_badge: { name: 'Badge personnalisé', description: 'Texte personnalisé affiché sur votre profil', emoji: '🏷️' },
  request_animation: { name: 'Animation de demande', description: "Animation spéciale lors de l'envoi d'une demande", emoji: '💫' },
}

export const useConnectCoinStore = create<ConnectCoinState>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      level: null,
      streak: null,
      dailyFreeClaimed: false,
      freeBoostClaimed: false,
      transactions: [],
      challenges: [],
      promos: [],
      showCreditStore: false,
      showSpendConfirm: null,
      showInsufficientBalance: null,
      selectedPackType: null,
      isLoading: false,

      fetchBalance: async (userId: string) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`/api/credits/balance?userId=${userId}`)
          if (!res.ok) {
            // User not found or server error — stop silently, keep cached values
            set({ isLoading: false })
            return
          }
          const data = await res.json()
          if (data.error) {
            set({ isLoading: false })
            return
          }
          set({
            balance: data.balance ?? 0,
            totalEarned: data.totalEarned ?? 0,
            totalSpent: data.totalSpent ?? 0,
            dailyFreeClaimed: data.dailyFreeClaimed ?? false,
            freeBoostClaimed: data.freeBoostClaimed ?? false,
            isLoading: false,
          })

          // Also fetch level and streak in parallel
          const [levelRes, streakRes] = await Promise.all([
            fetch(`/api/credits/level?userId=${userId}`),
            fetch(`/api/credits/streak?userId=${userId}`),
          ])

          if (levelRes.ok) {
            const levelData = await levelRes.json()
            if (!levelData.error) {
              set({
                level: {
                  level: levelData.level ?? 0,
                  levelName: levelData.levelName ?? 'Bronze',
                  totalSpent: levelData.totalSpent ?? 0,
                  nextLevelAt: levelData.nextThreshold ?? null,
                  progress: levelData.progress ?? 0,
                  benefits: levelData.benefits ?? [],
                },
              })
            }
          }

          if (streakRes.ok) {
            const streakData = await streakRes.json()
            if (!streakData.error) {
              set({
                streak: {
                  currentStreak: streakData.currentStreak ?? 0,
                  longestStreak: streakData.longestStreak ?? 0,
                  todayBonusClaimed: streakData.todayBonusClaimed ?? false,
                  lastCheckIn: streakData.lastCheckIn ?? null,
                  nextMilestone: streakData.nextMilestone ?? null,
                  milestones: streakData.milestones ?? {},
                },
              })
            }
          }
        } catch (err) {
          console.error('fetchBalance error:', err)
          set({ isLoading: false })
        }
      },

      purchasePack: async (userId: string, packType: PackType) => {
        try {
          const res = await fetch('/api/credits/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, packType }),
          })
          const data = await res.json()
          if (data.error) {
            console.error('Purchase error:', data.error)
            return false
          }
          // Refresh balance
          await get().fetchBalance(userId)
          return true
        } catch (err) {
          console.error('purchasePack error:', err)
          return false
        }
      },

      spendCredits: async (userId: string, action: PremiumAction, metadata?: Record<string, string>) => {
        try {
          const res = await fetch('/api/credits/spend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action, metadata }),
          })
          const data = await res.json()
          if (data.error) {
            console.error('Spend error:', data.error)
            return false
          }

          // Push the activated feature into the premium features store
          if (data.activeFeature) {
            try {
              const { usePremiumFeatures } = await import('./premium-features-store')
              usePremiumFeatures.getState().activateFeatureLocally({
                id: data.activeFeature.id,
                action: data.activeFeature.action,
                activatedAt: data.activeFeature.activatedAt,
                expiresAt: data.activeFeature.expiresAt,
                metadata: data.activeFeature.metadata ? JSON.parse(data.activeFeature.metadata) : null,
                isConsumed: false,
              })
            } catch {
              // Premium features store not available — non-critical
            }
          }

          // Refresh balance
          await get().fetchBalance(userId)
          return true
        } catch (err) {
          console.error('spendCredits error:', err)
          return false
        }
      },

      claimDailyFree: async (userId: string) => {
        try {
          const res = await fetch('/api/credits/daily-free', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })
          const data = await res.json()
          if (data.error) {
            if (data.error !== 'already_claimed') {
              console.error('Daily free error:', data.error)
            }
            return null
          }
          set({ dailyFreeClaimed: true })
          // Refresh balance
          await get().fetchBalance(userId)
          return {
            amount: data.amount ?? 3,
            hasSharedGift: data.hasSharedGift,
            sharedGiftAmount: data.sharedGiftAmount,
          }
        } catch (err) {
          console.error('claimDailyFree error:', err)
          return null
        }
      },

      checkInStreak: async (userId: string) => {
        try {
          const res = await fetch('/api/credits/streak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })
          const data = await res.json()
          if (data.error) {
            if (data.error !== 'already_claimed') {
              console.error('Streak check-in error:', data.error)
            }
            return
          }
          // Refresh balance and streak
          await get().fetchBalance(userId)
        } catch (err) {
          console.error('checkInStreak error:', err)
        }
      },

      fetchChallenges: async (userId: string) => {
        try {
          const res = await fetch(`/api/credits/challenges?userId=${userId}`)
          const data = await res.json()
          if (data.error) {
            console.error('Challenges error:', data.error)
            return
          }
          set({ challenges: data.challenges ?? [] })
        } catch (err) {
          console.error('fetchChallenges error:', err)
        }
      },

      fetchPromos: async (userId: string) => {
        try {
          const res = await fetch(`/api/credits/promos?userId=${userId}`)
          const data = await res.json()
          if (data.error) {
            console.error('Promos error:', data.error)
            return
          }
          set({
            promos: (data.promos ?? []).map((p: PromoItem & { expiresAt?: string | Date; isActive?: boolean }, i: number) => ({
              id: p.id || `promo-${i}`,
              type: p.type,
              title: p.title,
              description: p.description,
              discountPercent: p.discountPercent,
              bonusCC: p.bonusCC,
              bonusAction: p.bonusAction,
              packType: p.packType,
              expiresAt: p.expiresAt ? String(p.expiresAt) : undefined,
            })),
          })
        } catch (err) {
          console.error('fetchPromos error:', err)
        }
      },

      fetchHistory: async (userId: string, page?: number) => {
        try {
          const res = await fetch(`/api/credits/history?userId=${userId}&page=${page ?? 1}&limit=20`)
          const data = await res.json()
          if (data.error) {
            console.error('History error:', data.error)
            return
          }
          set({
            transactions: (data.transactions ?? []).map((t: TransactionItem & { date?: string }) => ({
              id: t.id,
              type: t.type,
              amount: t.amount,
              action: t.action,
              description: t.description,
              createdAt: t.createdAt || t.date || new Date().toISOString(),
            })),
          })
        } catch (err) {
          console.error('fetchHistory error:', err)
        }
      },

      setShowCreditStore: (show: boolean, packType: PackType | 'packs' | 'starter' | null = null) => set({ 
        showCreditStore: show, 
        selectedPackType: packType 
      }),
      setShowSpendConfirm: (confirm) => set({ showSpendConfirm: confirm }),
      setShowInsufficientBalance: (info) => set({ showInsufficientBalance: info }),
      setSelectedPackType: (packType) => set({ selectedPackType: packType }),

      // Smart spend action: check balance first, show insufficient dialog if needed
      trySpendAction: (action: PremiumAction, onConfirm: () => void) => {
        const cost = ACTION_COSTS[action]
        const currentBalance = get().balance
        if (currentBalance < cost) {
          // Show insufficient balance dialog with redirect option
          set({ showInsufficientBalance: { action, cost } })
        } else {
          // Balance is sufficient, show normal spend confirmation
          set({ showSpendConfirm: { action, cost, onConfirm } })
        }
      },
    }),
    {
      name: 'connectcoin-storage',
      partialize: (state) => ({
        balance: state.balance,
        totalEarned: state.totalEarned,
        totalSpent: state.totalSpent,
        dailyFreeClaimed: state.dailyFreeClaimed,
        freeBoostClaimed: state.freeBoostClaimed,
      }),
    }
  )
)
