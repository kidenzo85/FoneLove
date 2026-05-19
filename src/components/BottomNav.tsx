'use client'

import { motion } from 'framer-motion'
import { Heart, Phone, MessageCircle, Users, User } from 'lucide-react'
import { useAppStore, type TabType } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'

const tabs: { id: TabType; icon: typeof Heart }[] = [
  { id: 'discover', icon: Heart },
  { id: 'requests', icon: Phone },
  { id: 'messages', icon: MessageCircle },
  { id: 'connections', icon: Users },
  { id: 'profile', icon: User },
]

const tabLabels: Record<TabType, string> = {
  discover: 'nav.discover',
  requests: 'nav.requests',
  messages: 'nav.messages',
  connections: 'nav.contacts',
  profile: 'nav.profile',
}

export default function BottomNav() {
  const { activeTab, setActiveTab, receivedRequests, conversations, currentUser } = useAppStore()
  const { t } = useT()
  const pendingCount = receivedRequests.filter((r) => r.status === 'pending').length
  
  const unreadMessagesCount = conversations.reduce((total, conv) => {
    return total + conv.messages.filter(m => !m.isRead && m.senderId !== currentUser?.id).length
  }, 0)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) - 4px, 0px)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const showBadge = (tab.id === 'requests' && pendingCount > 0) || (tab.id === 'messages' && unreadMessagesCount > 0)
          const badgeCount = tab.id === 'requests' ? pendingCount : unreadMessagesCount

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.85 }}
              className={cn(
                'relative flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <motion.div
                  animate={isActive ? {
                    scale: [1, 1.2, 1],
                    y: [0, -2, 0],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className={cn(
                      'size-5 transition-all',
                      isActive ? 'text-[#f43f5e] fill-[#f43f5e]/10' : 'text-muted-foreground'
                    )}
                    style={isActive ? { color: 'url(#fonelove-grad)' } : {}}
                  />
                  {/* We use a SVG filter/mask for the icon if needed, but for now just use the rose color as base */}
                </motion.div>
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fonelove px-1 text-[10px] font-bold text-white"
                  >
                    {badgeCount}
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[#f43f5e]"
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </motion.span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-bold transition-all uppercase tracking-tighter',
                isActive ? 'text-fonelove' : 'text-muted-foreground'
              )}>
                {t(tabLabels[tab.id])}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ec4899, #f43f5e, #f59e0b)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
