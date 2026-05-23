import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, CheckCircle2, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useConnectCoinStore, type StreakInfo } from '@/lib/connectcoin-store'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import SharedGiftOverlay from '@/components/SharedGiftOverlay'

interface StreakWidgetProps {
  streak?: StreakInfo | null
  compact?: boolean
}

const MILESTONE_DAYS = [5, 7, 14, 30]



// ─── Main StreakWidget ─────────────────────────────────────────────────
export default function StreakWidget({ streak: propStreak, compact = false }: StreakWidgetProps) {
  const { t } = useT()
  const storeStreak = useConnectCoinStore((s) => s.streak)
  const { checkInStreak, claimDailyFree, dailyFreeClaimed } = useConnectCoinStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const [checkingIn, setCheckingIn] = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const [sharedGiftInfo, setSharedGiftInfo] = useState<{
    amount: number
    giftAmount: number
  } | null>(null)

  const streak = propStreak ?? storeStreak
  const isLoading = useConnectCoinStore((s) => s.isLoading)

  if (!streak) {
    if (isLoading) {
      return (
        <div className="animate-pulse rounded-2xl border bg-card p-4 h-[120px] flex flex-col justify-center gap-3">
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-xl" />
        </div>
      )
    }
    return null
  }


  const currentStreak = streak.currentStreak
  const nextMilestone = streak.nextMilestone
  const todayReward = 3 + Math.min(Math.max(0, currentStreak - 1), 5)

  // Calculate progress to next milestone
  const milestoneProgress = (() => {
    if (!nextMilestone) return 100
    const prevMilestone = MILESTONE_DAYS.filter((d) => d <= currentStreak).pop() ?? 0
    const range = nextMilestone - prevMilestone
    const progress = currentStreak - prevMilestone
    return Math.min(100, Math.round((progress / range) * 100))
  })()

  const handleCheckIn = async () => {
    if (!currentUser) return
    setCheckingIn(true)
    try {
      // 1. Assurer d'abord la validation du streak et l'obtention des paliers
      if (streak && !streak.todayBonusClaimed) {
        await checkInStreak(currentUser.id)
      }

      // 2. Réclamer ensuite les pièces gratuites quotidiennes et déclencher le partage
      let result: any = null
      if (!dailyFreeClaimed) {
        result = await claimDailyFree(currentUser.id)
      }
      
      if (result && result.hasSharedGift && result.sharedGiftAmount) {
        // Afficher le pop-up de partage viral du cadeau
        setSharedGiftInfo({
          amount: result.amount,
          giftAmount: result.sharedGiftAmount,
        })
        setCheckingIn(false)
        return
      }
      
      setJustClaimed(true)
      setTimeout(() => setJustClaimed(false), 2000)
    } catch (err) {
      console.error('Check-in error:', err)
    }
    setCheckingIn(false)
  }

  const alreadyCheckedIn = streak.todayBonusClaimed || dailyFreeClaimed

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={currentStreak > 0 ? { scale: [1, 1.15, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Flame className={cn('size-4', currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground')} />
        </motion.div>
        <span className="text-sm font-bold text-orange-400">{currentStreak}j</span>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card/80 p-4 backdrop-blur-sm border-border/30"
      >
        {/* Streak header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={currentStreak > 0 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20"
            >
              <Flame className="size-5 text-orange-400" />
            </motion.div>
            <div>
              <h4 className="font-bold text-orange-400">{t('streak.daysStreak', { n: currentStreak })}</h4>
              <p className="text-[10px] text-muted-foreground">{t('streak.record', { n: streak.longestStreak })}</p>
            </div>
          </div>

          {/* Today's reward */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t('streak.today')}</p>
            <p className="text-sm font-bold text-amber-400">+{todayReward} CC</p>
          </div>
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">
                {t('streak.nextMilestone', { n: nextMilestone })}
              </span>
              <span className="text-[10px] font-medium text-orange-400">{milestoneProgress}%</span>
            </div>
            <Progress value={milestoneProgress} className="h-1.5 bg-muted/50" />
          </div>
        )}

        {/* Milestone preview */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('streak.milestones')}</p>
          <div className="flex gap-1.5">
            {MILESTONE_DAYS.map((day) => {
              const milestoneInfo = streak.milestones?.[day]
              const isReached = currentStreak >= day
              const isNext = day === nextMilestone
              return (
                <motion.div
                  key={day}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex-1 rounded-lg border p-1.5 text-center transition-all',
                    isReached
                      ? 'border-orange-500/30 bg-orange-500/10'
                      : isNext
                        ? 'border-orange-500/20 bg-orange-500/5'
                        : 'border-border/20 bg-muted/20'
                  )}
                >
                  <p className={cn(
                    'text-[10px] font-bold',
                    isReached ? 'text-orange-400' : 'text-muted-foreground'
                  )}>
                    {t('streak.day', { n: day })}
                  </p>
                  {isReached && (
                    <CheckCircle2 className="size-3 text-orange-400 mx-auto mt-0.5" />
                  )}
                  {milestoneInfo && !isReached && (
                    <Gift className="size-3 text-muted-foreground mx-auto mt-0.5" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Check-in button */}
        <AnimatePresence mode="wait">
          {justClaimed ? (
            <motion.div
              key="claimed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 py-2.5"
            >
              <CheckCircle2 className="size-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">{t('streak.claimed', { n: todayReward })}</span>
            </motion.div>
          ) : alreadyCheckedIn ? (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-muted/30 border border-border/20 py-2.5"
            >
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('streak.checkedIn')}</span>
            </motion.div>
          ) : (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600"
                onClick={handleCheckIn}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {t('streak.inProgress')}
                  </motion.span>
                ) : (
                  <>
                    <Flame className="mr-1.5 size-4" />
                    {t('streak.checkIn', { n: todayReward })}
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Shared Gift Overlay */}
      <AnimatePresence>
        {sharedGiftInfo && (
          <SharedGiftOverlay
            amount={sharedGiftInfo.amount}
            giftAmount={sharedGiftInfo.giftAmount}
            onClose={() => {
              setSharedGiftInfo(null)
              setJustClaimed(true)
              setTimeout(() => setJustClaimed(false), 2000)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
