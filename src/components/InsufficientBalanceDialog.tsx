'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coins, AlertTriangle, ShoppingCart, ChevronRight,
  Sparkles, ArrowRight, Check, X, Wallet, TrendingUp
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  useConnectCoinStore,
  ACTION_LABELS,
  type PremiumAction,
  type PackType,
} from '@/lib/connectcoin-store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { useCurrencyStore, type PackLocalPrice } from '@/lib/currency-store'

// Find the cheapest pack that covers the missing amount
function findBestPack(missingCC: number, packPrices: PackLocalPrice[]): PackLocalPrice | null {
  if (!packPrices || packPrices.length === 0) return null
  const sorted = [...packPrices].sort((a, b) => a.rawLocalPrice - b.rawLocalPrice)
  return sorted.find(p => (p.cc + p.bonusCC) >= missingCC) || sorted[sorted.length - 1]
}

// Falling coin particles
function FallingCoins({ active }: { active: boolean }) {
  if (!active) return null
  const coins = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1,
    size: 14 + Math.random() * 10,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {coins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ opacity: 0, y: -20, x: `${coin.x}%`, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 80, 160], rotate: coin.rotation + 180 }}
          transition={{
            duration: coin.duration,
            delay: coin.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 2,
          }}
          className="absolute text-amber-400/30"
          style={{ fontSize: coin.size, left: `${coin.x}%`, top: 0 }}
        >
          🪙
        </motion.div>
      ))}
    </div>
  )
}

