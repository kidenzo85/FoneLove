'use client'

import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation()

  const toggle = () => {
    setLocale(locale === 'fr' ? 'en' : 'fr')
  }

  return (
    <motion.button
      onClick={toggle}
      className={cn(
        'flex items-center gap-1.5 rounded-full border bg-card/80 px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all hover:bg-accent',
        className
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
    >
      <Globe className="size-3.5 text-primary" />
      <span className={cn(
        'transition-all',
        locale === 'fr' ? 'text-primary font-bold' : 'text-muted-foreground'
      )}>
        FR
      </span>
      <span className="text-muted-foreground/50">/</span>
      <span className={cn(
        'transition-all',
        locale === 'en' ? 'text-primary font-bold' : 'text-muted-foreground'
      )}>
        EN
      </span>
    </motion.button>
  )
}
