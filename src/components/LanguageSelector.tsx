'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { useI18nStore, useTranslation, LOCALES, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * LanguageSelector — Compact language switcher
 * Shows current locale flag + code, dropdown to switch
 */
export default function LanguageSelector() {
  const { locale, setLocale, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const currentLocale = LOCALES.find((l) => l.code === locale) || LOCALES[1]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-muted/50 border border-border/20 px-2 py-1 hover:bg-muted/70 transition-colors"
      >
        <Globe className="size-3 text-muted-foreground" />
        <span className="text-sm">{currentLocale.flag}</span>
        <span className="text-[10px] text-muted-foreground uppercase font-medium">{locale}</span>
        <ChevronDown className={cn('size-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border border-border/30 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden"
          >
            <div className="p-1.5">
              {LOCALES.map((loc) => {
                const isActive = loc.code === locale
                return (
                  <button
                    key={loc.code}
                    onClick={() => {
                      setLocale(loc.code)
                      setOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors',
                      isActive
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <span className="text-base">{loc.flag}</span>
                    <span className={cn(
                      'text-xs font-medium',
                      isActive ? 'text-amber-400' : 'text-foreground'
                    )}>
                      {loc.label}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto h-2 w-2 rounded-full bg-amber-400"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside handler */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
