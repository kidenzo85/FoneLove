'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  motion,
  AnimatePresence,
  PanInfo,
} from 'framer-motion'
import {
  Heart, Phone, MapPin, Shield, Star, Share2,
  MessageCircle, X, ChevronUp, Sparkles, Briefcase,
  GraduationCap, Users, RotateCcw,
  Disc3, Clock as ClockIcon, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type ProfileWithDetails, useAppStore } from '@/lib/store'
import { useFeedback } from '@/components/FeedbackSystem'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import FoneLoveButton from '@/components/FoneLoveButton'
import { usePremiumFeatures } from '@/lib/premium-features-store'
import { useConnectCoinStore } from '@/lib/connectcoin-store'

// ============================================================
// FLOATING PARTICLE SYSTEM (ambient + hearts)
// ============================================================

interface Particle {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  type: 'dot' | 'heart'
  drift: number
}

function FloatingParticles() {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = []
    for (let i = 0; i < 18; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 8,
        opacity: 0.15 + Math.random() * 0.25,
        type: 'dot',
        drift: (Math.random() - 0.5) * 60,
      })
    }
    for (let i = 0; i < 4; i++) {
      items.push({
        id: 100 + i,
        x: 10 + Math.random() * 80,
        size: 10 + Math.random() * 8,
        duration: 12 + Math.random() * 10,
        delay: Math.random() * 15,
        opacity: 0.12 + Math.random() * 0.1,
        type: 'heart',
        drift: (Math.random() - 0.5) * 40,
      })
    }
    return items
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, bottom: '-5%' }}
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
        >
          {p.type === 'dot' ? (
            <div
              className="rounded-full bg-white"
              style={{
                width: p.size,
                height: p.size,
                boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.3)`,
              }}
            />
          ) : (
            <span style={{ fontSize: p.size, opacity: 0.7 }}>💕</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// TUTORIAL PARTICLE EFFECTS
// ============================================================

function TutorialParticles() {
  const items = useMemo(() => {
    const arr: any[] = []
    for (let i = 0; i < 20; i++) {
      arr.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        emoji: ['✨', '💫', '⭐', '❤️', '💕', '🌟'][Math.floor(Math.random() * 6)],
        size: 12 + Math.random() * 16,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 4,
        drift: (Math.random() - 0.5) * 40,
        spin: Math.random() * 30,
      })
    }
    return arr
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[61] overflow-hidden">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -30, -60],
            x: [0, item.drift],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, item.spin],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          <span style={{ fontSize: item.size }}>{item.emoji}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// ENHANCED TUTORIAL OVERLAY (4 phases with glassmorphism)
// ============================================================

function SwipeTutorial({ onDismiss, visible }: { onDismiss: () => void; visible: boolean }) {
  const { t } = useT()
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) return
    const t0 = setTimeout(() => {
      setPhase(0)
      setProgress(0)
    }, 0)
    const t1 = setTimeout(() => setPhase(1), 2000)
    const t2 = setTimeout(() => setPhase(2), 5000)
    const t3 = setTimeout(() => setPhase(3), 7000)

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1.43, 100))
    }, 100)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearInterval(interval)
    }
  }, [visible])

  if (!visible) return null

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onDismiss} />
      <TutorialParticles />

      <motion.div
        className="relative z-10 mx-6 w-full max-w-sm"
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute -inset-[2px] rounded-3xl"
          animate={{
            background: [
              'linear-gradient(45deg, #ec4899, #f43f5e, #ec4899)',
              'linear-gradient(135deg, #f43f5e, #a855f7, #ec4899)',
              'linear-gradient(225deg, #a855f7, #ec4899, #f43f5e)',
              'linear-gradient(315deg, #ec4899, #f43f5e, #a855f7)',
              'linear-gradient(45deg, #ec4899, #f43f5e, #ec4899)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ filter: 'blur(1px)' }}
        />

        {/* Glass card */}
        <div className="relative rounded-3xl bg-black/70 backdrop-blur-xl p-8 border border-white/10">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 shadow-lg shadow-primary/40"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(236,72,153,0.4)',
                      '0 0 30px 10px rgba(236,72,153,0.2)',
                      '0 0 0 0 rgba(236,72,153,0.4)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Phone className="size-10 text-white" />
                </motion.div>
                <motion.h2
                  className="text-3xl font-black text-white"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Bienvenue sur Fonelove ✨
                </motion.h2>
                <p className="text-white/60 text-sm">{t('tiktok.discover')}</p>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div
                key="swipe-up"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-5"
              >
                <div className="relative h-32 w-24 flex items-center justify-center">
                  <motion.div
                    className="absolute bottom-0 w-1 rounded-full bg-gradient-to-t from-primary/80 to-transparent"
                    animate={{ height: [0, 80, 80, 0], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="text-5xl relative z-10"
                    animate={{ y: [20, -40, -40, 20] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.6, 1] }}
                  >
                    ☝️
                  </motion.span>
                </div>
                <div>
                  <motion.h2
                    className="text-2xl font-bold text-white"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {t('tiktok.swipeUp')}
                  </motion.h2>
                  <p className="text-white/60 text-sm mt-1">{t('tiktok.nextProfile')}</p>
                </div>
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div
                key="double-tap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="relative">
                  <motion.span
                    className="text-6xl block"
                    animate={{ scale: [1, 1.3, 1, 1.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    ❤️
                  </motion.span>
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i / 6) * Math.PI * 2
                    const dx = Math.cos(angle) * 40
                    const dy = Math.sin(angle) * 40
                    return (
                      <motion.span
                        key={i}
                        className="absolute left-1/2 top-1/2 text-lg"
                        animate={{
                          x: [0, dx],
                          y: [0, dy],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: 0.3, ease: 'easeOut' }}
                      >
                        {['💗', '💖', '💕', '🩷', '❤️‍🔥', '💘'][i]}
                      </motion.span>
                    )
                  })}
                </div>
                <h2 className="text-2xl font-bold text-white">{t('tiktok.doubleTap')}</h2>
                <p className="text-white/60 text-sm">{t('tiktok.useButtons')}</p>
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div
                key="go"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center text-center space-y-5"
              >
                <motion.span
                  className="text-5xl"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  🚀
                </motion.span>
                <h2 className="text-2xl font-bold text-white">{t('tiktok.letsGo')}</h2>
                <motion.button
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-primary to-pink-500 px-10 py-3.5 text-lg font-bold text-white shadow-lg shadow-primary/40"
                  whileTap={{ scale: 0.95 }}
                  onClick={onDismiss}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <span className="relative z-10">{t('tiktok.start')}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i <= phase ? 'bg-primary' : 'bg-white/20'
                )}
                animate={{ width: i === phase ? 24 : 6 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// ENHANCED DOUBLE TAP HEART BURST
// ============================================================

function DoubleTapHeart({ show, x, y }: { show: boolean; x: number; y: number }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.span
            className="pointer-events-none fixed z-[55] text-7xl"
            style={{ left: x - 40, top: y - 40 }}
            initial={{ scale: 0, opacity: 1, rotate: -15 }}
            animate={{
              scale: [0, 1.6, 1.2],
              opacity: [1, 1, 0],
              rotate: [-15, 0, 5],
              y: [0, -30, -80],
            }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            ❤️
          </motion.span>
          <motion.div
            className="pointer-events-none fixed z-[54] rounded-full border-2 border-pink-400/60"
            style={{ left: x - 40, top: y - 40, width: 80, height: 80 }}
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2
            const dist = 55 + (i % 3) * 15
            return (
              <motion.span
                key={i}
                className="pointer-events-none fixed z-[55] text-xl"
                style={{ left: x - 10, top: y - 10 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 30,
                  scale: [0, 1.3, 0],
                  opacity: [1, 0.9, 0],
                  rotate: [0, (i % 2 === 0 ? 1 : -1) * 20],
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                {['💕', '💗', '💖', '🩷', '❤️‍🔥', '💘', '✨', '💫'][i]}
              </motion.span>
            )
          })}
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// PHOTO CAROUSEL (horizontal swipe within profile)
// ============================================================

function PhotoCarousel({
  photos,
  photoIndex,
  onPhotoChange,
}: {
  photos: { url: string }[]
  photoIndex: number
  onPhotoChange: (index: number) => void
}) {
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 300) {
        if (info.offset.x < 0 && photoIndex < photos.length - 1) {
          onPhotoChange(photoIndex + 1)
        } else if (info.offset.x > 0 && photoIndex > 0) {
          onPhotoChange(photoIndex - 1)
        }
      }
    },
    [photoIndex, photos.length, onPhotoChange]
  )

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false} custom={photoIndex} mode="wait">
        <motion.div
          key={`${photoIndex}`}
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
        >
          {/* Blurred Background to prevent black gaps */}
          <div
            className="absolute inset-[-10%] bg-cover bg-center blur-2xl opacity-60"
            style={{ backgroundImage: `url(${photos[photoIndex]?.url || ''})` }}
          />
          {/* Actual image layer (contained) */}
          <motion.div
            className="absolute inset-0 bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${photos[photoIndex]?.url || ''})` }}
            animate={{ scale: [1, 1.02] }}
            transition={{ duration: 10, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {photos.length > 1 && (
        <div className="absolute bottom-52 left-0 right-0 z-10 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-300',
                i === photoIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// ENHANCED PROFILE INFO OVERLAY (staggered animation)
// ============================================================

function ProfileInfoOverlay({ profile, onView }: { profile: ProfileWithDetails; onView: (profile: ProfileWithDetails) => void }) {
  const { t } = useT()
  const age = profile.birthDate
    ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const stagger = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, type: 'spring' as const, stiffness: 300, damping: 25 },
  })

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-24 safe-area-bottom">
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

      <div className="relative space-y-2.5">
        <motion.div
          className="flex items-center gap-2 flex-wrap cursor-pointer select-none active:opacity-80 transition-opacity"
          {...stagger(0.1)}
          onClick={(e) => {
            e.stopPropagation()
            onView(profile)
          }}
        >
          <h2 className="text-3xl font-black text-white drop-shadow-lg hover:text-white/90">
            {profile.firstName}{age ? `, ${age}` : ''}
          </h2>
          {profile.isVerified && (
            <motion.div
              className="relative flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-bold text-primary-foreground backdrop-blur-sm overflow-hidden"
              {...stagger(0.2)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
              />
              <Shield className="size-3 relative z-10" />
              <span className="relative z-10">✓</span>
            </motion.div>
          )}
          {profile.isPremium && (
            <motion.div
              className="relative flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 text-xs font-bold text-black backdrop-blur-sm overflow-hidden"
              {...stagger(0.3)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
              />
              <Star className="size-3 relative z-10 fill-current" />
              <span className="relative z-10">Premium</span>
            </motion.div>
          )}
        </motion.div>

        {profile.mood && (
          <motion.p
            className="text-sm font-medium text-primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
            transition={{
              y: { delay: 0.15, type: 'spring', stiffness: 300, damping: 25 },
              opacity: { repeat: Infinity, duration: 3, delay: 0.15 }
            }}
          >
            {profile.mood}
          </motion.p>
        )}

        <motion.div className="flex items-center gap-1 text-sm text-white/80 flex-wrap" {...stagger(0.25)}>
          {profile.city && (
            <>
              <MapPin className="size-3.5 shrink-0" />
              <span>{profile.city}</span>
            </>
          )}
          {profile.jobTitle && (
            <>
              <span className="text-white/40 mx-1">·</span>
              <Briefcase className="size-3 shrink-0" />
              <span>{profile.jobTitle}</span>
            </>
          )}
          {profile.company && (
            <>
              <span className="text-white/40 mx-1">·</span>
              <span className="text-white/60">{profile.company}</span>
            </>
          )}
          {profile.education && (
            <>
              <span className="text-white/40 mx-1">·</span>
              <GraduationCap className="size-3 shrink-0" />
              <span className="text-white/60">{profile.education}</span>
            </>
          )}
        </motion.div>

        {profile.bio && (
          <motion.p className="text-sm text-white/70 line-clamp-2 leading-relaxed" {...stagger(0.35)}>
            {profile.bio}
          </motion.p>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-1.5 mt-1"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.45 } },
            }}
          >
            {profile.interests.slice(0, 5).map((interest) => (
              <motion.span
                key={interest}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur-sm border border-white/10"
                variants={{
                  hidden: { scale: 0, opacity: 0 },
                  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
                }}
              >
                {t(interest) || interest}
              </motion.span>
            ))}
            {profile.interests.length > 5 && (
              <motion.span
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60 backdrop-blur-sm"
                variants={{
                  hidden: { scale: 0, opacity: 0 },
                  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
                }}
              >
                +{profile.interests.length - 5}
              </motion.span>
            )}
          </motion.div>
        )}

        {profile.spotifyAnthem && (
          <motion.div
            className="flex items-center gap-2.5 rounded-xl bg-green-500/15 px-3 py-2 mt-1 backdrop-blur-sm border border-green-500/20"
            {...stagger(0.55)}
          >
            <motion.div
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Disc3 className="size-5 text-green-400" />
              <div className="absolute h-2 w-2 rounded-full bg-green-500/40" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-[10px] text-green-400 font-medium">{t('detail.spotifyAnthem')}</p>
              <p className="text-xs text-white/80 truncate">{profile.spotifyAnthem}</p>
            </div>
          </motion.div>
        )}

        {/* Verification / status banner */}
        {profile.requestStatus && profile.requestStatus !== 'none' && (
          <motion.div
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 mt-2 backdrop-blur-sm border",
              profile.requestStatus === 'pending'
                ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                : "bg-red-500/20 border-red-500/30 text-red-300"
            )}
            {...stagger(0.6)}
          >
            {profile.requestStatus === 'pending' ? (
              <>
                <ClockIcon className="size-4 shrink-0 animate-pulse text-amber-400" />
                <div className="text-left">
                  <p className="font-bold text-xs">📱 Demande envoyée</p>
                  <p className="text-[10px] opacity-80 leading-tight">Tu as demandé son numéro. En attente de réponse.</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="size-4 shrink-0 text-red-400" />
                <div className="text-left">
                  <p className="font-bold text-xs">❌ Demande refusée</p>
                  <p className="text-[10px] opacity-80 leading-tight">Demande refusée. Tu peux réessayer si tu veux.</p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// ENHANCED SIDE ACTION BAR
// ============================================================

function SideActionBar({
  profile,
  onLike,
  onPass,
  onRequest,
  onView,
  onUndo,
  canUndo,
  likeCount,
  requestCount,
  undoCount = 0,
  isUndoOnly,
}: {
  profile: ProfileWithDetails
  onLike: () => void
  onPass: () => void
  onRequest: () => void
  onView: () => void
  onUndo?: () => void
  canUndo?: boolean
  likeCount: number
  requestCount: number
  undoCount?: number
  isUndoOnly?: boolean
}) {
  const { t } = useT()
  const [likeActive, setLikeActive] = useState(false)
  const [shareRipple, setShareRipple] = useState(false)
  const photo = profile.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`

  const handleLike = useCallback(() => {
    setLikeActive(true)
    onLike()
    setTimeout(() => setLikeActive(false), 600)
  }, [onLike])

  const handleShare = useCallback(() => {
    setShareRipple(true)
    setTimeout(() => setShareRipple(false), 600)
    
    const shareText = t('share.message', { name: profile.firstName })
    if (navigator.share) {
      navigator.share({
        title: 'Fonelove',
        text: shareText,
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
      })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
    }
  }, [profile.firstName, t])

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-20 flex flex-col items-center gap-5">
      {!isUndoOnly && (
        <>
          <motion.button className="flex flex-col items-center gap-1 min-h-[44px] w-20" whileTap={{ scale: 0.75 }} onClick={handleLike}>
        <motion.div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-300',
            likeActive ? 'bg-red-500/30' : 'bg-black/30'
          )}
          animate={
            likeActive
              ? { scale: [1, 1.3, 1] }
              : {
                  boxShadow: [
                    '0 0 0 0 rgba(239,68,68,0)',
                    '0 0 15px 5px rgba(239,68,68,0.3)',
                    '0 0 0 0 rgba(239,68,68,0)',
                  ],
                }
          }
          transition={likeActive ? { duration: 0.4 } : { repeat: Infinity, duration: 2.5 }}
        >
          <Heart className={cn('size-6 transition-colors duration-300', likeActive ? 'text-red-500 fill-red-500' : 'text-white')} />
        </motion.div>
        <motion.span
          className="text-[10px] text-white/80 font-bold uppercase tracking-tight text-center w-full block"
          key={likeCount}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {likeCount > 0 ? likeCount : t('tiktok.like')}
        </motion.span>
      </motion.button>

      {/* FoneLove Button */}
      <FoneLoveButton
        target={{ userId: profile.id, firstName: profile.firstName, photo: profile.photos?.[0]?.url }}
        variant="side"
      />

      <motion.button 
        className="flex flex-col items-center gap-1 min-h-[44px] w-20" 
        whileTap={{ scale: 0.75 }} 
        onClick={onRequest}
      >
        <motion.div
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg overflow-hidden",
            profile.requestStatus === 'pending'
              ? "bg-amber-500 border border-amber-400"
              : profile.requestStatus === 'declined'
              ? "bg-neutral-600 border border-neutral-500"
              : ""
          )}
          style={profile.requestStatus && profile.requestStatus !== 'none' ? {} : { background: 'linear-gradient(135deg, #ec4899, #f43f5e, #f59e0b)' }}
          animate={profile.requestStatus && profile.requestStatus !== 'none' ? {} : {
            boxShadow: [
              '0 0 0 0 rgba(236,72,153,0.3)',
              '0 0 20px 8px rgba(236,72,153,0.15)',
              '0 0 0 0 rgba(236,72,153,0.3)',
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {profile.requestStatus && profile.requestStatus !== 'none' ? null : (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            />
          )}
          {profile.requestStatus === 'pending' ? (
            <ClockIcon className="size-6 text-white relative z-10 animate-pulse" />
          ) : profile.requestStatus === 'declined' ? (
            <XCircle className="size-6 text-white relative z-10" />
          ) : (
            <Phone className="size-6 text-white relative z-10" />
          )}
        </motion.div>
        <motion.span
          className="text-[10px] text-white/80 font-bold uppercase tracking-tight text-center w-full block"
          key={requestCount}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {profile.requestStatus === 'pending'
            ? 'En attente'
            : profile.requestStatus === 'declined'
            ? 'Refusé'
            : requestCount > 0
            ? requestCount
            : t('tiktok.number')}
        </motion.span>
      </motion.button>
        </>
      )}

      {canUndo && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="flex flex-col items-center gap-1 min-h-[44px] mt-2 w-20"
          whileTap={{ scale: 0.75 }}
          onClick={onUndo}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/40">
            <RotateCcw className="size-4 text-amber-400" />
            <span className={cn(
              "absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-black",
              undoCount > 0 ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"
            )}>
              {undoCount > 0 ? undoCount : '1'}
            </span>
          </div>
          <span className="text-[9px] text-amber-400 font-bold uppercase tracking-tight text-center w-full block">
            {undoCount > 0 ? 'Gratuit' : 'Rewind'}
          </span>
        </motion.button>
      )}
    </div>
  )
}

// ============================================================
// STORY-STYLE PROGRESS BARS
// ============================================================

function StoryProgressBar({ current, total, photoProgress }: { current: number; total: number; photoProgress: number }) {
  const displayTotal = Math.min(total, 12)

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-2 safe-area-top">
      <div className="flex gap-1.5 h-[3px]">
        {Array.from({ length: displayTotal }).map((_, i) => (
          <div key={i} className="relative flex-1 bg-white/20 rounded-full overflow-hidden">
            {i < current && <div className="absolute inset-0 bg-fonelove" />}
            {i === current && (
              <motion.div 
                className="absolute inset-0 bg-fonelove"
                initial={{ width: 0 }}
                animate={{ width: `${photoProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// PROFILE COUNTER with animated number
// ============================================================

function ProfileCounter({ current, total }: { current: number; total: number }) {
  return (
    <motion.div
      className="absolute top-10 left-4 z-30 safe-area-top"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <Sparkles className="size-3.5 text-primary" />
        <span className="text-xs font-medium text-white/90">
          <AnimatePresence mode="wait">
            <motion.span
              key={current}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {current + 1}
            </motion.span>
          </AnimatePresence>
          {' / '}
          {total}
        </span>
      </div>
    </motion.div>
  )
}

// ============================================================
// PHOTO COUNTER BADGE
// ============================================================

function PhotoCounterBadge({ current, total }: { current: number; total: number }) {
  if (total <= 1) return null

  return (
    <motion.div
      className="absolute top-10 right-4 z-30 safe-area-top"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
        <span className="text-[10px] font-medium text-white/80">
          {current + 1}/{total}
        </span>
      </div>
    </motion.div>
  )
}

// ============================================================
// SCROLL UP HINT
// ============================================================

function ScrollUpIndicator({ visible }: { visible: boolean }) {
  const { t } = useT()
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="flex items-center gap-1 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm border border-white/10"
          >
            <ChevronUp className="size-4 text-white/70" />
            <span className="text-xs text-white/70 font-medium">{t('tiktok.swipeUpArrow')}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// TRANSITION FLASH EFFECT
// ============================================================

function TransitionFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            className="pointer-events-none absolute top-0 left-0 right-0 h-16 z-40 bg-gradient-to-b from-white/20 to-transparent"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 z-40 bg-gradient-to-t from-white/20 to-transparent"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useT()
  const [countdown, setCountdown] = useState(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefresh()
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onRefresh])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 1500)
  }, [onRefresh])

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-black">
      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 border border-primary/20"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(236,72,153,0)',
              '0 0 30px 10px rgba(236,72,153,0.1)',
              '0 0 0 0 rgba(236,72,153,0)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Heart className="size-10 text-primary/60" />
        </motion.div>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute text-sm"
            animate={{
              y: [0, -30 - i * 10],
              x: [(i - 1) * 20, (i - 1) * 30],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
            style={{ left: '50%', top: '0' }}
          >
            💔
          </motion.span>
        ))}
      </motion.div>

      <motion.h3
        className="mb-1 text-lg font-semibold text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {t('tiktok.noMoreProfiles')}
      </motion.h3>
      <p className="mb-5 text-sm text-white/50">{t('tiktok.comeBack')}</p>

      <Button
        variant="outline"
        className="rounded-xl border-white/20 text-white hover:bg-white/10 gap-2"
        onClick={handleRefresh}
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <RotateCcw className="size-4" />
        </motion.div>
        {t('tiktok.refresh')}
      </Button>

      <p className="mt-3 text-xs text-white/30">{t('tiktok.autoRefresh', { n: countdown })}</p>
    </div>
  )
}

// ============================================================
// MAIN TIKTOK-STYLE PROFILE VIEWER
// ============================================================

interface TikTokViewerProps {
  profiles: ProfileWithDetails[]
  currentUser: { id: string; firstName: string; photos?: { url: string }[] } | null
  onLike: (profile: ProfileWithDetails) => void
  onPass: (profile: ProfileWithDetails) => void
  onRequest: (profile: ProfileWithDetails) => void
  onView: (profile: ProfileWithDetails) => void
  onRefresh: () => void
  onLoadMore?: () => void
  isLoadingMore?: boolean
  hasMore?: boolean
}

export default function TikTokViewer({
  profiles,
  currentUser,
  onLike,
  onPass,
  onRequest,
  onView,
  onRefresh,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: TikTokViewerProps) {
  const { trigger } = useFeedback()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({})
  const [showTutorial, setShowTutorial] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 })
  const [direction, setDirection] = useState(1)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [transitionFlash, setTransitionFlash] = useState(false)
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({})
  const [photoProgress, setPhotoProgress] = useState(0)

  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const keyLockRef = useRef(false)

  const { inventory, getActiveFeature, consumeFeature, hasActiveFeature, fetchActiveFeatures } = usePremiumFeatures()
  const { balance, spendCredits, setShowCreditStore } = useConnectCoinStore()
  const [passedProfiles, setPassedProfiles] = useState<ProfileWithDetails[]>([])
  const [virtualIndex, setVirtualIndex] = useState(0)
  const [showPremiumRequestAnim, setShowPremiumRequestAnim] = useState(false)
  const [showUndoConfirm, setShowUndoConfirm] = useState(false)
  const [isUndoing, setIsUndoing] = useState(false)

  const currentProfile = profiles[currentIndex]
  const currentPhotoIndex = currentProfile ? (photoIndices[currentProfile.id] || 0) : 0
  const currentPhotos = currentProfile?.photos?.length
    ? currentProfile.photos
    : [{ id: '1', url: `https://i.pravatar.cc/400?img=${((currentIndex % 70) + 1)}`, position: 0, isPrimary: true }]

  // Photo progress for story bars
  useEffect(() => {
    const interval = setInterval(() => {
      setPhotoProgress((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 100)
    return () => clearInterval(interval)
  }, [currentIndex, currentPhotoIndex])

  useEffect(() => {
    const t = setTimeout(() => setPhotoProgress(0), 0)
    return () => clearTimeout(t)
  }, [currentIndex, currentPhotoIndex])

  // Check first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('connectphone-tutorial-seen')
    if (!hasSeenTutorial) {
      const t = setTimeout(() => setShowTutorial(true), 0)
      return () => clearTimeout(t)
    }
  }, [])

  // Show scroll hint after 5s on same profile
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setShowScrollHint(true)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [currentIndex, profiles.length])

  // Trigger onLoadMore when near end
  useEffect(() => {
    if (currentIndex >= profiles.length - 5 && hasMore && !isLoadingMore && profiles.length > 0) {
      onLoadMore?.()
    }
  }, [currentIndex, profiles.length, hasMore, isLoadingMore, onLoadMore])

  // ---- All callbacks defined BEFORE keyboard effect ----

  const dismissTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('connectphone-tutorial-seen', '1')
  }, [])

  const triggerFlash = useCallback(() => {
    setTransitionFlash(true)
    setTimeout(() => setTransitionFlash(false), 400)
  }, [])

  const goToNext = useCallback(() => {
    if (keyLockRef.current) return
    keyLockRef.current = true
    if (currentIndex < profiles.length - 1) {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
      setShowScrollHint(false)
      triggerFlash()
    }
    setTimeout(() => {
      keyLockRef.current = false
    }, 400)
  }, [currentIndex, profiles.length, triggerFlash])

  const goToPrev = useCallback(() => {
    if (keyLockRef.current) return
    keyLockRef.current = true
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((prev) => prev - 1)
      setShowScrollHint(false)
      triggerFlash()
    }
    setTimeout(() => {
      keyLockRef.current = false
    }, 500)
  }, [currentIndex, triggerFlash])

  const goToNextPhoto = useCallback(() => {
    if (!currentProfile) return
    const currentIdx = photoIndices[currentProfile.id] || 0
    if (currentIdx < currentPhotos.length - 1) {
      setPhotoIndices((prev) => ({ ...prev, [currentProfile.id]: currentIdx + 1 }))
    }
  }, [currentProfile, photoIndices, currentPhotos.length])

  const goToPrevPhoto = useCallback(() => {
    if (!currentProfile) return
    const currentIdx = photoIndices[currentProfile.id] || 0
    if (currentIdx > 0) {
      setPhotoIndices((prev) => ({ ...prev, [currentProfile.id]: currentIdx - 1 }))
    }
  }, [currentProfile, photoIndices])

  const handlePhotoChange = useCallback((index: number) => {
    if (!currentProfile) return
    setPhotoIndices((prev) => ({ ...prev, [currentProfile.id]: index }))
    setPhotoProgress(0)
  }, [currentProfile])

  const handleLikeAction = useCallback(() => {
    if (!currentProfile) return
    trigger('like')
    onLike(currentProfile)
    setLikeCounts((prev) => ({ ...prev, [currentProfile.id]: (prev[currentProfile.id] || 0) + 1 }))
    setHeartPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 1100)
    
    setDirection(1)
    triggerFlash()
    setVirtualIndex((prev) => prev + 1)
  }, [currentProfile, trigger, onLike, triggerFlash])

  const handlePassAction = useCallback(() => {
    if (!currentProfile) return
    trigger('pass')
    
    setPassedProfiles((prev) => [...prev, currentProfile])
    onPass(currentProfile)
    
    setDirection(1)
    triggerFlash()
    setVirtualIndex((prev) => prev + 1)
  }, [currentProfile, trigger, onPass, triggerFlash])

  const handleRequestAction = useCallback(() => {
    if (!currentProfile) return
    
    if (hasActiveFeature('request_animation')) {
      setShowPremiumRequestAnim(true)
      setTimeout(() => setShowPremiumRequestAnim(false), 2000)
    }
    
    onRequest(currentProfile)
    setRequestCounts((prev) => ({ ...prev, [currentProfile.id]: (prev[currentProfile.id] || 0) + 1 }))
  }, [currentProfile, onRequest, hasActiveFeature])

  const performLocalRollback = useCallback(() => {
    if (passedProfiles.length === 0) return
    const lastProfile = passedProfiles[passedProfiles.length - 1]
    
    const store = useAppStore.getState()
    store.setProfiles([lastProfile, ...store.profiles])
    
    setDirection(-1)
    triggerFlash()
    setVirtualIndex((prev) => Math.max(0, prev - 1))
    setPassedProfiles((prev) => prev.slice(0, -1))
  }, [passedProfiles, triggerFlash])

  const executeUndoRollback = useCallback(async (featureId?: string) => {
    if (passedProfiles.length === 0 || !currentUser) return false
    
    // Optimistic UI rollback
    performLocalRollback()
    
    if (featureId) {
      consumeFeature(currentUser.id, featureId)
        .then((success) => {
          if (success) {
            fetchActiveFeatures(currentUser.id)
          }
        })
        .catch((err) => console.error('Error consuming feature in background:', err))
    }
    return true
  }, [passedProfiles, currentUser, consumeFeature, fetchActiveFeatures, performLocalRollback])

  const confirmUndoPurchase = useCallback(async () => {
    if (passedProfiles.length === 0 || !currentUser || isUndoing) return
    
    if (balance < 1) {
      setShowUndoConfirm(false)
      setShowCreditStore(true, 'packs')
      return
    }
    
    setShowUndoConfirm(false)
    
    // Optimistic UI rollback
    performLocalRollback()
    
    setIsUndoing(true)
    try {
      const success = await spendCredits(currentUser.id, 'undo_pass')
      if (success) {
        const state = usePremiumFeatures.getState()
        const freshFeature = state.activeFeatures.find(f => f.action === 'undo_pass' && !f.isConsumed)
        
        if (freshFeature) {
          await consumeFeature(currentUser.id, freshFeature.id)
        }
        fetchActiveFeatures(currentUser.id)
      }
    } catch (err) {
      console.error('Error undoing pass in background:', err)
    } finally {
      setIsUndoing(false)
    }
  }, [passedProfiles, currentUser, isUndoing, balance, spendCredits, fetchActiveFeatures, consumeFeature, performLocalRollback, setShowCreditStore])

  const handleUndo = useCallback(async () => {
    if (passedProfiles.length === 0 || !currentUser) return
    
    const feature = getActiveFeature('undo_pass')
    if (feature) {
      await executeUndoRollback(feature.id)
      return
    }
    
    setShowUndoConfirm(true)
  }, [passedProfiles, currentUser, getActiveFeature, executeUndoRollback])

  // Keyboard support - defined AFTER all callbacks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyLockRef.current || showTutorial || showUndoConfirm) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlePassAction()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleUndo()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNextPhoto()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevPhoto()
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        handleLikeAction()
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        handlePassAction()
      } else if (e.key === ' ') {
        e.preventDefault()
        handleRequestAction()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextPhoto, goToPrevPhoto, handleLikeAction, handlePassAction, handleRequestAction, handleUndo, showTutorial, showUndoConfirm])

  // Handle swipe/drag
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (showUndoConfirm || showTutorial) return
      const threshold = 80
      const yVelocity = Math.abs(info.velocity.y)

      if (Math.abs(info.offset.y) > Math.abs(info.offset.x) * 1.5) {
        if (info.offset.y < -threshold || (info.velocity.y < -300 && yVelocity > 300)) {
          handlePassAction()
        } else if (info.offset.y > threshold || (info.velocity.y > 300 && yVelocity > 300)) {
          handleUndo()
        }
      }
    },
    [handlePassAction, handleUndo, showUndoConfirm, showTutorial]
  )

  // Single tap to view profile detail, double tap to like
  const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // If a dialog or tutorial is open, ignore clicks on the viewer container
      if (showUndoConfirm || showTutorial) return

      const containerWidth = containerRef.current?.clientWidth || window.innerWidth
      if (e.clientX > containerWidth * 0.78) return

      const containerHeight = containerRef.current?.clientHeight || window.innerHeight
      if (e.clientY > containerHeight * 0.88) return

      const now = Date.now()
      const tap = lastTapRef.current

      // Double tap detection
      if (
        now - tap.time < 350 &&
        Math.abs(e.clientX - tap.x) < 50 &&
        Math.abs(e.clientY - tap.y) < 50
      ) {
        if (singleTapTimerRef.current) {
          clearTimeout(singleTapTimerRef.current)
          singleTapTimerRef.current = null
        }
        const profile = profiles[currentIndex]
        if (profile) {
          setHeartPos({ x: e.clientX, y: e.clientY })
          setShowHeart(true)
          trigger('like')
          onLike(profile)
          setLikeCounts((prev) => ({ ...prev, [profile.id]: (prev[profile.id] || 0) + 1 }))
          setTimeout(() => setShowHeart(false), 1100)
          setTimeout(() => {
            setDirection(1)
            triggerFlash()
            setVirtualIndex((prev) => prev + 1)
          }, 700)
        }
        lastTapRef.current = { time: 0, x: 0, y: 0 }
        return
      }

      // Schedule single tap (view profile detail)
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY }
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current)
      singleTapTimerRef.current = setTimeout(() => {
        singleTapTimerRef.current = null
        const profile = profiles[currentIndex]
        if (profile) {
          onView(profile)
        }
      }, 360)
    },
    [profiles, currentIndex, trigger, onLike, onView, triggerFlash, showUndoConfirm, showTutorial]
  )

  // Handle wheel scroll
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (showUndoConfirm || showTutorial) return
      if (wheelTimeoutRef.current) return
      if (e.deltaY > 15) {
        handlePassAction()
      } else if (e.deltaY < -15) {
        handleUndo()
      }
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null
      }, 600)
    },
    [handlePassAction, handleUndo, showUndoConfirm, showTutorial]
  )

  // Empty state with rewind history support
  if (profiles.length === 0) {
    return (
      <div className="relative h-dvh w-full overflow-hidden bg-black flex flex-col justify-between">
        <FloatingParticles />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState onRefresh={onRefresh} />
        </div>
        
        {passedProfiles.length > 0 && (
          <div className="absolute right-4 bottom-24 z-50">
            <SideActionBar
              profile={{} as any}
              onLike={() => {}}
              onPass={() => {}}
              onRequest={() => {}}
              onView={() => {}}
              onUndo={handleUndo}
              canUndo={true}
              undoCount={inventory.undoCount}
              likeCount={0}
              requestCount={0}
              isUndoOnly={true}
            />
          </div>
        )}

        <UndoPassConfirmDialog
          isOpen={showUndoConfirm}
          onClose={() => setShowUndoConfirm(false)}
          onConfirm={confirmUndoPurchase}
          balance={balance}
          isPending={isUndoing}
          previousProfileName={passedProfiles.length > 0 ? passedProfiles[passedProfiles.length - 1]?.firstName : undefined}
        />

        <MiniBottomNav />
      </div>
    )
  }

  if (!currentProfile) return null

  // Spring animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? '100%' : '-100%',
      opacity: 0.6,
      scale: 0.92,
      filter: 'blur(4px)',
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      y: dir > 0 ? '-40%' : '40%',
      opacity: 0,
      scale: 0.88,
      filter: 'blur(8px)',
    }),
  }

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden bg-black"
      onWheel={handleWheel}
      onClick={handleTap}
      style={{ touchAction: 'none' }}
    >
      {/* Ambient floating particles */}
      <FloatingParticles />

      {/* Profile slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentProfile.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.25 },
            scale: { type: 'spring', stiffness: 300, damping: 30 },
            filter: { duration: 0.2 },
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <PhotoCarousel
            photos={currentPhotos}
            photoIndex={currentPhotoIndex}
            onPhotoChange={handlePhotoChange}
          />

          <div className="absolute inset-0 bg-black/10" />

          <ProfileInfoOverlay profile={currentProfile} onView={onView} />

          <SideActionBar
            profile={currentProfile}
            onLike={handleLikeAction}
            onPass={handlePassAction}
            onRequest={handleRequestAction}
            onView={() => onView(currentProfile)}
            onUndo={handleUndo}
            canUndo={passedProfiles.length > 0}
            undoCount={inventory.undoCount}
            likeCount={likeCounts[currentProfile.id] || 0}
            requestCount={requestCounts[currentProfile.id] || 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Premium Request Animation */}
      <AnimatePresence>
        {showPremiumRequestAnim && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" />
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * window.innerWidth * 1.5,
                  y: (Math.random() - 0.5) * window.innerHeight * 1.5,
                  scale: Math.random() * 2 + 0.5,
                  opacity: 0,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: Math.random() * 1.5 + 0.8,
                  ease: 'easeOut',
                }}
              >
                {['⭐', '✨', '💫', '💖', '🔥'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <PhotoCounterBadge current={currentPhotoIndex} total={currentPhotos.length} />
      <TransitionFlash active={transitionFlash} />
      <ScrollUpIndicator visible={showScrollHint} />
      <DoubleTapHeart show={showHeart} x={heartPos.x} y={heartPos.y} />

      <AnimatePresence>
        {showTutorial && (
          <SwipeTutorial onDismiss={dismissTutorial} visible={showTutorial} />
        )}
      </AnimatePresence>

      <UndoPassConfirmDialog
        isOpen={showUndoConfirm}
        onClose={() => setShowUndoConfirm(false)}
        onConfirm={confirmUndoPurchase}
        balance={balance}
        isPending={isUndoing}
        previousProfileName={passedProfiles.length > 0 ? passedProfiles[passedProfiles.length - 1]?.firstName : undefined}
      />

      <MiniBottomNav />
    </div>
  )
}

