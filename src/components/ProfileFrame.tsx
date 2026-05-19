'use client'

import { motion } from 'framer-motion'
import { usePremiumFeatures } from '@/lib/premium-features-store'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

type ThemeType = 'theme_flame' | 'theme_star' | 'theme_aura' | null

interface ProfileFrameProps {
  userId: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Override — pass the active cosmetic type directly (for other users' profiles) */
  activeTheme?: ThemeType
  /** Aura color override */
  auraColor?: string
  /** Custom badge text */
  badgeText?: string | null
}

/**
 * Wraps a profile photo/avatar with the user's active cosmetic theme.
 * Checks the premium features store for the current user,
 * or accepts an override for displaying other users' themes.
 */
export default function ProfileFrame({
  userId,
  children,
  size = 'md',
  className,
  activeTheme: themeProp,
  auraColor: auraColorProp,
  badgeText,
}: ProfileFrameProps) {
  const { getActiveFeature } = usePremiumFeatures()

  // Determine active theme (self or override)
  const activeTheme = useMemo<ThemeType>(() => {
    if (themeProp !== undefined) return themeProp
    if (getActiveFeature('theme_aura')) return 'theme_aura'
    if (getActiveFeature('theme_star')) return 'theme_star'
    if (getActiveFeature('theme_flame')) return 'theme_flame'
    return null
  }, [themeProp, getActiveFeature])

  // Get aura color from feature metadata
  const auraColor = useMemo(() => {
    if (auraColorProp) return auraColorProp
    const auraFeature = getActiveFeature('theme_aura')
    if (auraFeature?.metadata && typeof auraFeature.metadata === 'object') {
      return (auraFeature.metadata as Record<string, string>).colorChoice ?? '#a855f7'
    }
    return '#a855f7'
  }, [auraColorProp, getActiveFeature])

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }

  const ringSize = {
    sm: 3,
    md: 4,
    lg: 5,
  }

  if (!activeTheme) {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        {children}
        {badgeText && <BadgeOverlay text={badgeText} size={size} />}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Theme ring */}
      {activeTheme === 'theme_flame' && (
        <FlameRing size={size} ringSize={ringSize[size]}>
          <div className={cn(sizeClasses[size], 'relative z-10')}>
            {children}
          </div>
        </FlameRing>
      )}

      {activeTheme === 'theme_star' && (
        <StarRing size={size} ringSize={ringSize[size]}>
          <div className={cn(sizeClasses[size], 'relative z-10')}>
            {children}
          </div>
        </StarRing>
      )}

      {activeTheme === 'theme_aura' && (
        <AuraRing size={size} ringSize={ringSize[size]} color={auraColor}>
          <div className={cn(sizeClasses[size], 'relative z-10')}>
            {children}
          </div>
        </AuraRing>
      )}

      {badgeText && <BadgeOverlay text={badgeText} size={size} />}
    </div>
  )
}

// ===== 🔥 FLAME RING =====
function FlameRing({ children, size, ringSize }: { children: React.ReactNode; size: string; ringSize: number }) {
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      delay: i * 0.15,
      duration: 0.8 + Math.random() * 0.6,
    })), 
  [])

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated gradient ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: -ringSize,
          background: 'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #ef4444)',
          filter: 'blur(1px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Fire particles */}
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const dist = size === 'lg' ? 42 : size === 'md' ? 30 : 22
        return (
          <motion.div
            key={p.id}
            className="absolute z-20 pointer-events-none text-[8px]"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [Math.cos(rad) * dist, Math.cos(rad) * (dist + 6), Math.cos(rad) * dist],
              y: [Math.sin(rad) * dist, Math.sin(rad) * (dist + 6) - 8, Math.sin(rad) * dist],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          >
            🔥
          </motion.div>
        )
      })}

      {/* Inner content */}
      <div className="relative z-10 rounded-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// ===== ⭐ STAR RING =====
function StarRing({ children, size, ringSize }: { children: React.ReactNode; size: string; ringSize: number }) {
  const stars = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      delay: i * 0.3,
      duration: 1.5 + Math.random() * 1,
    })),
  [])

  return (
    <div className="relative flex items-center justify-center">
      {/* Gold gradient ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: -ringSize,
          background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #d97706, #fbbf24)',
          filter: 'blur(0.5px)',
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Twinkling stars */}
      {stars.map((s) => {
        const rad = (s.angle * Math.PI) / 180
        const dist = size === 'lg' ? 44 : size === 'md' ? 32 : 24
        return (
          <motion.div
            key={s.id}
            className="absolute z-20 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              fontSize: size === 'lg' ? '10px' : '7px',
            }}
            animate={{
              x: Math.cos(rad) * dist - 4,
              y: Math.sin(rad) * dist - 4,
              opacity: [0, 1, 0.3, 1, 0],
              scale: [0.3, 1, 0.6, 1, 0.3],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ✨
          </motion.div>
        )
      })}

      <div className="relative z-10 rounded-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// ===== ✨ AURA RING =====
function AuraRing({ children, size, ringSize, color }: { children: React.ReactNode; size: string; ringSize: number; color: string }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing aura glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: -(ringSize + 2),
          background: color,
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Inner solid ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          inset: -ringSize,
          borderColor: color,
          boxShadow: `0 0 12px ${color}60, inset 0 0 8px ${color}30`,
        }}
        animate={{
          boxShadow: [
            `0 0 12px ${color}60, inset 0 0 8px ${color}30`,
            `0 0 20px ${color}80, inset 0 0 12px ${color}50`,
            `0 0 12px ${color}60, inset 0 0 8px ${color}30`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 rounded-full overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// ===== 🏷️ BADGE OVERLAY =====
function BadgeOverlay({ text, size }: { text: string; size: string }) {
  const fontSize = size === 'lg' ? '9px' : size === 'md' ? '8px' : '7px'
  const py = size === 'lg' ? 'py-0.5' : 'py-px'

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'absolute -bottom-1 left-1/2 -translate-x-1/2 z-30',
        'whitespace-nowrap rounded-full px-1.5',
        py,
        'bg-gradient-to-r from-amber-500 to-yellow-400',
        'text-black font-bold shadow-md shadow-amber-500/30',
        'border border-amber-300/50'
      )}
      style={{ fontSize }}
    >
      {text}
    </motion.div>
  )
}

// ===== HELPER: Get user's active cosmetics from API response =====
export function extractCosmeticTheme(
  cosmetics: Array<{ type: string; isActive: boolean; customText?: string | null; colorChoice?: string | null }>
): {
  theme: ThemeType
  auraColor: string | null
  badgeText: string | null
} {
  const activeCosmetics = cosmetics.filter((c) => c.isActive)

  let theme: ThemeType = null
  let auraColor: string | null = null
  let badgeText: string | null = null

  for (const c of activeCosmetics) {
    if (c.type === 'theme_aura') {
      theme = 'theme_aura'
      auraColor = c.colorChoice ?? '#a855f7'
    } else if (c.type === 'theme_star' && !theme) {
      theme = 'theme_star'
    } else if (c.type === 'theme_flame' && !theme) {
      theme = 'theme_flame'
    } else if (c.type === 'custom_badge') {
      badgeText = c.customText ?? null
    }
  }

  return { theme, auraColor, badgeText }
}
