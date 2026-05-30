'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gift } from 'lucide-react'
import { useFoneLoveStore } from '@/lib/fonelove-store'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

import { useShallow } from 'zustand/react/shallow'

interface FoneLoveBalanceProps {
  compact?: boolean
}

export default function FoneLoveBalance({ compact = false }: FoneLoveBalanceProps) {
  const { sendBalance, receivedBalance, setShowWallet, fetchWallet } = useFoneLoveStore(
    useShallow(s => ({
      sendBalance: s.sendBalance,
      receivedBalance: s.receivedBalance,
      setShowWallet: s.setShowWallet,
      fetchWallet: s.fetchWallet,
    }))
  )
  const currentUser = useAppStore((s) => s.currentUser)
  const [justChanged, setJustChanged] = useState(false)
  const [prevBalance, setPrevBalance] = useState(sendBalance)

  useEffect(() => {
    if (currentUser) {
      fetchWallet(currentUser.id)
    }
  }, [currentUser])

  useEffect(() => {
    if (sendBalance !== prevBalance) {
      setJustChanged(true)
      setPrevBalance(sendBalance)
      const t = setTimeout(() => setJustChanged(false), 1200)
      return () => clearTimeout(t)
    }
  }, [sendBalance, prevBalance])


  return (
    <motion.button
      onClick={() => setShowWallet(true)}
      className={cn(
        'relative flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all',
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        'bg-pink-500/10 border-pink-500/20 shadow-sm',
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div
        animate={justChanged ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Gift className={cn(compact ? 'size-3.5' : 'size-4', 'text-pink-400')} />
      </motion.div>

      <span className={cn(
        'font-bold tabular-nums',
        compact ? 'text-xs' : 'text-sm',
        justChanged ? 'text-green-400' : 'text-pink-400'
      )}>
        {sendBalance}
      </span>

      <span className={cn(
        'font-medium text-pink-400/60',
        compact ? 'text-[9px]' : 'text-[10px]'
      )}>
        FL
      </span>


    </motion.button>
  )
}
