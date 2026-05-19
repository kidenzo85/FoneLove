'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star, Zap, Shield, MessageCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n/context'

interface PremiumCardProps {
  onUpgrade?: () => void
}

export default function PremiumCard({ onUpgrade }: PremiumCardProps) {
  const { t } = useT()
  const [hovering, setHovering] = useState(false)
  const features = [
    { icon: Zap, text: t('premium.unlimitedBoosts') },
    { icon: Crown, text: t('premium.superRequests') },
    { icon: Shield, text: t('premium.incognito') },
    { icon: MessageCircle, text: t('premium.unlimitedMessages') },
    { icon: Eye, text: t('premium.seeWhoVisited') },
  ]

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold/20 via-primary/10 to-pink-500/10 border border-gold/30 p-4"
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      whileHover={{ y: -2 }}
    >
      {/* Animated shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
        animate={hovering ? { x: ['-100%', '200%'] } : { x: '-100%' }}
        transition={hovering ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
      />

      {/* Sparkle decorations */}
      <motion.div
        className="absolute top-4 right-4 text-gold/40"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        ✦
      </motion.div>
      <motion.div
        className="absolute bottom-8 right-8 text-gold/20 text-sm"
        animate={{ rotate: -360, scale: [1, 1.3, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        ✦
      </motion.div>

      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Crown className="size-5 text-gold" />
          </motion.div>
          <h3 className="font-bold text-lg">{t('premium.title')}</h3>
          <Badge className="bg-gold text-gold-foreground text-[10px] animate-shimmer">PRO</Badge>
        </div>

        <div className="mb-4 space-y-2">
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <Icon className="size-4 text-gold" />
              </motion.div>
              <span>{text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-gold to-amber-500 text-gold-foreground font-bold hover:from-gold/90 hover:to-amber-400 shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-shadow"
            onClick={onUpgrade}
          >
            <motion.span
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Crown className="mr-2 size-4" /> {t('premium.trial')}
            </motion.span>
          </Button>
        </motion.div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          {t('premium.price')}
        </p>
      </div>
    </motion.div>
  )
}
