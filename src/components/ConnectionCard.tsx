'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MessageSquare, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type ConnectionItem } from '@/lib/store'
import { useFeedback } from '@/components/FeedbackSystem'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'

interface ConnectionCardProps {
  connection: ConnectionItem
}

export default function ConnectionCard({ connection }: ConnectionCardProps) {
  const { t, localeStr } = useT()
  const [copied, setCopied] = useState(false)
  const [showNumber, setShowNumber] = useState(false)
  const { trigger } = useFeedback()
  const { otherUser, phone, createdAt } = connection
  const photo = otherUser?.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`

  const handleCopy = () => {
    if (phone) {
      navigator.clipboard.writeText(phone)
      setCopied(true)
      trigger('number-copied')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.img
          src={photo}
          alt={otherUser?.firstName}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-green-500/30"
          whileTap={{ scale: 0.9 }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{otherUser?.firstName}</h4>
          {otherUser?.jobTitle && (
            <p className="text-xs text-muted-foreground truncate">{otherUser.jobTitle}</p>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          {new Date(createdAt).toLocaleDateString(localeStr, { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Phone number with animated reveal */}
      <div className="mb-3 rounded-xl bg-gradient-to-r from-green-500/5 to-primary/5 p-2.5 border border-green-500/10">
        <AnimatePresence mode="wait">
          {!showNumber ? (
            <motion.button
              key="hidden"
              onClick={() => {
                setShowNumber(true)
                trigger('number-revealed')
              }}
              className="w-full flex items-center gap-2 text-sm min-h-[44px]"
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="size-4 text-primary shrink-0" />
              <span className="flex-1 text-left font-medium text-primary tracking-widest">
                ••• •• •• •• ••
              </span>
              <span className="text-xs text-muted-foreground">{t('connection.show')}</span>
            </motion.button>
          ) : (
            <motion.div
              key="visible"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-2"
            >
              <Phone className="size-4 text-green-500 shrink-0" />
              <span className="flex-1 text-sm font-bold text-green-500 tracking-wider animate-number-scramble">
                {phone}
              </span>
              <motion.button
                onClick={handleCopy}
                whileTap={{ scale: 0.8 }}
                className="text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {copied ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs text-green-500 font-bold"
                  >
                    ✓ {t('connection.copied')}
                  </motion.span>
                ) : (
                  <Copy className="size-3.5" />
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <motion.a href={`sms:${phone}`} className="flex-1" whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" className="w-full rounded-xl hover:border-primary/30 transition-all min-h-[44px]">
            <MessageSquare className="mr-1 size-3.5" /> {t('connection.sms')}
          </Button>
        </motion.a>
        <motion.a href={`tel:${phone}`} className="flex-1" whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" className="w-full rounded-xl hover:border-primary/30 transition-all min-h-[44px]">
            <Phone className="mr-1 size-3.5" /> {t('connection.call')}
          </Button>
        </motion.a>
        <motion.a
          href={`https://wa.me/${phone?.replace('+', '').replace(/\s/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          whileTap={{ scale: 0.95 }}
        >
          <Button size="sm" className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-500/20 min-h-[44px]">
            WhatsApp
          </Button>
        </motion.a>
      </div>
    </motion.div>
  )
}
