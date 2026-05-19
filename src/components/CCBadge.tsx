'use client'

import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useConnectCoinStore } from '@/lib/connectcoin-store'
import { cn } from '@/lib/utils'

/**
 * CCBadge — Pastille discrète indiquant le coût en CC d'une action premium.
 * Spec: "Une pastille discrète indique le coût en CC avec un bouton d'achat en un tap"
 *
 * Usage: <CCBadge action="super_request" onSpend={handleSpend} />
 */
interface CCBadgeProps {
  /** The premium action key */
  action: string
  /** Cost in CC (override, defaults to ACTION_COSTS[action]) */
  cost?: number
  /** Called when user taps the badge — triggers 1-tap spend flow */
  onSpend?: (action: string, cost: number) => void
  /** Visual variant */
  variant?: 'pill' | 'dot' | 'inline'
  /** Extra class */
  className?: string
}

export default function CCBadge({ action, cost, onSpend, variant = 'pill', className }: CCBadgeProps) {
  const balance = useConnectCoinStore((s) => s.balance)
  const { ACTION_COSTS } = useConnectCoinStore.getState()
  const ccCost = cost ?? ACTION_COSTS[action as keyof typeof ACTION_COSTS] ?? 1
  const canAfford = balance >= ccCost

  if (variant === 'dot') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          onSpend?.(action, ccCost)
        }}
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold transition-all',
          canAfford
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25'
            : 'bg-muted/50 text-muted-foreground/50 border border-border/20',
          className
        )}
      >
        <Coins className="size-2.5" />
        {ccCost}
      </motion.button>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={cn(
        'inline-flex items-center gap-0.5 text-[10px] font-semibold',
        canAfford ? 'text-amber-400' : 'text-muted-foreground/50',
        className
      )}>
        <Coins className="size-3" />
        {ccCost} CC
      </span>
    )
  }

  // Default: pill variant — discrete but tappable
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={(e) => {
        e.stopPropagation()
        onSpend?.(action, ccCost)
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all',
        canAfford
          ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 cursor-pointer'
          : 'bg-muted/30 border-border/15 text-muted-foreground/40 cursor-not-allowed',
        className
      )}
    >
      <Coins className="size-3" />
      <span>{ccCost}</span>
      <span className="text-[8px] font-medium opacity-60">CC</span>
    </motion.button>
  )
}
