import { cn } from '@/lib/utils'
import { type MessageItem } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mic, Check, CheckCheck, Gift, Sparkles, Clock } from 'lucide-react'
import { useT } from '@/lib/i18n/context'
import { useState, useEffect } from 'react'
import { usePremiumFeatures } from '@/lib/premium-features-store'

interface MessageBubbleProps {
  message: MessageItem
  isOwn: boolean
  showExpiry?: boolean
  onSayThanks?: () => void
}

export default function MessageBubble({ message, isOwn, showExpiry, onSayThanks }: MessageBubbleProps) {
  const { t, localeStr } = useT()
  const [isOpened, setIsOpened] = useState(false)
  const isVoice = message.type === 'voice'
  const isGift = message.type === 'gift'
  const isEmoji = message.type === 'emoji'
  const isImage = message.type === 'image'

  let parsedGift = { amount: 1, message: '' }
  if (isGift) {
    try {
      parsedGift = JSON.parse(message.content)
    } catch {
      parsedGift = { amount: 1, message: message.content }
    }
  }

  const { hasActiveFeature } = usePremiumFeatures()
  const canSeeReadReceipts = hasActiveFeature('read_receipt')

  const isSending = message.id.startsWith('msg-')
  const [status, setStatus] = useState<'sending' | 'sent' | 'delivered' | 'read'>(() => {
    if (isSending) return 'sending'
    if (message.isRead && canSeeReadReceipts) return 'read'
    
    const ageMs = Date.now() - new Date(message.createdAt).getTime()
    if (ageMs < 1200) {
      return 'sent'
    }
    return 'delivered' // if isRead but !canSeeReadReceipts, it appears just delivered
  })

  useEffect(() => {
    if (isSending) {
      setStatus('sending')
      return
    }
    if (message.isRead && canSeeReadReceipts) {
      setStatus('read')
      return
    }

    const ageMs = Date.now() - new Date(message.createdAt).getTime()
    if (ageMs < 1200) {
      setStatus('sent')
      const timer = setTimeout(() => {
        setStatus('delivered')
      }, 1200 - ageMs)
      return () => clearTimeout(timer)
    } else {
      setStatus('delivered')
    }
  }, [message.isRead, isSending, message.createdAt])

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
        scale: 0.9,
        x: isOwn ? 20 : -20,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm relative overflow-hidden',
          isOwn
            ? 'bg-gradient-to-br from-primary to-pink-500 text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md',
          isEmoji && 'bg-transparent shadow-none px-0 py-0 overflow-visible'
        )}
      >
        {isEmoji ? (
          <motion.div
            className="text-6xl py-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {message.content}
          </motion.div>
        ) : isImage ? (
          <div className="-mx-4 -my-2.5 relative group overflow-hidden">
            <img src={message.content} alt="Photo envoyée" className="w-full h-auto max-w-[240px] rounded-2xl object-cover" />
          </div>
        ) : isGift && isOwn ? (
          <div className="py-1 min-w-[140px]">
            <div className="flex items-center gap-2 mb-2 text-white">
              <Gift className="size-4 text-pink-200" />
              <span className="text-xs font-black uppercase tracking-wider">
                🎁 Cadeau Envoyé ({parsedGift.amount} 💖)
              </span>
            </div>
            {parsedGift.message && (
              <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 mt-1.5">
                <p className="text-xs font-medium leading-relaxed italic text-white/90">
                  "{parsedGift.message}"
                </p>
              </div>
            )}
          </div>
        ) : isGift ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              {!isOpened ? (
                <motion.button
                  key="closed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  onClick={() => setIsOpened(true)}
                  className="flex flex-col items-center gap-2 py-2"
                >
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Gift className="size-12 text-primary" />
                  </motion.div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {t('chat.giftTitle')}
                  </p>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                    {t('chat.giftHint')}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="opened"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-1"
                >
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Sparkles className="size-4 animate-sparkle" />
                    <span className="text-sm font-black uppercase tracking-wider">{parsedGift.amount} FoneLove{parsedGift.amount > 1 ? 's' : ''}</span>
                  </div>
                  {parsedGift.message && (
                    <div className="p-3 bg-pink-500/10 rounded-xl mb-3 border border-pink-500/20">
                      <p className="text-sm font-medium leading-relaxed italic text-pink-500">"{parsedGift.message}"</p>
                    </div>
                  )}
                  {!isOwn && (
                    <button
                      onClick={onSayThanks}
                      className="mt-2 w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-xs font-bold shadow-md text-center hover:opacity-90 active:scale-95 transition-all block"
                    >
                      ⬇️ Réponds-lui pour dire merci ! 💖
                    </button>
                  )}
                  
                  {/* Visual confetti-like effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          opacity: 0, 
                          scale: 1, 
                          x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 40 + 20),
                          y: -(Math.random() * 40 + 20)
                        }}
                        transition={{ duration: 0.8 }}
                        className="absolute top-1/2 left-1/2 text-xs"
                      >
                        {['✨', '💖', '⭐', '🎈'][i % 4]}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : isVoice ? (
          <div className="flex items-center gap-3 py-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="size-8 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Mic className="size-4" />
            </motion.button>
            <div className="flex-1 flex items-end gap-0.5 h-6">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-current rounded-full"
                  animate={{ 
                    height: [
                      '40%', 
                      `${Math.random() * 60 + 40}%`, 
                      '40%'
                    ] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1, 
                    delay: i * 0.1 
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] opacity-70">0:12</span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}

        <div className={cn(
          'mt-1 flex items-center gap-1',
          isOwn ? 'justify-end' : 'justify-start',
          isEmoji && 'hidden'
        )}>
          {showExpiry && message.expiresAt && (
            <span className="text-[10px] opacity-50">
              {t('msgBubble.expires')}
            </span>
          )}
          <span className="text-[10px] opacity-50">
            {new Date(message.createdAt).toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            <motion.span
              key={status}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className={cn(
                "size-[12px] flex items-center justify-center ml-1 select-none translate-y-[0.5px]",
                status === 'sending' && "text-white/30",
                status === 'sent' && "text-white/45",
                status === 'delivered' && "text-white/70",
                status === 'read' && "text-sky-300 drop-shadow-[0_0_3px_rgba(56,189,248,0.9)] animate-pulse-subtle"
              )}
            >
              {status === 'sending' ? (
                <motion.div
                  className="flex items-center justify-center size-[10px]"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                >
                  <Clock className="size-[10px]" strokeWidth={1.8} />
                </motion.div>
              ) : status === 'sent' ? (
                <Check className="size-[11px]" strokeWidth={1.8} />
              ) : (
                <CheckCheck className="size-[12px]" strokeWidth={1.8} />
              )}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
