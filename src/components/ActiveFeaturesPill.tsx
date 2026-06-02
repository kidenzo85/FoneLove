'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { usePremiumFeatures } from '@/lib/premium-features-store'
import { getFeatureConfig, formatTimeRemaining, calculateProgress } from '@/lib/premium-ui'
import { cn } from '@/lib/utils'

export default function ActiveFeaturesPill() {
  const { activeFeatures } = usePremiumFeatures()
  const [now, setNow] = useState(Date.now())
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const [currentIndex, setCurrentIndex] = useState(0)

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

  // Filter features that are currently active (excluding single-use unconsumed tokens)
  const currentFeatures = activeFeatures.filter(f => 
    !f.isConsumed && 
    f.action !== 'undo_pass' &&
    new Date(f.expiresAt).getTime() > now
  )

  // Cycle through multiple features every 4 seconds
  useEffect(() => {
    if (currentFeatures.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % currentFeatures.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [currentFeatures.length])

  if (currentFeatures.length === 0) return null

  // Ensure index is within bounds
  const safeIndex = currentIndex >= currentFeatures.length ? 0 : currentIndex
  const feature = currentFeatures[safeIndex]
  const config = getFeatureConfig(feature.action)

  const isBoost = feature.action === 'boost'
  
  const remainingMs = new Date(feature.expiresAt).getTime() - now
  const { text: timeText, isExpiring } = formatTimeRemaining(remainingMs)
  
  // Calculate accurate progress based on original duration
  const progress = calculateProgress(feature.activatedAt, feature.expiresAt, now) / 100

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
        
        <div className="flex flex-col relative z-10 leading-tight pr-1" key={`pill-text-${feature.id}`}>
          <motion.span 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} 
            className="text-[10px] font-bold text-white uppercase tracking-wider"
          >
            {config.shortLabel}
          </motion.span>
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={cn(
              "text-xs font-black tracking-tight",
              isExpiring ? "text-red-400" : "text-white/90"
            )}
          >
            {timeText}
          </motion.span>
        </div>
        
        {currentFeatures.length > 1 && (
          <div className="relative z-10 flex flex-col items-center ml-1 pl-2 border-l border-white/20">
            <span className="text-[8px] text-white/50 mb-0.5 leading-none">+{currentFeatures.length - 1}</span>
            <div className="flex gap-0.5">
              {currentFeatures.map((_, i) => (
                <div key={i} className={cn("w-1 h-1 rounded-full", i === safeIndex ? "bg-white" : "bg-white/20")} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
