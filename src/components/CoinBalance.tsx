'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useConnectCoinStore } from '@/lib/connectcoin-store'
import { cn } from '@/lib/utils'

interface CoinBalanceProps {
  onClick?: () => void
  compact?: boolean
}

export default function CoinBalance({ onClick, compact = false }: CoinBalanceProps) {
  const { balance, dailyFreeClaimed, setShowCreditStore } = useConnectCoinStore()
  const [displayBalance, setDisplayBalance] = useState(balance)
  const springValue = useSpring(balance, { stiffness: 300, damping: 30 })
  const rounded = useTransform(springValue, (v) => Math.round(v))

  // Track direction of balance change for visual feedback
  const [justChanged, setJustChanged] = useState<'up' | 'down' | null>(null)
  const [prevBalance, setPrevBalance] = useState(balance)

  // Update spring on balance change
  useEffect(() => {
    springValue.set(balance)
  }, [balance, springValue])

  // Subscribe to spring value changes for display
  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplayBalance(v)
    })
    return unsubscribe
  }, [rounded])

  // Detect balance direction change with deferred state updates
  useEffect(() => {
    if (balance !== prevBalance) {
      const direction = balance > prevBalance ? 'up' : 'down'
      // Defer state updates to avoid synchronous setState in effect
      const timer1 = setTimeout(() => {
        setPrevBalance(balance)
        setJustChanged(direction)
      }, 0)
      const timer2 = setTimeout(() => setJustChanged(null), 1200)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [balance, prevBalance])

  const hasFreeToClaim = !dailyFreeClaimed
  const hasGlow = balance > 50

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
    } else {
      setShowCreditStore(true)
    }
  }, [onClick, setShowCreditStore])

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'relative flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all',
        compact
          ? 'px-2.5 py-1 text-xs'
          : 'px-3 py-1.5 text-sm',
        hasGlow
          ? 'bg-amber-500/15 border-amber-500/30 shadow-lg shadow-amber-500/10'
          : 'bg-card/80 border-border/50',
        hasFreeToClaim && 'animate-pulse-glow'
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Coin icon */}
      <motion.div
        animate={justChanged === 'up' ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : justChanged === 'down' ? { scale: [1, 0.85, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Coins
          className={cn(
            compact ? 'size-3.5' : 'size-4',
            hasGlow ? 'text-amber-400' : 'text-amber-500'
          )}
        />
        {hasGlow && (
          <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-sm" />
        )}
      </motion.div>

      {/* Balance number */}
      <span className={cn(
        'font-bold tabular-nums',
        compact ? 'text-xs' : 'text-sm',
        justChanged === 'up' && 'text-green-400',
        justChanged === 'down' && 'text-red-400',
        !justChanged && (hasGlow ? 'text-amber-300' : 'text-amber-400')
      )}>
        {displayBalance}
      </span>

      {/* CC label */}
      <span className={cn(
        'font-medium text-muted-foreground',
        compact ? 'text-[9px]' : 'text-[10px]'
      )}>
        CC
      </span>

      {/* Free CC indicator dot */}
      {hasFreeToClaim && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-green-500"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span className="text-[6px] font-bold text-white">!</span>
        </motion.div>
      )}
    </motion.button>
  )
}
