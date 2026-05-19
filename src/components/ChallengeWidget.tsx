'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle2, Gift, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useConnectCoinStore, type ChallengeItem } from '@/lib/connectcoin-store'
import { useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

interface ChallengeWidgetProps {
  challenges?: ChallengeItem[]
}

const CHALLENGE_ICONS: Record<string, string> = {
  sociable: '🤝',
  audacieux: '🎯',
  complet: '📋',
  actif: '⚡',
  curieux: '🔍',
}

export default function ChallengeWidget({ challenges: propChallenges }: ChallengeWidgetProps) {
  const { t } = useT()
  const storeChallenges = useConnectCoinStore((s) => s.challenges)
  const { fetchChallenges, fetchBalance, spendCredits } = useConnectCoinStore()
  const currentUser = useAppStore((s) => s.currentUser)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set())

  const challenges = propChallenges ?? storeChallenges

  const handleClaim = async (challenge: ChallengeItem) => {
    if (!currentUser) return
    setClaimingId(challenge.id)
    try {
      // In a real app, there would be a dedicated claim API
      // For now we'll simulate by just updating the UI state
      setClaimedIds((prev) => new Set(prev).add(challenge.id))
      await fetchChallenges(currentUser.id)
      await fetchBalance(currentUser.id)
    } catch (err) {
      console.error('Claim error:', err)
    }
    setClaimingId(null)
  }

  const handleRefresh = async () => {
    if (!currentUser) return
    await fetchChallenges(currentUser.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card/80 p-4 backdrop-blur-sm border-border/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20">
            <Trophy className="size-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold">{t('challenge.title')}</h4>
            <p className="text-[10px] text-muted-foreground">{t('challenge.resetInfo')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          onClick={handleRefresh}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      {/* Challenge list */}
      <div className="space-y-2.5">
        {challenges.length === 0 ? (
          <div className="flex flex-col items-center py-4">
            <Trophy className="size-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">{t('challenge.none')}</p>
          </div>
        ) : (
          challenges.map((challenge, idx) => {
            const icon = CHALLENGE_ICONS[challenge.type] || '🏅'
            const progressPct = Math.min(100, Math.round((challenge.progress / challenge.targetCount) * 100))
            const isCompleted = challenge.completed
            const isClaimed = challenge.claimed || claimedIds.has(challenge.id)
            const canClaim = isCompleted && !isClaimed

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={cn(
                  'rounded-xl border p-3 transition-all',
                  isClaimed
                    ? 'border-green-500/20 bg-green-500/5 opacity-70'
                    : isCompleted
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-border/20 bg-background/30'
                )}
              >
                <div className="flex items-start gap-2.5">
                  {/* Icon */}
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base',
                    isCompleted ? 'bg-amber-500/15' : 'bg-muted/30'
                  )}>
                    {isClaimed ? '✅' : icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className={cn(
                        'text-xs font-semibold',
                        isClaimed ? 'text-green-400' : 'text-foreground'
                      )}>
                        {challenge.title}
                      </h5>
                      <div className="flex items-center gap-1 shrink-0">
                        <Gift className="size-3 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">+{challenge.reward} CC</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">{challenge.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <Progress
                        value={progressPct}
                        className={cn(
                          'h-1.5 flex-1',
                          isCompleted ? 'bg-amber-500/10' : 'bg-muted/50'
                        )}
                      />
                      <span className={cn(
                        'text-[10px] font-medium tabular-nums shrink-0',
                        isCompleted ? 'text-amber-400' : 'text-muted-foreground'
                      )}>
                        {Math.min(challenge.progress, challenge.targetCount)}/{challenge.targetCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim button */}
                <AnimatePresence>
                  {canClaim && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <Button
                        size="sm"
                        className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-semibold hover:from-amber-600 hover:to-yellow-600 h-7"
                        onClick={() => handleClaim(challenge)}
                        disabled={claimingId === challenge.id}
                      >
                        {claimingId === challenge.id ? (
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            {t('challenge.claiming')}
                          </motion.span>
                        ) : (
                          <>
                            <Gift className="mr-1 size-3" />
                            {t('challenge.claim', { n: challenge.reward })}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
