'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProfileScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ProfileScore({ score, size = 'md' }: ProfileScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0)

  const sizeMap = {
    sm: { outer: 'h-12 w-12', text: 'text-xs', border: 3 },
    md: { outer: 'h-20 w-20', text: 'text-sm', border: 4 },
    lg: { outer: 'h-28 w-28', text: 'text-lg', border: 5 },
  }

  const s = sizeMap[size]
  const circumference = Math.PI * (40 - s.border)
  const offset = circumference - (animatedScore / 100) * circumference

  useEffect(() => {
    if (score === 0) {
      setAnimatedScore(0)
      return
    }

    // Animate the score counting up
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  return (
    <motion.div
      className={cn('relative flex items-center justify-center', s.outer)}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
        <defs>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle
          cx="20" cy="20" r={20 - s.border / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.border}
          className="text-muted/20"
        />
        <motion.circle
          cx="20" cy="20" r={20 - s.border / 2}
          fill="none"
          stroke="url(#score-grad)"
          strokeWidth={s.border}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="text-center">
        <span className={cn('font-black text-fonelove drop-shadow-sm', s.text)}>{animatedScore}%</span>
      </div>
    </motion.div>
  )
}
