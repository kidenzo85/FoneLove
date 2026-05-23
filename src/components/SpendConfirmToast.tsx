'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Check, AlertTriangle, ShoppingCart } from 'lucide-react'
import { useConnectCoinStore, ACTION_LABELS, ACTION_COSTS } from '@/lib/connectcoin-store'
import { useCurrencyStore } from '@/lib/currency-store'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * SpendConfirmToast — Micro-feedback non-intrusif pour confirmer une dépense CC.
 *
 * UX Spec compliance:
 * - "Jamais de modale intrusive" → Bottom toast, not modal
 * - "Micro-feedback visuel (icône + nombre en surbrillance) confirme l'action
 *   et affiche le nouveau solde, renforçant le sentiment de contrôle et de transparence"
 * - "Achat en un tap" → Single confirm button
 * - "Pas de bannières clignotantes, pas de comptes à rebours manipulateurs" → Clean, calm design
 */
export default function SpendConfirmToast() {
  const { showSpendConfirm, setShowSpendConfirm, balance, setShowCreditStore } = useConnectCoinStore()
  const { formatCCEquivalent } = useCurrencyStore()
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newBalance, setNewBalance] = useState<number | null>(null)
  const [spentAmount, setSpentAmount] = useState<number>(0)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (showSpendConfirm) {
      setProcessing(false)
      setSuccess(false)
      setNewBalance(null)
      setSpentAmount(0)
    }
  }, [showSpendConfirm])

  const handleConfirm = useCallback(async () => {
    if (!showSpendConfirm || processing) return
    setProcessing(true)
    try {
      const result = await (showSpendConfirm.onConfirm as () => any)()
      // Only show success if the spend actually succeeded
      if (result === false) {
        setProcessing(false)
        return
      }
      setSuccess(true)
      setSpentAmount(showSpendConfirm.cost)
      // Fetch the new balance to display
      const newBal = useConnectCoinStore.getState().balance
      setNewBalance(newBal)
      // Auto-dismiss after 1.5s — quick feedback, no lingering
      setTimeout(() => {
        setSuccess(false)
        setShowSpendConfirm(null)
      }, 1500)
    } catch {
      setProcessing(false)
    }
  }, [showSpendConfirm, processing, setShowSpendConfirm])

  if (!showSpendConfirm) return null

  const { action, cost } = showSpendConfirm
  const label = ACTION_LABELS[action]
  const remaining = balance - cost
  const insufficient = remaining < 0
  const localEquiv = formatCCEquivalent(cost)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm"
      >
        <AnimatePresence mode="wait">
          {success ? (
            /* ─── Success micro-feedback ─── */
            /* UX Spec: "icône + nombre en surbrillance confirme l'action et affiche le nouveau solde" */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="rounded-2xl border border-green-500/30 bg-green-500/10 backdrop-blur-xl shadow-lg shadow-green-500/10 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Icon with satisfying spring animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20"
                >
                  <Check className="size-5 text-green-400" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-green-400">{label ? label.name : t('spendConfirm.actionCompleted')} !</p>
                  {/* New balance — highlighted per spec */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Coins className="size-3.5 text-amber-400" />
                    <motion.span
                      key={newBalance ?? balance}
                      initial={{ scale: 1.3, color: '#4ade80' }}
                      animate={{ scale: 1, color: '#fbbf24' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="text-sm font-black text-amber-400 tabular-nums"
                    >
                      {newBalance ?? balance} CC
                    </motion.span>
                    <span className="text-[9px] text-muted-foreground">{t('spendConfirm.remainingBalance')}</span>
                  </div>
                </div>

                {/* Satisfying animation: spent amount highlighted — spec: "nombre en surbrillance" */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-right"
                >
                  <motion.span
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-lg font-black text-rose-400"
                  >
                    −{spentAmount}
                  </motion.span>
                  <p className="text-[9px] text-muted-foreground">CC</p>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* ─── Confirm toast — non-intrusive per spec ─── */
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden",
                insufficient
                  ? "border-red-500/30 bg-card/95 shadow-red-500/5"
                  : "border-border/40 bg-card/95 shadow-amber-500/5"
              )}
            >
              {/* Header: action info + cost — discrete pill per spec */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-2xl">{label?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{label ? label.name : ''}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{label ? label.description : ''}</p>
                </div>
                {/* Cost pill — discrete indicator per spec */}
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1">
                  <Coins className="size-3.5 text-amber-400" />
                  <span className="text-sm font-black text-amber-400 tabular-nums">{cost}</span>
                  <span className="text-[9px] font-medium text-amber-400/60">CC</span>
                </div>
              </div>

              {/* Insufficient balance warning — no manipulative countdowns per spec */}
              {insufficient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 bg-red-500/5 border-t border-red-500/10 px-4 py-2"
                >
                  <AlertTriangle className="size-3.5 text-red-400 shrink-0" />
                  <span className="text-[11px] text-red-400 flex-1">
                    {t('spendConfirm.insufficientBalance', { amount: Math.abs(remaining) })}
                  </span>
                  <button
                    onClick={() => {
                      setShowSpendConfirm(null)
                      setShowCreditStore(true, 'packs')
                    }}
                    className="rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-400 hover:bg-amber-500/25 transition-colors"
                  >
                    {t('spendConfirm.buy')}
                  </button>
                </motion.div>
              )}

              {/* Action bar: 1-tap confirm per spec */}
              <div className="flex items-center gap-2 border-t border-border/20 px-4 py-2.5">
                {/* Balance preview — shows remaining balance after spend */}
                <div className="flex-1 flex items-center gap-1.5">
                  <Coins className="size-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    {t('spendConfirm.remains')} <span className={cn(
                      'font-bold tabular-nums',
                      insufficient ? 'text-red-400' : 'text-amber-400'
                    )}>
                      {Math.max(0, remaining)} CC
                    </span>
                  </span>
                  <span className="text-[9px] text-muted-foreground/50">
                    ≈ {localEquiv}
                  </span>
                </div>

                {/* Cancel */}
                <button
                  onClick={() => setShowSpendConfirm(null)}
                  disabled={processing}
                  className="rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  {t('common.cancel')}
                </button>

                {/* Confirm — 1-tap purchase per spec */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={insufficient || processing}
                  className={cn(
                    'rounded-xl px-4 py-1.5 text-xs font-bold transition-all',
                    insufficient
                      ? 'bg-muted text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:shadow-md hover:shadow-amber-500/20'
                  )}
                >
                  {processing ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      {t('common.confirming')}
                    </motion.span>
                  ) : (
                    t('spendConfirm.confirmCost', { cost })
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
