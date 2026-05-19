'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Minus, Plus, X, Send, Sparkles, Coins } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFoneLoveStore } from '@/lib/fonelove-store'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [1, 5, 10, 25, 50]

export default function SendFoneLoveDialog() {
  const { showSendDialog, setShowSendDialog, sendFoneLove, sendBalance, setShowWallet } = useFoneLoveStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const [amount, setAmount] = useState(1)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const isOpen = !!showSendDialog
  const target = showSendDialog
  const insufficient = sendBalance < amount

  const handleClose = () => {
    setShowSendDialog(null)
    setAmount(1)
    setMessage('')
    setSending(false)
    setSuccess(false)
  }

  const handleSend = async () => {
    if (!currentUser || !target || sending || insufficient) return
    setSending(true)
    const ok = await sendFoneLove(currentUser.id, target.userId, amount, message || undefined)
    setSending(false)
    if (ok) {
      setSuccess(true)
      setTimeout(() => handleClose(), 2500)
    }
  }

  const handleRecharge = () => {
    handleClose()
    setShowWallet(true)
  }

  if (!target) return null

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent 
        showCloseButton={false}
        className="w-[calc(100%-1.5rem)] max-w-[384px] sm:w-full rounded-3xl border-0 bg-card/98 backdrop-blur-xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh]"
      >
        <DialogTitle className="sr-only">Offrir des FoneLove</DialogTitle>
        <DialogDescription className="sr-only">Choisis le nombre de FoneLove à envoyer pour faire plaisir</DialogDescription>

        <div className="w-full p-4 sm:p-6 flex flex-col box-border overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mb-4 text-7xl animate-bounce-subtle">💝</motion.div>
                <h3 className="text-xl font-bold text-fonelove mb-2">FoneLove envoyé !</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Tu as offert <span className="font-bold text-pink-500">{amount} FoneLove{amount > 1 ? 's' : ''}</span> à {target.firstName}
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 sm:mb-6 shrink-0">
                  <div className="relative font-sans">
                    <div className="h-14 w-14 rounded-full bg-cover bg-center border-2 border-pink-500/30 shrink-0"
                      style={{ backgroundImage: `url(${target.photo || `https://i.pravatar.cc/100?u=${target.userId}`})` }} />
                    <motion.div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs shadow-md"
                      style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}
                      animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      🎁
                    </motion.div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate text-foreground w-full">
                      Offrir des FoneLove à {target.firstName}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-snug break-words mt-0.5">Un geste chaleureux qui va droit au cœur ✨</p>
                  </div>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted/50 shrink-0 cursor-pointer ml-1"><X className="size-5 text-muted-foreground" /></button>
                </div>

                {/* Quick amounts selection */}
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3 flex items-center flex-wrap gap-1.5 select-none shrink-0">
                  <Sparkles className="size-3.5 text-pink-400" /> Combien veux-tu lui offrir ?
                </p>
                <div className="grid grid-cols-5 gap-2 mb-3 sm:mb-4 self-stretch shrink-0">
                  {QUICK_AMOUNTS.map((q) => (
                    <motion.button key={q} whileTap={{ scale: 0.95 }} onClick={() => setAmount(q)}
                      className={cn('py-2.5 rounded-xl text-sm font-bold transition-all border text-center flex items-center justify-center cursor-pointer',
                        amount === q ? 'bg-gradient-to-r from-pink-500/20 to-amber-500/20 border-pink-500/30 text-pink-500'
                          : 'bg-muted/30 border-transparent text-muted-foreground')}>
                      {q}
                    </motion.button>
                  ))}
                </div>

                {/* Picker quantity & clean indicator */}
                <div className="flex flex-col items-center bg-muted/20 rounded-2xl p-3 sm:p-4 border border-border/10 mb-3 sm:mb-5 shadow-inner shrink-0">
                  <div className="flex items-center justify-center gap-6 w-full">
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => setAmount(Math.max(1, amount - 1))}
                      disabled={amount <= 1} className="h-10 w-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center disabled:opacity-20 transition-colors cursor-pointer">
                      <Minus className="size-5 text-foreground" />
                    </motion.button>
                    <div className="flex flex-col items-center select-none">
                      <div className="flex items-center gap-2">
                        <motion.span key={amount} initial={{ y: 10, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                          className="text-4xl font-black text-fonelove tabular-nums leading-none">{amount}</motion.span>
                        <span className="text-2xl animate-bounce-subtle">💝</span>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => setAmount(Math.min(999, amount + 1))}
                      className="h-10 w-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-colors cursor-pointer">
                      <Plus className="size-5 text-foreground" />
                    </motion.button>
                  </div>
                  <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest mt-2">
                    {amount} FoneLove{amount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Optional message input */}
                <Input value={message} onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  placeholder="Ajouter un mot doux ? (optionnel)" className="h-12 rounded-2xl bg-muted/20 border-border/20 px-4 mb-3 sm:mb-4 text-sm w-full shrink-0" maxLength={200} />

                {/* Balance */}
                <div className={cn('rounded-xl border p-3 mb-3 sm:mb-4 flex items-center justify-between shrink-0',
                  insufficient ? 'border-red-500/20 bg-red-500/5' : 'border-border/20 bg-muted/10')}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💝</span>
                    <span className="text-xs text-muted-foreground">Solde FoneLove :</span>
                    <span className={cn('text-sm font-bold', insufficient ? 'text-red-400' : 'text-pink-500')}>{sendBalance}</span>
                  </div>
                  {insufficient && (
                    <button onClick={handleRecharge} className="text-xs font-bold text-amber-400 underline hover:text-amber-300 cursor-pointer">Recharger</button>
                  )}
                </div>

                {/* Send action CTA */}
                <div className="self-stretch shrink-0 mt-1 sm:mt-0">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-14 rounded-2xl text-base font-bold text-white shadow-xl border-0 relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    style={{ background: insufficient ? '#666' : 'linear-gradient(135deg, #ec4899, #f43f5e, #f59e0b)' }}
                    onClick={insufficient ? handleRecharge : handleSend} disabled={sending}>
                    {sending ? (
                      <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}>Envoi en cours...</motion.span>
                    ) : insufficient ? (
                      <span className="flex items-center justify-center gap-2 w-full px-2 min-w-0">
                        <Coins className="size-5 shrink-0" /> 
                        <span className="truncate min-w-0">Recharger mon solde</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 w-full px-2 min-w-0">
                        <Send className="size-4 shrink-0" /> 
                        <span className="truncate min-w-0">Offrir {amount} FoneLove{amount > 1 ? 's' : ''}</span> 
                        <span className="shrink-0">💝</span>
                      </span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