// Animated deficit counter
function AnimatedDeficit({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const duration = 800
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return <span className="tabular-nums">{display}</span>
}

export default function InsufficientBalanceDialog() {
  const { t } = useT()
  const { packPrices } = useCurrencyStore()
  const {
    showInsufficientBalance,
    setShowInsufficientBalance,
    balance,
    setShowCreditStore,
    setSelectedPackType,
  } = useConnectCoinStore()

  const [phase, setPhase] = useState<'warning' | 'confirm' | 'navigating'>('warning')
  const [selectedStoreTab, setSelectedStoreTab] = useState<PackType | 'packs' | null>(null)

  // Reset phase when dialog opens
  useEffect(() => {
    if (showInsufficientBalance) {
      setPhase('warning')
      setSelectedStoreTab(null)
    }
  }, [showInsufficientBalance])

  // Effect to handle the actual navigation after animation
  useEffect(() => {
    if (phase === 'navigating') {
      const timer = setTimeout(() => {
        setShowInsufficientBalance(null)
        setShowCreditStore(true, selectedStoreTab || 'packs')
        setPhase('warning')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [phase, selectedStoreTab, setShowInsufficientBalance, setShowCreditStore])

  // Early return AFTER all hooks
  if (!showInsufficientBalance) return null

  const { action, cost } = showInsufficientBalance
  const label = ACTION_LABELS[action]
  const missing = cost - balance
  const suggestedPack = findBestPack(missing, packPrices)

  const handleGoToStore = (packType?: PackType | 'packs') => {
    setPhase('navigating')
    setSelectedStoreTab(packType ?? 'packs')
  }

  const handleConfirmNavigation = () => {
    setPhase('navigating')
    setSelectedStoreTab('packs')
  }

  const handleCancel = () => {
    setShowInsufficientBalance(null)
  }

  return (
    <Dialog open={!!showInsufficientBalance} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">{t('insufficient.title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('insufficient.subtitle')}</DialogDescription>
        <AnimatePresence mode="wait">
          {phase === 'navigating' ? (
            <motion.div
              key="navigating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 relative"
            >
              <FallingCoins active />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-4xl mb-4 relative z-10"
              >
                🛒
              </motion.div>
              <p className="text-sm font-medium text-amber-400 relative z-10">{t('insufficient.redirecting')}</p>
              <motion.div
                className="mt-2 h-1 w-16 rounded-full bg-amber-500/30 overflow-hidden relative z-10"
              >
                <motion.div
                  className="h-full bg-amber-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </motion.div>
            </motion.div>
          ) : phase === 'confirm' ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-5 space-y-4"
            >
              {/* Confirmation header */}
              <div className="flex flex-col items-center text-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 border-2 border-amber-500/30"
                >
                  <ShoppingCart className="size-7 text-amber-400" />
                </motion.div>
                <h3 className="text-base font-bold">{t('insufficient.confirmTitle')}</h3>
                <p className="text-xs text-muted-foreground">{t('insufficient.confirmSubtitle')}</p>
              </div>

              {/* Pack recommendation */}
              {suggestedPack && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={cn(
                    'rounded-xl border p-3 overflow-hidden relative',
                    'bg-gradient-to-r',
                    suggestedPack.gradient,
                    'border-amber-500/30 ring-1 ring-amber-500/10'
                  )}
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 opacity-15">
                    <motion.div
                      className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                      animate={{ x: ['0%', '400%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                    />
                  </div>

                  <div className="relative flex items-center gap-3">
                    <span className="text-2xl">{suggestedPack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{suggestedPack.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-amber-400">{suggestedPack.cc + suggestedPack.bonusCC}</span>
                        <span className="text-[10px] text-amber-400/70 font-medium">CC</span>
                        {suggestedPack.bonusCC > 0 && (
                          <span className="inline-flex items-center rounded-full bg-green-500/20 text-green-400 text-[8px] font-semibold px-1.5 py-0.5">
                            +{suggestedPack.bonusCC}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold">{suggestedPack.priceFormatted}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl text-muted-foreground"
                  onClick={() => setPhase('warning')}
                >
                  {t('insufficient.back')}
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 gap-1.5"
                  onClick={() => handleGoToStore(suggestedPack?.type)}
                >
                  <ShoppingCart className="size-4" />
                  {t('insufficient.goToStore')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="relative"
            >
              <FallingCoins active />

              {/* Header with animated warning */}
              <div className="relative px-5 pt-5 pb-4 bg-gradient-to-b from-red-500/10 to-transparent z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border-2 border-red-500/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <AlertTriangle className="size-8 text-red-400" />
                  </motion.div>
                </motion.div>

                <div className="text-center p-0 space-y-1">
                  <h3 className="text-lg font-bold">{t('insufficient.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('insufficient.subtitle')}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4 relative z-10">
                {/* Action info card with animated deficit */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl bg-background/60 border border-border/30 p-3 space-y-2.5"
                >
                  {/* Requested action */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{label?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{label?.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{label?.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-1">
                      <Coins className="size-3.5 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">{cost}</span>
                    </div>
                  </div>

                  {/* Balance breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Wallet className="size-3" />
                        {t('insufficient.yourBalance')}
                      </span>
                      <span className="font-medium">{balance} CC</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{t('insufficient.actionCost')}</span>
                      <span className="font-medium text-red-400">-{cost} CC</span>
                    </div>
                    <div className="h-px bg-border/30" />
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-between items-center"
                    >
                      <span className="font-semibold text-red-400 text-xs">{t('insufficient.missing')}</span>
                      <div className="flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/20 px-2 py-0.5">
                        <Coins className="size-3 text-red-400" />
                        <span className="text-sm font-bold text-red-400">
                          <AnimatedDeficit value={missing} />
                        </span>
                        <span className="text-[9px] font-medium text-red-400/70">CC</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Visual progress bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                      <span>0</span>
                      <span>{cost} CC</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((balance / cost) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          balance === 0
                            ? 'bg-red-500/30'
                            : 'bg-gradient-to-r from-amber-500 to-red-400'
                        )}
                      />
                      {/* Missing portion indicator */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute right-0 top-0 h-full rounded-r-full bg-red-500/20 border-r-2 border-red-400 border-dashed"
                        style={{ width: `${Math.max(0, ((cost - balance) / cost) * 100)}%`, left: `${(balance / cost) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-red-400/80 mt-1 text-center">
                      {t('insufficient.needMore', { n: missing })}
                    </p>
                  </div>
                </motion.div>

                {/* Suggested pack */}
                {suggestedPack && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-2"
                  >
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="size-3 text-amber-400" />
                      {t('insufficient.suggested')}
                    </p>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGoToStore(suggestedPack.type)}
                      className={cn(
                        'w-full relative rounded-xl border p-3 text-left transition-all overflow-hidden',
                        'bg-gradient-to-r',
                        suggestedPack.gradient,
                        'border-amber-500/30 hover:border-amber-500/50 ring-1 ring-amber-500/10'
                      )}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 opacity-20">
                        <motion.div
                          className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                          animate={{ x: ['0%', '400%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                        />
                      </div>

                      <div className="relative flex items-center gap-3">
                        <span className="text-2xl">{suggestedPack.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold">{suggestedPack.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-amber-400">{suggestedPack.cc + suggestedPack.bonusCC}</span>
                            <span className="text-[10px] text-amber-400/70 font-medium">CC</span>
                            {suggestedPack.bonusCC > 0 && (
                              <span className="inline-flex items-center rounded-full bg-green-500/20 text-green-400 text-[8px] font-semibold px-1.5 py-0.5">
                                +{suggestedPack.bonusCC}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold">{suggestedPack.priceFormatted}</p>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <span className="text-[9px] font-medium">{t('insufficient.buyNow')}</span>
                            <ArrowRight className="size-3" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                )}

                {/* See all packs + confirm navigation button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Button
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 gap-2 shadow-lg shadow-amber-500/20"
                    onClick={handleConfirmNavigation}
                  >
                    <TrendingUp className="size-4" />
                    {t('insufficient.goToStore')}
                    <ChevronRight className="size-3.5 ml-auto" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 gap-2"
                    onClick={() => handleGoToStore()}
                  >
                    <ShoppingCart className="size-4" />
                    {t('insufficient.seeAllPacks')}
                    <ChevronRight className="size-3.5 ml-auto" />
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full rounded-xl text-muted-foreground"
                    onClick={handleCancel}
                  >
                    {t('insufficient.cancel')}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
