'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

interface StreakCounterProps {
  days: number
}

export default function StreakCounter({ days }: StreakCounterProps) {
  const { t } = useT()

  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 px-3 py-2 cursor-pointer"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={
          days >= 7
            ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
            : days >= 3
            ? { scale: [1, 1.15, 1] }
            : {}
        }
        transition={{ repeat: Infinity, duration: days >= 7 ? 0.8 : 1.5 }}
      >
        <Flame className={cn(
          'size-5',
          days >= 7 ? 'text-orange-500' : days >= 3 ? 'text-amber-500' : 'text-muted-foreground'
        )} />
      </motion.div>
      <div>
        <span className="text-lg font-bold text-foreground">{days}</span>
        <span className="text-xs text-muted-foreground ml-1">{t('streakCounter.days')}</span>
      </div>
      {days >= 7 && (
        <motion.span
          className="text-xs text-orange-500 font-medium"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {t('streakCounter.onFire')}
        </motion.span>
      )}
      {days >= 3 && days < 7 && (
        <span className="text-xs text-amber-500">{t('streakCounter.almostFire')}</span>
      )}
    </motion.div>
  )
}
