'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coins, Flame, Gift, Clock, Star, ShoppingCart,
  CheckCircle2, Sparkles, ChevronRight, X, Zap,
  Trophy, History, Shield, Phone, Disc3, XCircle,
  AlertCircle
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  useConnectCoinStore,
  PACKS,
  ACTION_COSTS,
  ACTION_LABELS,
  type PackType,
  type PremiumAction,
  type PromoItem,
} from '@/lib/connectcoin-store'
import { useCurrencyStore, type PackLocalPrice } from '@/lib/currency-store'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import SharedGiftOverlay from '@/components/SharedGiftOverlay'

// ===== Animated Counter =====
function AnimatedNumber({ value, duration = 0.8 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = display
    const diff = value - start
    if (diff === 0) return
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <span className="tabular-nums">{display}</span>
}

// ===== Countdown Timer =====
function CountdownTimer({ expiresAt }: { expiresAt?: string }) {
  const { t } = useT()
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!expiresAt) return
    const update = () => {
      const now = Date.now()
      const end = new Date(expiresAt).getTime()
      const diff = Math.max(0, end - now)
      if (diff === 0) { setTimeLeft(t('store.expired')); return }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, t])

  if (!expiresAt) return null
  return (
    <div className="flex items-center gap-1 text-[10px] text-amber-400">
      <Clock className="size-3" />
      <span>{timeLeft}</span>
    </div>
  )
}

// ===== Confetti Particles =====
function ConfettiParticles({ active }: { active: boolean }) {
  if (!active) return null
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    emoji: ['🎉', '✨', '⭐', '🌟', '💫', '🎊'][Math.floor(Math.random() * 6)],
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: 0, x: `${p.x}%`, scale: 1 }}
          animate={{ opacity: 0, y: -120, scale: 0.5 }}
          transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
          className="absolute"
          style={{ left: `${p.x}%`, bottom: '20%' }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}

