'use client'

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Share2 } from 'lucide-react'
import { useT } from '@/lib/i18n/context'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

type FeedbackType =
  | 'like'
  | 'pass'
  | 'match'
  | 'request-sent'
  | 'request-received'
  | 'request-accepted'
  | 'request-declined'
  | 'message-sent'
  | 'message-received'
  | 'number-revealed'
  | 'number-copied'
  | 'boost'
  | 'streak'
  | 'badge-earned'
  | 'premium'
  | 'super-request'

interface FeedbackEvent {
  id: string
  type: FeedbackType
  data?: Record<string, unknown>
  timestamp: number
}

interface FeedbackContextType {
  trigger: (type: FeedbackType, data?: Record<string, unknown>) => void
}

// ============================================================
// CONTEXT
// ============================================================

const FeedbackContext = createContext<FeedbackContextType>({ trigger: () => {} })

export function useFeedback() {
  return useContext(FeedbackContext)
}

// ============================================================
// CONFETTI SYSTEM
// ============================================================

interface ConfettiParticle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocityX: number
  velocityY: number
  gravity: number
  drag: number
  shape: 'circle' | 'square' | 'triangle' | 'heart'
}

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96E6A1',
  '#DDA0DD', '#FF9FF3', '#FECA57', '#FF6348', '#7BED9F',
  '#70A1FF', '#FF4757', '#ECCC68', '#A29BFE', '#FD79A8',
]

function ConfettiExplosion({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ConfettiParticle[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!active || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const shapes: ConfettiParticle['shape'][] = ['circle', 'square', 'triangle', 'heart']

    // Create particles from center-top
    const particles: ConfettiParticle[] = []
    for (let i = 0; i < 120; i++) {
      const angle = (Math.random() * Math.PI * 2)
      const speed = 4 + Math.random() * 10
      particles.push({
        id: i,
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - 6,
        gravity: 0.15 + Math.random() * 0.1,
        drag: 0.97 + Math.random() * 0.02,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }
    particlesRef.current = particles

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath()
      ctx.moveTo(x, y + size / 4)
      ctx.quadraticCurveTo(x, y, x + size / 4, y)
      ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4)
      ctx.quadraticCurveTo(x + size / 2, y, x + size * 3 / 4, y)
      ctx.quadraticCurveTo(x + size, y, x + size, y + size / 4)
      ctx.quadraticCurveTo(x + size, y + size / 2, x + size / 2, y + size * 3 / 4)
      ctx.quadraticCurveTo(x, y + size / 2, x, y + size / 4)
      ctx.fill()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false

      for (const p of particlesRef.current) {
        p.velocityX *= p.drag
        p.velocityY *= p.drag
        p.velocityY += p.gravity
        p.x += p.velocityX
        p.y += p.velocityY
        p.rotation += p.velocityX * 2

        if (p.y < canvas.height + 50) {
          alive = true
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height)

          if (p.shape === 'circle') {
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
          } else if (p.shape === 'square') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
          } else if (p.shape === 'triangle') {
            ctx.beginPath()
            ctx.moveTo(0, -p.size / 2)
            ctx.lineTo(p.size / 2, p.size / 2)
            ctx.lineTo(-p.size / 2, p.size / 2)
            ctx.closePath()
            ctx.fill()
          } else if (p.shape === 'heart') {
            drawHeart(ctx, -p.size / 2, -p.size / 2, p.size)
          }

          ctx.restore()
        }
      }

      if (alive) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[200]"
    />
  )
}

// ============================================================
// FLOATING ICONS (Hearts, Phones, Stars flying up)
// ============================================================

interface FloatingIconData {
  id: string
  icon: string
  x: number
  delay: number
  size: number
}

