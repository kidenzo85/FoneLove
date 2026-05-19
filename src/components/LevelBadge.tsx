'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { type LevelInfo } from '@/lib/connectcoin-store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: LevelInfo | null
  compact?: boolean
}

const LEVEL_CONFIG: Record<string, { emoji: string; color: string; glowColor: string; bgGradient: string; animClass: string }> = {
  Bronze: {
    emoji: '🥉',
    color: 'text-amber-700',
    glowColor: 'shadow-amber-700/20',
    bgGradient: 'from-amber-900/30 to-amber-800/20',
    animClass: '',
  },
  Argent: {
    emoji: '🥈',
    color: 'text-gray-300',
    glowColor: 'shadow-gray-400/20',
    bgGradient: 'from-gray-500/20 to-gray-400/15',
    animClass: '',
  },
  Or: {
    emoji: '🥇',
    color: 'text-amber-400',
    glowColor: 'shadow-amber-400/30',
    bgGradient: 'from-amber-500/25 to-yellow-500/20',
    animClass: 'animate-shimmer',
  },
  Platine: {
    emoji: '💎',
    color: 'text-cyan-300',
    glowColor: 'shadow-cyan-400/30',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    animClass: '',
  },
  Diamant: {
    emoji: '💠',
    color: 'text-violet-300',
    glowColor: 'shadow-violet-400/30',
    bgGradient: 'from-violet-500/20 to-purple-500/20',
    animClass: 'animate-sparkle',
  },
}

// Map from levelName to translation key
const LEVEL_NAME_KEYS: Record<string, string> = {
  Bronze: 'level.bronze',
  Argent: 'level.silver',
  Or: 'level.gold',
  Platine: 'level.platinum',
  Diamant: 'level.diamond',
}

export default function LevelBadge({ level, compact = false }: LevelBadgeProps) {
  const { t } = useT()

  if (!level) return null

  const config = LEVEL_CONFIG[level.levelName] || LEVEL_CONFIG.Bronze
  const levelNameKey = LEVEL_NAME_KEYS[level.levelName] || 'level.bronze'

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 border',
          `bg-gradient-to-r ${config.bgGradient}`,
          'border-border/30',
          config.glowColor && `shadow-lg ${config.glowColor}`
        )}
      >
        <span className={cn('text-sm', config.animClass)}>{config.emoji}</span>
        <span className={cn('text-xs font-semibold', config.color)}>{t(levelNameKey)}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border bg-card/80 p-4 backdrop-blur-sm',
        'border-border/30',
        config.glowColor && `shadow-lg ${config.glowColor}`
      )}
    >
      {/* Level header */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            `bg-gradient-to-br ${config.bgGradient}`,
            'border border-border/20'
          )}
          animate={
            level.levelName === 'Diamant'
              ? { rotate: [0, 5, -5, 0] }
              : level.levelName === 'Or'
                ? { scale: [1, 1.05, 1] }
                : {}
          }
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <span className={cn('text-2xl', config.animClass)}>{config.emoji}</span>
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn('font-bold', config.color)}>{t(levelNameKey)}</h4>
            <span className="text-xs text-muted-foreground">{t('level.levelN', { n: level.level + 1 })}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {level.nextLevelAt
              ? t('level.spentOf', { spent: level.totalSpent, next: level.nextLevelAt })
              : `${level.totalSpent} CC`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {level.nextLevelAt && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground">{t('level.nextLevel')}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{level.progress}%</span>
          </div>
          <Progress
            value={level.progress}
            className="h-1.5 bg-muted/50"
          />
        </div>
      )}

      {/* Benefits */}
      {level.benefits.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('level.benefits')}</span>
          {level.benefits.slice(0, 3).map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1.5 text-xs"
            >
              <span className="text-amber-400 text-[10px]">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </motion.div>
          ))}
          {level.benefits.length > 3 && (
            <p className="text-[10px] text-muted-foreground ml-4">
              {t('level.moreBenefits', { n: level.benefits.length - 3 })}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
