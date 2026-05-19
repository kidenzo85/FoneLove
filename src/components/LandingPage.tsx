'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Phone, Shield, Heart, MessageCircle, ChevronRight, ArrowRight, Lock } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n/context'

// ============================================================
// DATA
// ============================================================

const HERO_IMAGES = [
  '/landing/hero-1.webp',
  '/landing/hero-2.webp',
  '/landing/hero-3.webp',
  '/landing/hero-4.webp',
  '/landing/hero-5.webp',
]

const TAGLINE_KEYS = [
  { staticKey: 'landing.tagline1s', highlightKey: 'landing.tagline1h' },
  { staticKey: 'landing.tagline2s', highlightKey: 'landing.tagline2h' },
  { staticKey: 'landing.tagline3s', highlightKey: 'landing.tagline3h' },
  { staticKey: 'landing.tagline4s', highlightKey: 'landing.tagline4h' },
  { staticKey: 'landing.tagline5s', highlightKey: 'landing.tagline5h' },
  { staticKey: 'landing.tagline6s', highlightKey: 'landing.tagline6h' },
  { staticKey: 'landing.tagline7s', highlightKey: 'landing.tagline7h' },
  { staticKey: 'landing.tagline8s', highlightKey: 'landing.tagline8h' },
]

const BENEFIT_KEYS = [
  { icon: Shield, textKey: 'landing.benefit1' },
  { icon: Heart, textKey: 'landing.benefit2' },
  { icon: MessageCircle, textKey: 'landing.benefit3' },
]

// ============================================================
// BACKGROUND SLIDESHOW - Simple crossfade with CSS transitions
// ============================================================


function BackgroundSlideshow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: 'linear' }}
          >
            <Image
              src={HERO_IMAGES[index]}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
              quality={85}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Preload next image */}
      <div className="hidden">
        <Image 
          src={HERO_IMAGES[(index + 1) % HERO_IMAGES.length]} 
          alt="" 
          width={1} 
          height={1} 
          priority 
        />
      </div>

      {/* Dark overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 z-[1]" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/40 z-[1]" />
    </div>
  )
}

// ============================================================
// FLOATING PARTICLES - Lightweight, client-only
// ============================================================

const PARTICLE_DATA = [
  { id: 0, x: 15, size: 3, duration: 12, delay: 0, opacity: 0.12, drift: -15 },
  { id: 1, x: 35, size: 2.5, duration: 14, delay: 3, opacity: 0.1, drift: 20 },
  { id: 2, x: 55, size: 3.5, duration: 11, delay: 6, opacity: 0.15, drift: -10 },
  { id: 3, x: 75, size: 2, duration: 16, delay: 1, opacity: 0.11, drift: 18 },
  { id: 4, x: 25, size: 4, duration: 13, delay: 4, opacity: 0.13, drift: -22 },
  { id: 5, x: 65, size: 2.5, duration: 15, delay: 7, opacity: 0.1, drift: 12 },
  { id: 6, x: 85, size: 3, duration: 12, delay: 2, opacity: 0.14, drift: -8 },
  { id: 7, x: 10, size: 2, duration: 18, delay: 5, opacity: 0.11, drift: 25 },
  { id: 8, x: 45, size: 3.5, duration: 14, delay: 8, opacity: 0.12, drift: -18 },
  { id: 9, x: 90, size: 2.5, duration: 11, delay: 3, opacity: 0.1, drift: 14 },
  { id: 10, x: 5, size: 3, duration: 16, delay: 9, opacity: 0.13, drift: -12 },
  { id: 11, x: 50, size: 2, duration: 13, delay: 1, opacity: 0.15, drift: 20 },
]

function FloatingParticles() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => { 
    setMounted(true)
    setIsMobile(window.innerWidth < 640)
  }, [])

  if (!mounted) return null

  // Reduce particles on mobile for better performance
  const particles = isMobile ? PARTICLE_DATA.slice(0, 6) : PARTICLE_DATA

  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            bottom: '-2%',
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.3)`,
          }}
          animate={{
            y: [0, -1200],
            x: [0, p.drift],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

// ============================================================
// ANIMATED TAGLINE - CSS-first, Framer Motion enhanced
// ============================================================

function AnimatedTagline() {
  const { t } = useT()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % TAGLINE_KEYS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const tagline = TAGLINE_KEYS[idx]

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {t(tagline.staticKey)}
          </h2>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #f43f5e, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            {t(tagline.highlightKey)}
          </h2>
        </motion.div>
      </AnimatePresence>

      <p
        className="mt-4 max-w-xs sm:max-w-sm text-sm sm:text-base text-white/60 font-light leading-relaxed animate-fade-in-delay-1"
        style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
      >
        {t('landing.tagline1')}
      </p>
    </div>
  )
}

// ============================================================
// CONCEPT STEPS - CSS animation, no initial opacity:0
// ============================================================

function ConceptSteps() {
  const { t } = useT()
  return (
    <div className="flex items-center gap-2 sm:gap-4 animate-fade-in-up-delay-1">
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm">
          <Phone className="size-4 sm:size-5 text-primary" />
        </div>
        <span className="text-[9px] sm:text-[11px] text-white/60 font-medium">{t('landing.stepRequest')}</span>
      </div>

      <ChevronRight className="size-3 text-white/20" />

      <div className="flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
          <Shield className="size-4 sm:size-5 text-green-400" />
        </div>
        <span className="text-[9px] sm:text-[11px] text-white/60 font-medium">{t('landing.stepAccept')}</span>
      </div>

      <ChevronRight className="size-3 text-white/20" />

      <div className="flex flex-col items-center gap-1">
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
          <Heart className="size-4 sm:size-5 text-amber-400" />
        </div>
        <span className="text-[9px] sm:text-[11px] text-white/60 font-medium">{t('landing.stepConnect')}</span>
      </div>
    </div>
  )
}

// ============================================================
// BENEFIT CHIPS
// ============================================================

function BenefitChips() {
  const { t } = useT()
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 animate-fade-in-up-delay-2">
      {BENEFIT_KEYS.map((b) => (
        <div
          key={b.textKey}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm border border-white/10"
        >
          <b.icon className="size-3 text-primary" />
          <span className="text-[11px] sm:text-xs font-medium text-white/70">{t(b.textKey)}</span>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// CTA BUTTON
// ============================================================

function CTAButton({ onClick, isAuthenticated }: { onClick: () => void; isAuthenticated: boolean }) {
  const { t } = useT()
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-pink-500 to-primary px-10 h-[60px] shadow-xl shadow-primary/30 active:scale-[0.96] transition-transform animate-fade-in-up-delay-3 min-h-[60px] touch-manipulation w-full max-w-[320px]"
    >
      {/* Shimmer */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-premium-shimmer" />

      <span className="relative z-10 flex items-center justify-center gap-2 text-xl font-black text-white">
        {isAuthenticated ? t('landing.ctaReturn') : t('landing.ctaStart')}
        <ArrowRight className="size-6" />
      </span>
    </button>
  )
}

