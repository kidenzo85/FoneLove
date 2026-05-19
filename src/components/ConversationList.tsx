'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Clock, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type ConversationItem } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'

interface ConversationListProps {
  conversations: ConversationItem[]
  onSelect: (conversation: ConversationItem) => void
}

export default function ConversationList({ conversations, onSelect }: ConversationListProps) {
  const { t, localeStr } = useT()

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="size-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">{t('convList.empty')}</h3>
        <p className="text-sm text-muted-foreground">{t('convList.emptyHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv, i) => {
        const photo = conv.otherUser.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`
        const lastMsg = conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null)
        const remaining = 3 - conv.messageCount

        return (
          <motion.button
            key={conv.requestId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(conv)}
            className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-shadow hover:shadow-md"
          >
            <div className="relative">
              <img
                src={photo}
                alt={conv.otherUser.firstName}
                className="h-12 w-12 rounded-full object-cover"
              />
              {conv.status === 'accepted' && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                  <Phone className="size-3" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{conv.otherUser.firstName}</h4>
                {remaining > 0 && conv.status === 'pending' && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                    {remaining} {t('convList.remaining')}
                  </Badge>
                )}
              </div>
              {lastMsg && (
                <p className="text-sm text-muted-foreground truncate">
                  {lastMsg.type === 'gift' ? `🎁 ${t('chat.giftTitle')}` : 
                   lastMsg.type === 'voice' ? `🎙️ ${t('chat.recording')}` : 
                   lastMsg.content}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right">
              {lastMsg && (
                <p className="text-[10px] text-muted-foreground">
                  {new Date(lastMsg.createdAt).toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {conv.status === 'pending' && (
                <Clock className="ml-auto size-3 text-amber-500" />
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
