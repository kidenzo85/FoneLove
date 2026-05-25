"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Heart, Download, X } from "lucide-react"
import { registerServiceWorker } from "./PWAProvider"

// Types pour BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Enregistrer le Service Worker pour le cache et les Notifications Push
    registerServiceWorker()

    // Vérifier si l'app est déjà installée
    const isPwa = window.matchMedia("(display-mode: standalone)").matches || 
                 (window.navigator as any).standalone === true
    setIsStandalone(isPwa)

    if (isPwa) return

    // Détection iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Capture de l'événement natif d'installation (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Attendre un peu avant d'afficher
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 5000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
        setIsMinimized(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      // Sur iOS on doit réafficher le grand modal pour montrer les instructions
      setIsMinimized(false)
    }
  }

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsMinimized(true)
  }

  // Ne rien afficher si déjà installée, ou si on n'a ni prompt natif ni iOS
  if (isStandalone || (!deferredPrompt && !isIOS)) return null

  return (
    <AnimatePresence mode="wait">
      {showPrompt && !isMinimized && (
        <motion.div
          key="full-prompt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900 border border-white/10 p-6 shadow-2xl"
          >
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <div className="mb-6 flex justify-center relative">
                <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                <img 
                  src="/logo.webp" 
                  alt="Fonelove" 
                  className="h-16 w-16 rounded-[20px] object-cover shadow-xl shadow-pink-500/30 relative z-10"
                />
              </div>

              <h2 className="mb-2 text-2xl font-black tracking-tight text-white">
                Installe Fonelove
              </h2>
              <p className="mb-8 text-sm font-medium text-white/60">
                Pour une expérience plus rapide, plus fluide, et pour recevoir tes notifications en temps réel.
              </p>

              {isIOS && !deferredPrompt ? (
                <div className="flex w-full flex-col gap-3 rounded-2xl bg-white/5 p-4 text-left text-sm text-white/80">
                  <p className="font-semibold text-white mb-1">Comment installer sur iPhone :</p>
                  <ol className="flex flex-col gap-3">
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                      <span>Appuie sur le bouton <strong>Partager</strong> en bas de l'écran</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                      <span>Fais défiler et choisis <strong>"Sur l'écran d'accueil"</strong></span>
                    </li>
                  </ol>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-rose-500 py-4 font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
                >
                  <Download className="size-5" />
                  Installer l'Application
                </button>
              )}
              
              <button 
                onClick={handleDismiss}
                className="mt-4 text-xs font-semibold text-white/40 hover:text-white/60"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {isMinimized && (
        <motion.div
          key="minimized-prompt"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={handleInstall}
          className="fixed top-[calc(env(safe-area-inset-top,0px)+4.5rem)] left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 py-1.5 px-3 pr-1.5 shadow-2xl cursor-pointer hover:bg-black transition-all active:scale-95 group"
        >
          <img 
            src="/logo.webp" 
            alt="Fonelove" 
            className="h-7 w-7 rounded-lg object-cover shadow-sm group-hover:shadow-primary/50 transition-shadow" 
          />
          <span className="text-sm font-bold text-white/90 group-hover:text-white">Installer</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-white ml-1 group-hover:bg-primary transition-colors">
            <Download className="size-3.5" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
