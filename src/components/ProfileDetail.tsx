'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  Heart, X, Phone, MapPin, Shield, Star, ChevronLeft, ChevronRight,
  Briefcase, GraduationCap, Music, Share2, Flag, Ruler, Sparkles,
  ChevronDown, Camera, MessageCircle,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type ProfileWithDetails, useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useFeedback } from '@/components/FeedbackSystem'
import { useT } from '@/lib/i18n/context'
import { getCountryByCode } from '@/lib/countries'
import FoneLoveButton from '@/components/FoneLoveButton'

interface ProfileDetailProps {
  profile: ProfileWithDetails | null
  open: boolean
  onClose: () => void
  onLike: (profile: ProfileWithDetails) => void
  onPass: (profile: ProfileWithDetails) => void
  onRequest: (profile: ProfileWithDetails) => void
}

// ============================================================
// PHOTO HERO with tap zones & swipe
// ============================================================
function PhotoHero({
  photos,
  currentPhoto,
  onPhotoChange,
  profile,
  onClose,
}: {
  photos: { url: string; id: string; position: number; isPrimary: boolean }[]
  currentPhoto: number
  onPhotoChange: (i: number) => void
  profile: ProfileWithDetails
  onClose: () => void
}) {
  const { t } = useT()
  const age = profile.birthDate
    ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 300) {
        if (info.offset.x < 0 && currentPhoto < photos.length - 1) {
          onPhotoChange(currentPhoto + 1)
        } else if (info.offset.x > 0 && currentPhoto > 0) {
          onPhotoChange(currentPhoto - 1)
        }
      }
    },
    [currentPhoto, photos.length, onPhotoChange]
  )

  // Tap left/right to navigate
  const handleTapZone = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width

      if (x < width * 0.3 && currentPhoto > 0) {
        onPhotoChange(currentPhoto - 1)
      } else if (x > width * 0.7 && currentPhoto < photos.length - 1) {
        onPhotoChange(currentPhoto + 1)
      }
    },
    [currentPhoto, photos.length, onPhotoChange]
  )

  return (
    <div className="relative w-full" style={{ height: '55dvh', minHeight: '300px' }}>
      {/* Story progress bars */}
      {photos.length > 1 && (
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-[3px] p-3 pt-3">
          {photos.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 rounded-full overflow-hidden bg-white/25">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={false}
                animate={{
                  width: i < currentPhoto ? '100%' : i === currentPhoto ? '100%' : '0%',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Photo carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-black"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          onClick={handleTapZone}
        >
          {/* Blurred Background to prevent black gaps */}
          <div
            className="absolute inset-[-10%] bg-cover bg-center blur-2xl opacity-60"
            style={{ backgroundImage: `url(${photos[currentPhoto]?.url})` }}
          />
          {/* Subtle Ken Burns layer on top (contained) */}
          <motion.div
            className="absolute inset-0 bg-contain bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${photos[currentPhoto]?.url})` }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.03 }}
            transition={{ duration: 12, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between safe-area-top">
        <motion.button
          className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-white backdrop-blur-md border border-white/10"
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onClose() }}
        >
          <ChevronDown className="size-4" />
          <span className="text-xs font-medium">Retour</span>
        </motion.button>

        <div className="flex gap-2">
          {profile.isVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="relative flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground backdrop-blur-sm overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
              />
              <Shield className="size-3 relative z-10" />
              <span className="relative z-10">✓</span>
            </motion.div>
          )}
          {profile.isPremium && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="relative flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-1 text-xs font-bold text-black backdrop-blur-sm overflow-hidden"
            >
              <Star className="size-3 relative z-10 fill-current" />
              <span className="relative z-10">Premium</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Photo counter */}
      {photos.length > 1 && (
        <div className="absolute top-14 right-3 z-30">
          <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm border border-white/10">
            <Camera className="size-3 text-white/70" />
            <span className="text-[11px] font-medium text-white/80">
              {currentPhoto + 1}/{photos.length}
            </span>
          </div>
        </div>
      )}

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-3xl font-black text-white drop-shadow-lg">
              {profile.firstName}{age ? `, ${age}` : ''}
            </h2>
            {profile.astrologicalSign && (
              <span className="text-base text-white/60">{profile.astrologicalSign}</span>
            )}
          </div>
          {profile.mood && (
            <motion.p
              className="text-sm font-medium text-primary mb-1"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {profile.mood}
            </motion.p>
          )}
          <div className="flex items-center gap-2 text-sm text-white/70 flex-wrap">
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {profile.city}
                {profile.countryCode && (
                  <span className="ml-0.5" title={getCountryByCode(profile.countryCode)?.name}>
                    {getCountryByCode(profile.countryCode)?.flag}
                  </span>
                )}
              </span>
            )}
            {profile.height && (
              <span className="flex items-center gap-1 text-white/50">
                <Ruler className="size-3" />
                {profile.height} cm
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================
// PHOTO GRID (thumbnails gallery)
// ============================================================
function PhotoGrid({
  photos,
  currentPhoto,
  onPhotoChange,
}: {
  photos: { url: string; id: string }[]
  currentPhoto: number
  onPhotoChange: (i: number) => void
}) {
  if (photos.length <= 1) return null

  return (
    <div className="px-4 py-3">
      <h4 className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Camera className="size-3.5" />
        Photos ({photos.length})
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
        {photos.map((photo, i) => (
          <motion.button
            key={photo.id}
            onClick={() => onPhotoChange(i)}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden snap-start transition-all duration-200',
              i === currentPhoto
                ? 'ring-2 ring-primary ring-offset-1 ring-offset-background scale-105'
                : 'opacity-70 hover:opacity-100'
            )}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {i === currentPhoto && (
              <motion.div
                className="absolute inset-0 bg-primary/10"
                layoutId="photo-highlight"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// INFO CARD (reusable)
// ============================================================
function InfoCard({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'rounded-2xl bg-card border border-border/50 p-4',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// ============================================================
// MAIN PROFILE DETAIL COMPONENT
// ============================================================
export default function ProfileDetail({ profile, open, onClose, onLike, onPass, onRequest }: ProfileDetailProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [likeAnimating, setLikeAnimating] = useState(false)
  const [passAnimating, setPassAnimating] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  
  const { trigger } = useFeedback()
  const { t } = useT()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { receivedRequests, sentRequests } = useAppStore()
  
  const incomingRequest = profile ? receivedRequests.find(r => r.senderId === profile.id && r.status === 'pending') : null
  const outgoingRequest = profile ? sentRequests.find(r => r.receiverId === profile.id && r.status === 'pending') : null

  // Reset photo index when profile changes
  useEffect(() => {
    setCurrentPhoto(0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [profile?.id])

  if (!profile) return null

  const photos = profile.photos?.length
    ? profile.photos
    : [{ url: `https://i.pravatar.cc/400?img=1`, position: 0, isPrimary: true, id: 'default' }]

  const badgeIcons: Record<string, string> = {
    verified: '✅', popular: '🔥', quick_reply: '⚡', loyal: '💎', premium: '👑', streak_5: '🔥',
  }

  const handleLike = () => {
    setLikeAnimating(true)
    trigger('like')
    setTimeout(() => {
      onLike(profile)
      onClose()
      setLikeAnimating(false)
    }, 400)
  }

  const handlePass = () => {
    setPassAnimating(true)
    trigger('pass')
    setTimeout(() => {
      onPass(profile)
      onClose()
      setPassAnimating(false)
    }, 300)
  }

  const handleRequest = () => {
    // Only trigger if no outgoing request
    if (outgoingRequest) return
    onRequest(profile)
    onClose()
  }

  const handleAcceptIncoming = async () => {
    if (!incomingRequest) return
    setIsAccepting(true)
    try {
      await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: incomingRequest.id, status: 'accepted' }),
      })
      useAppStore.setState((state) => ({
        receivedRequests: state.receivedRequests.map((r) =>
          r.id === incomingRequest.id ? { ...r, status: 'accepted' as const } : r
        ),
      }))
      trigger('match')
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDeclineIncoming = async () => {
    if (!incomingRequest) return
    setIsDeclining(true)
    try {
      await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: incomingRequest.id, status: 'declined' }),
      })
      useAppStore.setState((state) => ({
        receivedRequests: state.receivedRequests.map((r) =>
          r.id === incomingRequest.id ? { ...r, status: 'declined' as const } : r
        ),
      }))
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeclining(false)
    }
  }

  const handleShareProfile = () => {
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
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-[calc(100vw-0.5rem)] sm:w-full h-[98dvh] sm:h-[92vh] max-h-[98dvh] sm:max-h-[92vh] p-0 gap-0 overflow-hidden rounded-3xl border-0 bg-background">
        <DialogTitle className="sr-only">Profil de {profile.firstName}</DialogTitle>
        <DialogDescription className="sr-only">Détails du profil et actions</DialogDescription>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overscroll-y-contain scroll-smooth"
          style={{ paddingBottom: '88px' }} 
        >
          {/* Photo Hero */}
          <PhotoHero
            photos={photos}
            currentPhoto={currentPhoto}
            onPhotoChange={setCurrentPhoto}
            profile={profile}
            onClose={onClose}
          />

          {/* Photo thumbnails */}
          <PhotoGrid
            photos={photos}
            currentPhoto={currentPhoto}
            onPhotoChange={(i) => {
              setCurrentPhoto(i)
              scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />

          {/* Profile details */}
          <div className="px-4 pb-4 space-y-3">
            {/* Ask a friend CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShareProfile}
              className="w-full flex items-center justify-between rounded-2xl p-4 border border-rose-500/20"
              style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1), rgba(245, 158, 11, 0.1))' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                  <Share2 className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-blue-500 dark:text-blue-400">
                    {t('share.askFriend')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Partage ce profil sur WhatsApp
                  </p>
                </div>
              </div>
              <ChevronRight className="size-5 text-blue-500/50" />
            </motion.button>
            {/* Job & Education */}
            {(profile.jobTitle || profile.education) && (
              <InfoCard delay={0.1}>
                <div className="space-y-2.5">
                  {profile.jobTitle && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Briefcase className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{profile.jobTitle}</p>
                        {profile.company && (
                          <p className="text-xs text-muted-foreground">@ {profile.company}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {profile.education && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 shrink-0">
                        <GraduationCap className="size-4 text-violet-500" />
                      </div>
                      <p className="font-medium">{profile.education}</p>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Bio */}
            {profile.bio && (
              <InfoCard delay={0.15}>
                <p className="text-sm leading-relaxed text-foreground/90 italic">
                  "{profile.bio}"
                </p>
              </InfoCard>
            )}

            {/* Prompts */}
            {profile.prompts && profile.prompts.length > 0 && (
              <div className="space-y-2">
                {profile.prompts.map((prompt, i) => (
                  <InfoCard key={prompt.id} delay={0.2 + i * 0.08} className="border-l-4 border-l-primary">
                    <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
                      {prompt.question}
                    </p>
                    <p className="text-sm font-medium">{prompt.answer}</p>
                  </InfoCard>
                ))}
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <InfoCard delay={0.3}>
                <h4 className="mb-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  {t('detail.interests')}
                </h4>
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
                  }}
                >
                  {profile.interests.map((interest) => (
                    <motion.span
                      key={interest}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary border border-primary/20"
                      variants={{
                        hidden: { scale: 0, opacity: 0 },
                        visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
                      }}
                    >
                      {t(interest) || interest}
                    </motion.span>
                  ))}
                </motion.div>
              </InfoCard>
            )}

            {/* Spotify anthem */}
            {profile.spotifyAnthem && (
              <InfoCard delay={0.35} className="bg-green-500/5 border-green-500/20">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500/15 shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Music className="size-5 text-green-500" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                      {t('detail.spotifyAnthem')}
                    </p>
                    <p className="text-sm font-medium truncate">{profile.spotifyAnthem}</p>
                  </div>
                </div>
              </InfoCard>
            )}

            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <InfoCard delay={0.4}>
                <h4 className="mb-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('detail.badges')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.45 + i * 0.08, type: 'spring' }}
                      className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium"
                    >
                      <span>{badgeIcons[badge.type] || '🏅'}</span>
                      <span className="capitalize">{badge.type.replace('_', ' ')}</span>
                    </motion.div>
                  ))}
                </div>
              </InfoCard>
            )}

            {/* Report */}
            <div className="flex justify-center pt-2 pb-2">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <Flag className="size-3" />
                Signaler ce profil
              </button>
            </div>
          </div>
        </div>

        {/* Floating action bar - fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-40">
          <div className="bg-gradient-to-t from-background via-background/95 to-transparent pt-6 px-4 pb-4 safe-area-bottom">
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              
              {incomingRequest ? (
                // IF INCOMING REQUEST: Show Accept/Decline
                <>
                  <motion.div whileTap={{ scale: 0.9 }} className="flex-1">
                    <button
                      className="w-full h-[52px] rounded-full border-2 border-red-500/30 bg-background/50 text-red-400 font-bold flex items-center justify-center disabled:opacity-50"
                      onClick={handleDeclineIncoming}
                      disabled={isDeclining || isAccepting}
                    >
                      {isDeclining ? '...' : t('requestCard.decline')}
                    </button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} className="flex-1">
                    <button
                      className="w-full h-[52px] rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-50"
                      onClick={handleAcceptIncoming}
                      disabled={isDeclining || isAccepting}
                    >
                      {isAccepting ? t('requestCard.accepting') : t('requestCard.accept')}
                    </button>
                  </motion.div>
                </>
              ) : outgoingRequest ? (
                // IF OUTGOING REQUEST: Show Pending state
                <div className="flex-1">
                  <button
                    className="w-full h-[52px] rounded-full bg-muted text-muted-foreground font-bold flex items-center justify-center gap-2"
                    disabled
                  >
                    <Phone className="size-5" />
                    {t('requestCard.pending')}
                  </button>
                </div>
              ) : (
                // DEFAULT DISCOVERY ACTIONS
                <>
                  {/* Pass (X) */}
                  <motion.div whileTap={{ scale: 0.8 }} animate={passAnimating ? { x: -30, opacity: 0 } : {}}>
                    <button
                      className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-red-400/60 bg-background text-red-400 hover:bg-red-500/10 transition-all shrink-0 shadow-lg shadow-red-500/10"
                      onClick={handlePass}
                    >
                      <X className="size-6" />
                    </button>
                  </motion.div>

                  {/* Like (Heart) */}
                  <motion.div whileTap={{ scale: 0.8 }} animate={likeAnimating ? { scale: [1, 1.3, 0] } : {}}>
                    <button
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 border-green-400/60 bg-background text-green-400 hover:bg-green-500/10 transition-all shrink-0 shadow-lg shadow-green-500/10"
                      onClick={handleLike}
                    >
                      <Heart className="size-7" />
                    </button>
                  </motion.div>

                  {/* FoneLove Button */}
                  <FoneLoveButton
                    target={{ userId: profile.id, firstName: profile.firstName, photo: profile.photos?.[0]?.url }}
                    variant="compact"
                  />

                  {/* Request Number */}
                  <motion.div whileTap={{ scale: 0.92 }} className="flex-1 max-w-[180px]">
                    <button
                      className="relative w-full h-[56px] rounded-full px-5 text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-2 overflow-hidden"
                      style={{ background: 'linear-gradient(90deg, #ec4899, #f43f5e, #f59e0b)' }}
                      onClick={handleRequest}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                      />
                      <motion.div
                        className="relative z-10 flex items-center gap-1.5"
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                      >
                        <Phone className="size-5" />
                      </motion.div>
                      <span className="relative z-10 font-bold text-sm">
                        {t('detail.requestNumberShort') || t('detail.requestNumber')}
                      </span>
                    </button>
                  </motion.div>
                </>
              )}
              
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
