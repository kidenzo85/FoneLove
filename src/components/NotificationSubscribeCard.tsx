'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X, Sparkles, MessageCircle, Heart, Gift, AlertTriangle } from 'lucide-react'
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

export default function NotificationSubscribeCard() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const currentUser = useAppStore((state) => state.currentUser)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    
    // Set current permission state
    setPermission(Notification.permission)

    // Check if dismissed in this session (only applicable for 'default' permission)
    const isDismissed = sessionStorage.getItem('notif_card_dismissed') === 'true'
    
    if (currentUser) {
      if (Notification.permission === 'default' && !isDismissed) {
        const timer = setTimeout(() => setShowCard(true), 500)
        return () => clearTimeout(timer)
      }
    }
  }, [currentUser])

  const subscribe = useCallback(async () => {
    if (isSubscribing) return
    setIsSubscribing(true)
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

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
          
          setSuccess(true)
          setTimeout(() => setShowCard(false), 2500)
        }
      }
    } catch (error) {
      console.error('[NotificationCard] Subscription error:', error)
    } finally {
      setIsSubscribing(false)
    }
  }, [currentUser, isSubscribing])

  const handleDismiss = () => {
    sessionStorage.setItem('notif_card_dismissed', 'true')
    setShowCard(false)
  }

  if (!showCard) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className="w-full overflow-hidden rounded-3xl bg-slate-950/80 border border-white/[0.08] shadow-2xl relative"
      >
        {/* Glow effect */}
        {permission === 'granted' ? (
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-2xl opacity-30 pointer-events-none" />
        ) : permission === 'denied' ? (
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-gradient-to-br from-rose-500 to-amber-600 rounded-full blur-2xl opacity-30 pointer-events-none" />
        ) : (
          <>
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-gradient-to-br from-primary to-pink-600 rounded-full blur-2xl opacity-40 pointer-events-none animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-gradient-to-br from-pink-600 to-amber-500 rounded-full blur-2xl opacity-40 pointer-events-none" />
          </>
        )}

        {/* Decorative Top Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${
          permission === 'granted' 
            ? 'from-emerald-500 via-teal-500 to-emerald-400' 
            : permission === 'denied'
            ? 'from-rose-500 via-orange-500 to-amber-500'
            : 'from-primary via-pink-500 to-amber-500'
        }`} />
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border relative ${
                permission === 'granted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : permission === 'denied'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-gradient-to-br from-primary/20 to-pink-500/20 border-primary/30 text-primary'
              }`}>
                {permission === 'denied' ? (
                  <AlertTriangle className="size-6" />
                ) : (
                  <Bell className={`size-6 ${permission === 'default' ? 'animate-bounce' : ''}`} />
                )}
                {permission === 'default' && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  {permission === 'granted' ? 'Alertes activées ✓' : permission === 'denied' ? 'Alertes bloquées ⚠️' : 'Recevoir mes alertes'}
                  {permission === 'default' && <Sparkles className="size-4 text-amber-400 fill-amber-400" />}
                </h3>
                <p className="text-[11px] text-white/50">
                  {permission === 'granted' 
                    ? 'Tu ne rateras aucun moment important !' 
                    : permission === 'denied'
                    ? 'Active-les pour ne rien rater.'
                    : 'Pour ne rater aucun moment important !'}
                </p>
              </div>
            </div>
            
            {permission === 'default' && (
              <button 
                onClick={handleDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/80 active:scale-90 transition-all"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Body Content based on permission */}
          {permission === 'granted' || success ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white mt-0.5">
                  <Check className="size-3.5 stroke-[3px]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-400">Tout fonctionne parfaitement !</h4>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                    Les alertes en temps réel pour tes nouveaux messages, tes demandes de numéro et tes matchs mutuels sont actives sur ce téléphone.
                  </p>
                </div>
              </div>
            </div>
          ) : permission === 'denied' ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3.5 flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white mt-0.5">
                  <AlertTriangle className="size-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-400">Notifications bloquées</h4>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                    Tu as bloqué les alertes pour ce site. Pour recevoir les demandes de numéro et les messages en direct :
                  </p>
                  <ol className="text-[10px] text-white/40 list-decimal list-inside mt-2 space-y-1">
                    <li>Appuie sur l'icône de réglages/cadenas dans ta barre d'adresse.</li>
                    <li>Autorise ou réinitialise les permissions de notifications.</li>
                    <li>Actualise la page de ton navigateur.</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Core Perks */}
              <div className="space-y-2.5 mb-5">
                {[
                  { icon: MessageCircle, text: 'Nouveau message reçu', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { icon: Heart, text: 'Un nouveau match avec toi !', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
                  { icon: Gift, text: 'Un cadeau FoneLove reçu !', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                ].map((perk, i) => (
                  <motion.div
                    key={perk.text}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 ${perk.color}`}
                  >
                    <div className="p-1 rounded-lg">
                      <perk.icon className="size-5 shrink-0" />
                    </div>
                    <span className="text-sm font-semibold text-white/90">{perk.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={subscribe}
                  disabled={isSubscribing}
                  className="w-full h-[60px] rounded-2xl bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#059669] text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50"
                >
                  {isSubscribing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activation...</span>
                    </>
                  ) : (
                    <>
                      <span>Oui, je veux les alertes !</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-xs font-semibold text-white/50 hover:text-white/80 active:scale-95 transition-all text-center"
                >
                  Plus tard
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
