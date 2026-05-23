'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Check, X, Clock, Star, Sparkles, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type NumberRequest, type ProfileWithDetails } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useFeedback } from '@/components/FeedbackSystem'
import { useT } from '@/lib/i18n/context'

interface RequestCardProps {
  request: NumberRequest
  type: 'received' | 'sent'
  onAccept?: (request: NumberRequest) => void
  onDecline?: (request: NumberRequest) => void
  onViewProfile?: (profile: ProfileWithDetails) => void
}

export default function RequestCard({ request, type, onAccept, onDecline, onViewProfile }: RequestCardProps) {
  const profile = type === 'received' ? request.sender : request.receiver
  const { trigger } = useFeedback()
  const { t } = useT()
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!profile) return null

  const photo = profile.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`

  const handleAccept = () => {
    setAccepting(true)
    setTimeout(() => {
      setShowSuccess(true)
      onAccept?.(request)
      setTimeout(() => {
        setAccepting(false)
        setShowSuccess(false)
      }, 1200)
    }, 400)
  }

  const handleDecline = () => {
    setDeclining(true)
    trigger('request-declined')
    setTimeout(() => {
      onDecline?.(request)
      setDeclining(false)
    }, 300)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: declining ? 0.95 : 1,
      }}
      exit={{ opacity: 0, x: type === 'received' ? -200 : 200, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-2xl border bg-card shadow-sm transition-all relative overflow-hidden",
        request.status === 'accepted' ? "p-2" : "p-4",
        showSuccess && "ring-2 ring-green-500/50 bg-green-500/5",
        accepting && "ring-2 ring-primary/30",
        type === 'received' && request.status === 'pending' && "border-primary/20 shadow-md shadow-primary/5",
        request.isSuper && "border-amber-400/50 shadow-lg shadow-amber-500/10 bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/20 dark:to-yellow-950/10",
      )}
    >
      {/* Super Request shimmer effect */}
      {request.isSuper && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.08) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl bg-green-500/10 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white font-bold"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.3 }}
              >
                ✓
              </motion.span>
              {t('requestCard.exchanged')}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("flex items-center gap-3", request.status !== 'accepted' && "items-start")}>
        {/* Avatar */}
        <button
          onClick={() => onViewProfile?.(profile as ProfileWithDetails)}
          className="relative shrink-0 group"
        >
          <motion.img
            src={photo}
            alt={profile.firstName}
            className={cn(
              "rounded-full object-cover ring-2 ring-background group-hover:ring-primary/30 transition-all",
              request.status === 'accepted' ? "h-8 w-8" : "h-14 w-14"
            )}
            whileTap={{ scale: 0.9 }}
          />
          {type === 'received' && request.status === 'pending' && (
            <motion.div
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h4 className={cn("font-semibold truncate", request.status === 'accepted' ? "text-xs" : "text-sm sm:text-base")}>
                {profile.firstName}
              </h4>
              {request.isSuper && (
                <motion.div
                  className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-1.5 py-0 text-[9px] font-black text-white shadow-sm shadow-amber-500/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="size-2.5 fill-white" /> Super
                </motion.div>
              )}
              {type === 'received' && request.status === 'pending' && !request.isSuper && (
                <Badge variant="default" className="text-[9px] px-1 py-0 animate-pulse">{t('requestCard.new')}</Badge>
              )}
            </div>
            
            {request.status === 'accepted' && (
               <div className="flex items-center gap-1 text-[10px] text-green-500 font-medium whitespace-nowrap">
                  <Sparkles className="size-2.5" />
                  {t('requestCard.exchanged')}
               </div>
            )}
          </div>

          {request.status !== 'accepted' && (
            <>
              {request.message && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2 italic">&ldquo;{request.message}&rdquo;</p>
              )}

              {type === 'received' && request.status === 'pending' && (
                <button
                  onClick={handleShare}
                  className="text-[10px] text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1 mb-2 hover:underline"
                >
                  <Share2 className="size-2.5" /> {t('share.askFriend')}
                </button>
              )}

              {type === 'sent' && (
                <div className="flex items-center gap-1.5">
                  {request.status === 'pending' && (
                    <motion.div
                      className="flex items-center gap-1 text-[10px] text-amber-500"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Clock className="size-2.5" /> {t('requestCard.pending')}
                    </motion.div>
                  )}
                  {request.status === 'declined' && (
                    <div className="flex items-center gap-1 text-[10px] text-red-500">
                      <X className="size-2.5" /> {t('requestCard.declined')}
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons for received pending */}
              {type === 'received' && request.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-9 rounded-xl text-red-500 hover:bg-red-50"
                    onClick={handleDecline}
                  >
                    <X className="mr-1 size-3" /> {t('requestCard.decline')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-9 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white shadow-md shadow-primary/20"
                    onClick={handleAccept}
                  >
                    <Phone className="mr-1 size-3" /> {t('requestCard.accept')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
