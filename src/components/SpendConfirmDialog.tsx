'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Check, AlertTriangle, ShoppingCart } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { useConnectCoinStore, ACTION_LABELS, ACTION_COSTS } from '@/lib/connectcoin-store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

export default function SpendConfirmDialog() {
  const { t } = useT()
  const { showSpendConfirm, setShowSpendConfirm, balance, setShowCreditStore, setShowInsufficientBalance } = useConnectCoinStore()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Reset processing/success state whenever the dialog opens with a new action
  // This prevents stale state from blocking subsequent actions
  const currentAction = showSpendConfirm?.action ?? null
  const isOpen = !!showSpendConfirm

  // We need this effect to run before the early return so hooks stay consistent
  // When dialog opens fresh, reset states
  if (!isOpen && (processing || success)) {
    // Sync reset when dialog closes - avoids stale state on next open
    setProcessing(false)
    setSuccess(false)
  }

  if (!showSpendConfirm) return null

  const { action, cost, onConfirm } = showSpendConfirm
  const label = ACTION_LABELS[action]
  const remaining = balance - cost
  const insufficient = remaining < 0

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      await onConfirm()
      // Small delay to let the store balance refresh from fetchBalance
      await new Promise(r => setTimeout(r, 300))
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setProcessing(false)
        setShowSpendConfirm(null)
      }, 2000)
    } catch {
      // Spend failed — reset to allow retry
      setProcessing(false)
    }
  }

  const handleClose = () => {
    if (!processing) {
      setProcessing(false)
      setSuccess(false)
      setShowSpendConfirm(null)
    }
  }

  return (
    <Dialog open={!!showSpendConfirm} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogTitle className="sr-only">{label?.name || 'Confirmation'}</DialogTitle>
        <DialogDescription className="sr-only">{label?.description || ''}</DialogDescription>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-8 gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
              >
                <Check className="size-8 text-green-400" />
              </motion.div>
              <h3 className="text-lg font-bold text-green-400">{label?.name} {t('spend.activated')}</h3>
              <p className="text-sm text-muted-foreground text-center px-4">
                {label?.description}
              </p>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 mt-1">
                <Coins className="size-3.5 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{balance} CC</span>
                <span className="text-[10px] text-amber-400/60">{t('spend.remainingShort')}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col gap-1">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="text-2xl">{label?.emoji}</span>
                  <span>{label?.name}</span>
                </h3>
                <p className="text-sm text-muted-foreground">{label?.description}</p>
              </div>

              <div className="mt-4 space-y-4">
                {/* Cost breakdown */}
                <div className="rounded-xl bg-background/50 p-4 space-y-3 border border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('spend.cost')}</span>
                    <div className="flex items-center gap-1.5">
                      <Coins className="size-4 text-amber-400" />
                      <span className="font-bold text-amber-400">{cost} CC</span>
                    </div>
                  </div>
                  <div className="h-px bg-border/30" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('spend.currentBalance')}</span>
                    <div className="flex items-center gap-1.5">
                      <Coins className="size-3.5 text-amber-400" />
                      <span className="text-sm font-medium">{balance} CC</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('spend.afterBalance')}</span>
                    <div className="flex items-center gap-1.5">
                      <Coins className="size-3.5" />
                      <span
                        className={cn(
                          'text-sm font-bold',
                          insufficient ? 'text-red-400' : 'text-green-400'
                        )}
                      >
                        {Math.max(0, remaining)} CC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Insufficient balance warning */}
                {insufficient && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3"
                  >
                    <AlertTriangle className="size-4 text-red-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-400">{t('spend.insufficient')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('spend.missing', { n: Math.abs(remaining) })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="border-amber-500/30 bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600 text-xs font-semibold"
                      onClick={() => {
                        setShowSpendConfirm(null)
                        // Open the insufficient balance dialog which will guide to purchase
                        if (showSpendConfirm) {
                          setShowInsufficientBalance({ action: showSpendConfirm.action, cost: showSpendConfirm.cost })
                        }
                      }}
                    >
                      <ShoppingCart className="mr-1 size-3" />
                      {t('spend.buy')}
                    </Button>
                  </motion.div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-xl"
                    onClick={handleClose}
                    disabled={processing}
                  >
                    {t('store.cancel')}
                  </Button>
                  <Button
                    className={cn(
                      'flex-1 rounded-xl font-semibold',
                      insufficient
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600'
                    )}
                    onClick={handleConfirm}
                    disabled={insufficient || processing}
                  >
                    {processing ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        {t('store.processing')}
                      </motion.span>
                    ) : (
                      <>
                        <Coins className="mr-1.5 size-4" />
                        {t('spend.confirm', { n: cost })}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
