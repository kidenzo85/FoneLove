'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, RefreshCw } from 'lucide-react'

export default function PaymentErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4 safe-area-top safe-area-bottom">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[360px] text-center flex flex-col items-center gap-5"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border-2 border-red-500/20"
        >
          <span className="text-4xl">😞</span>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-xl font-bold text-white">
            Échec du paiement
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            Le paiement n'a pas pu aboutir.
            <br />Aucun montant n'a été débité de ton compte.
          </p>
        </motion.div>

        {/* Help card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 space-y-2"
        >
          <p className="text-xs font-semibold text-amber-400">
            💡 Raisons possibles :
          </p>
          <ul className="text-[11px] text-white/50 text-left space-y-1 pl-3">
            <li>• Solde insuffisant sur ton compte mobile</li>
            <li>• Problème de connexion réseau</li>
            <li>• Transaction expirée (trop de temps écoulé)</li>
            <li>• Code de confirmation incorrect</li>
          </ul>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-2.5"
        >
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold py-3.5 px-6 text-sm hover:from-amber-600 hover:to-yellow-600 active:scale-[0.97] transition-all shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="size-4" />
            Réessayer
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-medium py-3 text-xs hover:bg-white/10 active:scale-[0.97] transition-all"
          >
            <ArrowLeft className="size-3.5" />
            Retour à FoneLove
          </button>

          <a
            href="https://wa.me/237654197288?text=Bonjour%2C%20j%27ai%20un%20probl%C3%A8me%20de%20paiement%20sur%20FoneLove"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-600/10 border border-green-500/20 text-green-400 font-medium py-3 text-xs hover:bg-green-600/20 active:scale-[0.97] transition-all"
          >
            <MessageCircle className="size-3.5" />
            Contacter le support
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}
