'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Moon, Heart, Phone, Gift, Save } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function NotificationSettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { currentUser } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Settings state
  const [prefs, setPrefs] = useState({
    pushEnabled: true,
    requestReceived: true,
    messageReceived: true,
    profileLiked: true,
    foneloveReceived: true, // We'll map this to 'messageReceived' or similar if needed, or add to DB
    quietHoursEnabled: false,
  })

  // Load preferences when opened
  useEffect(() => {
    if (open && currentUser?.id) {
      const loadPrefs = async () => {
        setLoading(true)
        try {
          const res = await fetch(`/api/notifications/preferences?userId=${currentUser.id}`)
          if (res.ok) {
            const data = await res.json()
            setPrefs({
              pushEnabled: data.pushEnabled ?? true,
              requestReceived: data.requestReceived ?? true,
              messageReceived: data.messageReceived ?? true,
              profileLiked: data.profileLiked ?? true,
              foneloveReceived: data.foneloveReceived ?? true,
              quietHoursEnabled: data.quietHoursEnabled ?? false,
            })
          }
        } catch (err) {
          console.error('Failed to load notification prefs:', err)
        }
        setLoading(false)
      }
      loadPrefs()
    }
  }, [open, currentUser?.id])

  const handleSave = async () => {
    if (!currentUser?.id) return
    setSaving(true)
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...prefs,
        }),
      })
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save notification prefs:', err)
    }
    setSaving(false)
  }

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl bg-slate-950 border-t border-white/10 p-0 flex flex-col text-white"
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full" />
        
        <SheetHeader className="px-6 pt-8 pb-4 text-left border-b border-white/10 shrink-0">
          <SheetTitle className="flex items-center gap-3 text-2xl font-black text-white">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Bell className="size-5" />
            </div>
            Quand veux-tu être prévenu ?
          </SheetTitle>
          <p className="text-sm text-white/60 mt-2">
            Choisis les alertes que tu veux recevoir sur ton téléphone.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Global toggle */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Toutes les alertes</h3>
                  <p className="text-sm text-white/50">Activer ou désactiver complètement</p>
                </div>
                <Switch 
                  checked={prefs.pushEnabled} 
                  onCheckedChange={() => togglePref('pushEnabled')} 
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              <AnimatePresence>
                {prefs.pushEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2 mt-4">
                      Alertes importantes
                    </h4>
                    
                    <SettingRow
                      icon={<Gift className="size-5 text-pink-500" />}
                      title="Quand on m'envoie un FoneLove 🎁"
                      checked={prefs.foneloveReceived}
                      onToggle={() => togglePref('foneloveReceived')}
                    />
                    
                    <SettingRow
                      icon={<Heart className="size-5 text-red-500" />}
                      title="Quand quelqu'un aime mon profil ❤️"
                      checked={prefs.profileLiked}
                      onToggle={() => togglePref('profileLiked')}
                    />
                    
                    <SettingRow
                      icon={<Phone className="size-5 text-blue-500" />}
                      title="Quand on me demande mon numéro 📱"
                      checked={prefs.requestReceived}
                      onToggle={() => togglePref('requestReceived')}
                    />

                    <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2 mt-8">
                      Tranquillité
                    </h4>

                    <SettingRow
                      icon={<Moon className="size-5 text-indigo-400" />}
                      title="Mode Nuit 🌙"
                      subtitle="Ne pas me déranger de 22h à 8h"
                      checked={prefs.quietHoursEnabled}
                      onToggle={() => togglePref('quietHoursEnabled')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 bg-slate-950">
          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white font-black text-lg shadow-lg shadow-primary/25"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer mes choix'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SettingRow({ icon, title, subtitle, checked, onToggle }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-base leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}
