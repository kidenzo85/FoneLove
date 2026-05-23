'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePremiumFeatures, type ActiveFeature } from '@/lib/premium-features-store'
import { Flame, Ghost, Eye } from 'lucide-react'

// Map actions to icons and text
const FEATURE_MAP: Record<string, { icon: React.ReactNode; label: string; shortLabel: string; color: string }> = {
  boost: { icon: <Flame className="size-4" />, label: 'Ton profil est très visible', shortLabel: 'Boost', color: 'text-orange-500' },
  incognito: { icon: <Ghost className="size-4" />, label: 'Personne ne te voit', shortLabel: 'Fantôme', color: 'text-purple-400' },
  see_visitors: { icon: <Eye className="size-4" />, label: 'Tu vois tes visiteurs', shortLabel: 'Visiteurs', color: 'text-cyan-400' }
}

export default function ActiveFeaturesPill() {
  const { activeFeatures } = usePremiumFeatures()
  const [expanded, setExpanded] = useState(true)
  const [now, setNow] = useState(Date.now())

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-collapse after 5 seconds
  useEffect(() => {
    if (activeFeatures.length > 0) {
      setExpanded(true)
      const timer = setTimeout(() => setExpanded(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [activeFeatures.length])

  // Filter features that are currently active
  const currentFeatures = activeFeatures.filter(f => !f.isConsumed && new Date(f.expiresAt).getTime() > now)

  if (currentFeatures.length === 0) return null

  // Pick the first active feature to display in the pill
  const feature = currentFeatures[0]
  const config = FEATURE_MAP[feature.action] || { icon: <Flame className="size-4" />, label: 'Avantage actif', shortLabel: 'Actif', color: 'text-primary' }

  const remainingMs = Math.max(0, new Date(feature.expiresAt).getTime() - now)
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  
  const timeText = minutes > 60 
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <motion.button
        layout
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 shadow-xl"
      >
        <span className={config.color}>{config.icon}</span>
        
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap"
            >
              <span className="text-[11px] font-medium text-white">{config.label}</span>
              <span className="text-[10px] font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full">
                {timeText}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-1 overflow-hidden whitespace-nowrap"
            >
              <span className="text-[11px] font-bold text-white">{timeText}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {currentFeatures.length > 1 && (
          <div className="flex -space-x-1 ml-1">
            <span className="w-4 h-4 rounded-full bg-white/20 text-[8px] font-bold text-white flex items-center justify-center border border-black/50">
              +{currentFeatures.length - 1}
            </span>
          </div>
        )}
      </motion.button>
    </div>
  )
}
