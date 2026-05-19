'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PremiumAction } from './connectcoin-constants'

// ===== Types =====

export interface ActiveFeature {
  id: string
  action: PremiumAction
  activatedAt: string
  expiresAt: string
  metadata?: Record<string, unknown> | null
  isConsumed: boolean
}

export interface PremiumActionConfigItem {
  action: string
  durationMinutes: number
  isEnabled: boolean
  costCC: number
  label: string
  emoji: string
}

interface PremiumFeaturesState {
  // Active features for the current user
  activeFeatures: ActiveFeature[]
  // Admin-configured durations
  configs: PremiumActionConfigItem[]
  // Inventory counts (accumulated tokens)
  inventory: {
    roseCount: number
    undoCount: number
    superRequestCount: number
    extraRequestCount: number
  }
  // Loading state
  isLoading: boolean
  lastFetchedAt: string | null

  // Actions
  fetchActiveFeatures: (userId: string) => Promise<void>
  fetchConfigs: () => Promise<void>
  hasActiveFeature: (action: PremiumAction) => boolean
  getActiveFeature: (action: PremiumAction) => ActiveFeature | null
  getRemainingTime: (action: PremiumAction) => number // ms remaining
  consumeFeature: (userId: string, featureId: string) => Promise<boolean>
  activateFeatureLocally: (feature: ActiveFeature) => void
  setInventory: (inv: Partial<PremiumFeaturesState['inventory']>) => void
}

export const usePremiumFeatures = create<PremiumFeaturesState>()(
  persist(
    (set, get) => ({
      activeFeatures: [],
      configs: [],
      inventory: {
        roseCount: 0,
        undoCount: 0,
        superRequestCount: 0,
        extraRequestCount: 0,
      },
      isLoading: false,
      lastFetchedAt: null,

      fetchActiveFeatures: async (userId: string) => {
        set({ isLoading: true })
        try {
          const res = await fetch(`/api/credits/active-features?userId=${userId}`)
          if (!res.ok) {
            set({ isLoading: false })
            return
          }
          const data = await res.json()
          if (data.error) {
            set({ isLoading: false })
            return
          }
          set({
            activeFeatures: (data.features ?? []).map((f: Record<string, unknown>) => ({
              id: f.id as string,
              action: f.action as PremiumAction,
              activatedAt: f.activatedAt as string,
              expiresAt: f.expiresAt as string,
              metadata: f.metadata ? (typeof f.metadata === 'string' ? JSON.parse(f.metadata as string) : f.metadata) : null,
              isConsumed: f.isConsumed as boolean,
            })),
            inventory: data.inventory ?? get().inventory,
            isLoading: false,
            lastFetchedAt: new Date().toISOString(),
          })
        } catch (err) {
          console.error('fetchActiveFeatures error:', err)
          set({ isLoading: false })
        }
      },

      fetchConfigs: async () => {
        try {
          const res = await fetch('/api/credits/active-features/configs')
          if (!res.ok) return
          const data = await res.json()
          if (data.configs) {
            set({ configs: data.configs })
          }
        } catch (err) {
          console.error('fetchConfigs error:', err)
        }
      },

      hasActiveFeature: (action: PremiumAction): boolean => {
        const now = Date.now()
        return get().activeFeatures.some(
          (f) =>
            f.action === action &&
            !f.isConsumed &&
            new Date(f.expiresAt).getTime() > now
        )
      },

      getActiveFeature: (action: PremiumAction): ActiveFeature | null => {
        const now = Date.now()
        return (
          get().activeFeatures.find(
            (f) =>
              f.action === action &&
              !f.isConsumed &&
              new Date(f.expiresAt).getTime() > now
          ) ?? null
        )
      },

      getRemainingTime: (action: PremiumAction): number => {
        const feature = get().getActiveFeature(action)
        if (!feature) return 0
        return Math.max(0, new Date(feature.expiresAt).getTime() - Date.now())
      },

      consumeFeature: async (userId: string, featureId: string): Promise<boolean> => {
        try {
          const res = await fetch('/api/credits/active-features/consume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, featureId }),
          })
          const data = await res.json()
          if (data.success) {
            // Mark as consumed locally
            set((state) => ({
              activeFeatures: state.activeFeatures.map((f) =>
                f.id === featureId ? { ...f, isConsumed: true } : f
              ),
            }))
            return true
          }
          return false
        } catch (err) {
          console.error('consumeFeature error:', err)
          return false
        }
      },

      activateFeatureLocally: (feature: ActiveFeature) => {
        set((state) => ({
          activeFeatures: [...state.activeFeatures, feature],
        }))
      },

      setInventory: (inv) => {
        set((state) => ({
          inventory: { ...state.inventory, ...inv },
        }))
      },
    }),
    {
      name: 'premium-features-storage',
      partialize: (state) => ({
        activeFeatures: state.activeFeatures,
        inventory: state.inventory,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
)
