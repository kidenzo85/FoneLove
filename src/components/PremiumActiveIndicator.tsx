'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, X, Ghost, Eye, Filter, Zap, CheckCheck, Sparkles } from 'lucide-react'
import { usePremiumFeatures, type ActiveFeature } from '@/lib/premium-features-store'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Floating indicator showing active premium features with countdown timers.
 * Appears at the top of the screen when any timed feature is active.
 */
export default function PremiumActiveIndicator() {
  const currentUser = useAppStore((s) => s.currentUser)
  const { activeFeatures, fetchActiveFeatures } = usePremiumFeatures()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Fetch active features on mount
  useEffect(() => {
    if (currentUser?.id) {
      fetchActiveFeatures(currentUser.id)
    }
  }, [currentUser?.id, fetchActiveFeatures])

  // Filter to visible timed features (not one-shot, not dismissed)
  const visibleFeatures = useMemo(() => {
    const now = Date.now()
    const TIMED_ACTIONS = new Set([
      'boost', 'ghost_mode', 'see_visitors', 'read_receipt', 'filters_plus',
      'theme_flame', 'theme_star', 'theme_aura', 'custom_badge', 'request_animation',
    ])
    return activeFeatures.filter(
      (f) =>
        TIMED_ACTIONS.has(f.action) &&
        !f.isConsumed &&
        new Date(f.expiresAt).getTime() > now &&
        !dismissed.has(f.id)
    )
  }, [activeFeatures, dismissed])

  if (visibleFeatures.length === 0) return null

  return (
    <div className="fixed top-[env(safe-area-inset-top,0px)] left-0 right-0 z-50 px-3 pt-1 pointer-events-none">
      <AnimatePresence>
        {visibleFeatures.slice(0, 2).map((feature, i) => (
          <FeaturePill
            key={feature.id}
            feature={feature}
            index={i}
            onDismiss={() => setDismissed((prev) => new Set([...prev, feature.id]))}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function FeaturePill({
  feature,
  index,
  onDismiss,
}: {
  feature: ActiveFeature
  index: number
  onDismiss: () => void
}) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const remaining = new Date(feature.expiresAt).getTime() - Date.now()
      if (remaining <= 0) {
        setTimeLeft('Expiré')
        return
      }
      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${seconds}s`)
      }
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [feature.expiresAt])

  const config = FEATURE_DISPLAY[feature.action] ?? {
    icon: Sparkles,
    label: feature.action,
    gradient: 'from-violet-500/90 to-purple-600/90',
    emoji: '✨',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'pointer-events-auto mb-1 flex items-center gap-2 rounded-2xl px-3 py-1.5',
        'bg-gradient-to-r backdrop-blur-xl border border-white/10 shadow-lg',
        config.gradient
      )}
    >
      <span className="text-sm">{config.emoji}</span>
      <span className="text-[11px] font-bold text-white truncate flex-1">
        {config.label}
      </span>
      <div className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5">
        <Timer className="size-3 text-white/80" />
        <span className="text-[10px] font-mono font-bold text-white tabular-nums">
          {timeLeft}
        </span>
      </div>
      <button
        onClick={onDismiss}
        className="flex items-center justify-center size-5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="size-3 text-white/70" />
      </button>
    </motion.div>
  )
}

const FEATURE_DISPLAY: Record<string, { icon: React.ElementType; label: string; gradient: string; emoji: string }> = {
  boost: { icon: Zap, label: 'Boost actif', gradient: 'from-amber-500/90 to-orange-600/90', emoji: '🚀' },
  ghost_mode: { icon: Ghost, label: 'Mode Fantôme', gradient: 'from-violet-500/90 to-purple-600/90', emoji: '👻' },
  see_visitors: { icon: Eye, label: 'Visiteurs visibles', gradient: 'from-cyan-500/90 to-blue-600/90', emoji: '👁️' },
  read_receipt: { icon: CheckCheck, label: 'Accusé de lecture', gradient: 'from-sky-500/90 to-blue-600/90', emoji: '✓' },
  filters_plus: { icon: Filter, label: 'Filtres Connect+', gradient: 'from-emerald-500/90 to-teal-600/90', emoji: '🔍' },
  theme_flame: { icon: Sparkles, label: 'Thème Flamme', gradient: 'from-red-500/90 to-orange-600/90', emoji: '🔥' },
  theme_star: { icon: Sparkles, label: 'Thème Étoile', gradient: 'from-amber-500/90 to-yellow-600/90', emoji: '⭐' },
  theme_aura: { icon: Sparkles, label: 'Thème Aura', gradient: 'from-violet-500/90 to-fuchsia-600/90', emoji: '✨' },
  custom_badge: { icon: Sparkles, label: 'Badge actif', gradient: 'from-rose-500/90 to-pink-600/90', emoji: '🏷️' },
  request_animation: { icon: Sparkles, label: 'Animation premium', gradient: 'from-indigo-500/90 to-violet-600/90', emoji: '💫' },
}