// ===== Pack Card =====
function PackCard({ pack, index, onPurchase }: {
  pack: PackLocalPrice
  index: number
  onPurchase: (pack: PackLocalPrice) => void
}) {
  const { t } = useT()
  const [visible, setVisible] = useState(false)
  const isBestValue = pack.type === 'flamme'
  const isPopular = pack.type === 'tendance'
  const totalCC = pack.cc + pack.bonusCC

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 120)
    return () => clearTimeout(timer)
  }, [index])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onPurchase(pack)}
      className={cn(
        'relative rounded-2xl border p-4 cursor-pointer transition-all overflow-hidden',
        'bg-gradient-to-br backdrop-blur-sm',
        pack.gradient,
        isBestValue
          ? 'border-amber-500/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20'
          : 'border-border/30 hover:border-border/50'
      )}
    >
      {/* Best value / Popular badge */}
      {isBestValue && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-amber-500 text-black text-[9px] font-bold border-0 px-1.5 py-0 h-4">
            {t('store.bestValue')}
          </Badge>
        </div>
      )}
      {isPopular && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-orange-500 text-white text-[9px] font-bold border-0 px-1.5 py-0 h-4">
            {t('store.popular')}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Pack icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/30 border border-white/5 text-2xl">
          {pack.icon}
        </div>

        {/* Pack info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">{pack.name}</h4>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-amber-400">
              <AnimatedNumber value={totalCC} />
            </span>
            <span className="text-xs text-muted-foreground font-medium">CC</span>
          </div>
          {pack.bonusText && (
            <p className="text-[10px] font-semibold text-green-400 mt-0.5">{pack.bonusText}</p>
          )}
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-lg font-bold">{pack.priceFormatted}</p>
          <p className="text-[9px] text-muted-foreground">{pack.pricePerCCFormatted}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ===== Daily Free Section =====
function DailyFreeSection() {
  const { t } = useT()
  const { dailyFreeClaimed, claimDailyFree, checkInStreak, balance, streak } = useConnectCoinStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const [claiming, setClaiming] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [claimedAmount, setClaimedAmount] = useState<number | null>(null)
  const [sharedGiftInfo, setSharedGiftInfo] = useState<{ amount: number; giftAmount: number } | null>(null)

  const todayReward = useMemo(() => {
    const currentStreak = streak?.currentStreak ?? 0
    const streakBonus = Math.min(Math.max(0, currentStreak - 1), 5)
    return 3 + streakBonus
  }, [streak?.currentStreak])

  const handleClaim = async () => {
    if (!currentUser || dailyFreeClaimed) return
    setClaiming(true)
    try {
      // 1. Assurer d'abord la validation du streak et l'obtention des paliers
      if (streak && !streak.todayBonusClaimed) {
        await checkInStreak(currentUser.id)
      }

      // 2. Réclamer ensuite les pièces gratuites quotidiennes et déclencher le partage
      const result = await claimDailyFree(currentUser.id)
      if (result !== null) {
        setClaimedAmount(result.amount)
        if (result.hasSharedGift && result.sharedGiftAmount) {
          setSharedGiftInfo({
            amount: result.amount,
            giftAmount: result.sharedGiftAmount,
          })
        } else {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 2000)
        }
      }
    } catch (err) {
      console.error('Claim error:', err)
    }
    setClaiming(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4 backdrop-blur-sm overflow-hidden"
      >
        <ConfettiParticles active={showConfetti} />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={!dailyFreeClaimed ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/20"
              >
                <Gift className="size-5 text-amber-400" />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold text-amber-300">{t('store.freeCC')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('store.freeCCHint')}</p>
              </div>
            </div>

            {/* Streak badge */}
            {streak && streak.currentStreak > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/20 px-2 py-0.5">
                <Flame className="size-3 text-orange-400" />
                <span className="text-[10px] font-bold text-orange-400">{streak.currentStreak}j</span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {dailyFreeClaimed && claimedAmount !== null ? (
              <motion.div
                key="claimed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 py-2.5"
              >
                <CheckCircle2 className="size-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  {t('store.claimed', { n: claimedAmount })}
                </span>
              </motion.div>
            ) : dailyFreeClaimed ? (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-muted/30 border border-border/20 py-2.5"
              >
                <CheckCircle2 className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('store.alreadyClaimed')}</span>
              </motion.div>
            ) : (
              <motion.div
                key="claim"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/20"
                  onClick={handleClaim}
                  disabled={claiming}
                >
                  {claiming ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      {t('store.claiming')}
                    </motion.span>
                  ) : (
                    <>
                      <Gift className="mr-1.5 size-4" />
                      {t('store.claimFree', { n: todayReward })}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Shared Gift Overlay */}
      <AnimatePresence>
        {sharedGiftInfo && (
          <SharedGiftOverlay
            amount={sharedGiftInfo.amount}
            giftAmount={sharedGiftInfo.giftAmount}
            onClose={() => {
              setSharedGiftInfo(null)
              setShowConfetti(true)
              setTimeout(() => setShowConfetti(false), 2000)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ===== Promo Card =====
function PromoCard({ promo, index }: { promo: PromoItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-rose-500/5 p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-bold text-amber-300">{promo.title}</h5>
          <p className="text-[10px] text-muted-foreground mt-0.5">{promo.description}</p>
        </div>
        {promo.discountPercent && (
          <div className="ml-2 shrink-0 rounded-lg bg-red-500/20 border border-red-500/20 px-2 py-0.5">
            <span className="text-xs font-bold text-red-400">-{promo.discountPercent}%</span>
          </div>
        )}
        {promo.bonusCC && !promo.discountPercent && (
          <div className="ml-2 shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/20 px-2 py-0.5">
            <span className="text-xs font-bold text-amber-400">+{promo.bonusCC} CC</span>
          </div>
        )}
      </div>
      {promo.expiresAt && <CountdownTimer expiresAt={promo.expiresAt} />}
    </motion.div>
  )
}

// ===== Action Catalog Item =====
function ActionCatalogItem({ action, cost, balance, onSpend, onInfoClick }: {
  action: PremiumAction
  cost: number
  balance: number
  onSpend: (action: PremiumAction, cost: number) => void
  onInfoClick: (action: PremiumAction) => void
}) {
  const { t } = useT()
  const label = ACTION_LABELS[action]
  const [shaking, setShaking] = useState(false)

  if (!label) return null

  const insufficient = balance < cost
  const missing = cost - balance

  const handleClick = () => {
    if (insufficient) {
      // Trigger shake animation then open the insufficient balance dialog
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
    }
    onSpend(action, cost)
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileTap={{ scale: insufficient ? 0.97 : 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      animate={shaking ? {
        x: [0, -4, 4, -4, 4, -2, 2, 0],
        transition: { duration: 0.5 }
      } : {}}
      className={cn(
        'relative flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all text-center overflow-hidden',
        insufficient
          ? 'border-red-500/20 bg-red-500/5 cursor-pointer hover:border-red-500/40 hover:bg-red-500/10'
          : 'border-border/30 bg-card/60 hover:border-amber-500/30 hover:bg-amber-500/5 cursor-pointer'
      )}
    >
      {/* Information Button — using div to avoid nested interactive elements */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Informations sur cette action"
        onClick={(e) => {
          e.stopPropagation()
          onInfoClick(action)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation()
            onInfoClick(action)
          }
        }}
        className="absolute top-1.5 right-1.5 z-20 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-[9px] font-black">i</span>
      </div>

      {/* Insufficient balance shimmer indicator */}
      {insufficient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full"
            animate={{ x: ['0%', '400%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          />
        </div>
      )}

      <span className="text-xl relative z-10">{label.emoji}</span>
      <span className={cn(
        'text-[10px] font-semibold leading-tight line-clamp-2 relative z-10 pr-2',
        insufficient && 'text-red-400/90'
      )}>
        {label.name}
      </span>
      <div className="flex items-center gap-0.5 relative z-10">
        <Coins className={cn('size-3', insufficient ? 'text-red-400' : 'text-amber-400')} />
        <span className={cn(
          'text-[10px] font-bold',
          insufficient ? 'text-red-400' : 'text-amber-400'
        )}>
          {cost}
        </span>
      </div>

      {/* Missing amount or affordable indicator */}
      {insufficient ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 rounded-full bg-red-500/15 border border-red-500/20 px-1.5 py-0"
        >
          <span className="text-[8px] font-bold text-red-400">-{missing} CC</span>
        </motion.div>
      ) : (
        <div className="relative z-10 rounded-full bg-green-500/10 border border-green-500/15 px-1.5 py-0">
          <span className="text-[8px] font-bold text-green-400">OK</span>
        </div>
      )}
    </motion.div>
  )
}

// ===== Premium Action Previews Data =====
const ACTION_PREVIEWS: Record<PremiumAction, {
  title: string
  description: string
  advantage: string
  gradient: string
  icon: string
}> = {
  boost: {
    title: 'Boost Visibilité',
    description: 'Propulse ton profil en tête de liste pour tous les utilisateurs proches de toi pendant 30 minutes.',
    advantage: 'Multiplier par 10 tes chances de recevoir des demandes de numéro !',
    gradient: 'from-orange-500 to-amber-500',
    icon: '🚀',
  },
  super_request: {
    title: 'Super Demande',
    description: 'Envoie une demande de numéro dorée et ultra-visible qui apparaît tout en haut de la liste de ton destinataire.',
    advantage: 'Attirer immédiatement l\'attention et obtenir 3 fois plus de réponses positives !',
    gradient: 'from-pink-500 to-rose-600',
    icon: '⭐',
  },
  rose_connect: {
    title: 'Rose Connect',
    description: 'Envoie une rose virtuelle animée avec un message doux pour déclarer ton coup de cœur.',
    advantage: 'Montrer un intérêt sincère et unique qui te démarque des autres profils.',
    gradient: 'from-red-500 to-rose-500',
    icon: '🌹',
  },
  extra_request: {
    title: 'Demande Supplémentaire',
    description: 'Débloque une demande de numéro en plus de ta limite quotidienne gratuite.',
    advantage: 'Ne pas laisser passer ta chance avec un profil coup de cœur aujourd\'hui !',
    gradient: 'from-violet-500 to-fuchsia-500',
    icon: '📱',
  },
  see_visitors: {
    title: 'Voir les Visiteurs',
    description: 'Découvre instantanément qui a visité ton profil au cours des dernières 24 heures.',
    advantage: 'Savoir exactement qui s\'intéresse déjà à toi pour faire le premier pas en confiance.',
    gradient: 'from-indigo-500 to-purple-600',
    icon: '👁️',
  },
  read_receipt: {
    title: 'Accusé de Lecture',
    description: 'Sache à quel moment précis tes messages ont été ouverts et lus par tes contacts.',
    advantage: 'Ne plus rester dans le doute et mieux comprendre le rythme de ta discussion.',
    gradient: 'from-sky-500 to-blue-600',
    icon: '✓',
  },
  filters_plus: {
    title: 'Filtres Connect+',
    description: 'Filtre tes résultats par critères précis : taille, centres d\'intérêt, études et plus encore.',
    advantage: 'Trouver directement des profils qui te correspondent à 100% sans perdre de temps.',
    gradient: 'from-emerald-500 to-teal-600',
    icon: '🔍',
  },
  ghost_mode: {
    title: 'Mode Fantôme',
    description: 'Visite les profils et regarde leurs informations en toute discrétion, sans laisser aucune trace.',
    advantage: 'Naviguer à ton rythme sans pression et en protégeant totalement ta vie privée.',
    gradient: 'from-slate-600 to-neutral-800',
    icon: '👻',
  },
  undo_pass: {
    title: 'Annuler un Pass',
    description: 'Reviens sur le dernier profil que tu as swipé à gauche pour changer de décision.',
    advantage: 'Corriger instantanément une erreur de manipulation et ne louper aucune belle rencontre.',
    gradient: 'from-amber-500 to-orange-600',
    icon: '↩️',
  },
  theme_flame: {
    title: 'Thème Flamme',
    description: 'Ajoute un superbe cadre de flamme animé autour de ton avatar sur ton profil.',
    advantage: 'Rendre ton profil irrésistiblement chaud et attirer l\'œil instantanément.',
    gradient: 'from-red-600 to-orange-500',
    icon: '🔥',
  },
  theme_star: {
    title: 'Thème Étoile',
    description: 'Décore ton avatar d\'un halo d\'étoiles dorées et scintillantes.',
    advantage: 'Faire rayonner ton profil et montrer que tu es une vraie star sur l\'application.',
    gradient: 'from-yellow-400 to-amber-500',
    icon: '⭐',
  },
  theme_aura: {
    title: 'Thème Aura',
    description: 'Décore ton profil avec un halo mystique et coloré aux reflets violets et bleus.',
    advantage: 'Donner une atmosphère magique, élégante et premium à ton avatar.',
    gradient: 'from-purple-600 to-indigo-500',
    icon: '✨',
  },
  custom_badge: {
    title: 'Badge Personnalisé',
    description: 'Écris un court texte ou insère des émojis personnalisés directement affichés sur ton profil.',
    advantage: 'Exprimer ton humeur ou ton statut unique directement sur ta photo.',
    gradient: 'from-rose-500 to-pink-500',
    icon: '🏷️',
  },
  request_animation: {
    title: 'Animation de Demande',
    description: 'Déclenche une pluie d\'effets magiques et d\'étoiles filantes sur l\'écran du destinataire lors de ta demande.',
    advantage: 'Créer une surprise inoubliable dès la première seconde de connexion.',
    gradient: 'from-purple-500 to-pink-600',
    icon: '💫',
  },
}

function PremiumActionPreviewDialog({
  action,
  onClose,
  onSpend,
  balance,
}: {
  action: PremiumAction | null
  onClose: () => void
  onSpend: (action: PremiumAction, cost: number) => void
  balance: number
}) {
  const { actionConfigs } = useConnectCoinStore()
  if (!action) return null

  const info = ACTION_PREVIEWS[action]
  if (!info) return null

  const cost = actionConfigs && actionConfigs[action] ? actionConfigs[action].costCC : ACTION_COSTS[action]

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[340px] rounded-3xl bg-neutral-900 border border-neutral-800 text-white p-5 overflow-hidden">
        <DialogHeader className="p-0 space-y-1">
          <DialogTitle className="text-xl font-black text-center flex items-center justify-center gap-2">
            <span>{info.icon}</span> {info.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-white/60">
            Aperçu de l'action premium
          </DialogDescription>
        </DialogHeader>

        {/* Visual Preview Area */}
        <div className="my-4 flex items-center justify-center">
          <div className="relative w-[180px] h-[180px] rounded-2xl bg-neutral-950 border border-white/5 flex items-center justify-center overflow-hidden">
            {/* Ambient glow */}
            <div className={`absolute -inset-10 bg-gradient-to-tr ${info.gradient} opacity-10 blur-2xl animate-pulse`} />

            {/* Visual simulation content depending on action */}
            {action === 'boost' && (
              <div className="flex flex-col items-center justify-center gap-2">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-5xl"
                >
                  🚀
                </motion.div>
                <div className="flex flex-col items-center">
                  <div className="h-2 w-16 bg-orange-500/20 border border-orange-500/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-yellow-400"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span className="text-[9px] text-orange-400 font-bold uppercase tracking-widest mt-1">Boosté 10x</span>
                </div>
              </div>
            )}

            {action === 'super_request' && (
              <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-gradient-to-br from-yellow-500/10 to-amber-500/20 border border-yellow-500/30 rounded-xl">
                <span className="text-3xl">⭐</span>
                <span className="text-[10px] font-bold text-yellow-400 text-center uppercase tracking-wider">Demande Étoilée</span>
                <div className="text-[8px] text-white/70 text-center leading-tight">Placée tout en haut des demandes reçues !</div>
              </div>
            )}

            {action === 'rose_connect' && (
              <div className="flex flex-col items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-5xl drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  🌹
                </motion.div>
                <span className="text-[9px] text-red-400 font-bold tracking-wider">Rose Connect envoyée</span>
              </div>
            )}

            {(action === 'theme_flame' || action === 'theme_star' || action === 'theme_aura') && (
              <div className="relative">
                {/* Avatar with theme border */}
                <div className="relative h-20 w-20 rounded-full flex items-center justify-center overflow-hidden z-10">
                  <img src="https://i.pravatar.cc/100?img=47" alt="Mock profile" className="h-full w-full object-cover" />
                </div>
                {/* Frame overlay */}
                {action === 'theme_flame' && (
                  <div className="absolute -inset-1.5 rounded-full border-2 border-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] z-20 pointer-events-none animate-bounce" />
                )}
                {action === 'theme_star' && (
                  <div className="absolute -inset-1.5 rounded-full border-2 border-yellow-400 animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] z-20 pointer-events-none" />
                )}
                {action === 'theme_aura' && (
                  <div className="absolute -inset-1.5 rounded-full border-2 border-purple-500 animate-pulse drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] z-20 pointer-events-none" />
                )}
              </div>
            )}

            {action === 'custom_badge' && (
              <div className="relative flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-white/10 mb-1">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Mock" className="h-full w-full object-cover" />
                </div>
                <div className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border border-pink-400 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-wider">
                  ✨ Célibataire ✨
                </div>
              </div>
            )}

            {action === 'ghost_mode' && (
              <div className="flex flex-col items-center justify-center gap-2">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="text-5xl"
                >
                  👻
                </motion.div>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">Invisible activé</span>
              </div>
            )}

            {action === 'see_visitors' && (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className="text-3xl">👁️</span>
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wide">Qui visite mon profil ?</span>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/5 blur-[2px]" />
                  <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/5 blur-[2px]" />
                  <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/5 blur-[2px]" />
                </div>
              </div>
            )}

            {action === 'read_receipt' && (
              <div className="flex flex-col gap-1 w-[120px] bg-neutral-900 border border-white/5 p-2 rounded-xl">
                <div className="bg-neutral-800 text-[8px] p-1 rounded self-start max-w-[80px]">Coucou !</div>
                <div className="bg-primary/20 text-[8px] p-1 rounded self-end max-w-[80px] text-right flex flex-col items-end gap-0.5">
                  <span>Ça va ?</span>
                  <span className="text-[7px] text-blue-400 font-bold flex items-center gap-0.5">Lu ✓✓</span>
                </div>
              </div>
            )}

            {action === 'filters_plus' && (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-3xl">🔍</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase">Filtres connect+</span>
                <span className="text-[8px] text-white/60 text-center">Taille, Signe astro, Emploi...</span>
              </div>
            )}

            {action === 'undo_pass' && (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-3xl">↩️</span>
                <span className="text-[9px] text-amber-500 font-bold uppercase">Annuler pass</span>
                <span className="text-[8px] text-white/60 text-center">Récupère ton swipe gauche !</span>
              </div>
            )}

            {action === 'extra_request' && (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-3xl">📱</span>
                <span className="text-[9px] text-violet-400 font-bold uppercase">Demande bonus</span>
                <span className="text-[8px] text-white/60 text-center">Plus de limites gratuites.</span>
              </div>
            )}

            {action === 'request_animation' && (
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-3xl">💫</span>
                <span className="text-[9px] text-fuchsia-400 font-bold uppercase">Effet magique</span>
                <span className="text-[8px] text-white/60 text-center">Animation plein écran !</span>
              </div>
            )}
          </div>
        </div>

        {/* Text descriptions */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <p className="text-xs font-medium text-white/90 leading-relaxed text-center">
              {info.description}
            </p>
          </div>

          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
            <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-0.5 text-center">
              💡 L'avantage pour ton profil
            </h4>
            <p className="text-xs font-bold text-amber-300 text-center leading-relaxed">
              {info.advantage}
            </p>
          </div>
        </div>

        {/* Button footer */}
        <div className="mt-5 space-y-2">
          <Button
            onClick={() => onSpend(action, cost)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-black text-sm h-12 rounded-2xl flex items-center justify-center gap-2"
          >
            <span>Activer pour {cost} CC</span>
            <Coins className="size-4 text-black fill-current" />
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-white/60 hover:text-white text-xs h-10 hover:bg-white/5 rounded-xl"
          >
            Fermer l'aperçu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ===== Transaction History Item =====
function TransactionItemRow({ tx }: { tx: { id: string; type: string; amount: number; action?: string | null; description?: string | null; createdAt: string } }) {
  const { t, localeStr } = useT()
  const isPositive = tx.amount > 0
  const typeIcons: Record<string, string> = {
    purchase: '🛒',
    spend: '💸',
    earn_free: '🎁',
    earn_streak: '🔥',
    earn_bonus: '⭐',
    earn_promo: '🎉',
  }
  const icon = typeIcons[tx.type] || (isPositive ? '💰' : '💳')

  const dateStr = (() => {
    try {
      const d = new Date(tx.createdAt)
      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()
      if (isToday) {
        return d.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })
      }
      return d.toLocaleDateString(localeStr, { day: 'numeric', month: 'short' })
    } catch {
      return ''
    }
  })()

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {tx.description || (isPositive ? t('store.ccEarned') : t('store.ccSpent'))}
        </p>
        <p className="text-[9px] text-muted-foreground">{dateStr}</p>
      </div>
      <span className={cn(
        'text-xs font-bold tabular-nums shrink-0',
        isPositive ? 'text-green-400' : 'text-red-400'
      )}>
        {isPositive ? '+' : ''}{tx.amount} CC
      </span>
    </div>
  )
}

// ===== Purchase Confirmation Dialog =====
function PurchaseConfirmDialog({
  pack,
  open,
  onClose,
  onConfirm,
}: {
  pack: PackLocalPrice | null
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<boolean>
}) {
  const { t } = useT()
  const [processing, setProcessing] = useState(false)

  if (!pack) return null

  const handleConfirm = async () => {
    setProcessing(true)
    const ok = await onConfirm()
    if (!ok) {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !processing && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogTitle className="sr-only">{pack ? t('store.packName', { name: pack.name }) : 'Chargement...'}</DialogTitle>
        <DialogDescription className="sr-only">{pack ? t('store.confirmPurchase', { n: pack.cc + pack.bonusCC }) : ''}</DialogDescription>
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500"
              >
                <Coins className="size-8 text-amber-400" />
              </motion.div>
              <h3 className="text-base font-bold text-amber-400">Préparation du paiement...</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Nous vous redirigeons vers My-CoolPay pour finaliser votre achat en toute sécurité.
              </p>
            </motion.div>
          ) : (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col gap-1">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="text-2xl">{pack.icon}</span>
                  {t('store.packName', { name: pack.name })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('store.confirmPurchase', { n: pack.cc + pack.bonusCC })}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-background/50 p-3 space-y-2 border border-border/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('store.baseCC')}</span>
                    <span className="font-medium">{pack.cc} CC</span>
                  </div>
                  {pack.bonusCC > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">{t('store.bonusCC')}</span>
                      <span className="font-medium text-green-400">+{pack.bonusCC} CC</span>
                    </div>
                  )}
                  <div className="h-px bg-border/30" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{t('store.total')}</span>
                    <span className="font-bold text-amber-400">{pack.cc + pack.bonusCC} CC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('store.price')}</span>
                    <span className="font-bold">{pack.priceFormatted}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 rounded-xl" onClick={onClose} disabled={processing}>
                    {t('store.cancel')}
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600"
                    onClick={handleConfirm}
                    disabled={processing}
                  >
                    {processing ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        {t('store.processing')}
                      </motion.span>
                    ) : (
                      <>
                        <ShoppingCart className="mr-1.5 size-4" />
                        {t('store.buyPrice', { price: pack.priceFormatted })}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

// ===== Main CreditStore Component =====
export default function CreditStore() {
  const { t } = useT()
  const {
    showCreditStore,
    setShowCreditStore,
    balance,
    transactions,
    promos,
    challenges,
    level,
    streak,
    actionConfigs,
    purchasePack,
    fetchBalance,
    fetchHistory,
    fetchPromos,
    fetchChallenges,
    setShowSpendConfirm,
    trySpendAction,
    spendCredits,
    selectedPackType,
    setSelectedPackType,
  } = useConnectCoinStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const { packPrices } = useCurrencyStore()

  const [selectedPack, setSelectedPack] = useState<PackLocalPrice | null>(null)
  const [activeSection, setActiveSection] = useState<'packs' | 'actions' | 'history'>('actions')
  const [dataLoaded, setDataLoaded] = useState(false)
  const [previewAction, setPreviewAction] = useState<PremiumAction | null>(null)

  // Auto-select pack when coming from insufficient balance dialog
  useEffect(() => {
    if (selectedPackType && showCreditStore) {
      setActiveSection('packs') // Navigate to packs tab
      const pack = packPrices.find(p => p.type === selectedPackType)
      if (pack) {
        setSelectedPack(pack)
      }
      setSelectedPackType(null) // Reset after use
    }
  }, [selectedPackType, showCreditStore, setSelectedPackType, packPrices])

  // Load data when store opens
  useEffect(() => {
    if (showCreditStore && currentUser && !dataLoaded) {
      const loadData = async () => {
        await Promise.all([
          fetchBalance(currentUser.id),
          fetchHistory(currentUser.id),
          fetchPromos(currentUser.id),
          fetchChallenges(currentUser.id),
        ])
        setDataLoaded(true)
      }
      loadData()
    }
  }, [showCreditStore, currentUser, dataLoaded, fetchBalance, fetchHistory, fetchPromos, fetchChallenges])

  const handlePurchase = async (pack: PackLocalPrice) => {
    setSelectedPack(pack)
  }

  const confirmPurchase = async () => {
    if (!currentUser || !selectedPack) return false
    return await purchasePack(currentUser.id, selectedPack.type as PackType)
  }

  const handleSpendAction = (action: PremiumAction, cost: number) => {
    // trySpendAction handles both flows:
    // - Insufficient balance → shows InsufficientBalanceDialog with pack suggestions
    // - Sufficient balance → shows SpendConfirmDialog with actual spend logic
    trySpendAction(action, async () => {
      if (!currentUser) return
      const success = await spendCredits(currentUser.id, action)
      if (!success) throw new Error('Échec de la dépense')
    })
  }

  const handleSpendActionFromPreview = (action: PremiumAction, cost: number) => {
    setPreviewAction(null)
    handleSpendAction(action, cost)
  }

  // Categorize actions
  const actionCategories = useMemo(() => {
    const interaction: PremiumAction[] = ['super_request', 'rose_connect', 'boost', 'extra_request', 'undo_pass']
    const visibility: PremiumAction[] = ['see_visitors', 'read_receipt', 'ghost_mode', 'filters_plus']
    const cosmetic: PremiumAction[] = ['theme_flame', 'theme_star', 'theme_aura', 'custom_badge', 'request_animation']
    return [
      { title: t('store.interaction'), actions: interaction },
      { title: t('store.visibility'), actions: visibility },
      { title: t('store.cosmetic'), actions: cosmetic },
    ]
  }, [t])

  return (
    <>
      <Sheet open={showCreditStore} onOpenChange={setShowCreditStore}>
        <SheetContent
          side="bottom"
          className="h-[92dvh] sm:h-[92vh] rounded-t-3xl border-t-border/30 bg-background/98 backdrop-blur-xl px-0 pt-0 gap-0 overflow-hidden safe-area-bottom"
        >
          <SheetTitle className="sr-only">{t('store.title')}</SheetTitle>
          <SheetDescription className="sr-only">{t('store.subtitle')}</SheetDescription>
          {/* Sticky Header */}
          <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/20">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20">
                  <Coins className="size-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold">{t('store.title')}</h2>
                  <p className="text-[10px] text-muted-foreground">{t('store.subtitle')}</p>
                </div>
              </div>

              {/* Balance display */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
                  <Coins className="size-4 text-amber-400" />
                  <span className="text-base font-black text-amber-400 tabular-nums">
                    <AnimatedNumber value={balance} />
                  </span>
                  <span className="text-[10px] font-medium text-amber-400/70">CC</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-muted-foreground"
                  onClick={() => setShowCreditStore(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex mx-4 mb-2 rounded-xl bg-muted/50 p-1">
              {([
                { key: 'actions', label: t('store.actions'), icon: Zap },
                { key: 'packs', label: t('store.packs'), icon: ShoppingCart },
                { key: 'history', label: t('store.history'), icon: History },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-medium transition-all',
                    activeSection === tab.key
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-6">
            <AnimatePresence mode="wait">
              {activeSection === 'actions' && (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5 py-4"
                >
                  {actionCategories.map((category) => (
                    <div key={category.title}>
                      <h3 className="text-xs font-bold text-muted-foreground mb-2">{category.title}</h3>
                      <div className="grid grid-cols-3 sm:gap-2 gap-1.5">
                        {category.actions.map((action) => (
                          <ActionCatalogItem
                            key={action}
                            action={action}
                            cost={actionConfigs && actionConfigs[action] ? actionConfigs[action].costCC : ACTION_COSTS[action]}
                            balance={balance}
                            onSpend={handleSpendAction}
                            onInfoClick={(act) => setPreviewAction(act)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl bg-muted/20 border border-border/20 p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">
                      {t('store.moreCC')}
                    </p>
                  </div>
                </motion.div>
              )}

              {activeSection === 'packs' && (
                <motion.div
                  key="packs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 py-4"
                >
                  {/* Daily Free Section */}
                  <DailyFreeSection />

                  {/* Level Badge */}
                  {level && <LevelBadgeInline level={level} />}

                  {/* Streak Widget (compact) */}
                  {streak && streak.currentStreak > 0 && <StreakInline streak={streak} />}

                  {/* Promos */}
                  {promos.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Star className="size-3 text-amber-400" /> {t('store.activePromos')}
                      </h3>
                      <div className="space-y-2">
                        {promos.map((promo, i) => (
                          <PromoCard key={promo.id || i} promo={promo} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pack Cards */}
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ShoppingCart className="size-3 text-amber-400" /> {t('store.buyCC')}
                    </h3>
                    <div className="space-y-2.5">
                      {packPrices.map((pack, i) => (
                        <PackCard
                          key={pack.type}
                          pack={pack}
                          index={i}
                          onPurchase={handlePurchase}
                        />
                      ))}
                    </div>
                  </div>

                  {/* First purchase promo note */}
                  <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 text-center">
                    <p className="text-[10px] text-amber-400/80">
                      {t('store.firstOrder')}
                    </p>
                  </div>
                </motion.div>
              )}

              {activeSection === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="py-4"
                >
                  <h3 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <History className="size-3" /> {t('store.recentTransactions')}
                  </h3>
                  {transactions.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                      <History className="size-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">{t('store.noTransactions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {transactions.map((tx) => (
                        <TransactionItemRow key={tx.id} tx={tx} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>

      {/* Purchase Confirmation Dialog */}
      <PurchaseConfirmDialog
        pack={selectedPack}
        open={!!selectedPack}
        onClose={() => setSelectedPack(null)}
        onConfirm={confirmPurchase}
      />

      {/* Premium Action Preview Dialog */}
      <PremiumActionPreviewDialog
        action={previewAction}
        onClose={() => setPreviewAction(null)}
        onSpend={handleSpendActionFromPreview}
        balance={balance}
      />
    </>
  )
}

// ===== Inline Level Badge (for store) =====
function LevelBadgeInline({ level }: { level: { levelName: string; level: number; totalSpent: number; nextLevelAt: number | null; progress: number; benefits: string[] } }) {
  const { t } = useT()
  const config: Record<string, { emoji: string; color: string; bgGradient: string }> = {
    Bronze: { emoji: '🥉', color: 'text-amber-700', bgGradient: 'from-amber-900/20 to-amber-800/15' },
    Argent: { emoji: '🥈', color: 'text-gray-300', bgGradient: 'from-gray-500/15 to-gray-400/10' },
    Or: { emoji: '🥇', color: 'text-amber-400', bgGradient: 'from-amber-500/15 to-yellow-500/10' },
    Platine: { emoji: '💎', color: 'text-cyan-300', bgGradient: 'from-cyan-500/15 to-blue-500/10' },
    Diamant: { emoji: '💠', color: 'text-violet-300', bgGradient: 'from-violet-500/15 to-purple-500/10' },
  }

  // Map from levelName to translation key
  const levelNameKeys: Record<string, string> = {
    Bronze: 'level.bronze',
    Argent: 'level.silver',
    Or: 'level.gold',
    Platine: 'level.platinum',
    Diamant: 'level.diamond',
  }

  const c = config[level.levelName] || config.Bronze
  const levelNameKey = levelNameKeys[level.levelName] || 'level.bronze'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={cn(
        'rounded-xl border border-border/30 bg-gradient-to-r p-3',
        c.bgGradient
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{c.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn('text-sm font-bold', c.color)}>{t(levelNameKey)}</span>
            <span className="text-[10px] text-muted-foreground">{t('store.level', { n: level.level + 1 })}</span>
          </div>
          {level.nextLevelAt && (
            <div className="mt-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] text-muted-foreground">{level.totalSpent} / {level.nextLevelAt} CC</span>
                <span className="text-[9px] font-medium text-muted-foreground">{level.progress}%</span>
              </div>
              <Progress value={level.progress} className="h-1 bg-muted/50" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ===== Inline Streak (for store) =====
function StreakInline({ streak }: { streak: { currentStreak: number; longestStreak: number; nextMilestone: number | null } }) {
  const { t } = useT()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-2.5 rounded-xl border border-orange-500/15 bg-gradient-to-r from-orange-500/10 to-amber-500/5 p-3"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="text-lg"
      >
        🔥
      </motion.div>
      <div className="flex-1">
        <p className="text-xs font-bold text-orange-400">
          {t('store.daysStreak', { n: streak.currentStreak })}
        </p>
        {streak.nextMilestone && (
          <p className="text-[9px] text-muted-foreground">
            {t('store.nextMilestone', { n: streak.nextMilestone })}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-[9px] text-muted-foreground">{t('store.record')}</p>
        <p className="text-xs font-bold text-orange-400">{streak.longestStreak}j</p>
      </div>
    </motion.div>
  )
}