// ============================================================
// SLIDE INDICATOR
// ============================================================

function SlideIndicator() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1.5">
      {HERO_IMAGES.map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === active ? 24 : 5,
            height: 5,
            backgroundColor: i === active ? '#ec4899' : 'rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </div>
  )
}

// ============================================================
// AUTH MODAL — Ultra-Premium Glassmorphism
// ============================================================

const MODAL_SPARKLES = [
  { id: 0, x: 15, y: 20, size: 2, delay: 0, duration: 3 },
  { id: 1, x: 80, y: 15, size: 1.5, delay: 0.8, duration: 3.5 },
  { id: 2, x: 60, y: 70, size: 2.5, delay: 1.5, duration: 2.8 },
  { id: 3, x: 25, y: 80, size: 1.8, delay: 2.2, duration: 3.2 },
  { id: 4, x: 70, y: 45, size: 1.2, delay: 0.5, duration: 4 },
  { id: 5, x: 40, y: 30, size: 2, delay: 1.8, duration: 3 },
]

function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'choose' | 'email' | 'sent'>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useCallback(async (emailToUse: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: 'demo123' }),
      })
      const data = await res.json()
      if (data.user) {
        onClose()
        window.dispatchEvent(new CustomEvent('connectphone:login', { detail: data.user }))
      } else {
        setError(data.error || t('landing.authError'))
      }
    } catch {
      setError(t('landing.authNetworkError'))
    }
    setLoading(false)
  }, [onClose, t])

  const handleMagicLink = useCallback(async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setStep('sent')
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: 'demo123' }),
      })
      const loginData = await loginRes.json()
      if (loginData.user) {
        setTimeout(() => {
          onClose()
          window.dispatchEvent(new CustomEvent('connectphone:login', { detail: loginData.user }))
        }, 2000)
      } else {
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: email.trim().split('@')[0] || 'Utilisateur', email: email.trim(), password: 'demo123' }),
        })
        const registerData = await registerRes.json()
        if (registerData.user) {
          setTimeout(() => {
            onClose()
            window.dispatchEvent(new CustomEvent('connectphone:login', { detail: registerData.user }))
          }, 2000)
        } else {
          setStep('email')
          setError(registerData.error || t('landing.authRegisterError'))
        }
      }
    } catch {
      setStep('email')
      setError(t('landing.authNetworkError'))
    }
    setLoading(false)
  }, [email, onClose, t])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[380px] overflow-hidden rounded-[28px] mx-2 sm:mx-0"
            initial={{ scale: 0.88, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute -inset-[2px] rounded-[30px] opacity-80"
              animate={{
                background: [
                  'conic-gradient(from 0deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
                  'conic-gradient(from 90deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
                  'conic-gradient(from 180deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
                  'conic-gradient(from 270deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            {/* Glass card */}
            <div className="relative rounded-[28px] bg-[#0a0a12]/95 backdrop-blur-2xl p-7">
              {/* Sparkle particles */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                {MODAL_SPARKLES.map((s) => (
                  <motion.div
                    key={s.id}
                    className="absolute rounded-full bg-white"
                    style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
                    animate={{
                      opacity: [0, 0.6, 0],
                      scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                      duration: s.duration,
                      delay: s.delay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-white/40 hover:bg-white/[0.12] hover:text-white/70 transition-all"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Header */}
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-amber-500 shadow-xl shadow-primary/30">
                  <img src="/logo.webp" alt="Fonelove" className="size-10 brightness-0 invert" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">{t('landing.authWelcome')}</h3>
                <p className="mt-1.5 text-sm text-white/40 font-light">{t('landing.authJoin')}</p>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-center text-sm text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {step === 'choose' && (
                  <motion.div
                    key="choose"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="space-y-3"
                  >
                    {/* Google SSO */}
                    <motion.button
                      onClick={() => login('moi@connectphone.fr')}
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-semibold text-gray-700 shadow-lg shadow-black/20 hover:shadow-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <motion.div
                          className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-700"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        />
                      ) : (
                        <svg className="size-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span>{t('landing.authGoogle')}</span>
                    </motion.button>

                    {/* Email magic link */}
                    <motion.button
                      onClick={() => { setStep('email'); setError('') }}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm px-5 py-4 font-semibold text-white/90 hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="size-5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <span>{t('landing.authEmail')}</span>
                    </motion.button>
                  </motion.div>
                )}

                {step === 'email' && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-2.5 block text-sm font-medium text-white/50">{t('landing.authEmailLabel')}</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError('') }}
                          placeholder="exemple@email.com"
                          className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] px-4 py-3.5 text-base text-white placeholder:text-white/20 outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleMagicLink() }}
                        />
                      </div>
                    </div>

                    <motion.button
                      onClick={handleMagicLink}
                      disabled={loading || !email.trim()}
                      className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-pink-500 to-amber-500 py-3.5 font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-40 transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                      />
                      <span className="relative z-10">
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.div
                              className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            />
                            {t('landing.authSending')}
                          </span>
                        ) : (
                          t('landing.authMagicLink')
                        )}
                      </span>
                    </motion.button>

                    <button
                      onClick={() => { setStep('choose'); setError('') }}
                      className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors"
                    >
                      {t('landing.authBack')}
                    </button>

                    <p className="text-center text-[11px] text-white/20">
                      {t('landing.authNoPassword')}
                    </p>
                  </motion.div>
                )}

                {step === 'sent' && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-5 py-6"
                  >
                    <motion.div
                      className="relative flex h-20 w-20 items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-green-500/20"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30">
                        <motion.svg
                          className="size-8 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <motion.path
                            d="M5 12l5 5L20 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                          />
                        </motion.svg>
                      </div>
                    </motion.div>

                    <div className="text-center">
                      <h4 className="text-xl font-bold text-white">{t('landing.authLinkSent')}</h4>
                      <p className="mt-1.5 text-sm text-white/40">{t('landing.authCheckEmail')}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/25">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <span>{t('landing.authConnecting')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/20">
                <Lock className="size-3" />
                <span>{t('landing.authSecure')}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// INLINE AUTH SECTION — Real Google One Tap + Magic Link
// ============================================================

// Extend window for Google GSI
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
        }
      }
    }
  }
}

function InlineAuth() {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'choose' | 'email' | 'sent' | 'success'>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const googleBtnRef = useCallback((node: HTMLDivElement | null) => {
    if (node && window.google && googleLoaded) {
      window.google.accounts.id.renderButton(node, {
        type: 'standard',
        shape: 'pill',
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        logo_alignment: 'left',
        width: node.offsetWidth || 300,
      })
    }
  }, [googleLoaded])

  // Load Google GSI script and initialize
  const googleInitRef = useRef(false)
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || googleInitRef.current) return

    const handleCredential = async (response: { credential: string }) => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        })
        const data = await res.json()
        if (data.user) {
          window.dispatchEvent(new CustomEvent('fonelove:login', { detail: data.user }))
        } else {
          setError(data.error || t('landing.authError'))
        }
      } catch {
        setError(t('landing.authNetworkError'))
      }
      setLoading(false)
    }

    const initGoogle = () => {
      if (!window.google || googleInitRef.current) return
      googleInitRef.current = true
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false, // Reverted to false to avoid origin errors
        itp_support: true,
        use_fedcm_for_prompt: false,
      })
      
      setGoogleLoaded(true)
    }

    // Check if already loaded
    if (window.google) {
      initGoogle()
      return
    }

    // Load script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)
  }, [t])

  const [otpCode, setOtpCode] = useState('')

  // Send OTP code via email
  const handleSendOtp = useCallback(async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('sent')
        setOtpCode('')
      } else {
        setError(data.error || t('landing.authError'))
      }
    } catch {
      setError(t('landing.authNetworkError'))
    }
    setLoading(false)
  }, [email, t])

  // Verify OTP code
  const handleVerifyOtp = useCallback(async (code?: string) => {
    const codeToVerify = code || otpCode
    if (codeToVerify.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: codeToVerify }),
      })
      const data = await res.json()
      if (data.user) {
        setStep('success')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('fonelove:login', { detail: data.user }))
        }, 1500)
      } else {
        setError(data.error || t('landing.authError'))
      }
    } catch {
      setError(t('landing.authNetworkError'))
    }
    setLoading(false)
  }, [otpCode, email, t])

  return (
    <div className="w-full max-w-[340px] mx-auto animate-fade-in-up-delay-2">
      {/* Glassmorphism card */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-[24px] shadow-2xl shadow-black/40"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 260, 
          damping: 20,
          layout: { duration: 0.3, ease: 'easeOut' }
        }}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute -inset-[1.5px] rounded-[26px] opacity-40"
          animate={{
            background: [
              'conic-gradient(from 0deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
              'conic-gradient(from 120deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
              'conic-gradient(from 240deg, #ec4899, #f43f5e, #a855f7, #f59e0b, #ec4899)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Glass card content */}
        <div className="relative rounded-[24px] bg-black/70 backdrop-blur-2xl p-5 border border-white/10">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-center text-xs text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'choose' && (
              <motion.div
                key="choose"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-2.5"
              >
                {/* Google One Tap — Real rendered button */}
                {googleLoaded ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <div ref={googleBtnRef} className="w-full [&>div]:!w-full [&>div>div]:!w-full [&>div>div]:!h-[56px] [&>div>div]:!rounded-2xl overflow-hidden" />
                  </motion.div>
                ) : (
                  <div className="relative w-full h-[56px] rounded-2xl bg-white/5 border border-white/10 animate-pulse overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    <div className="flex items-center justify-center gap-3 h-full">
                      <div className="h-5 w-5 rounded-full bg-white/10" />
                      <div className="h-4 w-32 rounded-full bg-white/10" />
                    </div>
                  </div>
                )}

                {/* Separator */}
                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-black/60 px-3 text-white/25">ou</span></div>
                </div>

                {/* Email button */}
                <motion.button
                  onClick={() => { setStep('email'); setError('') }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.07] border border-white/[0.1] backdrop-blur-sm px-4 py-3.5 font-semibold text-white/90 hover:bg-white/[0.12] transition-all min-h-[56px] touch-manipulation"
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="size-5 text-white/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span className="text-sm">{t('landing.authEmail')}</span>
                </motion.button>
              </motion.div>
            )}

            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="exemple@email.com"
                  className="w-full rounded-xl bg-white/[0.07] border border-white/[0.1] px-4 py-3.5 text-base text-white placeholder:text-white/20 outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all min-h-[52px]"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendOtp() }}
                />
                <motion.button
                  onClick={handleSendOtp}
                  disabled={loading || !email.trim()}
                  className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-pink-500 to-amber-500 py-3.5 font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-40 transition-all min-h-[52px] touch-manipulation"
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 3 }} />
                  <span className="relative z-10 text-sm">{loading ? t('landing.authSending') : t('landing.authSendCode')}</span>
                </motion.button>
                <button onClick={() => { setStep('choose'); setError('') }} className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-1">
                  {t('landing.authBack')}
                </button>
              </motion.div>
            )}

            {step === 'sent' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-3"
              >
                <div className="text-center mb-2">
                  <p className="text-sm text-white/70">{t('landing.authOtpSentTo')}</p>
                  <p className="text-sm font-semibold text-primary truncate">{email}</p>
                </div>

                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setOtpCode(val)
                      setError('')
                      if (val.length === 6) handleVerifyOtp(val)
                    }}
                    placeholder="000000"
                    className="w-full rounded-xl bg-white/[0.07] border border-white/[0.1] px-4 py-4 text-center text-3xl font-black tracking-[0.4em] text-white placeholder:text-white/10 outline-none focus:border-primary/60 focus:shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all min-h-[64px] font-mono"
                    autoFocus
                  />
                  {/* Digital glow line */}
                  <motion.div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: otpCode.length * (100/6) + '%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>

                <motion.button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otpCode.length !== 6}
                  className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-pink-500 to-amber-500 py-3.5 font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-40 transition-all min-h-[52px] touch-manipulation"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm">{loading ? t('landing.authConnecting') : t('landing.authVerifyCode')}</span>
                </motion.button>

                <div className="flex justify-between items-center">
                  <button onClick={() => { setStep('email'); setError(''); setOtpCode('') }} className="text-xs text-white/30 hover:text-white/50 transition-colors py-1">
                    {t('landing.authBack')}
                  </button>
                  <button onClick={handleSendOtp} disabled={loading} className="text-xs text-primary/60 hover:text-primary transition-colors py-1">
                    {t('landing.authResendCode')}
                  </button>
                </div>
              </motion.div>
            )}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 gap-4"
              >
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/40">
                    <motion.svg 
                      className="size-10 text-white" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </motion.svg>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black text-white">{t('landing.authSuccess')}</h4>
                  <p className="text-sm text-white/50">{t('landing.authRedirecting')}</p>
                </div>
                
                {/* Micro-loader */}
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="h-1 w-1 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security footer */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-white/20">
            <Lock className="size-2.5" />
            <span>{t('landing.authSecure')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================
// LANDING PAGE - Main with inline auth
// ============================================================

export default function LandingPage({ onStart }: { onStart?: () => void }) {
  const { t } = useT()
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const onboardingDone = useAppStore((s) => s.onboardingDone)

  const handleEnter = useCallback(() => {
    if (onStart) { onStart(); return }
    window.dispatchEvent(new CustomEvent('fonelove:enter-app'))
  }, [onStart])

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black select-none">
      <BackgroundSlideshow />
      <FloatingParticles />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        {/* TOP: Logo */}
        <div className="flex w-full items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="Fonelove" 
              className="h-10 w-10 rounded-[14px] object-cover shadow-lg shadow-pink-500/30"
            />
            <span className="text-xl font-black text-white tracking-tight">Fonelove</span>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleEnter}
              className="rounded-full bg-white/10 border border-white/10 px-5 py-2 text-xs font-semibold text-white/70 backdrop-blur-sm hover:bg-white/15 hover:text-white active:scale-95 transition-all touch-manipulation min-h-[36px]"
            >
              {onboardingDone ? t('landing.enter') : t('landing.continueBtn')}
            </button>
          )}
        </div>

        {/* CENTER: Hero + Auth */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:gap-5 w-full">
          <AnimatedTagline />
          <ConceptSteps />

          {isAuthenticated ? (
            <CTAButton onClick={handleEnter} isAuthenticated={true} />
          ) : (
            <InlineAuth />
          )}
        </div>

        {/* BOTTOM */}
        <div className="flex w-full flex-col items-center gap-3 animate-fade-in">
          <SlideIndicator />
          <div className="flex items-center justify-center gap-3 text-[10px] text-white/30 text-center">
            <a href="/privacy" className="hover:text-white/60 transition-colors">Confidentialité</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white/60 transition-colors">Conditions</a>
          </div>
        </div>
      </div>
    </div>
  )
}
