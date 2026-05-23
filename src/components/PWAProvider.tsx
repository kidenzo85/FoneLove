'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, WifiOff, Wifi, Bell, BellOff, X,
  Smartphone, Check, ChevronRight, Zap
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

// ============================================================
// PWA INSTALL BANNER - Smart, elegant install prompt
// ============================================================

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const { t } = useT()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowBanner(true), 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowBanner(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setIsInstalled(true)
    } catch (error) {
      console.error('Install prompt error:', error)
    }
    setDeferredPrompt(null)
    setShowBanner(false)
    setIsInstalling(false)
  }, [deferredPrompt])

  if (isInstalled) return null

  return (
    <AnimatePresence>
      {showBanner && deferredPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[90] p-4 pb-6 safe-area-bottom"
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#0f0f1a]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-pink-500 to-amber-500" />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-primary/20">
                  <Download className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{t('pwa.installTitle')}</h3>
                  <p className="mt-0.5 text-xs text-white/40 leading-relaxed">{t('pwa.installDesc')}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { icon: Zap, textKey: 'pwa.faster' },
                      { icon: Bell, textKey: 'pwa.notifications' },
                      { icon: WifiOff, textKey: 'pwa.offline' },
                    ].map((b) => (
                      <span key={b.textKey} className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/30">
                        <b.icon className="size-2.5" />
                        {t(b.textKey)}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowBanner(false)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowBanner(false)} className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.06] py-2.5 text-xs font-medium text-white/40 hover:bg-white/[0.08] transition-all">
                  {t('pwa.later')}
                </button>
                <button onClick={handleInstall} disabled={isInstalling} className="flex-1 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-primary py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform disabled:opacity-50">
                  {isInstalling ? t('pwa.installing') : t('pwa.install')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// OFFLINE INDICATOR - Elegant connectivity status
// ============================================================

export function OfflineIndicator() {
  const { t } = useT()
  const [isOnline, setIsOnline] = useState(true)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => { setIsOnline(true); setShowBackOnline(true); setTimeout(() => setShowBackOnline(false), 3000) }
    const handleOffline = () => { setIsOnline(false); setShowBackOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 right-0 z-[95] safe-area-top">
          <div className="flex items-center justify-center gap-2 bg-amber-500/90 backdrop-blur-sm px-4 py-2">
            <WifiOff className="size-3.5 text-white" />
            <span className="text-xs font-semibold text-white">{t('pwa.offlineMode')}</span>
            <div className="ml-1 h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse" />
          </div>
        </motion.div>
      )}
      {showBackOnline && (
        <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 right-0 z-[95] safe-area-top">
          <div className="flex items-center justify-center gap-2 bg-green-500/90 backdrop-blur-sm px-4 py-2">
            <Wifi className="size-3.5 text-white" />
            <span className="text-xs font-semibold text-white">{t('pwa.backOnline')}</span>
            <Check className="size-3.5 text-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// NOTIFICATION PERMISSION - Elegant opt-in with VAPID key
// ============================================================

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

export function NotificationPermission() {
  const { t } = useT()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    setPermission(Notification.permission)

    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        const store = useAppStore.getState()
        if (store.isAuthenticated && store.onboardingDone) {
          setShowPrompt(true)
        }
      }, 30000)
      return () => clearTimeout(timer)
    }

    // If already granted, check if we're subscribed
    if (Notification.permission === 'granted') {
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setSubscribed(!!subscription)
    } catch {
      // SW not ready
    }
  }

  const requestPermission = useCallback(async () => {
    setIsRequesting(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted' && VAPID_PUBLIC_KEY) {
        try {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
          })

          // Save subscription to server
          const subData = subscription.toJSON()
          const store = useAppStore.getState()
          const userId = store.currentUser?.id

          if (userId && subData.endpoint && subData.keys?.p256dh && subData.keys?.auth) {
            await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                endpoint: subData.endpoint,
                p256dh: subData.keys.p256dh,
                auth: subData.keys.auth,
                userAgent: navigator.userAgent,
                deviceType: detectDeviceType(),
              }),
            })
          }

          setSubscribed(true)
          console.log('[PWA] Push subscription saved:', subData.endpoint?.substring(0, 50))
        } catch (err) {
          console.error('[PWA] Push subscription failed:', err)
        }
      }
    } catch (error) {
      console.error('[PWA] Notification permission error:', error)
    }
    setIsRequesting(false)
    setShowPrompt(false)
  }, [])

  const dismiss = useCallback(() => {
    setShowPrompt(false)
  }, [])

  return (
    <AnimatePresence>
      {showPrompt && permission === 'default' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        >
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[340px] overflow-hidden rounded-2xl bg-[#0f0f1a]/95 backdrop-blur-xl border border-white/[0.08]"
          >
            <div className="h-[2px] bg-gradient-to-r from-primary via-pink-500 to-amber-500" />
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-primary/20">
                <Bell className="size-7 text-primary" />
              </div>
              <h3 className="text-center text-lg font-bold text-white">{t('pwa.notifTitle')}</h3>
              <p className="mt-1.5 text-center text-sm text-white/40 leading-relaxed">{t('pwa.notifBody')}</p>
              <div className="mt-4 space-y-2">
                {[
                  { emoji: '📞', text: 'Nouvelle demande de numero' },
                  { emoji: '❤️', text: 'Match mutuel !' },
                  { emoji: '💬', text: 'Nouveau message' },
                ].map((n, i) => (
                  <motion.div
                    key={n.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2"
                  >
                    <span className="text-sm">{n.emoji}</span>
                    <span className="text-xs text-white/50">{n.text}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={dismiss} className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 text-xs font-medium text-white/40 hover:bg-white/[0.08] transition-all">
                  {t('pwa.notifLater')}
                </button>
                <button onClick={requestPermission} disabled={isRequesting} className="flex-1 rounded-xl bg-gradient-to-r from-primary via-pink-500 to-primary py-3 text-xs font-bold text-white shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform disabled:opacity-50">
                  {isRequesting ? t('pwa.notifEnabling') : t('pwa.notifEnable')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// SERVICE WORKER REGISTRATION
// ============================================================

export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      console.log('[PWA] Service Worker registered:', registration.scope)
      setInterval(() => registration.update(), 60 * 60 * 1000)
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') console.log('[PWA] New Service Worker activated')
          })
        }
      })
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
    }
  }

  if (document.readyState === 'complete') {
    register()
  } else {
    window.addEventListener('load', register)
  }
}

// ============================================================
// PWA STATUS HOOK
// ============================================================

export function usePWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [hasSW, setHasSW] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true)
    setIsOnline(navigator.onLine)
    setHasSW('serviceWorker' in navigator)
    if ('Notification' in window) setNotificationPermission(Notification.permission)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  return { isInstalled, isOnline, hasSW, notificationPermission }
}

// ============================================================
// COMBINED PWA PROVIDER
// ============================================================

export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineIndicator />
      <PWAInstallBanner />
      <NotificationPermission />
      {children}
    </>
  )
}