function FloatingIcons({ icons }: { icons: FloatingIconData[] }) {
  return (
    <>
      {icons.map((icon) => (
        <motion.div
          key={icon.id}
          className="pointer-events-none fixed z-[150] text-4xl"
          style={{ left: icon.x, bottom: '10%' }}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [-20, -80, -160],
            scale: [0.5, 1.2, 0.8],
            x: [0, (Math.random() - 0.5) * 60],
          }}
          transition={{
            duration: 1.5,
            delay: icon.delay,
            ease: 'easeOut',
          }}
        >
          <span style={{ fontSize: icon.size }}>{icon.icon}</span>
        </motion.div>
      ))}
    </>
  )
}

// ============================================================
// SCREEN FLASH / PULSE EFFECT
// ============================================================

function ScreenPulse({ color, active }: { color: string; active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100]"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}

// ============================================================
// MATCH CELEBRATION OVERLAY
// ============================================================

function MatchCelebration({
  active,
  names,
  photos,
  onDismiss,
}: {
  active: boolean
  names: [string, string]
  photos: [string, string]
  onDismiss: () => void
}) {
  const { t } = useT()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (active) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <>
          <ConfettiExplosion active={showConfetti} />
          <motion.div
            className="fixed inset-0 z-[220] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onDismiss}
            />

            {/* Content */}
            <motion.div
              className="relative z-10 flex flex-col items-center px-8"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
            >
              {/* Sparkle ring */}
              <motion.div
                className="absolute -inset-20 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(255,107,157,0)',
                    '0 0 60px 30px rgba(255,107,157,0.3)',
                    '0 0 0 0 rgba(255,107,157,0)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-widest text-primary">
                  {t('feedback.match')}
                </h2>
              </motion.div>

              <motion.h1
                className="mb-8 bg-gradient-to-r from-primary via-pink-400 to-red-400 bg-clip-text text-center text-5xl font-black text-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {t('feedback.matchTitle')}
              </motion.h1>

              {/* Avatars */}
              <div className="mb-8 flex items-center gap-6">
                <motion.div
                  className="relative"
                  initial={{ x: -60, opacity: 0, rotate: -15 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                >
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-primary p-0.5">
                    <img src={photos[0]} alt={names[0]} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ❤️
                  </motion.div>
                </motion.div>

                {/* Heart between avatars */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-5xl"
                >
                  💕
                </motion.div>

                <motion.div
                  className="relative"
                  initial={{ x: 60, opacity: 0, rotate: 15 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                >
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-primary p-0.5">
                    <img src={photos[1]} alt={names[1]} className="h-full w-full rounded-full object-cover" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  >
                    ❤️
                  </motion.div>
                </motion.div>
              </div>

              {/* Names */}
              <motion.p
                className="mb-6 text-center text-lg text-white/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {names[0]} & {names[1]}
              </motion.p>

              {/* CTA */}
              <motion.button
                className="rounded-full bg-gradient-to-r from-primary to-pink-500 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-primary/40"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  useAppStore.getState().setActiveTab('messages')
                  onDismiss()
                }}
              >
                {t('feedback.sendMessage')}
              </motion.button>

              <motion.button
                className="mt-3 text-sm text-white/50 hover:text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={() => {
                  useAppStore.getState().setActiveTab('discover')
                  onDismiss()
                }}
              >
                {t('feedback.keepDiscovering')}
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// REQUEST SENT CELEBRATION
// ============================================================

function RequestSentCelebration({
  active,
  name,
  onDismiss,
}: {
  active: boolean
  name: string
  onDismiss: () => void
}) {
  const { t } = useT()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (active) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <>
          <ConfettiExplosion active={showConfetti} />
          <motion.div
            className="fixed inset-0 z-[220] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onDismiss}
            />
            <motion.div
              className="relative z-10 flex flex-col items-center rounded-3xl bg-card border border-primary/20 p-8 shadow-2xl shadow-primary/20 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Phone ring animation */}
              <motion.div
                className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 shadow-lg shadow-primary/30"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <motion.span
                  className="text-5xl"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  📱
                </motion.span>
              </motion.div>

              {/* Ripple rings */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute h-24 w-24 rounded-full border-2 border-primary/30"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              <motion.h2
                className="mb-2 text-2xl font-black bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('feedback.requestSent')}
              </motion.h2>

              <motion.p
                className="mb-6 text-center text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('feedback.requestSentHint', { name })}
              </motion.p>

              {/* Progress steps */}
              <motion.div
                className="mb-6 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
                  <span className="text-sm">📤</span>
                  <span className="text-xs font-medium text-primary">{t('feedback.sent')}</span>
                </div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <span className="text-muted-foreground">→</span>
                </motion.div>
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <span className="text-sm">⏳</span>
                  <span className="text-xs font-medium text-muted-foreground">{t('feedback.pending')}</span>
                </div>
                <span className="text-muted-foreground">→</span>
                <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                  <span className="text-sm">📱</span>
                  <span className="text-xs font-medium text-muted-foreground">{t('feedback.number')}</span>
                </div>
              </motion.div>

              <motion.button
                className="w-full rounded-full bg-gradient-to-r from-primary to-pink-500 px-6 py-3 text-white font-semibold shadow-lg shadow-primary/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
              >
                {t('feedback.great')}
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// REQUEST ACCEPTED CELEBRATION (Phone Reveal)
// ============================================================

function RequestAcceptedCelebration({
  active,
  name,
  phone,
  photo,
  onDismiss,
}: {
  active: boolean
  name: string
  phone?: string
  photo?: string
  onDismiss: () => void
}) {
  const { t } = useT()
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (active) {
      setRevealed(false)
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(t)
    }
  }, [active])

  const handleCopy = () => {
    if (phone) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(phone)
          .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
          .catch(() => fallbackCopy(phone))
      } else {
        fallbackCopy(phone)
      }
    }
  }

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Fallback copy failed', err)
    }
    document.body.removeChild(textArea)
  }

  return (
    <AnimatePresence>
      {active && (
        <>
          <ConfettiExplosion active={showConfetti} />
          <motion.div
            className="fixed inset-0 z-[220] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={onDismiss}
            />
            <motion.div
              className="relative z-10 flex flex-col items-center rounded-3xl bg-card border border-green-500/20 p-8 shadow-2xl shadow-green-500/10 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Golden glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/10 via-green-500/10 to-gold/10 blur-xl pointer-events-none" />

              {/* Avatar with green ring */}
              <motion.div
                className="relative mb-4 z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-green-500 p-0.5">
                  <img src={photo || `https://i.pravatar.cc/200?img=1`} alt={name} className="h-full w-full rounded-full object-cover" />
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white text-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  ✓
                </motion.div>
              </motion.div>

              <motion.h2
                className="mb-1 text-2xl font-black text-green-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('feedback.numberObtained')}
              </motion.h2>

              <motion.p
                className="mb-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {t('feedback.acceptedHint', { name })}
              </motion.p>

              {/* Phone number reveal */}
              <motion.div
                className="mb-4 w-full relative z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <AnimatePresence mode="wait">
                  {!revealed ? (
                    <motion.button
                      key="reveal-btn"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-4 text-white font-bold shadow-lg shadow-green-500/30"
                      onClick={() => setRevealed(true)}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                      >
                        📱
                      </motion.span>
                      {t('feedback.revealNumber')}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="revealed-phone"
                      initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="rounded-2xl bg-green-500/10 border border-green-500/30 p-4 text-center"
                    >
                      <p className="text-3xl font-black text-green-500 tracking-wider">{phone || '+33 6 XX XX XX XX'}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex-1 rounded-xl bg-green-500/20 py-2 text-sm font-medium text-green-500 hover:bg-green-500/30 transition-colors"
                        >
                          {copied ? '✅ Copié !' : '📋 Copier'}
                        </button>
                        <a
                          href={`sms:${phone}`}
                          className="flex-1 rounded-xl bg-green-500/20 py-2 text-sm font-medium text-green-500 hover:bg-green-500/30 transition-colors text-center"
                        >
                          💬 SMS
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* App Recommendation Invite */}
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="mb-4 w-full rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center overflow-hidden"
                >
                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Aide tes amis à matcher !</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-tight">
                    L'amour se partage. Recommande Fonelove à un ami !
                  </p>
                  <button
                    onClick={() => {
                      const shareText = t('share.appMessage')
                      if (navigator.share) {
                        navigator.share({
                          title: t('share.appTitle'),
                          text: shareText,
                        }).catch(() => {
                          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
                        })
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-fonelove px-4 py-3.5 text-sm font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-tight"
                  >
                    <Share2 className="size-4" /> {t('share.appButton') || "Partager l'application"}
                  </button>
                </motion.div>
              )}

              <motion.button
                className="w-full relative z-20 rounded-full bg-muted px-6 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onDismiss}
              >
                {t('feedback.close')}
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// BOOST ACTIVATION EFFECT
// ============================================================

function BoostEffect({ active, onDismiss }: { active: boolean; onDismiss: () => void }) {
  const { t } = useT()
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Radial lightning */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 3, opacity: [0.8, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />

          {/* Central bolt */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <span className="text-8xl">⚡</span>
          </motion.div>

          {/* Shockwave */}
          <motion.div
            className="absolute h-32 w-32 rounded-full border-4 border-primary/50"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute h-32 w-32 rounded-full border-2 border-gold/40"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
          />

          {/* Text */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-2xl font-black bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              {t('feedback.boostActivated')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t('feedback.boostHint')}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// STREAK CELEBRATION
// ============================================================

function StreakCelebration({ active, days, onDismiss }: { active: boolean; days: number; onDismiss: () => void }) {
  const { t } = useT()
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[220] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            className="relative z-10 flex flex-col items-center rounded-3xl bg-gradient-to-br from-orange-500/10 via-card to-red-500/10 border border-orange-500/20 p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Fire emoji with animation */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
              }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-7xl mb-4"
            >
              🔥
            </motion.div>

            <motion.h2
              className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('feedback.daysStreak', { days })}
            </motion.h2>

            <motion.p
              className="text-sm text-muted-foreground text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {days >= 7
                ? t('feedback.streakOnFire')
                : t('feedback.streakKeep', { days })}
            </motion.p>

            {/* Streak bar */}
            <motion.div
              className="w-full h-3 rounded-full bg-muted overflow-hidden mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (days / 7) * 100)}%` }}
                transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
              />
            </motion.div>
            <p className="text-xs text-muted-foreground mb-4">{t('feedback.daysBeforeBadge', { days: Math.max(0, 7 - days) })}</p>

            <motion.button
              className="w-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-white font-semibold shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
            >
              {t('feedback.continueFire')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// BADGE EARNED CELEBRATION
// ============================================================

function BadgeEarnedCelebration({
  active,
  badgeType,
  onDismiss,
}: {
  active: boolean
  badgeType: string
  onDismiss: () => void
}) {
  const { t } = useT()
  const [showConfetti, setShowConfetti] = useState(false)
  const badgeIcons: Record<string, string> = {
    verified: '✅', popular: '🔥', quick_reply: '⚡', loyal: '💎', premium: '👑', streak_5: '🔥',
    first_request: '📱', first_match: '💕', first_message: '💬',
  }
  const badgeNameKeys: Record<string, string> = {
    verified: 'badge.verified', popular: 'badge.popular', quick_reply: 'badge.quickReply', loyal: 'badge.loyal',
    premium: 'badge.premium', streak_5: 'badge.streak5', first_request: 'badge.firstRequest',
    first_match: 'badge.firstMatch', first_message: 'badge.firstMessage',
  }

  useEffect(() => {
    if (active) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <>
          <ConfettiExplosion active={showConfetti} />
          <motion.div
            className="fixed inset-0 z-[220] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onDismiss}
            />
            <motion.div
              className="relative z-10 flex flex-col items-center rounded-3xl bg-card border border-gold/20 p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Badge shine */}
              <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-full h-full rounded-full bg-gold/20 blur-2xl" />
              </motion.div>

              {/* Badge icon */}
              <motion.div
                className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold/20 to-amber-500/20 border-2 border-gold/30"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <span className="text-5xl">{badgeIcons[badgeType] || '🏅'}</span>
              </motion.div>

              <motion.h2
                className="mb-1 text-xl font-black text-gold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('feedback.newBadge')}
              </motion.h2>

              <motion.p
                className="mb-1 text-lg font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {t(badgeNameKeys[badgeType] || `badge.${badgeType}`)}
              </motion.p>

              <motion.p
                className="mb-6 text-sm text-muted-foreground text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {t('feedback.badgeUnlocked')}
              </motion.p>

              <motion.button
                className="w-full rounded-full bg-gradient-to-r from-gold to-amber-500 px-6 py-3 text-gold-foreground font-semibold shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
              >
                {t('feedback.awesome')}
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// PREMIUM UNLOCK CELEBRATION
// ============================================================

function PremiumCelebration({ active, onDismiss }: { active: boolean; onDismiss: () => void }) {
  const { t } = useT()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (active) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(t)
    }
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <>
          <ConfettiExplosion active={showConfetti} />
          <motion.div
            className="fixed inset-0 z-[220] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-gold/5 to-black/80 backdrop-blur-md"
              onClick={onDismiss}
            />
            <motion.div
              className="relative z-10 flex flex-col items-center rounded-3xl bg-gradient-to-br from-gold/10 via-card to-amber-500/5 border border-gold/30 p-8 max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Golden shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />

              <motion.span
                className="text-7xl mb-4"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                👑
              </motion.span>

              <motion.h2
                className="text-3xl font-black bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {t('feedback.welcomePremium')}
              </motion.h2>

              <motion.p
                className="text-sm text-muted-foreground text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('feedback.premiumFeatures')}
              </motion.p>

              {/* Features unlocked */}
              <motion.div
                className="w-full space-y-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: '⚡', key: 'premium.unlimitedBoosts' },
                  { icon: '👑', key: 'premium.superRequests' },
                  { icon: '🛡️', key: 'premium.incognito' },
                  { icon: '💬', key: 'premium.unlimitedMessages' },
                  { icon: '👁️', key: 'premium.seeWhoVisited' },
                ].map((feature, i) => (
                  <motion.div
                    key={feature.key}
                    className="flex items-center gap-3 rounded-xl bg-gold/5 px-4 py-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-sm font-medium">{t(feature.key)}</span>
                    <motion.span
                      className="ml-auto text-green-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                    >
                      ✓
                    </motion.span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                className="w-full rounded-full bg-gradient-to-r from-gold to-amber-500 px-6 py-3 text-gold-foreground font-bold shadow-lg shadow-gold/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
              >
                {t('feedback.letsGo')} 👑
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// QUICK ACTION TOAST (for smaller feedbacks)
// ============================================================

interface ToastData {
  id: string
  icon: string
  message: string
  color: string
}

function ActionToast({ toast }: { toast: ToastData }) {
  return (
    <motion.div
      className="fixed top-4 left-1/2 z-[190] -translate-x-1/2"
      initial={{ y: -80, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -40, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        className="flex items-center gap-2 rounded-full px-5 py-2.5 shadow-xl backdrop-blur-lg border"
        style={{
          backgroundColor: `color-mix(in oklch, ${toast.color} 15%, var(--card))`,
          borderColor: `color-mix(in oklch, ${toast.color} 30%, transparent)`,
        }}
      >
        <motion.span
          className="text-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          {toast.icon}
        </motion.span>
        <span className="text-sm font-semibold" style={{ color: toast.color }}>
          {toast.message}
        </span>
      </div>
    </motion.div>
  )
}

// ============================================================
// MAIN FEEDBACK PROVIDER
// ============================================================

export default function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { t } = useT()
  const [events, setEvents] = useState<FeedbackEvent[]>([])
  const [floatingIcons, setFloatingIcons] = useState<FloatingIconData[]>([])
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [screenPulse, setScreenPulse] = useState<{ color: string; active: boolean }>({ color: '', active: false })

  // Celebration states
  const [matchData, setMatchData] = useState<{ active: boolean; names: [string, string]; photos: [string, string] }>({
    active: false, names: ['', ''], photos: ['', ''],
  })
  const [requestData, setRequestData] = useState<{ active: boolean; name: string }>({ active: false, name: '' })
  const [acceptedData, setAcceptedData] = useState<{ active: boolean; name: string; phone?: string; photo?: string }>({
    active: false, name: '',
  })
  const [boostActive, setBoostActive] = useState(false)
  const [streakData, setStreakData] = useState<{ active: boolean; days: number }>({ active: false, days: 0 })
  const [badgeData, setBadgeData] = useState<{ active: boolean; badgeType: string }>({ active: false, badgeType: '' })
  const [premiumActive, setPremiumActive] = useState(false)
  const [persistentNotif, setPersistentNotif] = useState<{ icon: string; title: string; message: string; isMinimized?: boolean; action?: () => void } | null>(null)

  const trigger = useCallback((type: FeedbackType, data?: Record<string, unknown>) => {
    const id = `${type}-${Date.now()}-${Math.random()}`
    
    // Auto-minimize persistent notifications
    if (type === 'message-received') {
      setTimeout(() => {
        setPersistentNotif(prev => {
          if (prev && !prev.isMinimized) return { ...prev, isMinimized: true }
          return prev
        })
      }, 5000)
    }

    // Add event
    setEvents((prev) => [...prev, { id, type, data, timestamp: Date.now() }])
    setTimeout(() => setEvents((prev) => prev.filter((e) => e.id !== id)), 3000)

    // Generate floating icons
    const iconSets: Record<FeedbackType, string[]> = {
      like: ['❤️', '💕', '💗', '💖', '🩷'],
      pass: ['👋', '🤷'],
      match: ['💕', '🔥', '💥', '✨', '💫', '🎉'],
      'request-sent': ['📱', '📤', '✨', '🤞', '💫'],
      'request-received': ['📱', '📩', '✨', '🤞', '💫'],
      'request-accepted': ['🎉', '✅', '📱', '💚', '🎊'],
      'request-declined': ['😌', '💪'],
      'message-sent': ['💬', '✉️'],
      'message-received': ['📩', '💬', '❗'],
      'number-revealed': ['📱', '🎉', '🎊', '✨'],
      'number-copied': ['📋', '✅'],
      boost: ['⚡', '🚀', '💫', '✨'],
      streak: ['🔥', '💯', '⚡'],
      'badge-earned': ['🏅', '⭐', '✨', '🏆'],
      premium: ['👑', '✨', '💎', '⭐'],
      'super-request': ['⭐', '📱', '✨', '💫', '🌟'],
    }

    const icons = iconSets[type] || ['✨']
    const count = type === 'match' ? 12 : type === 'like' ? 5 : type === 'request-sent' ? 8 : 3
    const newIcons: FloatingIconData[] = []
    for (let i = 0; i < count; i++) {
      newIcons.push({
        id: `${id}-icon-${i}`,
        icon: icons[Math.floor(Math.random() * icons.length)],
        x: 20 + Math.random() * 60,
        delay: i * 0.1,
        size: 20 + Math.random() * 20,
      })
    }
    setFloatingIcons((prev) => [...prev, ...newIcons])
    setTimeout(() => setFloatingIcons((prev) => prev.filter((fi) => !newIcons.includes(fi))), 2500)

    // Screen pulse
    const pulseColors: Record<FeedbackType, string> = {
      like: 'rgba(255,107,157,0.15)',
      pass: 'rgba(156,163,175,0.1)',
      match: 'rgba(255,107,157,0.3)',
      'request-sent': 'rgba(236,72,153,0.2)',
      'request-received': 'rgba(236,72,153,0.2)',
      'request-accepted': 'rgba(34,197,94,0.2)',
      'request-declined': 'rgba(239,68,68,0.1)',
      'message-sent': 'rgba(236,72,153,0.1)',
      'message-received': 'rgba(236,72,153,0.3)',
      'number-revealed': 'rgba(34,197,94,0.2)',
      'number-copied': 'rgba(34,197,94,0.1)',
      boost: 'rgba(249,115,22,0.2)',
      streak: 'rgba(249,115,22,0.2)',
      'badge-earned': 'rgba(217,119,6,0.2)',
      premium: 'rgba(217,119,6,0.2)',
      'super-request': 'rgba(217,119,6,0.2)',
    }
    setScreenPulse({ color: pulseColors[type], active: true })
    setTimeout(() => setScreenPulse((prev) => ({ ...prev, active: false })), 600)

    // Toast notifications for smaller actions
    const toastConfigs: Partial<Record<FeedbackType, { icon: string; message: string; color: string }>> = {
      pass: { icon: '👋', message: t('feedback.pass'), color: 'oklch(0.65 0.01 340)' },
      'number-copied': { icon: '📋', message: t('feedback.numberCopied'), color: 'oklch(0.65 0.18 145)' },
      'request-declined': { icon: '💪', message: t('feedback.keepGoing'), color: 'oklch(0.65 0.01 340)' },
    }

    if (toastConfigs[type]) {
      const tc = toastConfigs[type]!
      const toastId = `${id}-toast`
      setToasts((prev) => [...prev, { id: toastId, ...tc }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 2500)
    }

    // Full-screen celebrations
    if (type === 'match') {
      setMatchData({
        active: true,
        names: [(data?.name1 as string) || 'Toi', (data?.name2 as string) || 'Quelqu\'un'],
        photos: [
          (data?.photo1 as string) || 'https://i.pravatar.cc/200?img=11',
          (data?.photo2 as string) || 'https://i.pravatar.cc/200?img=1',
        ],
      })
    }

    if (type === 'request-sent') {
      setRequestData({ active: true, name: (data?.name as string) || 'quelqu\'un' })
    }

    if (type === 'message-received') {
      let displayMessage = (data?.content as string) || t('feedback.newMessageText')
      let displayIcon = '💬'

      if (displayMessage.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(displayMessage)
          if (parsed && typeof parsed.amount === 'number') {
            displayIcon = '🎁'
            if (parsed.message && parsed.message.trim()) {
              displayMessage = `🎁 Cadeau (${parsed.amount} 💖) : ${parsed.message}`
            } else {
              displayMessage = `🎁 T'a envoyé un Cadeau FoneLove ! (${parsed.amount} 💖)`
            }
          }
        } catch (e) {
          // Ignore parse errors, keep original message
        }
      }

      setPersistentNotif({
        icon: displayIcon,
        title: (data?.name as string) || t('feedback.newMessage'),
        message: displayMessage,
        isMinimized: false,
        action: () => {
           if (data?.requestId) {
             const store = useAppStore.getState()
             // Configurer la conversation à ouvrir automatiquement
             store.setAutoOpenRequestId(data.requestId as string)
             // Basculer vers l'onglet des messages
             store.setActiveTab('messages')
           }
        }
      })
    }

    if (type === 'request-accepted') {
      setAcceptedData({
        active: true,
        name: (data?.name as string) || 'quelqu\'un',
        phone: data?.phone as string | undefined,
        photo: data?.photo as string | undefined,
      })
    }

    if (type === 'boost') {
      setBoostActive(true)
      setTimeout(() => setBoostActive(false), 2000)
    }

    if (type === 'streak' && typeof data?.days === 'number') {
      setStreakData({ active: true, days: data.days as number })
    }

    if (type === 'badge-earned') {
      setBadgeData({ active: true, badgeType: (data?.badgeType as string) || 'verified' })
    }

    if (type === 'premium') {
      setPremiumActive(true)
    }
  }, [])

  return (
    <FeedbackContext.Provider value={{ trigger }}>
      {children}

      {/* Global feedback layers */}
      {typeof window !== 'undefined' && createPortal(
        <>
          {/* Screen pulse */}
          <ScreenPulse color={screenPulse.color} active={screenPulse.active} />

          {/* Floating icons */}
          <FloatingIcons icons={floatingIcons} />

          {/* Toast notifications */}
          <AnimatePresence>
            {toasts.map((toast) => (
              <ActionToast key={toast.id} toast={toast} />
            ))}
          </AnimatePresence>

          {/* Full-screen celebrations */}
          <MatchCelebration
            active={matchData.active}
            names={matchData.names}
            photos={matchData.photos}
            onDismiss={() => setMatchData((prev) => ({ ...prev, active: false }))}
          />

          <RequestSentCelebration
            active={requestData.active}
            name={requestData.name}
            onDismiss={() => setRequestData((prev) => ({ ...prev, active: false }))}
          />

          <RequestAcceptedCelebration
            active={acceptedData.active}
            name={acceptedData.name}
            phone={acceptedData.phone}
            photo={acceptedData.photo}
            onDismiss={() => setAcceptedData((prev) => ({ ...prev, active: false }))}
          />

          <BoostEffect
            active={boostActive}
            onDismiss={() => setBoostActive(false)}
          />

          <StreakCelebration
            active={streakData.active}
            days={streakData.days}
            onDismiss={() => setStreakData((prev) => ({ ...prev, active: false }))}
          />

          <BadgeEarnedCelebration
            active={badgeData.active}
            badgeType={badgeData.badgeType}
            onDismiss={() => setBadgeData((prev) => ({ ...prev, active: false }))}
          />

          <PremiumCelebration
            active={premiumActive}
            onDismiss={() => setPremiumActive(false)}
          />

          {/* Persistent Notifications / Miniaturizable */}
          <AnimatePresence mode="wait">
            {persistentNotif && (
              <motion.div
                key={persistentNotif.isMinimized ? 'mini' : 'full'}
                initial={{ y: -100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -100, opacity: 0, scale: 0.8 }}
                className={cn(
                  "fixed z-[210] flex items-center gap-3 bg-background/95 shadow-2xl border-2 border-primary/20 backdrop-blur-md transition-all duration-500",
                  persistentNotif.isMinimized 
                    ? "top-20 right-4 w-14 h-14 rounded-full p-1 justify-center cursor-pointer hover:scale-110 active:scale-95" 
                    : "top-4 left-4 right-4 rounded-2xl p-4 cursor-pointer"
                )}
                onClick={() => {
                  if (persistentNotif.isMinimized) {
                    setPersistentNotif(prev => prev ? { ...prev, isMinimized: false } : null)
                  } else {
                    if (persistentNotif.action) persistentNotif.action()
                    setPersistentNotif(null)
                  }
                }}
              >
                {persistentNotif.isMinimized ? (
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                      {persistentNotif.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-fonelove animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">
                      {persistentNotif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{persistentNotif.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{persistentNotif.message}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setPersistentNotif(null) }}
                         className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
                       >
                         ✕
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setPersistentNotif(prev => prev ? { ...prev, isMinimized: true } : null) }}
                         className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary"
                       >
                         −
                       </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </FeedbackContext.Provider>
  )
}
