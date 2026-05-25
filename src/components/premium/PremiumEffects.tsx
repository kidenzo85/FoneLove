'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PremiumAction } from '@/lib/connectcoin-store'

interface PremiumEffectProps {
  action: PremiumAction
  children?: React.ReactNode
  isActive?: boolean
}

export function PremiumEffect({ action, children, isActive = true }: PremiumEffectProps) {
  if (!isActive) return <>{children}</>

  if (action === 'super_request') {
    return (
      <div className="relative group overflow-hidden rounded-2xl">
        {/* Shimmer Border/Background */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(120deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.3) 50%, rgba(251,191,36,0.1) 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Subtle Gold Border */}
        <div className="absolute inset-0 border-[1.5px] border-amber-400/60 rounded-2xl pointer-events-none z-10" />

        {/* Content */}
        <div className="relative z-10 p-[1px]">
          {children}
        </div>

        {/* Floating Stars */}
        <div className="absolute -top-2 -right-2 pointer-events-none z-20">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          >
            <Star className="size-6 text-amber-400 fill-amber-400" />
          </motion.div>
        </div>
      </div>
    )
  }

  if (action === 'rose_connect') {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        {children}
        
        {/* Rose Particles falling */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 100 + "%", opacity: 0, rotate: 0 }}
              animate={{ 
                y: ["0%", "100%"], 
                x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [0, 1, 0],
                rotate: 360
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2,
                ease: "linear" 
              }}
              className="absolute text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]"
              style={{ fontSize: `${12 + Math.random() * 12}px` }}
            >
              🌹
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (action === 'boost') {
    return (
      <div className="relative rounded-2xl">
        {/* Boost Radar Pulse */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden rounded-2xl">
          <motion.div
            className="w-full h-full rounded-2xl border-2 border-orange-500/50"
            animate={{ scale: [0.95, 1.05], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  if (action === 'custom_badge') {
    return (
      <div className="relative">
        {children}
        {/* We assume custom_badge effect is applied directly where needed via PremiumBadge, but we can add a subtle sparkle here */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 pointer-events-none z-0" />
      </div>
    )
  }

  return <>{children}</>
}

// Full screen animation for 'request_animation'
export function RequestAnimationOverlay({ active, onComplete }: { active: boolean, onComplete: () => void }) {
  if (!active) return null;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.5, 1], rotate: 0 }}
          transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute w-64 h-64 bg-fuchsia-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="text-9xl drop-shadow-[0_0_30px_rgba(217,70,239,0.8)] z-10 relative">
            💫
          </div>
          
          {/* Particles explosion */}
          {[...Array(20)].map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 100 + Math.random() * 150;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x, y, scale: Math.random() * 1.5, opacity: 0 }}
                transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
                className="absolute text-fuchsia-400 z-20"
              >
                <Sparkles className="size-6 fill-current" />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
