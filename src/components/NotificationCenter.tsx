'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck, Gift, Heart, Phone, Info } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export type AppNotification = {
  id: string
  userId: string
  type: string
  title: string
  body: string
  url?: string
  image?: string
  isRead: boolean
  createdAt: string
}

export function NotificationCenter({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { currentUser } = useAppStore()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && currentUser?.id) {
      loadNotifications()
    }
  }, [open, currentUser?.id])

  const loadNotifications = async () => {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'read' })
      })
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, action: 'readAll' })
      })
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl bg-slate-950 border-t border-white/10 p-0 flex flex-col text-white"
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />
        
        <SheetHeader className="px-6 pt-8 pb-4 text-left border-b border-white/10 shrink-0 flex flex-row items-center justify-between">
          <div>
            <SheetTitle className="flex items-center gap-2 text-2xl font-black text-white">
              <Bell className="size-6 text-primary" />
              Mes Alertes
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full ml-2">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-white/60 hover:text-white">
              <CheckCheck className="size-4 mr-1" />
              Tout lire
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Bell className="size-8 text-white/20" />
              </div>
              <div>
                <p className="font-bold text-lg text-white/60">Aucune alerte</p>
                <p className="text-sm text-white/40">Tu n'as pas encore reçu de notification.</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif) => (
                <NotificationItem 
                  key={notif.id} 
                  notif={notif} 
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id)
                    // If there is a URL, you could navigate to it using Next Router.
                    // For now, we just close the sheet or mark as read.
                  }} 
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function NotificationItem({ notif, onClick }: { notif: AppNotification, onClick: () => void }) {
  
  // Choose icon based on type
  let Icon = Info
  let iconColor = "text-blue-400"
  let bgColor = "bg-blue-400/10"

  if (notif.type === 'fonelove_received' || notif.type.includes('fonelove') || notif.type === 'gift') {
    Icon = Gift
    iconColor = "text-pink-500"
    bgColor = "bg-pink-500/10"
  } else if (notif.type === 'profile_liked' || notif.type.includes('like')) {
    Icon = Heart
    iconColor = "text-red-500"
    bgColor = "bg-red-500/10"
  } else if (notif.type === 'number_request' || notif.type.includes('request')) {
    Icon = Phone
    iconColor = "text-primary"
    bgColor = "bg-primary/10"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={`relative rounded-2xl border p-4 flex gap-3 items-start overflow-hidden cursor-pointer transition-all ${
        notif.isRead 
          ? 'bg-white/5 border-transparent opacity-70' 
          : 'bg-white/10 border-white/10'
      }`}
    >
      {!notif.isRead && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
      )}
      
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
        {notif.image ? (
          <img src={notif.image} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <Icon className={`size-5 ${iconColor}`} />
        )}
      </div>
      
      <div className="flex-1 pr-4">
        <h4 className="font-bold text-sm leading-tight">{notif.title}</h4>
        <p className="text-xs text-white/70 mt-1 leading-snug">{notif.body}</p>
        <span className="text-[10px] text-white/40 mt-2 block">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
        </span>
      </div>
    </motion.div>
  )
}
