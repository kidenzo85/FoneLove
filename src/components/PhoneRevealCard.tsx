'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MessageSquare, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/context'

interface PhoneRevealCardProps {
  phoneNumber: string
  name: string
  photoUrl: string
}

export default function PhoneRevealCard({ phoneNumber, name, photoUrl }: PhoneRevealCardProps) {
  const { t } = useT()
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3 mb-4">
        <img src={photoUrl} alt={name} className="h-12 w-12 rounded-full object-cover" />
        <div>
          <h4 className="font-semibold">{name}</h4>
          <p className="text-xs text-muted-foreground">{t('phoneReveal.label')}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            <div className="mb-3 h-16 w-full rounded-xl bg-muted flex items-center justify-center">
              <span className="text-2xl tracking-widest text-muted-foreground">••• •• •• •• ••</span>
            </div>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white"
              onClick={() => setRevealed(true)}
            >
              <Phone className="mr-2 size-4" /> {t('phoneReveal.reveal')}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="mb-3 h-16 w-full rounded-xl bg-primary/10 flex items-center justify-center animate-phone-reveal">
              <span className="text-2xl font-bold text-primary tracking-wider">{phoneNumber}</span>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={handleCopy}
              >
                {copied ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
                {copied ? t('phoneReveal.copied') : t('phoneReveal.copy')}
              </Button>
              <a
                href={`sms:${phoneNumber}`}
                className="flex-1"
              >
                <Button className="w-full rounded-xl bg-green-500 text-white hover:bg-green-600">
                  <MessageSquare className="mr-1 size-4" /> SMS
                </Button>
              </a>
              <a
                href={`https://wa.me/${phoneNumber.replace('+', '').replace(/\s/g, '')}`}
                className="flex-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700">
                  <Phone className="mr-1 size-4" /> WhatsApp
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