// ============================================================
// MINI BOTTOM NAV
// ============================================================

function MiniBottomNav() {
  const { t } = useT()
  const { activeTab, setActiveTab, receivedRequests } = useAppStore()
  const pendingCount = receivedRequests.filter((r) => r.status === 'pending').length

  const tabs = [
    { id: 'discover' as const, icon: Heart, label: t('nav.discover') },
    { id: 'requests' as const, icon: Phone, label: t('nav.requests') },
    { id: 'messages' as const, icon: MessageCircle, label: t('nav.messages') },
    { id: 'connections' as const, icon: Users, label: t('nav.contacts') },
    { id: 'profile' as const, icon: Shield, label: t('nav.profile') },
  ]

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="flex items-center justify-around bg-black/50 backdrop-blur-md border-t border-white/10 px-2 py-1.5 overscroll-y-contain">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const showBadge = tab.id === 'requests' && pendingCount > 0

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.85 }}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all',
                isActive ? 'text-primary' : 'text-white/50 hover:text-white/80'
              )}
            >
              <div className="relative">
                <Icon className={cn('size-4', isActive && 'fill-primary/20')} />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[9px] font-medium', isActive ? 'text-primary' : 'text-white/40')}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tiktok-nav-indicator"
                  className="absolute -top-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// PREMIUM UNDO PASS CONFIRM DIALOG
