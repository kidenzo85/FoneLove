'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import { useConnectCoinStore, ACTION_COSTS } from '@/lib/connectcoin-store'

interface BoostButtonProps {
  used: boolean
  onBoost: () => void
}

export default function BoostButton({ used, onBoost }: BoostButtonProps) {
  const { t } = useT()
  const [boosting, setBoosting] = useState(false)
  const { balance, trySpendAction, freeBoostClaimed, setShowCreditStore, setShowInsufficientBalance } = useConnectCoinStore()

  const boostCost = ACTION_COSTS.boost
  const canAfford = balance >= boostCost
  const isFreeAvailable = !used && !freeBoostClaimed

  const handleBoost = () => {
    if (used) return

    if (isFreeAvailable) {
      // Free daily boost — no CC cost
      setBoosting(true)
      onBoost()
      setTimeout(() => setBoosting(false), 2000)
    } else {
      // Premium boost — needs CC
      trySpendAction('boost', async () => {
        setBoosting(true)
        onBoost()
        setTimeout(() => setBoosting(false), 2000)
      })
    }
  }

  return (
    <motion.div whileTap={{ scale: used ? 1 : 0.9 }}>
      <Button
        variant="outline"
        className={cn(
          'rounded-xl gap-1.5 transition-all text-xs sm:text-sm',
          used
            ? 'opacity-50 cursor-not-allowed'
            : isFreeAvailable
              ? 'hover:border-primary hover:text-primary animate-glow-pulse'
              : canAfford
                ? 'hover:border-amber-500 hover:text-amber-400'
                : 'hover:border-red-400/50 hover:text-red-400',
          boosting && 'border-primary text-primary bg-primary/5'
        )}
        onClick={handleBoost}
        disabled={used}
      >
        <AnimatePresence mode="wait">
          {boosting ? (
            <motion.div
              key="boosting"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: [1, 1.5, 1], rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Zap className="size-4 text-primary fill-primary" />
            </motion.div>
          ) : used ? (
            <motion.div
              key="used"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Check className="size-4 text-muted-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="available"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Zap className="size-4" />
            </motion.div>
          )}
        </AnimatePresence>
        {used ? t('boost.used') : isFreeAvailable ? t('boost.available') : (
          <span className="flex items-center gap-1">
            {t('boost.premium')}
            <Coins className="size-3 text-amber-400" />
            <span className="text-amber-400 font-bold">{boostCost}</span>
          </span>
        )}
      </Button>
    </motion.div>
  )
}
