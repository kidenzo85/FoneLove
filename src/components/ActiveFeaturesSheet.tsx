'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePremiumFeatures, type ActiveFeature } from '@/lib/premium-features-store'
import { Flame, Ghost, Eye, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'

const FEATURE_MAP: Record<string, { icon: React.ReactNode; label: string; desc: string; color: string; bg: string }> = {
  boost: { 
    icon: <Flame className="size-6" />, 
    label: 'Super Visibilité', 
    desc: 'Ton profil passe en premier', 
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  incognito: { 
    icon: <Ghost className="size-6" />, 
    label: 'Mode Fantôme', 
    desc: 'Personne ne te voit visiter', 
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  see_visitors: { 
    icon: <Eye className="size-6" />, 
    label: 'Vue Visiteurs', 
    desc: 'Tu vois qui visite ton profil', 
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  }
}

export default function ActiveFeaturesSheet({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { activeFeatures } = usePremiumFeatures()
  const [now, setNow] = useState(Date.now())

  // Update timer every second when open
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [open])

  const currentFeatures = activeFeatures.filter(f => !f.isConsumed && new Date(f.expiresAt).getTime() > now)

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
              const config = FEATURE_MAP[feature.action] || { 
                icon: <Flame className="size-6" />, 
                label: 'Avantage actif', 
                desc: 'Profites-en !',
                color: 'text-primary',
                bg: 'bg-primary/10'
              }
              
              const start = new Date(feature.activatedAt).getTime()
              const end = new Date(feature.expiresAt).getTime()
              const totalDuration = end - start
              const remainingMs = Math.max(0, end - now)
              
              // Calculate progress percentage (0 to 100)
              const progressPct = Math.min(100, Math.max(0, 100 - (remainingMs / totalDuration) * 100))

              const minutes = Math.floor(remainingMs / 60000)
              const seconds = Math.floor((remainingMs % 60000) / 1000)
              const timeText = minutes > 60 
                ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
                : `${minutes}m ${seconds.toString().padStart(2, '0')}s`

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
                      <p className="text-xs text-white/50 mt-0.5">{config.desc}</p>
                    </div>
                  </div>

                  <div className="ml-2 mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 font-medium">Temps restant</span>
                      <span className="font-bold text-white font-mono bg-black/40 px-2 py-0.5 rounded-md">
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