// ============================================================

interface UndoPassConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  balance: number
  isPending: boolean
  previousProfileName?: string
}

function UndoPassConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  balance,
  isPending,
  previousProfileName = 'ce profil',
}: UndoPassConfirmDialogProps) {
  if (!isOpen) return null

  const hasEnoughCoins = balance >= 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative w-full max-w-[340px] overflow-hidden rounded-3xl bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-6 text-center shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        >
          {/* Decorative Glowing Background */}
          <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

          {/* Animated 3D Flip Logo Icon (Proposal 7) */}
          <div className="mx-auto mb-4 w-16 h-16 drop-shadow-lg">
            <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="undo-logo-grad-7" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ec4899"/>
                  <stop offset="1" stopColor="#f59e0b"/>
                </linearGradient>
              </defs>
              <style>{`
                @keyframes undo-flip-7 {
                  0% { transform: rotateY(0deg); }
                  100% { transform: rotateY(360deg); }
                }
                .undo-anim-7-box {
                  transform-origin: 256px 256px;
                  animation: undo-flip-7 3.5s infinite ease-in-out;
                }
              `}</style>
              <g className="undo-anim-7-box">
                <rect width="512" height="512" rx="120" fill="url(#undo-logo-grad-7)"/>
                <path d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" fill="white" />
                <path d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" fill="white" transform="translate(20, -20) scale(0.9)" />
              </g>
            </svg>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white mb-2">
            Retour en arrière ↩️
          </h3>

          <p className="text-sm text-zinc-300 leading-relaxed mb-6 px-1">
            Tu veux annuler ton dernier choix et retrouver{' '}
            <span className="font-bold text-amber-400">{previousProfileName}</span> ?
          </p>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 flex items-center justify-between text-left">
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Coût de l'action</span>
              <span className="text-sm font-bold text-white">1 ConnectCoin (CC)</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block font-medium">Ton solde actuel</span>
              <span className={cn(
                "text-sm font-black",
                hasEnoughCoins ? "text-emerald-400" : "text-rose-400"
              )}>
                {balance} CC
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {hasEnoughCoins ? (
              <Button
                onClick={onConfirm}
                disabled={isPending}
                className="w-full h-12 rounded-xl text-sm font-black transition-all bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 active:scale-[0.98] border-none"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Disc3 className="size-4 animate-spin text-white" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  `Oui, revoir ${previousProfileName} (-1 CC)`
                )}
              </Button>
            ) : (
              <Button
                onClick={onConfirm}
                className="w-full h-12 rounded-xl text-sm font-black transition-all bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20 active:scale-[0.98] border-none"
              >
                Acheter des CC 🪙
              </Button>
            )}

            <button
              onClick={onClose}
              disabled={isPending}
              className="w-full h-10 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors active:scale-95"
            >
              Non, continuer à chercher
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
