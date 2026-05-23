'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Coins, ArrowLeft, Loader2, Gift } from 'lucide-react'
import { useConnectCoinStore } from '@/lib/connectcoin-store'
import { useAppStore } from '@/lib/store'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const currentUser = useAppStore((s) => s.currentUser)
  const { fetchBalance } = useConnectCoinStore()

  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading')
  const [orderData, setOrderData] = useState<{
    ccAmount: number
    bonusCC: number
    packType: string
    amountXAF: number
  } | null>(null)
  const [pollCount, setPollCount] = useState(0)

  const checkStatus = useCallback(async () => {
    if (!orderId) {
      setStatus('error')
      return
    }

    try {
      const res = await fetch(`/api/payments/status?orderId=${orderId}`)
      if (!res.ok) {
        setStatus('error')
        return
      }

      const data = await res.json()
      setOrderData(data)

      if (data.status === 'success') {
        setStatus('success')
        // Rafraîchir le solde CC
        if (currentUser) {
          await fetchBalance(currentUser.id)
        }
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setStatus('error')
      } else {
        setStatus('pending')
      }
    } catch {
      setStatus('error')
    }
  }, [orderId, currentUser, fetchBalance])

  // Polling pour vérifier le statut (le callback peut arriver avec un délai)
  useEffect(() => {
    checkStatus()

    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev >= 30) {
          // Stop après 30 tentatives (environ 2 min)
          clearInterval(interval)
          return prev
        }
        checkStatus()
        return prev + 1
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [checkStatus])

  // Stopper le polling si le statut final est atteint
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      setPollCount(999)
    }
  }, [status])

  const goHome = () => router.push('/')

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[360px] text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="size-12 text-amber-400 animate-spin" />
            <p className="text-base font-medium text-white/80">
              Vérification du paiement...
            </p>
            <p className="text-xs text-white/40">
              Ça ne prend que quelques secondes
            </p>
          </div>
        )}

        {status === 'pending' && (
          <div className="flex flex-col items-center gap-4 py-12">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Loader2 className="size-12 text-amber-400 animate-spin" />
            </motion.div>
            <p className="text-base font-medium text-white/80">
              Paiement en cours de traitement...
            </p>
            <p className="text-xs text-white/40">
              Le paiement est en attente de confirmation.
              <br />Cette page se met à jour toute seule.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-5">
            {/* Confetti effect */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/30"
              >
                <CheckCircle2 className="size-14 text-green-400" />
              </motion.div>
              {/* Glow */}
              <div className="absolute -inset-4 rounded-full bg-green-500/10 blur-2xl animate-pulse" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h1 className="text-2xl font-black text-white">
                Paiement réussi ! 🎉
              </h1>
              <p className="text-sm text-white/60">
                Tes ConnectCoins ont été ajoutés à ton compte
              </p>
            </motion.div>

            {/* CC Amount Card */}
            {orderData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 p-5"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Coins className="size-6 text-amber-400" />
                  <span className="text-3xl font-black text-amber-400">
                    +{orderData.ccAmount}
                  </span>
                  <span className="text-sm font-bold text-amber-400/70">CC</span>
                </div>

                {orderData.bonusCC > 0 && (
                  <div className="flex items-center justify-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 mx-auto w-fit">
                    <Gift className="size-3.5 text-green-400" />
                    <span className="text-xs font-bold text-green-400">
                      dont +{orderData.bonusCC} CC bonus offerts !
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-white/40 mt-3">
                  {orderData.amountXAF?.toLocaleString('fr-FR')} FCFA
                </p>
              </motion.div>
            )}

            {/* Return Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={goHome}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold py-3.5 px-6 text-sm hover:from-amber-600 hover:to-yellow-600 active:scale-[0.97] transition-all shadow-lg shadow-amber-500/20"
            >
              <ArrowLeft className="size-4" />
              Retour à FoneLove
            </motion.button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/20">
              <span className="text-4xl">😔</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">
                Problème de vérification
              </h1>
              <p className="text-sm text-white/60">
                Nous n'avons pas pu vérifier ton paiement pour le moment.
                Si tu as payé, tes CC seront ajoutés automatiquement.
              </p>
            </div>
            <button
              onClick={goHome}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/10 text-white font-medium py-3 text-sm hover:bg-white/15 active:scale-[0.97] transition-all"
            >
              <ArrowLeft className="size-4" />
              Retour à FoneLove
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="size-12 text-amber-400 animate-spin" />
          <p className="text-base font-medium text-white/80">
            Vérification du paiement...
          </p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
