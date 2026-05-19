'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { X, Phone, MapPin, Shield, Star, ChevronRight, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type ProfileWithDetails } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import { getCountryByCode } from '@/lib/countries'

interface ProfileCardProps {
  profile: ProfileWithDetails
  onLike: (profile: ProfileWithDetails) => void
  onPass: (profile: ProfileWithDetails) => void
  onRequest: (profile: ProfileWithDetails) => void
  onView: (profile: ProfileWithDetails) => void
  isTop?: boolean
  stackIndex?: number
}

export default function ProfileCard({ profile, onLike, onPass, onRequest, onView, isTop = true, stackIndex = 0 }: ProfileCardProps) {
  const { t } = useT()
  const [exitX, setExitX] = useState(0)
  const [showOverlay, setShowOverlay] = useState<'like' | 'pass' | null>(null)
  const [likeCount, setLikeCount] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, 0], [1, 0])

  // Button scale animation with overlay color
  const likeScale = useTransform(x, [0, 100], [1, 1.2])
  const passScale = useTransform(x, [-100, 0], [1.2, 1])

  const primaryPhoto = profile.photos?.[0]?.url || `https://i.pravatar.cc/400?img=1`
  const age = profile.birthDate
    ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 100
    if (info.offset.x > threshold || info.velocity.x > 500) {
      setExitX(300)
      setShowOverlay('like')
      setTimeout(() => onLike(profile), 200)
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      setExitX(-300)
      setShowOverlay('pass')
      setTimeout(() => onPass(profile), 200)
    }
  }, [onLike, onPass, profile])

  const handleLike = () => {
    setExitX(300)
    setShowOverlay('like')
    setLikeCount((c) => c + 1)
    setTimeout(() => onLike(profile), 200)
  }

  const handlePass = () => {
    setExitX(-300)
    setShowOverlay('pass')
    setTimeout(() => onPass(profile), 200)
  }

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - stackIndex,
        scale: 1 - stackIndex * 0.04,
        y: stackIndex * 8,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
      onDragStart={() => setShowOverlay(null)}
      onDrag={(_, info) => {
        if (info.offset.x > 60) setShowOverlay('like')
        else if (info.offset.x < -60) setShowOverlay('pass')
        else setShowOverlay(null)
      }}
      exit={{ x: exitX, opacity: 0, rotate: exitX > 0 ? 25 : -25 }}
      initial={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 8 }}
      animate={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-card shadow-lg">
        {/* Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-200"
          style={{
            backgroundImage: `url(${primaryPhoto})`,
            transform: showOverlay === 'like' ? 'scale(1.05)' : showOverlay === 'pass' ? 'scale(0.95)' : 'scale(1)',
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Like overlay with enhanced animation */}
        <AnimatePresence>
          {showOverlay === 'like' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              style={{ opacity: isTop ? likeOpacity : 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="rounded-lg border-4 border-green-500 bg-green-500/20 px-6 py-2 backdrop-blur-sm"
              >
                <span className="text-3xl font-bold text-green-400">{t('card.like')}</span>
              </motion.div>
              {/* Floating hearts around overlay */}
              <motion.span
                className="absolute top-1/4 left-1/4 text-3xl"
                animate={{ y: [-20, -60], x: [-10, -30], opacity: [1, 0], scale: [0.5, 1.5] }}
                transition={{ duration: 0.8 }}
              >
                ❤️
              </motion.span>
              <motion.span
                className="absolute top-1/3 right-1/4 text-2xl"
                animate={{ y: [-20, -50], x: [10, 30], opacity: [1, 0], scale: [0.5, 1.3] }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                💕
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pass overlay with enhanced animation */}
        <AnimatePresence>
          {showOverlay === 'pass' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              style={{ opacity: isTop ? passOpacity : 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
            >
              <motion.div
                animate={{ x: [-5, 5, -5, 0] }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border-4 border-red-500 bg-red-500/20 px-6 py-2 backdrop-blur-sm"
              >
                <span className="text-3xl font-bold text-red-400">{t('card.nope')}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top badges */}
        <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {profile.isVerified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground backdrop-blur-sm"
              >
                <Shield className="size-3" /> {t('card.verified')}
              </motion.div>
            )}
            {profile.isPremium && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-xs font-medium text-gold-foreground backdrop-blur-sm animate-shimmer"
              >
                <Star className="size-3" /> {t('card.premium')}
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-2xl font-bold text-white">
              {profile.firstName}{age ? `, ${age}` : ''}
            </h3>
            {profile.mood && (
              <motion.span
                className="text-sm"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {profile.mood}
              </motion.span>
            )}
          </div>

          {profile.city && (
            <div className="mb-1.5 flex items-center gap-1 text-sm text-white/80">
              <MapPin className="size-3.5" />
              <span>{profile.city}</span>
              {profile.countryCode && (
                <span className="ml-0.5" title={getCountryByCode(profile.countryCode)?.name}>
                  {getCountryByCode(profile.countryCode)?.flag}
                </span>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mb-2 line-clamp-2 text-sm text-white/70">{profile.bio}</p>
          )}

          {/* Interest badges */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {profile.interests.slice(0, 4).map((interest, i) => (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
                >
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0 text-xs">
                    {interest}
                  </Badge>
                </motion.div>
              ))}
              {profile.interests.length > 4 && (
                <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0 text-xs">
                  +{profile.interests.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Action buttons - Ultra-accessible for iPhone SE */}
          {isTop && (
            <div className="flex items-center justify-center gap-3 px-2">
              <motion.div style={{ scale: isTop ? passScale : 1 }} whileTap={{ scale: 0.8 }}>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-[60px] w-[60px] rounded-full border-2 border-red-400 bg-white/10 text-red-400 hover:bg-red-500/20 backdrop-blur-sm transition-all shrink-0"
                  onClick={handlePass}
                >
                  <X className="size-8" />
                </Button>
              </motion.div>

              <motion.div style={{ scale: isTop ? likeScale : 1 }} whileTap={{ scale: 0.8 }}>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-[60px] w-[60px] rounded-full border-2 border-green-400 bg-white/10 text-green-400 hover:bg-green-500/20 backdrop-blur-sm transition-all shrink-0"
                  onClick={handleLike}
                >
                  <Heart className="size-8" />
                </Button>
              </motion.div>

              <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                <Button
                  size="xl"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 animate-glow-pulse"
                  onClick={() => onRequest(profile)}
                >
                  <motion.div
                    className="flex items-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  >
                    <Phone className="mr-2 size-6" />
                  </motion.div>
                  <span className="text-lg font-black">{t('card.request')}</span>
                </Button>
              </motion.div>
            </div>
          )}

          {/* View more */}
          {isTop && (
            <motion.button
              onClick={() => onView(profile)}
              whileTap={{ scale: 0.95 }}
              className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              {t('card.viewProfile')} <ChevronRight className="size-3" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
