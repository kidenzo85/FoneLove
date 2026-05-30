'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { usePremiumFeatures } from '@/lib/premium-features-store'
import { Flame, Ghost, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

// Map actions to icons and text
const FEATURE_MAP: Record<string, { icon: React.ReactNode; label: string; shortLabel: string; color: string; gradient?: string }> = {
  boost: { 
    icon: <Flame className="size-4" />, 
    label: 'Ton profil est très visible', 
    shortLabel: 'Boost actif', 
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 via-orange-500/20 to-rose-500/20'
  },
  incognito: { 
    icon: <Ghost className="size-4" />, 
    label: 'Personne ne te voit', 
    shortLabel: 'Mode Fantôme', 
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-indigo-500/20'
  },
  see_visitors: { 
    icon: <Eye className="size-4" />, 
    label: 'Tu vois tes visiteurs', 
    shortLabel: 'Visiteurs', 
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  }
}

export default function ActiveFeaturesPill() {
  const { activeFeatures } = usePremiumFeatures()
  const [now, setNow] = useState(Date.now())
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Load saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem('fonelove_boost_pill_pos')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        x.set(parsed.x)
        y.set(parsed.y)
      } catch (e) {}
    }
  }, [x, y])

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Filter features that are currently active
  const currentFeatures = activeFeatures.filter(f => !f.isConsumed && new Date(f.expiresAt).getTime() > now)

  if (currentFeatures.length === 0) return null

  // Pick the first active feature to display in the pill
  // Prioritize boost
  const feature = currentFeatures.find(f => f.action === 'boost') || currentFeatures[0]
  const config = FEATURE_MAP[feature.action] || { 
    icon: <Flame className="size-4" />, 
    label: 'Avantage actif', 
    shortLabel: 'Actif', 
    color: 'text-primary' 
  }

  const isBoost = feature.action === 'boost'
  const remainingMs = Math.max(0, new Date(feature.expiresAt).getTime() - now)
  const totalDurationMs = 30 * 60 * 1000 // assuming 30 min default duration
  const progress = Math.max(0, Math.min(1, remainingMs / totalDurationMs))
  
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  
  const isExpiring = minutes < 5
  
  const timeText = minutes > 60 
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <motion.div
        layout
        drag
        dragMomentum={false}
        onDragEnd={() => {
          localStorage.setItem('fonelove_boost_pill_pos', JSON.stringify({ x: x.get(), y: y.get() }))
        }}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        style={{ x, y, cursor: 'grab', touchAction: 'none' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "relative flex items-center gap-2.5 rounded-full px-3 py-1.5 shadow-xl border overflow-hidden",
          isBoost ? "bg-black/80 border-amber-500/30" : "bg-black/80 border-white/10"
        )}
      >
        {/* Subtle animated background gradient for boost */}
        {isBoost && (
          <motion.div
            className={cn("absolute inset-0 bg-gradient-to-r opacity-50", config.gradient)}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          />
        )}
        
        {/* Expiring pulse effect */}
        {isBoost && isExpiring && (
          <motion.div
            className="absolute inset-0 bg-red-500/20"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        <div className="relative flex items-center justify-center shrink-0">
          <span className={cn("relative z-10", isExpiring ? 'text-red-400' : config.color)}>
            {config.icon}
          </span>
          {/* Progress Ring */}
          {isBoost && (
            <svg className="absolute w-8 h-8 -rotate-90 pointer-events-none" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="16"
                fill="none"
                className="stroke-white/10"
                strokeWidth="2"
              />
              <circle
                cx="18" cy="18" r="16"
                fill="none"
                className={isExpiring ? "stroke-red-500" : "stroke-amber-500"}
                strokeWidth="2"
                strokeDasharray={`${progress * 100} 100`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
          )}
        </div>
        
        <div className="flex flex-col relative z-10 leading-tight pr-1">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{config.shortLabel}</span>
          <span className={cn(
            "text-xs font-black tracking-tight",
            isExpiring ? "text-red-400" : "text-white/90"
          )}>
            {timeText}
          </span>
        </div>
        
        {currentFeatures.length > 1 && (
          <div className="relative z-10 flex -space-x-1 ml-1 pl-2 border-l border-white/20">
            <span className="w-5 h-5 rounded-full bg-white/20 text-[9px] font-bold text-white flex items-center justify-center border border-black/50">
              +{currentFeatures.length - 1}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
