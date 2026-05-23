'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Sparkles, Heart, MessageCircle, Gift, Check, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as any
}

function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  const ua = navigator.userAgent
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) return 'mobile'
  if (/android/i.test(ua)) return 'tablet'
  return 'desktop'
}

/**
 * NotificationOptInBanner
 * 
 * A premium, globally-floating notification opt-in banner that slides
 * down from the top of the screen. Designed with catchy marketing copy,
 * glassmorphism aesthetics, and iPhone SE tactile standards.
 * 
 * Shows automatically 4 seconds after the user enters the app,
 * only when notification permission is 'default' (not yet decided).
 */
export default function NotificationOptInBanner() {
  const [show, setShow] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'banner' | 'expanded'>('banner')

  const currentUser = useAppStore((state) => state.currentUser)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) {
      console.log('[NotifBanner] Notifications not supported in this browser')
      return
    }
    if (!('serviceWorker' in navigator)) {
      console.log('[NotifBanner] Service workers not supported')
      return
    }

    console.log('[NotifBanner] Current permission:', Notification.permission)

    // For testing: we comment out the strict checks so you can see the banner!
    /*
    if (Notification.permission !== 'default') return
    const lastDismissed = localStorage.getItem('notif_banner_dismissed_at')
    if (lastDismissed) {
      const elapsed = Date.now() - parseInt(lastDismissed, 10)
      if (elapsed < 24 * 60 * 60 * 1000) return 
    }
    */

    if (!currentUser) {
      console.log('[NotifBanner] Waiting for user to login...')
      return
    }

    console.log('[NotifBanner] Conditions met, starting 4s timer...')
    const timer = setTimeout(() => {
      console.log('[NotifBanner] Showing banner now!')
      setShow(true)
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [currentUser])

  const handleSubscribe = useCallback(async () => {
    if (isSubscribing) return
    setIsSubscribing(true)

    try {
      const result = await Notification.requestPermission()

      if (result === 'granted' && VAPID_PUBLIC_KEY) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
        })

        const subData = subscription.toJSON()

        if (currentUser?.id && subData.endpoint && subData.keys?.p256dh && subData.keys?.auth) {
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              endpoint: subData.endpoint,
              p256dh: subData.keys.p256dh,
              auth: subData.keys.auth,
              userAgent: navigator.userAgent,
              deviceType: detectDeviceType(),
            }),
          })
        }

        setSuccess(true)
        setTimeout(() => setShow(false), 2500)
      } else {
        // Denied or dismissed — hide and set cooldown
        handleDismiss()
      }
    } catch (err) {
      console.error('[NotifBanner] Subscription error:', err)
      handleDismiss()
    } finally {
      setIsSubscribing(false)
    }
  }, [currentUser, isSubscribing])

  const handleDismiss = useCallback(() => {
    localStorage.setItem('notif_banner_dismissed_at', Date.now().toString())
    setShow(false)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="fixed top-0 left-0 right-0 z-[100] px-3 pt-[max(env(safe-area-inset-top,8px),8px)]"
        >
          <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-b-3xl rounded-t-2xl shadow-2xl shadow-black/40">
            {/* Gradient Top Edge */}
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400" />

            {/* Glassmorphic Background */}
            <div className="relative bg-[#0c0c1a]/[0.97] backdrop-blur-2xl border-x border-b border-white/[0.07]">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-b from-rose-500/25 to-transparent rounded-full blur-3xl" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />

              {success ? (
                /* ========== SUCCESS STATE ========== */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-5 py-5 flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                    <Check className="size-6 text-emerald-400 stroke-[3px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-400">C'est activé ! 🎉</p>
                    <p className="text-[11px] text-white/50 mt-0.5">Tu seras alerté(e) en temps réel.</p>
                  </div>
                </motion.div>
              ) : step === 'banner' ? (
                /* ========== COMPACT BANNER ========== */
                <div className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {/* Animated bell icon */}
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/25">
                      <Bell className="size-5 text-rose-400" />
                      <motion.span
                        className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-rose-500 border-2 border-[#0c0c1a]"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    </div>

                    {/* Copy */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white leading-tight">
                        Ne rate plus aucun message 💬
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5 leading-snug">
                        Active les alertes pour savoir quand quelqu'un craque pour toi !
                      </p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={handleDismiss}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 active:scale-90 transition-all"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  {/* CTA Row */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleDismiss}
                      className="flex-1 h-[44px] rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-semibold text-white/40 hover:bg-white/[0.08] active:scale-[0.97] transition-all"
                    >
                      Plus tard
                    </button>
                    <button
                      onClick={() => setStep('expanded')}
                      className="flex-[2] h-[44px] rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="size-3.5" />
                      Découvrir ce que je rate
                    </button>
                  </div>
                </div>
              ) : (
                /* ========== EXPANDED STATE ========== */
                <div className="px-4 pt-4 pb-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border border-rose-500/25">
                        <Bell className="size-5 text-rose-400 animate-bounce" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-1">
                          Voici ce que tu rates <Sparkles className="size-3.5 text-amber-400 fill-amber-400" />
                        </p>
                        <p className="text-[10px] text-white/40">Active les alertes en un clic</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-white/60 active:scale-90 transition-all"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>

                  {/* Perk Cards */}
                  <div className="space-y-1.5 mb-4">
                    {[
                      {
                        icon: Heart,
                        emoji: '❤️',
                        text: 'Quelqu\'un craque pour toi',
                        sub: 'Sois le/la premier(e) à le savoir',
                        gradient: 'from-pink-500/15 to-rose-500/5 border-pink-500/15',
                        iconColor: 'text-pink-400',
                      },
                      {
                        icon: MessageCircle,
                        emoji: '💬',
                        text: 'Nouveau message privé',
                        sub: 'Réponds vite, c\'est peut-être le bon !',
                        gradient: 'from-blue-500/15 to-indigo-500/5 border-blue-500/15',
                        iconColor: 'text-blue-400',
                      },
                      {
                        icon: Gift,
                        emoji: '🎁',
                        text: 'Cadeau FoneLove reçu',
                        sub: 'Quelqu\'un pense fort à toi',
                        gradient: 'from-amber-500/15 to-orange-500/5 border-amber-500/15',
                        iconColor: 'text-amber-400',
                      },
                    ].map((perk, i) => (
                      <motion.div
                        key={perk.text}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * i, type: 'spring', stiffness: 300 }}
                        className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${perk.gradient} border px-3 py-2.5`}
                      >
                        <span className="text-base">{perk.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white/90">{perk.text}</p>
                          <p className="text-[10px] text-white/40">{perk.sub}</p>
                        </div>
                        <ChevronRight className={`size-3.5 ${perk.iconColor} opacity-50`} />
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activation...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="size-4" />
                        <span>Oui, active mes alertes !</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="w-full mt-1.5 py-2 text-[11px] font-medium text-white/30 hover:text-white/50 transition-colors text-center"
                  >
                    Non merci, peut-être plus tard
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
