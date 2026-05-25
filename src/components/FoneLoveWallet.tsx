'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, ArrowDownToLine, ArrowUpFromLine, History, Sparkles, CheckCircle2, Minus, Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useFoneLoveStore } from '@/lib/fonelove-store'
import { useAppStore } from '@/lib/store'
import { useCurrencyStore } from '@/lib/currency-store'
import { cn } from '@/lib/utils'

const RECHARGE_PACKS = [
  { amount: 5, label: '5 FoneLove', icon: '🌹', gradient: 'from-pink-500/15 to-rose-500/15' },
  { amount: 10, label: '10 FoneLove', icon: '💝', gradient: 'from-rose-500/15 to-pink-500/15' },
  { amount: 20, label: '20 FoneLove', icon: '💘', gradient: 'from-rose-500/15 to-pink-500/15', popular: true },
  { amount: 50, label: '50 FoneLove', icon: '💍', gradient: 'from-amber-500/15 to-yellow-500/15', best: true },
]

export default function FoneLoveWallet() {
  const { showWallet, setShowWallet, sendBalance, receivedBalance, totalSent, totalReceived, totalWithdrawn,
    config, transactions, gifts, orders, fetchWallet, fetchConfig, fetchHistory, rechargeWallet, requestWithdraw } = useFoneLoveStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const formatLocalPrice = useCurrencyStore((s) => s.formatLocalPrice)

  const [tab, setTab] = useState<'balance' | 'recharge' | 'withdraw' | 'history'>('balance')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState(10)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (showWallet && currentUser && !loaded) {
      Promise.all([
        fetchWallet(currentUser.id),
        fetchConfig(),
        fetchHistory(currentUser.id),
      ]).then(() => setLoaded(true))
    }
  }, [showWallet, currentUser, loaded])

  const handleRecharge = async (amount: number) => {
    if (!currentUser || processing) return
    setProcessing(true)
    // FoneLove can only be purchased with real money (CoolPay)
    const ok = await rechargeWallet(currentUser.id, amount)
    setProcessing(false)
    if (ok) {
      setSuccess(`+${amount} FoneLove ajoutés !`)
      setTimeout(() => setSuccess(null), 2000)
    }
  }

  const handleWithdraw = async () => {
    if (!currentUser || processing) return
    const min = config?.minWithdrawAmount ?? 10
    if (withdrawAmount < min || withdrawAmount > receivedBalance) return
    setProcessing(true)
    const ok = await requestWithdraw(currentUser.id, withdrawAmount)
    setProcessing(false)
    if (ok) {
      setSuccess('Retrait demandé !')
      setTimeout(() => setSuccess(null), 2000)
    }
  }

  const commission = config?.commissionPercent ?? 40
  const withdrawValue = config?.withdrawValueEur ?? 0.30
  const netPayout = withdrawAmount * withdrawValue * (1 - commission / 100)

  return (
    <Sheet open={showWallet} onOpenChange={setShowWallet}>
      <SheetContent side="bottom" className="h-[85dvh] rounded-t-3xl border-t-border/30 bg-background/98 backdrop-blur-xl px-0 pt-0 gap-0 overflow-hidden">
        <SheetTitle className="sr-only">Wallet FoneLove</SheetTitle>
        <SheetDescription className="sr-only">Gérer tes FoneLove</SheetDescription>

        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(245,158,11,0.2))' }}>
                <Gift className="size-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-base font-bold">Mon Wallet FoneLove</h2>
                <p className="text-[10px] text-muted-foreground">Offre, reçois, retire 💝</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => setShowWallet(false)}>
              <X className="size-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex mx-4 mb-2 rounded-xl bg-muted/50 p-1">
            {([
              { key: 'balance' as const, label: 'Mon solde', icon: Sparkles },
              { key: 'recharge' as const, label: 'Recharger', icon: ArrowDownToLine },
              { key: 'withdraw' as const, label: 'Retirer', icon: ArrowUpFromLine },
              { key: 'history' as const, label: 'Historique', icon: History },
            ]).map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn('flex-1 flex items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-medium transition-all',
                  tab === t.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}>
                <t.icon className="size-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Success toast */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="my-3 flex items-center gap-2 rounded-2xl bg-green-500/10 border border-green-500/20 p-3 text-sm font-bold text-green-400">
                <CheckCircle2 className="size-4" /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {tab === 'balance' && (
            <div className="space-y-4 py-4">
              {/* Balance cards */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-pink-500/20 p-4" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(244,63,94,0.08))' }}>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">À envoyer</p>
                  <p className="text-3xl font-black text-pink-500">{sendBalance}</p>
                  <p className="text-[10px] text-pink-400/60">FoneLove 💝</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="rounded-2xl border border-amber-500/20 p-4" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,179,8,0.08))' }}>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Reçus</p>
                  <p className="text-3xl font-black text-amber-500">{receivedBalance}</p>
                  <p className="text-[10px] text-amber-400/60">convertibles 💰</p>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Envoyés', value: totalSent, color: 'text-pink-400' },
                  { label: 'Reçus', value: totalReceived, color: 'text-green-400' },
                  { label: 'Retirés', value: totalWithdrawn, color: 'text-amber-400' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/20 border border-border/20 p-3 text-center">
                    <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-6 py-4">
              {/* ACHATS */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                  <ArrowDownToLine className="size-3.5" /> Achats de FoneLove
                </h4>
                {(!orders || orders.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucun achat</p>
                ) : (
                  <div className="space-y-1">
                    {orders.map((order) => {
                      const dateStr = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                      const statusColors: Record<string, string> = { success: 'text-green-400', pending: 'text-amber-400', processing: 'text-amber-400', failed: 'text-red-400', cancelled: 'text-red-400' }
                      const statusLabels: Record<string, string> = { success: 'Réussi', pending: 'En attente', processing: 'En traitement', failed: 'Échoué', cancelled: 'Annulé' }
                      const statusColor = statusColors[order.status] || 'text-muted-foreground'
                      const statusLabel = statusLabels[order.status] || order.status
                      let flAmount = 0
                      try {
                        if (order.metadata) flAmount = JSON.parse(order.metadata).flAmount || 0
                      } catch (e) {}

                      return (
                        <div key={order.id} className="flex items-center gap-3 py-2 rounded-lg border-b border-border/10 last:border-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-sm">💳</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate uppercase">{flAmount > 0 ? `${flAmount} FoneLove` : `Pack ${order.packType}`}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] text-muted-foreground">{dateStr}</p>
                              <p className={cn("text-[9px] font-bold", statusColor)}>{statusLabel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground">{order.amountXAF} FCFA</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* AUTRES TRANSACTIONS */}
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                  <History className="size-3.5" /> Autres Transactions
                </h4>
                {(!transactions || transactions.length === 0) ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucune transaction</p>
                ) : (
                  <div className="space-y-1">
                    {transactions.slice(0, 15).map((tx) => {
                      const isPositive = tx.amount > 0
                      const icons: Record<string, string> = { recharge: '💳', send: '🎁', receive: '💝', withdraw: '💰', convert_from_cc: '🔄' }
                      return (
                        <div key={tx.id} className="flex items-center gap-3 py-2 rounded-lg border-b border-border/10 last:border-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-sm">
                            {icons[tx.type] || '💫'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{tx.description || tx.type}</p>
                            <p className="text-[9px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <span className={cn('text-xs font-bold tabular-nums', isPositive ? 'text-green-400' : 'text-red-400')}>
                            {isPositive ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'recharge' && (
            <div className="space-y-4 py-4">
              {/* Payment info */}
              <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3 flex items-center gap-2.5">
                <span className="text-xl">💳</span>
                <div>
                  <p className="text-sm font-bold">Paiement Mobile / Carte</p>
                  <p className="text-[10px] text-muted-foreground">Paiement sécurisé via CoolPay</p>
                </div>
              </div>

              {/* Packs */}
              <div className="space-y-2">
                {RECHARGE_PACKS.map((pack) => (
                  <motion.button key={pack.amount} whileTap={{ scale: 0.97 }}
                    onClick={() => handleRecharge(pack.amount)}
                    disabled={processing}
                    className={cn('relative w-full rounded-2xl border p-4 text-left transition-all overflow-hidden bg-gradient-to-br',
                      pack.gradient, pack.best ? 'border-amber-500/30' : pack.popular ? 'border-pink-500/30' : 'border-border/20')}>
                    {pack.best && <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-full">Meilleur</span>}
                    {pack.popular && <span className="absolute top-2 right-2 text-[9px] font-bold bg-pink-500 text-white px-1.5 py-0.5 rounded-full">Populaire</span>}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pack.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{pack.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatLocalPrice(pack.amount * (config?.unitPriceEur ?? 0.50))}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {tab === 'withdraw' && (
            <div className="space-y-4 py-4">
              <div className="rounded-2xl border border-amber-500/20 p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,179,8,0.08))' }}>
                <p className="text-xs text-muted-foreground mb-1">FoneLove reçus disponibles</p>
                <p className="text-4xl font-black text-amber-500">{receivedBalance}</p>
              </div>

              {/* Amount selector */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Combien retirer ?</p>
                <div className="flex items-center gap-3 bg-muted/20 rounded-2xl p-3 border border-border/20">
                  <button onClick={() => setWithdrawAmount(Math.max(config?.minWithdrawAmount ?? 10, withdrawAmount - 5))}
                    className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center"><Minus className="size-5" /></button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black text-amber-500">{withdrawAmount}</span>
                    <span className="text-sm text-muted-foreground ml-1">FL</span>
                  </div>
                  <button onClick={() => setWithdrawAmount(Math.min(receivedBalance, withdrawAmount + 5))}
                    className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center"><Plus className="size-5" /></button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="rounded-xl bg-muted/10 border border-border/20 p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Valeur brute</span><span>{formatLocalPrice(withdrawAmount * withdrawValue)}</span></div>
                <div className="flex justify-between"><span className="text-red-400">Commission ({commission}%)</span><span className="text-red-400">-{formatLocalPrice(withdrawAmount * withdrawValue * commission / 100)}</span></div>
                <div className="h-px bg-border/20" />
                <div className="flex justify-between font-bold"><span>Tu reçois</span><span className="text-green-400">{formatLocalPrice(netPayout)}</span></div>
              </div>

              <Button className="w-full h-14 rounded-2xl text-base font-bold text-white border-0"
                style={{ background: receivedBalance < (config?.minWithdrawAmount ?? 10) ? '#666' : 'linear-gradient(135deg, #f59e0b, #eab308)' }}
                onClick={handleWithdraw} disabled={processing || receivedBalance < (config?.minWithdrawAmount ?? 10) || withdrawAmount > receivedBalance}>
                {processing ? 'Traitement...' : `Retirer ${formatLocalPrice(netPayout)}`}
              </Button>

              {receivedBalance < (config?.minWithdrawAmount ?? 10) && (
                <p className="text-xs text-muted-foreground text-center">Minimum {config?.minWithdrawAmount ?? 10} FoneLove pour retirer</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
