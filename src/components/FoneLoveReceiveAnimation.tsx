'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useFoneLoveStore } from '@/lib/fonelove-store'
import { useAppStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

export default function FoneLoveReceiveAnimation() {
  const { pendingReceivedGift, setPendingReceivedGift } = useFoneLoveStore(
    useShallow(s => ({
      pendingReceivedGift: s.pendingReceivedGift,
      setPendingReceivedGift: s.setPendingReceivedGift
    }))
  )
  const currentUser = useAppStore(s => s.currentUser)
  const [active, setActive] = useState(false)

  // Polling for unseen gifts
  useEffect(() => {
    if (!currentUser) return
    const checkGifts = async () => {
      try {
        const res = await fetch(`/api/fonelove/pending-gifts?userId=${currentUser.id}`)
        const data = await res.json()
        const currentPending = useFoneLoveStore.getState().pendingReceivedGift
        if (data.gift && !currentPending) {
          useFoneLoveStore.getState().setPendingReceivedGift(data.gift)
        }
      } catch (err) {
        console.error('Failed to poll gifts', err)
      }
    }
    checkGifts()
    // We can poll every 15 seconds, or just once on mount
    const interval = setInterval(checkGifts, 15000)
    return () => clearInterval(interval)
  }, [currentUser])

  useEffect(() => {
    if (pendingReceivedGift && currentUser) {
      setActive(true)
      
      // Mark as seen in DB
      fetch('/api/fonelove/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: pendingReceivedGift.id, userId: currentUser.id })
      }).catch(err => console.error('Error marking gift seen', err))

      const timer = setTimeout(() => {
        setActive(false)
        setTimeout(() => setPendingReceivedGift(null), 500) // Wait for exit animation
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [pendingReceivedGift, setPendingReceivedGift, currentUser])

  if (!pendingReceivedGift) return null

  // Generate floating hearts
  const hearts = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1.5,
    size: 20 + Math.random() * 40,
    emoji: ['💝', '💖', '🎁', '✨', '💕', '❤️‍🔥'][Math.floor(Math.random() * 6)],
  }))

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-none overflow-hidden"
        >
          {/* Floating hearts */}
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: '110vh', x: `${h.x}vw`, scale: 0.5 }}
              animate={{ opacity: [0, 1, 1, 0], y: '-20vh', x: `${h.x + (Math.random() * 10 - 5)}vw`, scale: [0.5, 1.2, 1] }}
              transition={{ duration: h.duration, delay: h.delay, ease: 'easeOut' }}
              className="absolute text-5xl"
              style={{ fontSize: h.size }}
            >
              {h.emoji}
            </motion.div>
          ))}

          {/* Main message */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="relative flex flex-col items-center bg-background/90 p-8 rounded-3xl border border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center max-w-[85vw]"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
            
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mb-4"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 shadow-xl">
                <Gift className="size-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-pink-500 to-amber-500 bg-clip-text text-transparent">
              Surprise !
            </h2>
            
            <p className="text-lg font-medium">
              Tu as reçu <span className="font-bold text-pink-500">{pendingReceivedGift.amount} FoneLove</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              de la part de {pendingReceivedGift.senderName || 'Quelqu\'un'}
            </p>

            {pendingReceivedGift.message && (
              <div className="mt-4 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 italic text-sm text-pink-400">
                "{pendingReceivedGift.message}"
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
