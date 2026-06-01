'use client'

import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useFoneLoveStore, type SendDialogTarget } from '@/lib/fonelove-store'
import { cn } from '@/lib/utils'
import { FoneLoveIcon } from '@/components/FoneLoveIcon'

interface FoneLoveButtonProps {
  target: SendDialogTarget
  variant?: 'side' | 'inline' | 'compact' | 'chat'
  className?: string
  label?: string
}

export default function FoneLoveButton({ target, variant = 'inline', className, label }: FoneLoveButtonProps) {
  const setShowSendDialog = useFoneLoveStore((s) => s.setShowSendDialog)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSendDialog(target)
  }

  // Side bar variant (TikTok-style)
  if (variant === 'side') {
    return (
      <motion.button
        className={cn('flex flex-col items-center gap-1 min-h-[44px] w-20', className)}
        whileTap={{ scale: 0.8 }}
        onClick={handleClick}
      >
        <motion.div
          className="relative flex h-12 w-12 items-center justify-center rounded-full"
          animate={{
            scale: [1, 1.05, 1],
            filter: [
              'drop-shadow(0 0 0px rgba(236,72,153,0))',
              'drop-shadow(0 0 10px rgba(245,158,11,0.5))',
              'drop-shadow(0 0 0px rgba(236,72,153,0))',
            ],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <FoneLoveIcon className="w-[110%] h-[110%] relative z-10" />
        </motion.div>
        <span className="text-[10px] text-white/80 font-bold uppercase tracking-tight text-center w-full block mt-1">
          {label || 'FoneLove'}
        </span>
      </motion.button>
    )
  }

  // Chat variant (inline in chat footer)
  if (variant === 'chat') {
    return (
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        animate={{
          scale: [1, 1.02, 1],
          borderColor: [
            'rgba(236,72,153,0.2)',
            'rgba(236,72,153,0.5)',
            'rgba(236,72,153,0.2)',
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut'
        }}
        className={cn(
          'flex-shrink-0 h-[44px] px-3.5 flex items-center gap-2 rounded-2xl font-bold text-xs border overflow-hidden relative transition-all',
          'bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10',
          'text-pink-500 border-pink-500/20 hover:bg-pink-500/15',
          className
        )}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
        <FoneLoveIcon className="size-5 relative z-10 animate-bounce-subtle" />
        <span className="relative z-10 flex items-center justify-center">
          {label || 'Offrir un FoneLove'}
        </span>
      </motion.button>
    )
  }

  // Compact variant (profile action bar)
  if (variant === 'compact') {
    return (
      <motion.div whileTap={{ scale: 0.85 }}>
        <button
          className={cn(
            'flex h-[52px] w-[52px] items-center justify-center rounded-full transition-all shrink-0 relative',
            className
          )}
          onClick={handleClick}
        >
          <FoneLoveIcon className="w-[120%] h-[120%] relative z-10" glow={true} />
        </button>
      </motion.div>
    )
  }

  // Default inline variant (e.g. profiles)
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      animate={{
        scale: [1, 1.02, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: 'easeInOut'
      }}
      className={cn(
        'relative flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold text-sm text-white overflow-hidden shadow-md shadow-pink-500/10',
        className
      )}
      style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e, #f59e0b)' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-200%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />
      <FoneLoveIcon className="size-5 relative z-10" />
      <span className="relative z-10 flex items-center justify-center">
        {label || 'Offrir un FoneLove'}
      </span>
    </motion.button>
  )
}
