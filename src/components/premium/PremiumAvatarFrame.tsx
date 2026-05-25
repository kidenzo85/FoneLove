'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { type PremiumAction } from '@/lib/connectcoin-store'

interface PremiumAvatarFrameProps {
  children: React.ReactNode
  theme?: PremiumAction | null
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function PremiumAvatarFrame({ children, theme, className, size = 'md' }: PremiumAvatarFrameProps) {
  if (!theme || !['theme_flame', 'theme_star', 'theme_aura'].includes(theme)) {
    return <div className={cn("relative", className)}>{children}</div>
  }

  // Size mapping for the container padding/scaling
  const sizeClasses = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5',
    xl: 'p-2',
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}>
      {/* Dynamic Background Glow Based on Theme */}
      {theme === 'theme_flame' && (
        <motion.div 
          className="absolute -inset-1 rounded-full bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500 opacity-30 blur-sm pointer-events-none"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {theme === 'theme_star' && (
        <motion.div 
          className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-400 to-amber-500 opacity-40 blur-sm pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {theme === 'theme_aura' && (
        <motion.div 
          className="absolute -inset-2 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 opacity-30 blur-md pointer-events-none"
          animate={{ scale: [1, 1.1, 1], rotate: [0, -180, -360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* The Actual Avatar */}
      <div className="relative z-10 rounded-full overflow-hidden w-full h-full">
        {children}
      </div>

      {/* Overlays / Borders */}
      {theme === 'theme_flame' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" style={{ transform: 'scale(1.1)' }}>
          <defs>
            <linearGradient id="flame-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
            <filter id="glow-flame">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="url(#flame-grad)" 
            strokeWidth="3"
            filter="url(#glow-flame)"
            animate={{ 
              strokeDasharray: ["20 10 30 40", "40 20 10 30", "20 10 30 40"],
              strokeDashoffset: [0, 100],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
      )}

      {theme === 'theme_star' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" style={{ transform: 'scale(1.1)' }}>
          <defs>
            <linearGradient id="star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="glow-star">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.circle 
            cx="50" cy="50" r="48" 
            fill="none" 
            stroke="url(#star-grad)" 
            strokeWidth="2.5"
            filter="url(#glow-star)"
            animate={{ rotate: 360 }}
            style={{ transformOrigin: 'center' }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Petites étoiles animées sur le contour */}
          <motion.g 
            animate={{ rotate: -360 }} 
            style={{ transformOrigin: 'center' }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 72, 144, 216, 288].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = 50 + 48 * Math.cos(rad);
              const y = 50 + 48 * Math.sin(rad);
              return (
                <motion.path
                  key={i}
                  d={`M${x},${y-4} Q${x},${y} ${x+4},${y} Q${x},${y} ${x},${y+4} Q${x},${y} ${x-4},${y} Q${x},${y} ${x},${y-4}`}
                  fill="#fef08a"
                  filter="url(#glow-star)"
                  animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                />
              )
            })}
          </motion.g>
        </svg>
      )}

      {theme === 'theme_aura' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" style={{ transform: 'scale(1.15)' }}>
          <defs>
            <linearGradient id="aura-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="glow-aura">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.circle 
            cx="50" cy="50" r="46" 
            fill="none" 
            stroke="url(#aura-grad)" 
            strokeWidth="4"
            filter="url(#glow-aura)"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      )}
    </div>
  )
}
