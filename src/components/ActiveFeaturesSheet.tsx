'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePremiumFeatures, type ActiveFeature } from '@/lib/premium-features-store'
import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import { getFeatureConfig, formatTimeRemaining, calculateProgress } from '@/lib/premium-ui'

export default function ActiveFeaturesSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { activeFeatures } = usePremiumFeatures()
  const [now, setNow] = useState(Date.now())

  // Update timer every second when open
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [open])

  const currentFeatures = activeFeatures.filter(f => 
    !f.isConsumed && 
    f.action !== 'undo_pass' &&
    new Date(f.expiresAt).getTime() > now
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-slate-950 border-white/10 px-4 pb-10 pt-6">
        <SheetHeader className="mb-6 relative">
          <SheetTitle className="text-xl font-black text-center text-white">
            ✨ Tes avantages en cours
          </SheetTitle>
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute -top-2 right-0 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </SheetHeader>

        <div className="space-y-4">
          {currentFeatures.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <p className="text-sm font-medium">Aucun avantage actif pour le moment.</p>
            </div>
          ) : (
            currentFeatures.map(feature => {
              const config = getFeatureConfig(feature.action)
              
              const remainingMs = Math.max(0, new Date(feature.expiresAt).getTime() - now)
              const { text: timeText, isExpiring } = formatTimeRemaining(remainingMs)
              
              // Calculate progress percentage (0 to 100)
              const progressPct = calculateProgress(feature.activatedAt, feature.expiresAt, now)

              return (
                <motion.div 
                  key={feature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${config.bg.replace('/10', '')}`} />
                  
                  <div className="flex items-center gap-4 mb-3 ml-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-white leading-tight">{config.label}</h4>
                      <p className="text-xs text-white/50 mt-0.5">{config.shortLabel}</p>
                    </div>
                  </div>

                  <div className="ml-2 mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 font-medium">Temps restant</span>
                      <span className={`font-bold font-mono px-2 py-0.5 rounded-md ${isExpiring ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-white'}`}>
                        {timeText}
                      </span>
                    </div>
                    <Progress value={progressPct} className="h-2 bg-black/40" />
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
