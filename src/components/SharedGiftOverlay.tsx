'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/context'

const SHARE_URL = 'https://fonelove.com'

interface SharedGiftOverlayProps {
  amount: number
  giftAmount: number
  onClose: () => void
}

export default function SharedGiftOverlay({ amount, giftAmount, onClose }: SharedGiftOverlayProps) {
  const { t } = useT()
  const [giftSent, setGiftSent] = useState(false)
  const [step, setStep] = useState<'reward' | 'gift'>('reward')

  // Build the share text
  const shareText = t('gift.shareText', { n: String(giftAmount), url: SHARE_URL })

  const handleShare = useCallback(async () => {
    // Try native Web Share API first (works on most mobile browsers)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('gift.shareTitle'),
          text: shareText,
        })
        setGiftSent(true)
        setTimeout(onClose, 2000)
        return
      } catch {
        // User cancelled or share failed — fall through to WhatsApp
      }
    }
    // Fallback: open WhatsApp directly
    handleWhatsApp()
  }, [shareText, t, onClose])

  const handleWhatsApp = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
    setGiftSent(true)
    setTimeout(onClose, 2000)
  }, [shareText, onClose])

  const handleSMS = useCallback(() => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`
    window.open(url, '_self')
    setGiftSent(true)
    setTimeout(onClose, 2000)
  }, [shareText, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative w-full max-w-[340px] rounded-3xl border border-amber-500/30 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 p-5 shadow-2xl shadow-amber-500/10 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors cursor-pointer"
          style={{ minWidth: '32px', minHeight: '32px' }}
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>

        {/* Animated sparkles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-400/20"
              style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {giftSent ? (
            /* ─── Gift Sent Confirmation ──────── */
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-6 gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-5xl"
              >
                💖
              </motion.div>
              <p className="text-lg font-bold text-white text-center">{t('gift.sent')}</p>
            </motion.div>
          ) : step === 'reward' ? (
            /* ─── Step 1: Show Reward ──────── */
            <motion.div
              key="reward"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              {/* Coin animation */}
              <motion.div
                animate={{ y: [0, -8, 0], rotateY: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
              >
                <span className="text-3xl font-black text-white">CC</span>
              </motion.div>

              <div className="text-center">
                <p className="text-sm text-amber-300 font-medium">{t('gift.surprise')}</p>
                <p className="text-2xl font-black text-white mt-1">{t('gift.youGot', { n: String(amount) })}</p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full"
              >
                <Button
                  onClick={() => setStep('gift')}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 text-base hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 cursor-pointer"
                  style={{ minHeight: '48px' }}
                >
                  <Gift className="mr-2 size-5" />
                  {t('gift.andAlso')}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* ─── Step 2: Share Gift ──────── */
            <motion.div
              key="gift"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              {/* Gift box animation */}
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl"
              >
                🎁
              </motion.div>

              <div className="text-center px-2">
                <p className="text-base font-bold text-white leading-snug">
                  {t('gift.giftToShare', { n: String(giftAmount) })}
                </p>
              </div>

              {/* Share buttons */}
              <div className="w-full flex flex-col gap-2.5">
                {/* Primary: Web Share or WhatsApp */}
                <Button
                  onClick={handleShare}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 text-base hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20 cursor-pointer"
                  style={{ minHeight: '52px' }}
                >
                  <Share2 className="mr-2 size-5" />
                  {t('gift.share')}
                </Button>

                {/* WhatsApp direct */}
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full rounded-xl border-green-500/30 text-green-400 font-semibold py-3.5 text-sm hover:bg-green-500/10 cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {t('gift.sendWhatsApp')}
                </Button>

                {/* SMS */}
                <Button
                  onClick={handleSMS}
                  variant="outline"
                  className="w-full rounded-xl border-blue-500/30 text-blue-400 font-semibold py-3.5 text-sm hover:bg-blue-500/10 cursor-pointer"
                  style={{ minHeight: '44px' }}
                >
                  {t('gift.sendSMS')}
                </Button>
              </div>

              {/* Skip */}
              <button
                onClick={onClose}
                className="text-xs text-white/40 hover:text-white/60 transition-colors mt-1 cursor-pointer"
              >
                {t('gift.noThanks')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
