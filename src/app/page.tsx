'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Phone, MessageCircle, Users, SlidersHorizontal,
  LayoutGrid, Columns, Sparkles, RefreshCw, LogOut, Eye,
  Shield, Moon, Sun, Volume2, VolumeX, Pause, Play,
  ChevronRight, MapPin, X, Camera, MessageSquare, Bell, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  useAppStore,
  type ProfileWithDetails,
  type UserProfile,
  type NumberRequest,
  type ConversationItem,
} from '@/lib/store'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'

// Import components
import BottomNav from '@/components/BottomNav'
import ProfileCard from '@/components/ProfileCard'
import ProfileDetail from '@/components/ProfileDetail'
import OnboardingFlow from '@/components/OnboardingFlow'
import RequestCard from '@/components/RequestCard'
import ConversationList from '@/components/ConversationList'
import ChatView from '@/components/ChatView'
import ConnectionCard from '@/components/ConnectionCard'
import FilterSheet from '@/components/FilterSheet'
import MomentStory from '@/components/MomentStory'
import StreakCounter from '@/components/StreakCounter'
import ProfileScore from '@/components/ProfileScore'
import BoostButton from '@/components/BoostButton'
import FeedbackProvider, { useFeedback } from '@/components/FeedbackSystem'
import TikTokViewer from '@/components/TikTokViewer'
import AdminDashboard from '@/components/AdminDashboard'
import CoinBalance from '@/components/CoinBalance'
import CreditStore from '@/components/CreditStore'
import SpendConfirmDialog from '@/components/SpendConfirmDialog'
import InsufficientBalanceDialog from '@/components/InsufficientBalanceDialog'
import LevelBadge from '@/components/LevelBadge'
import StreakWidget from '@/components/StreakWidget'
import LandingPage from '@/components/LandingPage'
import ChallengeWidget from '@/components/ChallengeWidget'
import { useConnectCoinStore } from '@/lib/connectcoin-store'
import { useFoneLoveStore } from '@/lib/fonelove-store'
import { useCurrencyStore } from '@/lib/currency-store'
import { playSound } from '@/lib/sounds'
import { usePremiumFeatures } from '@/lib/premium-features-store'
import ProfileEditor from '@/components/ProfileEditor'
import DatingPoster from '@/components/DatingPoster'
import FoneLoveBalance from '@/components/FoneLoveBalance'
import FoneLoveWallet from '@/components/FoneLoveWallet'
import SendFoneLoveDialog from '@/components/SendFoneLoveDialog'
import FoneLoveReceiveAnimation from '@/components/FoneLoveReceiveAnimation'
import ProfileFrame from '@/components/ProfileFrame'
import NotificationSubscribeCard from '@/components/NotificationSubscribeCard'
import NotificationOptInBanner from '@/components/NotificationOptInBanner'
import { NotificationCenter } from '@/components/NotificationCenter'
import { NotificationSettingsSheet } from '@/components/NotificationSettingsSheet'
import ActiveFeaturesPill from '@/components/ActiveFeaturesPill'
import ActiveFeaturesSheet from '@/components/ActiveFeaturesSheet'
import { getFeatureConfig } from '@/lib/premium-ui'


// ======== Login Screen — Now just renders Landing with inline auth ========
function LoginScreen({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  useEffect(() => {
    const handler = (e: Event) => {
      const user = (e as CustomEvent).detail
      if (user) onLogin(user)
    }
    window.addEventListener('fonelove:login', handler)
    return () => window.removeEventListener('fonelove:login', handler)
  }, [onLogin])

  return <LandingPage />
}

// ======== Discover Tab (TikTok-Style) ========
function DiscoverTab({ onRequest }: { onRequest: (profile: ProfileWithDetails) => void }) {
  const { t } = useT()
  const { 
    profiles, 
    removeProfile, 
    setActiveTab, 
    setSelectedProfile, 
    setShowProfileDetail, 
    viewMode, 
    setViewMode, 
    setShowFilter, 
    currentUser,
    nextCursor,
    hasMore,
    isLoadingMore,
    setProfiles,
    setNextCursor,
    setHasMore,
    setIsLoadingMore,
    appendProfiles
  } = useAppStore()
  const { trigger } = useFeedback()

  const handleLike = useCallback(async (profile: ProfileWithDetails) => {
    trigger('like')
    if (currentUser) {
      try {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: currentUser.id, receiverId: profile.id }),
        })
        const data = await res.json()
        if (data?.like?.isMutual) {
          setTimeout(() => {
            trigger('match', {
              name1: currentUser.firstName,
              name2: profile.firstName,
              photo1: currentUser.photos?.[0]?.url || `https://i.pravatar.cc/200?img=11`,
              photo2: profile.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`,
            })
          }, 500)
        }
      } catch (err) { console.error(err) }
    }
    removeProfile(profile.id)
  }, [currentUser, removeProfile, trigger])

  const handlePass = useCallback((profile: ProfileWithDetails) => {
    trigger('pass')
    removeProfile(profile.id)
  }, [removeProfile, trigger])

  const handleView = useCallback((profile: ProfileWithDetails) => {
    setSelectedProfile(profile)
    setShowProfileDetail(true)

    // Ensure the visit is recorded for the "Qui m'a visité" premium feature
    if (currentUser?.id) {
      fetch('/api/profile/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: currentUser.id, profileId: profile.id })
      }).catch(err => console.error('Failed to record visit:', err))
    }
  }, [setSelectedProfile, setShowProfileDetail, currentUser])

  const handleRefresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/profiles?userId=${currentUser?.id}&limit=20`)
      const data = await res.json()
      if (data.profiles) {
        setProfiles(data.profiles)
        setNextCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      }
    } catch (err) { console.error(err) }
  }, [currentUser, setProfiles, setNextCursor, setHasMore])

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return
    
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/profiles?userId=${currentUser?.id}&cursor=${nextCursor}&limit=20`)
      const data = await res.json()
      if (data.profiles) {
        appendProfiles(data.profiles)
        setNextCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      }
    } catch (err) {
      console.error('Load more error:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentUser, nextCursor, hasMore, isLoadingMore, appendProfiles, setNextCursor, setHasMore, setIsLoadingMore])

  if (viewMode === 'grid') {
    return (
      <div className="flex h-full flex-col relative">
        <ActiveFeaturesPill />
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-xl font-bold">{t('discover.title')}</h2>
            <p className="text-xs text-muted-foreground">{profiles.length} {t('discover.profiles')}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <FoneLoveBalance compact />
            <CoinBalance compact />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setViewMode('swipe')}
              className="text-muted-foreground"
            >
              <Columns className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowFilter(true)}
              className="text-muted-foreground"
            >
              <SlidersHorizontal className="size-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2">
          <div className="mb-4">
             <NotificationSubscribeCard />
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {profiles.map((profile, idx) => {
              const photo = profile.photos?.[0]?.url || `https://i.pravatar.cc/300?img=1`
              const age = profile.birthDate
                ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                : null
              return (
                <motion.button
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleView(profile)}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white">{profile.firstName}</span>
                      {age && <span className="text-sm text-white/80">{age}</span>}
                      {profile.isVerified && <Shield className="size-3 text-primary" />}
                    </div>
                    {profile.city && (
                      <p className="text-xs text-white/60 flex items-center gap-0.5">
                        <MapPin className="size-2.5" /> {profile.city}
                      </p>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // TikTok-style fullscreen viewer
  return (
    <div className="relative h-dvh">
      <ActiveFeaturesPill />
      {/* Top bar overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 safe-area-top">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white drop-shadow-lg">{t('discover.title')}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <FoneLoveBalance compact />
          <CoinBalance compact onClick={() => useConnectCoinStore.getState().setShowCreditStore(true)} />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setViewMode('grid')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <LayoutGrid className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowFilter(true)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <SlidersHorizontal className="size-5" />
          </Button>
        </div>
      </div>

      <TikTokViewer
        profiles={profiles}
        currentUser={currentUser}
        onLike={handleLike}
        onPass={handlePass}
        onRequest={onRequest}
        onView={handleView}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
      />
    </div>
  )
}

// ======== Requests Tab ========
function RequestsTab() {
  const { t } = useT()
  const { receivedRequests, sentRequests, currentUser, setSelectedProfile, setShowProfileDetail } = useAppStore()
  const { trigger } = useFeedback()
  const [activeSection, setActiveSection] = useState<'received' | 'sent'>('received')
  const [justAccepted, setJustAccepted] = useState<string | null>(null)
  const [justDeclined, setJustDeclined] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      const fetchReqs = async () => {
        try {
          const [receivedRes, sentRes] = await Promise.all([
            fetch(`/api/requests?userId=${currentUser.id}&type=received`),
            fetch(`/api/requests?userId=${currentUser.id}&type=sent`)
          ])
          const receivedData = await receivedRes.json()
          const sentData = await sentRes.json()
          
          if (receivedData.requests) {
            useAppStore.setState({ receivedRequests: receivedData.requests })
          }
          if (sentData.requests) {
            useAppStore.setState({ sentRequests: sentData.requests })
          }
        } catch (err) {
          console.error('Failed to refresh requests', err)
        }
      }
      fetchReqs()
    }
  }, [currentUser])

  const handleAccept = useCallback(async (request: NumberRequest) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id, status: 'accepted' }),
      })
      const data = await res.json()
      useAppStore.setState((state) => ({
        receivedRequests: state.receivedRequests.map((r) =>
          r.id === request.id ? { ...r, status: 'accepted' as const } : r
        ),
      }))
      setJustAccepted(request.id)
      const sender = request.sender
      // Use the phone number from the API response (senderPhone = phone of the person who sent the request)
      trigger('request-accepted', {
        name: sender?.firstName || t('requests.someone'),
        phone: data?.senderPhone || sender?.phone,
        photo: sender?.photos?.[0]?.url,
      })
      setTimeout(() => setJustAccepted(null), 1000)
    } catch (err) { console.error(err) }
  }, [trigger, t])

  const handleDecline = useCallback(async (request: NumberRequest) => {
    try {
      await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id, status: 'declined' }),
      })
      useAppStore.setState((state) => ({
        receivedRequests: state.receivedRequests.map((r) =>
          r.id === request.id ? { ...r, status: 'declined' as const } : r
        ),
      }))
      setJustDeclined(request.id)
      trigger('request-declined')
      setTimeout(() => setJustDeclined(null), 600)
    } catch (err) { console.error(err) }
  }, [trigger])

  const pendingReceived = receivedRequests.filter((r) => r.status === 'pending')
  const otherReceived = receivedRequests.filter((r) => r.status !== 'pending')
  const pendingSent = sentRequests.filter((r) => r.status === 'pending')

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-xl font-bold">{t('requests.title')}</h2>
          <p className="text-xs text-muted-foreground">
            {activeSection === 'received' ? pendingReceived.length : pendingSent.length} {t('requests.pending')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <FoneLoveBalance compact />
          <CoinBalance compact />
        </div>
      </div>

      <div className="mx-4 mb-3 flex rounded-xl bg-muted p-1">
        <button
          onClick={() => setActiveSection('received')}
          className={cn(
            'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-all',
            activeSection === 'received' ? 'bg-background shadow-sm' : 'text-muted-foreground'
          )}
        >
          {t('requests.received')} {pendingReceived.length > 0 && `(${pendingReceived.length})`}
        </button>
        <button
          onClick={() => setActiveSection('sent')}
          className={cn(
            'flex-1 rounded-lg py-2 text-center text-sm font-medium transition-all',
            activeSection === 'sent' ? 'bg-background shadow-sm' : 'text-muted-foreground'
          )}
        >
          {t('requests.sent')} {pendingSent.length > 0 && `(${pendingSent.length})`}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-20 space-y-3">
        {activeSection === 'received' ? (
          <>
            {(() => {
              const merged = new Map()
              receivedRequests.forEach(r => {
                const existing = merged.get(r.senderId)
                if (!existing || r.status === 'pending' || (existing.status !== 'pending' && r.createdAt > existing.createdAt)) {
                  merged.set(r.senderId, r)
                }
              })
              const uniqueReceived = Array.from(merged.values())
              const pending = uniqueReceived.filter(r => r.status === 'pending')
              const others = uniqueReceived.filter(r => r.status !== 'pending')

              if (uniqueReceived.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Phone className="size-8 text-muted-foreground mb-3 opacity-20" />
                    <h3 className="font-semibold">{t('requests.empty')}</h3>
                  </div>
                )
              }

              return (
                <>
                  {pending.map(req => (
                    <motion.div key={req.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <RequestCard
                        request={req}
                        type="received"
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        onViewProfile={(p) => { setSelectedProfile(p); setShowProfileDetail(true) }}
                      />
                    </motion.div>
                  ))}
                  {others.length > 0 && (
                    <div className="pt-4 space-y-2">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-2">{t('requests.recent')}</p>
                      {others.map(req => (
                        <motion.div key={req.id} layout>
                          <RequestCard
                            request={req}
                            type="received"
                            onViewProfile={(p) => { setSelectedProfile(p); setShowProfileDetail(true) }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </>
        ) : (
          <>
            {(() => {
              const merged = new Map()
              sentRequests.forEach(r => {
                const existing = merged.get(r.receiverId)
                if (!existing || r.createdAt > existing.createdAt) {
                  merged.set(r.receiverId, r)
                }
              })
              const uniqueSent = Array.from(merged.values())

              if (uniqueSent.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Phone className="size-8 text-muted-foreground mb-3 opacity-20" />
                    <h3 className="font-semibold">{t('requests.emptySent')}</h3>
                  </div>
                )
              }

              return uniqueSent.map(req => (
                <motion.div key={req.id} layout>
                  <RequestCard
                    request={req}
                    type="sent"
                    onViewProfile={(p) => { setSelectedProfile(p); setShowProfileDetail(true) }}
                  />
                </motion.div>
              ))
            })()}
          </>
        )}
      </div>
    </div>
  )
}

// ======== Messages Tab ========
function MessagesTab() {
  const { t } = useT()
  const { conversations, currentUser, autoOpenRequestId, setAutoOpenRequestId } = useAppStore()
  const { trigger } = useFeedback()
  const [activeConversation, setActiveConversation] = useState<ConversationItem | null>(null)

  useEffect(() => {
    if (autoOpenRequestId) {
      const conv = conversations.find(c => c.requestId === autoOpenRequestId)
      if (conv) {
        setActiveConversation(conv)
        setAutoOpenRequestId(null)
      }
    }
  }, [autoOpenRequestId, conversations, setAutoOpenRequestId])

  useEffect(() => {
    const handleCloseChat = () => setActiveConversation(null)
    window.addEventListener('fonelove:close-chat', handleCloseChat)
    return () => window.removeEventListener('fonelove:close-chat', handleCloseChat)
  }, [])

  useEffect(() => {
    if (!currentUser) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${currentUser.id}`)
        const data = await res.json()
        if (data.conversations) {
          const oldConvs = useAppStore.getState().conversations
          const activeChatUserId = useAppStore.getState().activeChatUserId
          
          data.conversations.forEach((newConv: any) => {
            const oldConv = oldConvs.find(c => c.requestId === newConv.requestId)
            const oldMsgCount = oldConv?.messages?.length || 0
            if (newConv.messages.length > oldMsgCount) {
              const lastMsg = newConv.messages[newConv.messages.length - 1]
              if (lastMsg.senderId !== currentUser.id) {
                // Show notification if NOT in this chat
                if (newConv.otherUser.id !== activeChatUserId) {
                  playSound('received')
                  trigger('message-received', {
                    name: newConv.otherUser.firstName,
                    content: lastMsg.content,
                    requestId: newConv.requestId
                  })
                }
              }
            }
          })

          useAppStore.setState({ conversations: data.conversations })
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [currentUser])

  if (activeConversation) {
    return (
      <div className="h-full">
        <ChatView
          conversation={activeConversation}
          onBack={() => setActiveConversation(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-xl font-bold">{t('messages.title')}</h2>
          <p className="text-xs text-muted-foreground">
            {conversations.length} {conversations.length !== 1 ? t('messages.conversations') : t('messages.conversation')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <FoneLoveBalance compact />
          <CoinBalance compact />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-20">
        <div className="mb-4 mt-2">
           <NotificationSubscribeCard />
        </div>
        <ConversationList
          conversations={conversations}
          onSelect={setActiveConversation}
        />
      </div>
    </div>
  )
}

// ======== Connections Tab ========
function ConnectionsTab() {
  const { t } = useT()
  const { connections, moments, currentUser } = useAppStore()

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/connections?userId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.connections) useAppStore.setState({ connections: data.connections })
        })
        .catch(console.error)
    }
  }, [currentUser])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-xl font-bold">{t('connections.title')}</h2>
          <p className="text-xs text-muted-foreground">
            {connections.length} {connections.length !== 1 ? t('connections.contacts') : t('connections.contact')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <FoneLoveBalance compact />
          <CoinBalance compact />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-20">
        <div className="mb-4">
           <NotificationSubscribeCard />
        </div>

        {/* Moments Section - Toujours visible pour afficher le bouton "Moi" */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{t('connections.moments')}</h3>
          <MomentStory moments={moments} />
        </div>

        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
            >
              <Users className="size-8 text-muted-foreground" />
            </motion.div>
            <h3 className="font-semibold">{t('connections.empty')}</h3>
            <p className="text-sm text-muted-foreground">{t('connections.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{t('connections.exchanged')}</h3>
            {connections.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ======== Profile Tab ========
function ProfileTab({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { t } = useT()
  const { currentUser, profileVisits } = useAppStore()
  const { trigger } = useFeedback()
  const { hasActiveFeature, fetchActiveFeatures, activeFeatures } = usePremiumFeatures()
  const canSeeVisitors = hasActiveFeature('see_visitors')
  const { setShowInsufficientBalance, spendCredits, fetchBalance, balance, setShowCreditStore, setSelectedPackType } = useConnectCoinStore()
  const ccLevel = useConnectCoinStore((s) => s.level)
  const storeStreak = useConnectCoinStore((s) => s.streak)
  const displayStreakDays = storeStreak?.currentStreak ?? currentUser?.streakDays ?? 0
  const [showVisitors, setShowVisitors] = useState(false)
  const [showPoster, setShowPoster] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [visitorUpsellState, setVisitorUpsellState] = useState<'teaser' | 'confirm'>('teaser')
  const [isActivatingVisitor, setIsActivatingVisitor] = useState(false)
  const { packPrices } = useCurrencyStore()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fonelove-dark-mode')
      if (saved !== null) return saved === 'true'
    }
    return false // Mode jour par défaut
  })
  const [incognito, setIncognito] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showActiveFeaturesSheet, setShowActiveFeaturesSheet] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)

  // Filter valid active features
  const currentActiveFeatures = activeFeatures.filter(f => !f.isConsumed && new Date(f.expiresAt).getTime() > Date.now())

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('fonelove-dark-mode', String(darkMode))
  }, [darkMode])

  if (!currentUser) return null

  const photo = currentUser.photos?.[0]?.url || `https://i.pravatar.cc/200?img=11`
  const age = currentUser.birthDate
    ? Math.floor((Date.now() - new Date(currentUser.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  // Calculate dynamic score to prevent showing 0% if backend calculation was missed
  const dynamicScore = Math.min(100,
    15 +
    (currentUser.firstName ? 5 : 0) +
    (currentUser.gender ? 5 : 0) +
    (currentUser.birthDate ? 5 : 0) +
    (currentUser.bio ? 10 : 0) +
    (currentUser.interests?.length || 0) * 3 +
    (currentUser.lookingFor ? 5 : 0) +
    (currentUser.city ? 3 : 0) +
    ((currentUser as any).jobTitle ? 3 : 0) +
    ((currentUser as any).education ? 2 : 0) +
    (currentUser.astrologicalSign ? 2 : 0) +
    (currentUser.height ? 2 : 0) +
    (currentUser.photos?.length || 0) * 10 +
    (currentUser.prompts?.length || 0) * 5
  )
  const displayScore = Math.max(currentUser.profileScore || 0, dynamicScore)

  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
            <X className="size-5" />
          </Button>
          <h2 className="text-xl font-bold">{t('profile.title')}</h2>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ProfileEditor
            profile={currentUser}
            onSave={async (updates) => {
              try {
                // Optimistically update UI
                useAppStore.getState().setUser({ ...currentUser, ...updates })
                
                // Persist to backend
                const res = await fetch(`/api/profiles`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: currentUser.id, ...updates }),
                })
                
                if (res.ok) {
                  const data = await res.json()
                  if (data.profile) {
                    useAppStore.getState().setUser(data.profile)
                  }
                }
              } catch (err) {
                console.error('Failed to save profile:', err)
              }
              setIsEditing(false)
            }}
            onClose={() => setIsEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xl font-bold">{t('profile.title')}</h2>
        <div className="flex items-center gap-1.5">
          <FoneLoveBalance compact />
          <CoinBalance compact />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-20 space-y-4">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl bg-card border p-4"
        >
          <div className="shrink-0">
            <ProfileFrame userId={currentUser.id} size="lg">
              <img src={photo} alt={currentUser.firstName} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-primary/30" />
            </ProfileFrame>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{currentUser.firstName}{age ? `, ${age}` : ''}</h3>
            {currentUser.mood && <p className="text-sm text-primary">{currentUser.mood}</p>}
            {currentUser.city && (
              <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-1">
                <MapPin className="size-3" /> {currentUser.city}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {currentUser.phoneType === 'whatsapp' ? (
                <MessageSquare className="size-3 text-green-500" />
              ) : currentUser.phoneType === 'direct' ? (
                <Phone className="size-3 text-primary" />
              ) : (
                <>
                  <Phone className="size-3 text-primary" />
                  <MessageSquare className="size-3 text-green-500" />
                </>
              )}
              <span className="font-medium">{currentUser.phone}</span>
            </p>
          </div>
          <ProfileScore score={displayScore} size="md" />
        </motion.div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowPoster(true)}
            className="flex-[2] rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 h-12 font-bold shadow-lg shadow-amber-500/20"
          >
            {t('poster.create')}
          </Button>
          <Button
            onClick={() => setIsEditing(true)}
            className="flex-1 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 h-12 font-bold"
          >
            ✏️
          </Button>
        </div>

        {/* Active Features Section */}
        {currentActiveFeatures.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Tes Avantages Actifs</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-primary"
                onClick={() => setShowActiveFeaturesSheet(true)}
              >
                Gérer
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {currentActiveFeatures.map(feature => {
                const config = getFeatureConfig(feature.action)
                return (
                  <motion.div 
                    key={feature.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowActiveFeaturesSheet(true)}
                    className={cn("flex items-center gap-2.5 p-3 rounded-xl border relative overflow-hidden cursor-pointer", config.bg, "border-white/5")}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-r opacity-20", config.gradient)} />
                    <div className={cn("relative z-10 shrink-0", config.color)}>
                      {config.icon}
                    </div>
                    <div className="relative z-10 flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{config.shortLabel}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        <NotificationSubscribeCard />

        {/* Onboarding Details Card */}
        <div className="rounded-2xl bg-card border p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">{t('onboard.gender')}</span>
             <span className="font-medium">{currentUser.gender === 'M' ? '👨 Homme' : currentUser.gender === 'F' ? '👩 Femme' : currentUser.gender === 'Autre' ? '✨ Autre' : '-'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">{t('onboard.whoYouLookingFor')}</span>
             <span className="font-medium">{currentUser.lookingForGender === 'F' ? '👩 Femmes' : currentUser.lookingForGender === 'M' ? '👨 Hommes' : currentUser.lookingForGender === 'all' ? '💫 Tout' : '-'}</span>
          </div>
           <div className="flex items-center justify-between text-sm">
             <span className="text-muted-foreground">{t('onboard.lookingForTitle')}</span>
             <span className="font-medium">
               {currentUser.lookingFor === 'marriage' ? '💍 Mariage' : currentUser.lookingFor === 'relation' ? '❤️ Sérieux' : currentUser.lookingFor === 'casual' ? '🔥 Sans lendemain' : currentUser.lookingFor === 'amitié' ? '🤝 Amitié' : currentUser.lookingFor === 'business' ? '💼 Affaires' : '-'}
             </span>
          </div>
          {currentUser.otherPhones && currentUser.otherPhones.length > 0 && (
            <div className="pt-2 border-t mt-2">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">Autres numéros</span>
              <div className="space-y-1.5 mt-2">
                {currentUser.otherPhones.map((ph, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-xl">
                    {ph.type === 'whatsapp' ? (
                      <MessageSquare className="size-3.5 text-green-500" />
                    ) : ph.type === 'direct' ? (
                      <Phone className="size-3.5 text-primary" />
                    ) : (
                      <>
                        <Phone className="size-3 text-primary" />
                        <MessageSquare className="size-3 text-green-500" />
                      </>
                    )}
                    <span className="font-bold">{ph.number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center rounded-xl bg-card border p-3 cursor-pointer"
            onClick={() => trigger('streak', { days: displayStreakDays })}
          >
            <StreakCounter days={displayStreakDays} />
          </motion.div>
          <div className="flex flex-col items-center rounded-xl bg-card border p-3">
            <div className="text-lg font-bold text-primary">{displayScore}%</div>
            <div className="text-[10px] text-muted-foreground">{t('profile.score')}</div>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-card border p-3">
            <BoostButton
              used={currentUser.dailyBoostUsed}
              onBoost={() => {
                useAppStore.setState((state) => ({
                  currentUser: state.currentUser ? { ...state.currentUser, dailyBoostUsed: true } : null,
                }))
                trigger('boost')
              }}
            />
          </div>
        </div>

        {/* Photos Grid */}
        {currentUser.photos && currentUser.photos.length > 0 && (
          <div className="rounded-2xl bg-card border p-4">
            <h4 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <Camera className="size-4 text-primary" /> {t('onboard.photos')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {currentUser.photos.map((photo, i) => (
                <div key={photo.id} className="aspect-[3/4] relative rounded-xl overflow-hidden bg-muted group">
                  <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  {photo.isPrimary && (
                    <div className="absolute top-1 left-1 bg-primary text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold">
                      Principale
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio Section */}
        {currentUser.bio && (
          <div className="rounded-2xl bg-card border p-4">
            <h4 className="mb-2 text-sm font-semibold">{t('onboard.bio')}</h4>
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "{currentUser.bio}"
            </p>
          </div>
        )}

        {/* Interests */}
        {currentUser.interests && currentUser.interests.length > 0 && (
          <div className="rounded-2xl bg-card border p-4">
            <h4 className="mb-2 text-sm font-semibold">{t('onboard.interests')}</h4>
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map((interest) => (
                <span key={interest} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {t(interest)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prompts */}
        {currentUser.prompts && currentUser.prompts.length > 0 && (
          <div className="space-y-3">
            {currentUser.prompts.map((prompt) => (
              <div key={prompt.id} className="rounded-2xl bg-card border p-4 border-l-4 border-l-primary">
                <h5 className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{prompt.question}</h5>
                <p className="text-base font-medium">{prompt.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {currentUser.badges && currentUser.badges.length > 0 && (
          <div className="rounded-2xl bg-card border p-4">
            <h4 className="mb-2 text-sm font-semibold">{t('profile.badges')}</h4>
            <div className="flex flex-wrap gap-2">
              {currentUser.badges.map((badge) => {
                const icons: Record<string, string> = { verified: '✅', popular: '🔥', quick_reply: '⚡', loyal: '💎', premium: '👑', streak_5: '🔥' }
                return (
                  <motion.button
                    key={badge.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => trigger('badge-earned', { badgeType: badge.type })}
                    className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs animate-pop-in"
                  >
                    <span>{icons[badge.type] || '🏅'}</span>
                    <span className="capitalize">{badge.type.replace('_', ' ')}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}

        {/* ConnectCoin Level Badge */}
        <LevelBadge level={ccLevel} compact />

        {/* ConnectCoin Streak Widget */}
        <StreakWidget />

        {/* ConnectCoin Challenges Widget */}
        <ChallengeWidget />

        {/* Profile visitors */}
        <div className="rounded-2xl bg-card border p-4">
          <button
            className="flex w-full items-center justify-between"
            onClick={() => setShowVisitors(!showVisitors)}
          >
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-primary" />
              <span className="text-sm font-semibold">{t('profile.visitors')}</span>
              {canSeeVisitors ? (
                <Badge variant="secondary" className="text-[10px]">{profileVisits.length}</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20 font-black tracking-wide flex items-center gap-1">
                  🔒 3 CC <span className="opacity-60 font-medium">/ 24h</span>
                </Badge>
              )}
            </div>
            <ChevronRight className={cn('size-4 text-muted-foreground transition-transform', showVisitors && 'rotate-90')} />
          </button>
          <AnimatePresence>
            {showVisitors && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 relative min-h-[100px]">
                  {profileVisits.length === 0 && canSeeVisitors ? (
                    <p className="text-xs text-muted-foreground">{t('profile.noVisits')}</p>
                  ) : (
                    <div className={cn(
                      "space-y-2",
                      !canSeeVisitors && "filter blur-sm select-none pointer-events-none opacity-50"
                    )}>
                      {profileVisits.length === 0 && !canSeeVisitors ? (
                        /* Dummy profiles to blur if they have 0 real visitors */
                        [1, 2, 3].map((_, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-white/5">
                            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                            <div className="space-y-1">
                              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                              <div className="h-2 w-12 bg-muted/60 animate-pulse rounded" />
                            </div>
                          </div>
                        ))
                      ) : (
                        profileVisits.map((visitor, idx) => {
                          const vPhoto = visitor.photos?.[0]?.url || `https://i.pravatar.cc/40?img=${idx + 1}`
                          const genderIcon = visitor.gender === 'male' ? '♂️' : visitor.gender === 'female' ? '♀️' : ''
                          
                          return (
                            <button
                              key={visitor.id}
                              onClick={() => {
                                if (canSeeVisitors) {
                                  setSelectedUserId(visitor.id)
                                }
                              }}
                              className={cn(
                                "flex items-center gap-2 p-2 w-full text-left rounded-lg transition-colors border border-transparent",
                                canSeeVisitors && "hover:bg-accent/50 hover:border-border/50"
                              )}
                            >
                              <img
                                src={vPhoto}
                                alt={visitor.firstName || 'User'}
                                className="h-10 w-10 rounded-full object-cover shadow-sm border border-border/50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-sm font-bold truncate">
                                    {visitor.firstName} {genderIcon}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                  {visitor.birthDate && <span>{Math.floor((Date.now() - new Date(visitor.birthDate).getTime()) / 31557600000)} ans</span>}
                                  {visitor.city && (
                                    <>
                                      {visitor.birthDate && <span className="w-1 h-1 rounded-full bg-border" />}
                                      <span className="truncate">{visitor.city}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}

                  {/* See Visitors Premium Upsell */}
                  {!canSeeVisitors && (
                    visitorUpsellState === 'teaser' ? (
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-[2px] rounded-xl cursor-pointer hover:bg-black/50 transition-all"
                        onClick={() => setVisitorUpsellState('confirm')}
                      >
                        <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center max-w-[220px] shadow-2xl">
                          <Eye className="size-6 text-cyan-400 mx-auto mb-2" />
                          <p className="text-[11px] text-white/90 font-bold leading-tight">
                            Découvre qui a visité ton profil
                          </p>
                          <div className="mt-2 text-[9px] text-cyan-300 font-black uppercase tracking-wider bg-cyan-500/20 py-1 px-2 rounded-full inline-block">
                            Pour 24 Heures
                          </div>
                          <div className="mt-3 flex items-center justify-center gap-1.5">
                            <span className="text-[10px] text-white/50">Coût :</span>
                            <span className="text-xs font-black text-amber-400">3 CC</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/95 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-cyan-500/30 overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                        <Eye className="size-8 text-cyan-400 mx-auto mb-2 relative z-10" />
                        <h3 className="text-sm font-black text-white relative z-10 mb-1">Passer en mode VIP</h3>
                        <p className="text-[10px] text-white/60 text-center mb-4 relative z-10">
                          Voit tous tes visiteurs en illimité pendant 24 heures.
                        </p>

                        {balance >= 3 ? (
                          <div className="w-full relative z-10 space-y-3">
                            <div className="flex items-center justify-between text-[11px] bg-white/5 rounded-lg p-2 border border-white/10">
                              <span className="text-white/60">Ton solde actuel</span>
                              <span className="font-bold text-amber-400">{balance} CC</span>
                            </div>
                            <Button
                              className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 relative overflow-hidden"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIsActivatingVisitor(true)
                                const success = await spendCredits(currentUser.id, 'see_visitors')
                                if (success) {
                                  await fetchBalance(currentUser.id)
                                  await fetchActiveFeatures(currentUser.id)
                                  const res = await fetch(`/api/profile/visits?userId=${currentUser.id}`)
                                  const data = await res.json()
                                  if (data.visits) useAppStore.getState().setProfileVisits(data.visits)
                                }
                                setIsActivatingVisitor(false)
                                setVisitorUpsellState('teaser')
                              }}
                              disabled={isActivatingVisitor}
                            >
                              {isActivatingVisitor ? (
                                <span className="animate-pulse">Activation...</span>
                              ) : (
                                <>Confirmer l'activation <span className="ml-1 opacity-80">(-3 CC)</span></>
                              )}
                            </Button>
                            <button 
                              className="w-full text-center text-[10px] text-white/40 hover:text-white pb-1"
                              onClick={(e) => { e.stopPropagation(); setVisitorUpsellState('teaser'); }}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (() => {
                          const missing = 3 - balance;
                          const sortedPacks = [...(packPrices || [])].sort((a, b) => a.rawLocalPrice - b.rawLocalPrice);
                          const suggestedPack = sortedPacks.find(p => (p.cc + p.bonusCC) >= missing) || sortedPacks[sortedPacks.length - 1];
                          
                          return (
                            <div className="w-full relative z-10 space-y-3">
                              <div className="flex items-center justify-between text-[11px] bg-red-500/10 rounded-lg p-2 border border-red-500/20">
                                <span className="text-red-300 font-medium">Solde insuffisant</span>
                                <span className="font-bold text-red-400">{balance} / 3 CC</span>
                              </div>
                              
                              {suggestedPack ? (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left">
                                  <p className="text-[10px] text-white/60 mb-2 font-medium leading-tight">
                                    Il te manque {missing} CC. Le pack <strong>{suggestedPack.name}</strong> est parfait pour ça :
                                  </p>
                                  <Button
                                      className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-black text-xs flex items-center justify-between px-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCreditStore(true, suggestedPack.type);
                                      }}
                                    >
                                      <span>🪙 +{suggestedPack.cc + suggestedPack.bonusCC} CC</span>
                                      <span>{suggestedPack.priceFormatted}</span>
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-black text-xs"
                                  onClick={(e) => { e.stopPropagation(); setShowCreditStore(true, 'packs'); }}
                                >
                                  🪙 Acheter des CC
                                </Button>
                              )}
                              <button 
                                className="w-full text-center text-[10px] text-white/40 hover:text-white"
                                onClick={(e) => { e.stopPropagation(); setVisitorUpsellState('teaser'); }}
                              >
                                Plus tard
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-card border p-4 space-y-4">
          <h4 className="text-sm font-semibold">{t('profile.settings')}</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="size-4" />
              <span className="text-sm">Réglages des alertes</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowNotificationSettings(true)}>
              Configurer
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <span className="text-sm">{t('profile.darkMode')}</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {incognito ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              <span className="text-sm">{t('profile.incognito')}</span>
            </div>
            <Switch checked={incognito} onCheckedChange={setIncognito} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              <span className="text-sm">{t('profile.pause')}</span>
            </div>
            <Switch checked={paused} onCheckedChange={setPaused} />
          </div>
        </div>

        {/* Admin Dashboard Button */}
        {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.email === 'fabricewilliam73@gmail.com') && (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white animate-pulse"
              onClick={onOpenAdmin}
            >
              <Shield className="mr-2 size-4" /> {t('profile.admin')}
            </Button>
          </motion.div>
        )}


        {/* Logout */}
        <Button
          variant="outline"
          className="w-full rounded-xl text-red-400 border-red-400/30 hover:bg-red-500/10"
          onClick={() => useAppStore.getState().logout()}
        >
          <LogOut className="mr-2 size-4" /> {t('profile.logout')}
        </Button>
        {/* Delete Account */}
        <Button
          variant="outline"
          className="w-full rounded-xl text-red-500 border-red-500/50 hover:bg-red-500/10 mb-4"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="mr-2 size-4" /> Supprimer mon compte
        </Button>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-500">
              <Trash2 className="size-6" /> Tu veux vraiment nous quitter ? 😢
            </DialogTitle>
            <DialogDescription className="text-base font-medium mt-4">
              Attention : Cette action est <strong>définitive</strong>.
              Toutes tes photos, tes messages, tes FoneLoves et ton historique seront perdus pour toujours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 mt-6 sm:flex-col">
            <Button
              variant="default"
              className="w-full rounded-xl h-12 text-base font-bold"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Non, je reste !
            </Button>
            <Button
              variant="destructive"
              className="w-full rounded-xl h-12 text-base font-bold bg-red-100 text-red-600 hover:bg-red-200 border-none shadow-none"
              onClick={async () => {
                setIsDeleting(true)
                try {
                  const res = await fetch(`/api/user?userId=${currentUser.id}`, {
                    method: 'DELETE',
                  })
                  if (res.ok) {
                    useAppStore.getState().logout()
                  }
                } catch (err) {
                  console.error('Erreur suppression', err)
                }
                setIsDeleting(false)
                setShowDeleteConfirm(false)
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression en cours...' : 'Oui, supprimer mon compte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showPoster && (
          <DatingPoster user={currentUser} onClose={() => setShowPoster(false)} />
        )}
      </AnimatePresence>
      <ActiveFeaturesSheet open={showActiveFeaturesSheet} onOpenChange={setShowActiveFeaturesSheet} />
      <NotificationSettingsSheet open={showNotificationSettings} onOpenChange={setShowNotificationSettings} />
    </div>
  )
}

// ======== Number Request Dialog ========
function NumberRequestDialog({
  profile,
  open,
  onClose,
  onSent,
}: {
  profile: ProfileWithDetails | null
  open: boolean
  onClose: () => void
  onSent: () => void
}) {
  const { currentUser, sentRequests } = useAppStore()
  const { trigger } = useFeedback()
  const { t } = useT()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [ccError, setCcError] = useState(false)

  const {
    balance,
    spendCredits,
    setShowInsufficientBalance,
    setShowCreditStore,
    setSelectedPackType,
  } = useConnectCoinStore()

  // Cost for a number request
  const REQUEST_COST = 5 // extra_request cost
  const canAfford = balance >= REQUEST_COST
  const balanceAfter = Math.max(0, balance - REQUEST_COST)

  // Initialize the message with a premium catchy default text when dialog opens
  useEffect(() => {
    if (open && profile) {
      setMessage(t('requestDialog.placeholder', { name: profile.firstName }) || `Salut ${profile.firstName} ! J'aimerais faire ta connaissance 😊`)
    } else {
      setMessage('')
    }
  }, [open, profile, t])

  if (!profile || !currentUser) return null

  // A request is only blocking if it is pending or accepted
  const hasRequested = sentRequests.some(
    (r) => r.receiverId === profile.id && (r.status === 'pending' || r.status === 'accepted')
  )

  const handleSend = async () => {
    if (!canAfford) {
      // Redirect to insufficient balance flow
      onClose()
      setShowInsufficientBalance({ action: 'extra_request', cost: REQUEST_COST })
      return
    }

    setSending(true)
    setCcError(false)
    try {
      // 1. Debit CC first (server-side validation)
      const spent = await spendCredits(currentUser.id, 'extra_request')
      if (!spent) {
        setCcError(true)
        setSending(false)
        return
      }

      // 2. Create the request
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: profile.id,
          message: message || t('requestDialog.placeholder', { name: profile.firstName }),
          isSuper: false,
        }),
      })
      const data = await res.json()
      if (data.request) {
        useAppStore.setState((state) => ({
          sentRequests: [data.request, ...state.sentRequests],
        }))
      }
      trigger('request-sent', { name: profile.firstName })
      onSent()
      onClose()
      setMessage('')
    } catch (err) {
      console.error(err)
    }
    setSending(false)
  }

  // Pre-written magic lines/presets
  const presets = [
    {
      icon: '😊',
      label: t('presets.friendly') || 'Amical',
      text: t('requestDialog.placeholder', { name: profile.firstName }) || `Salut ${profile.firstName} ! J'aimerais faire ta connaissance 😊`,
    },
    {
      icon: '✨',
      label: t('presets.compliment') || 'Compliment',
      text: `Salut ${profile.firstName} ! Ton profil est super sympa, j'adorerais échanger avec toi ✨`,
    },
    {
      icon: '🥂',
      label: t('presets.direct') || 'Direct',
      text: `Hello ${profile.firstName} ! Et si on prenait un verre pour discuter ? Voici une demande pour ton numéro 🥂`,
    },
    {
      icon: '🕵️‍♂️',
      label: t('presets.intriguing') || 'Intrigant',
      text: `Coucou ${profile.firstName} ! J'ai lu ton profil et je parie qu'on a plein de points communs... On teste ? 🕵️‍♂️`,
    }
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-sm rounded-2xl mx-auto border-white/10 bg-slate-950/95 backdrop-blur-2xl text-white shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto p-3.5 sm:p-6 scrollbar-none">
        
        {/* Subtle Glow Effects */}
        <div className="absolute -left-12 -top-12 w-24 h-24 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        <DialogHeader className="relative z-10 space-y-0">
          <DialogTitle className="flex items-center gap-2 text-[15px] sm:text-xl font-black tracking-tight">
            <div className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-tr from-primary to-pink-500 shadow-md shadow-primary/30 shrink-0">
              <Phone className="size-3.5 sm:size-5 text-white animate-phone-ring" />
            </div>
            <span className="truncate">{t('requestDialog.title', { name: profile.firstName })}</span>
          </DialogTitle>
          <DialogDescription className="text-white/50 text-[10px] sm:text-sm leading-snug">
            {t('requestDialog.description', { name: profile.firstName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-4 mt-1.5 sm:mt-4 relative z-10">
          
          {/* Compact CC Cost & Balance — single merged card */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-lg border p-2 sm:p-4 space-y-1.5 sm:space-y-3 relative overflow-hidden transition-all',
              canAfford
                ? 'bg-amber-500/5 border-amber-500/15'
                : 'bg-red-500/5 border-red-500/15'
            )}
          >
            {/* Cost + Balance in one row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-xs">📱</span>
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wide">
                  {t('spend.cost') || 'Coût'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                <span className="text-[10px]">🪙</span>
                <span className="text-[11px] sm:text-sm font-black text-amber-400">{REQUEST_COST} CC</span>
              </div>
            </div>

            {/* Balance line */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-white/60">{t('spend.currentBalance') || 'Solde actuel'}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white/70">{balance} CC</span>
                <span className="text-white/30">→</span>
                <span className={cn(
                  'font-black',
                  canAfford ? 'text-green-400' : 'text-red-400'
                )}>
                  {canAfford ? `${balanceAfter} CC` : t('spend.insufficient') || 'Insuffisant'}
                </span>
              </div>
            </div>

            {/* Insufficient warning */}
            {!canAfford && (
              <div className="flex items-center gap-1 rounded bg-red-500/15 border border-red-500/20 px-1.5 py-1">
                <span className="text-[10px]">⚠️</span>
                <span className="text-[9px] sm:text-xs text-red-300 font-medium flex-1 leading-tight">
                  {t('spend.missing', { n: REQUEST_COST - balance }) || `Il te manque ${REQUEST_COST - balance} CC`}
                </span>
              </div>
            )}
          </motion.div>

          {/* CC error message */}
          {ccError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-1.5 text-center">
              <span className="text-[10px] text-red-400 font-semibold">Le débit a échoué. Réessaie.</span>
            </div>
          )}

          {/* Preset messages */}
          {!hasRequested && (
            <div>
              <span className="text-[8px] sm:text-[10px] font-bold text-white/35 uppercase tracking-widest block mb-1">
                {t('requestDialog.choosePreset')}
              </span>
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none snap-x">
                {presets.map((preset, idx) => {
                  const isSelected = message === preset.text
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={sending}
                      onClick={() => setMessage(preset.text)}
                      className={cn(
                        'flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all border snap-start min-h-[26px] sm:min-h-[36px] active:scale-95 duration-200',
                        isSelected
                          ? 'bg-gradient-to-r from-primary to-pink-500 text-white border-transparent shadow-md shadow-primary/20'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/5'
                      )}
                    >
                      <span className="text-[11px]">{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Message Area */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={hasRequested || sending}
              maxLength={160}
              placeholder={t('requestDialog.placeholder', { name: profile.firstName })}
              className="w-full rounded-lg border border-white/10 bg-black/40 hover:bg-black/60 focus:bg-black/80 px-2.5 py-2 text-[11px] sm:text-sm text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none h-[52px] sm:min-h-[80px] transition-all disabled:opacity-50 disabled:cursor-not-allowed duration-200 leading-snug"
            />
            <div className="absolute bottom-1.5 right-2.5 text-[8px] font-mono text-white/30">
              {message.length}/160
            </div>
          </div>

          {/* Action Button */}
          <motion.div whileTap={{ scale: 0.98 }}>
            {hasRequested ? (
              <Button
                className="w-full h-10 sm:h-14 rounded-lg text-[11px] sm:text-base font-bold bg-white/5 border border-white/10 text-white/40 cursor-not-allowed flex items-center justify-center gap-1.5"
                disabled
              >
                <Phone className="size-3.5 sm:size-5" />
                Demande déjà envoyée
              </Button>
            ) : canAfford ? (
              <Button
                className="relative w-full h-10 sm:h-14 rounded-lg text-[11px] sm:text-base font-black text-white shadow-xl shadow-primary/20 overflow-hidden group active:scale-95 duration-200"
                style={{ background: 'linear-gradient(90deg, #ec4899, #f43f5e, #f59e0b)' }}
                onClick={handleSend}
                disabled={sending}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {sending ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="font-bold"
                    >
                      {t('requestDialog.sending')}
                    </motion.span>
                  ) : (
                    <>
                      <Phone className="size-3.5 sm:size-5 animate-phone-ring" />
                      <span>{t('requestDialog.send')}</span>
                      <span className="text-[8px] sm:text-xs font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">• {REQUEST_COST} CC</span>
                    </>
                  )}
                </span>
              </Button>
            ) : (
              <Button
                className="relative w-full h-10 sm:h-14 rounded-lg text-[11px] sm:text-base font-black text-slate-900 shadow-xl overflow-hidden bg-gradient-to-r from-amber-400 to-yellow-500 active:scale-95 duration-200 flex items-center justify-center"
                onClick={() => {
                  onClose()
                  setShowCreditStore(true, 'starter')
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                />
                <span className="relative z-10 flex items-center justify-center gap-1 font-black text-black">
                  🪙 {t('insufficient.goToStore') || 'Recharger mes CC'}
                </span>
              </Button>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


// ======== Fullscreen Loading Screen (Logo Animation 21) ========
// ======== Fullscreen Loading Screen (Logo Animation 21) ========
export function FullscreenLoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; drift: number }[]>([])
  const { t } = useT()

  // Smoothly increment progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev
        // Slow down as it approaches 100%
        const increment = prev > 80 ? 1 : prev > 50 ? 2 : 3
        return Math.min(prev + increment, 98)
      })
    }, 150)
    return () => clearInterval(timer)
  }, [])

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get tap coordinates relative to viewport
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const drift = (Math.random() - 0.5) * 60 // random horizontal drift

    // Spawn a heart
    setHearts((prev) => [...prev, { id: Date.now() + Math.random(), x, y, drift }])

    // Boost progress by 5-10%
    setProgress((prev) => Math.min(prev + Math.floor(Math.random() * 6) + 5, 99))
  }

  const removeHeart = (id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id))
  }

  // Dynamic status text based on progress
  const getStatusText = () => {
    const s1 = t('loading.status1')
    const s2Resolved = t('loading.status2')
    const s3 = t('loading.status3')
    const s4 = t('loading.status4')
    const s5 = t('loading.status5')

    if (progress < 25) return s1 !== 'loading.status1' ? s1 : 'Allumage du signal amoureux...'
    if (progress < 50) return s2Resolved !== 'loading.status2' ? s2Resolved : 'Synchronisation des cœurs...'
    if (progress < 75) return s3 !== 'loading.status3' ? s3 : 'Recherche de profils...'
    if (progress < 95) return s4 !== 'loading.status4' ? s4 : 'Finalisation de la connexion...'
    return s5 !== 'loading.status5' ? s5 : 'Prêt ! Lancement de Fonelove...'
  }

  return (
    <div
      onClick={handleScreenTap}
      className="flex min-h-dvh flex-col items-center justify-between bg-zinc-950 text-white p-8 relative overflow-hidden select-none cursor-pointer"
    >
      {/* Floating interactive hearts */}
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 1, scale: 0.8, x: h.x - 12, y: h.y - 12 }}
          animate={{ opacity: 0, scale: 1.6, x: h.x - 12 + h.drift, y: h.y - 100 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute pointer-events-none text-pink-500 z-50"
          onAnimationComplete={() => removeHeart(h.id)}
        >
          <Heart fill="currentColor" className="size-6 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
        </motion.div>
      ))}

      <div /> {/* Spacer */}

      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-[280px]">
        {/* Background radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* SVG logo with the combined animation (Proposal 21) */}
        <div className="w-32 h-32 drop-shadow-2xl">
          <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="load-logo-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ec4899"/>
                <stop offset="1" stopColor="#f59e0b"/>
              </linearGradient>
              <linearGradient id="load-orbit-grad" x1="0" y1="0" x2="512" y2="512">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.9"/>
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.3"/>
                <stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <style>{`
              @keyframes load-orbit-rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes load-draw {
                0% { stroke-dashoffset: 1200; fill-opacity: 0; }
                50% { stroke-dashoffset: 0; fill-opacity: 0; }
                80%, 100% { stroke-dashoffset: 0; fill-opacity: 1; }
              }
              .load-ring {
                transform-origin: 256px 256px;
                animation: load-orbit-rotate 2.5s infinite linear;
              }
              .load-path {
                stroke: white;
                stroke-width: 8;
                stroke-dasharray: 1200;
                stroke-dashoffset: 1200;
                animation: load-draw 3.5s infinite ease-in-out;
              }
            `}</style>
            <rect width="512" height="512" rx="120" fill="url(#load-logo-grad)"/>
            <circle className="load-ring" cx="256" cy="256" r="215" stroke="url(#load-orbit-grad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="350 400" fill="none" />
            <path className="load-path" d="M150 200C150 188.954 158.954 180 170 180H210C215.523 180 220.523 182.239 224.142 185.858L260 221.716C263.619 225.335 265.858 230.335 265.858 235.858C265.858 241.381 263.619 246.381 260 250L240 270C255 285 275 305 290 320L310 300C313.619 296.381 318.619 294.142 324.142 294.142C329.665 294.142 334.665 296.381 338.284 300L374.142 335.858C377.761 339.477 380 344.477 380 350V390C380 401.046 371.046 410 360 410H330C230.589 410 150 329.411 150 230V200Z" />
            <path className="load-path" d="M428.4 154.6C418.1 144.3 404.1 138 388.5 138C372.9 138 358.9 144.3 348.6 154.6L338.5 164.7L328.4 154.6C318.1 144.3 304.1 138 288.5 138C272.9 138 258.9 144.3 248.6 154.6C227 176.2 227 211.2 248.6 232.8L338.5 322.7L428.4 232.8C450 211.2 450 176.2 428.4 154.6Z" transform="translate(20, -20) scale(0.9)" />
          </svg>
        </div>

        {/* Brand name & slogan */}
        <div className="flex flex-col items-center text-center">
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(236,72,153,0.2)]">
            Fonelove
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mt-2">
            L&apos;amour au bout du fil
          </span>
        </div>
      </div>

      {/* Loading bar container at the bottom */}
      <div className="w-full max-w-[280px] flex flex-col items-center gap-3 pb-8 z-10">
        {/* Visual progress bar */}
        <div className="w-full h-2 bg-zinc-900/80 rounded-full overflow-hidden border border-zinc-800/40 relative shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-full relative"
            style={{ width: `${progress}%` }}
            layoutId="loading-bar-fill"
          >
            {/* Glossy light effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15),transparent)]" />
            
            {/* Glowing endpoint indicator */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_15px_rgba(236,72,153,0.8)]" />
          </motion.div>
        </div>

        {/* Informative / Interactive text helper */}
        <div className="flex flex-col items-center gap-1 text-center min-h-[36px]">
          <span className="text-xs font-semibold text-zinc-400">
            {getStatusText()}
          </span>
          <span className="text-[9px] font-medium text-pink-500/70 animate-pulse">
            {progress}% • Tapotez pour accélérer ⚡
          </span>
        </div>
      </div>
    </div>
  )
}


// ======== Main App (with Feedback Provider) ========
function AppContent() {
  const {
    isAuthenticated,
    onboardingDone,
    currentUser,
    activeTab,
    profiles,
    selectedProfile,
    showProfileDetail,
    showFilter,
    filters,
    isLoading,
    receivedRequests,
    sentRequests,
    connections,
    conversations,
    moments,
    profileVisits,
    setUser,
    setAuthenticated,
    setOnboardingDone,
    setProfiles,
    setReceivedRequests,
    setSentRequests,
    setConnections,
    setConversations,
    setMoments,
    setProfileVisits,
    setSelectedProfile,
    setShowProfileDetail,
    setShowFilter,
    setFilters,
    setIsLoading,
    setPremiumActions,
  } = useAppStore()

  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestTarget, setRequestTarget] = useState<ProfileWithDetails | null>(null)
  const [seeded, setSeeded] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // Track local states for the back button handler without re-running useEffect
  const statesRef = useRef({
    showRequestDialog,
    showAdmin,
    showNotificationCenter,
    showExitConfirm,
  })

  useEffect(() => {
    statesRef.current = {
      showRequestDialog,
      showAdmin,
      showNotificationCenter,
      showExitConfirm,
    }
  }, [showRequestDialog, showAdmin, showNotificationCenter, showExitConfirm])

  // ConnectCoin store
  const ccFetchBalance = useConnectCoinStore((s) => s.fetchBalance)
  const { trigger } = useFeedback()
  const { t } = useT()

  // Polling for new requests and updates
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return
    
    const pollInterval = setInterval(async () => {
      try {
        const receivedRes = await fetch(`/api/requests?userId=${currentUser.id}&type=received`)
        const receivedData = await receivedRes.json()
        
        const sentRes = await fetch(`/api/requests?userId=${currentUser.id}&type=sent`)
        const sentData = await sentRes.json()
        
        useAppStore.setState((state) => {
          const oldReceived = state.receivedRequests || []
          const newReceived = receivedData.requests || []
          const oldSent = state.sentRequests || []
          const newSent = sentData.requests || []
          
          // 1. Detect newly received requests (status pending)
          const newlyReceived = newReceived.filter((nr: any) => 
            nr.status === 'pending' && !oldReceived.find((or) => or.id === nr.id)
          )
          
          if (newlyReceived.length > 0) {
            const senderName = newlyReceived[0].sender?.firstName || 'Quelqu\'un'
            trigger('request-received', { name: senderName })
          }
          
          // 2. Detect newly accepted requests (we check if it was pending before, and now it's accepted)
          // To avoid firing multiple times, we compare local state vs fetched state.
          const newlyAccepted = newSent.filter((ns: any) => 
            ns.status === 'accepted' && oldSent.find((os) => os.id === ns.id && os.status === 'pending')
          )
          
          if (newlyAccepted.length > 0) {
            const req = newlyAccepted[0]
            // We need to fetch the phone number if it's not in the request payload
            // Actually, if we just want to trigger the popup, we can do it and the UI will show the receiver's details
            trigger('request-accepted', {
              name: req.receiver?.firstName || 'Ton crush',
              phone: req.receiver?.phone,
              photo: req.receiver?.photos?.[0]?.url,
            })
          }
          
          return {
            receivedRequests: newReceived,
            sentRequests: newSent,
          }
        })
      } catch (err) {
        console.error('Polling error', err)
      }
    }, 15000) // Poll every 15 seconds

    return () => clearInterval(pollInterval)
  }, [isAuthenticated, currentUser, trigger])

  // ====== Magic Link Redeem: detect ?redeem= URL param ======
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redeemCode = params.get('redeem')
    if (!redeemCode) return

    // Clean URL immediately
    const cleanUrl = window.location.pathname
    window.history.replaceState({}, '', cleanUrl)

    // Redeem the code for user data
    const redeemAuth = async () => {
      try {
        const res = await fetch('/api/auth/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: redeemCode }),
        })
        const data = await res.json()
        if (data.user) {
          // Dispatch login event — the LoginScreen listener will pick it up
          window.dispatchEvent(new CustomEvent('fonelove:login', { detail: data.user }))
        }
      } catch (err) {
        console.error('Redeem error:', err)
      }
    }

    redeemAuth()
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-login with demo account on first load

  // Seed data and load initial data
  useEffect(() => {
    const initApp = async () => {
      if (!isAuthenticated || !currentUser) return

      setIsLoading(true)
      try {
        // Ensure user exists in Prisma/SQLite whenever app starts
        const syncRes = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: currentUser }),
        }).catch(err => {
          console.error('Initial sync fetch error:', err)
          return null
        })

        if (syncRes && syncRes.status === 409) {
          const syncData = await syncRes.json()
          if (syncData.error === 'ID_MISMATCH' && syncData.correctUser) {
            console.warn('Stale user ID detected in local storage. Updating store to correct ID:', syncData.correctUser.id)
            setUser(syncData.correctUser)
            // Reload page to start fresh with correct user details
            window.location.reload()
            return
          }
        }

        if (!seeded) {
          await fetch('/api/seed', { method: 'POST' })
          setSeeded(true)
        }

        // Initialize ConnectCoin balance
        ccFetchBalance(currentUser.id).catch((err) => console.error('CC init error:', err))

        // Parallelize all data fetches to load data significantly faster
        const [
          profilesRes,
          receivedRes,
          sentRes,
          connRes,
          msgRes,
          visitRes,
          momentsRes,
          premiumActionsRes
        ] = await Promise.all([
          fetch(`/api/profiles?userId=${currentUser.id}&limit=20`),
          fetch(`/api/requests?userId=${currentUser.id}&type=received`),
          fetch(`/api/requests?userId=${currentUser.id}&type=sent`),
          fetch(`/api/connections?userId=${currentUser.id}`),
          fetch(`/api/messages?userId=${currentUser.id}`),
          fetch(`/api/profile/visits?userId=${currentUser.id}`),
          fetch(`/api/moments?userId=${currentUser.id}`).catch(() => null),
          fetch(`/api/premium-actions`).catch(() => null)
        ])

        // Parse JSON responses in parallel
        const [
          profilesData,
          receivedData,
          sentData,
          connData,
          msgData,
          visitData,
          momentsData,
          premiumActionsData
        ] = await Promise.all([
          profilesRes.json(),
          receivedRes.json(),
          sentRes.json(),
          connRes.json(),
          msgRes.json(),
          visitRes.json(),
          momentsRes ? momentsRes.json() : Promise.resolve(null),
          premiumActionsRes ? premiumActionsRes.json() : Promise.resolve(null)
        ])

        if (profilesData?.profiles) {
          setProfiles(profilesData.profiles)
          useAppStore.setState({ 
            nextCursor: profilesData.nextCursor,
            hasMore: !!profilesData.nextCursor 
          })
        }
        if (receivedData?.requests) setReceivedRequests(receivedData.requests)
        if (sentData?.requests) setSentRequests(sentData.requests)
        if (connData?.connections) setConnections(connData.connections)
        if (msgData?.conversations) setConversations(msgData.conversations)
        if (visitData?.visits) setProfileVisits(visitData.visits)
        if (momentsData?.moments) setMoments(momentsData.moments)
        if (premiumActionsData?.actions) setPremiumActions(premiumActionsData.actions)

      } catch (err) {
        console.error('Init error:', err)
      }
      setIsLoading(false)
    }

    initApp()
  }, [isAuthenticated, currentUser, seeded])

  const handleLogin = async (user: UserProfile & { onboardingDone?: boolean }) => {
    // Sync user to Prisma/SQLite for ConnectCoin in the background
    fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    }).catch(err => {
      console.error('Sync-user error:', err)
    })
    
    setUser(user)
    setAuthenticated(true)
    // Check if user has completed onboarding — new users go to onboarding, existing skip
    const userOnboardingDone = (user as any).onboardingDone === true
    setOnboardingDone(userOnboardingDone)
  }

  const handleOnboardingComplete = async (user: UserProfile) => {
    // Persist onboardingDone to the database
    try {
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, onboardingDone: true }),
      })
      
      // Refresh profiles list now that this user is visible and DB is ready
      const res = await fetch(`/api/profiles?userId=${user.id}&limit=20`)
      const data = await res.json()
      if (data.profiles) {
        setProfiles(data.profiles)
        useAppStore.setState({ 
          nextCursor: data.nextCursor,
          hasMore: !!data.nextCursor 
        })
      }
    } catch (err) {
      console.error('Onboarding sync error:', err)
    }
    
    setUser(user)
    setOnboardingDone(true)
    setAuthenticated(true)
  }

  // Prevent accidental back button closure
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Push dummy state
    window.history.pushState({ isApp: true }, '')
    
    const handlePopState = (e: PopStateEvent) => {
      // Re-push immediately to maintain the trap
      window.history.pushState({ isApp: true }, '')

      const store = useAppStore.getState()
      const { 
        showProfileDetail, setShowProfileDetail,
        showFilter, setShowFilter,
        activeTab, setActiveTab,
        activeChatUserId
      } = store

      const ccStore = useConnectCoinStore.getState()
      const flStore = useFoneLoveStore.getState()

      const { 
        showRequestDialog, 
        showAdmin, 
        showNotificationCenter,
        showExitConfirm 
      } = statesRef.current

      // Prioritize closing modals and overlays from foreground to background
      if (showExitConfirm) {
        setShowExitConfirm(false)
        return
      }

      if (ccStore.showSpendConfirm) {
        ccStore.setShowSpendConfirm(null)
        return
      }

      if (ccStore.showInsufficientBalance) {
        ccStore.setShowInsufficientBalance(null)
        return
      }

      if (flStore.showSendDialog) {
        flStore.setShowSendDialog(null)
        return
      }

      if (ccStore.showCreditStore) {
        ccStore.setShowCreditStore(false)
        return
      }

      if (flStore.showWallet) {
        flStore.setShowWallet(false)
        return
      }

      if (showAdmin) {
        setShowAdmin(false)
        return
      }

      if (showNotificationCenter) {
        setShowNotificationCenter(false)
        return
      }

      if (showRequestDialog) {
        setShowRequestDialog(false)
        return
      }

      if (showProfileDetail) {
        setShowProfileDetail(false)
        return
      }

      if (showFilter) {
        setShowFilter(false)
        return
      }

      // If a chat conversation is open, emit event to close it
      if (activeChatUserId) {
        window.dispatchEvent(new CustomEvent('fonelove:close-chat'))
        return
      }

      // If we are not on the discover tab, go back to discover
      if (activeTab !== 'discover') {
        setActiveTab('discover')
        return
      }

      // If on discover tab with no overlays, ask for exit confirm
      setShowExitConfirm(true)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Prevent accidental page refresh (pull-to-refresh, F5, Ctrl+R, swipe)
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Modern browsers require returnValue to be set
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isAuthenticated])

  const handleRequestNumber = (profile: ProfileWithDetails) => {
    setRequestTarget(profile)
    setShowRequestDialog(true)
  }

  // Admin Dashboard view
  if (showAdmin && currentUser) {
    return <AdminDashboard currentUser={currentUser} onBackToApp={() => setShowAdmin(false)} />
  }

  // Prevent hydration mismatch and flash of login screen
  if (!isMounted) {
    return <FullscreenLoadingScreen />
  }

  // Auth flow (manual login if auto-login failed)
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Onboarding
  if (!onboardingDone) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // Loading
  if (isLoading) {
    return <FullscreenLoadingScreen />
  }

  // Main app
  return (
    <div className="relative h-dvh bg-background overflow-hidden">
      {/* Global floating notification opt-in banner (slides from top) */}
      <NotificationOptInBanner />

      {/* Tab content */}
      <div className={cn('h-full', activeTab === 'discover' ? '' : 'pb-20')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === 'discover' && <DiscoverTab onRequest={handleRequestNumber} />}
            {activeTab === 'requests' && <RequestsTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'connections' && <ConnectionsTab />}
            {activeTab === 'profile' && <ProfileTab onOpenAdmin={() => setShowAdmin(true)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav - hidden on discover (TikTok mode) since it has its own overlay */}
      {activeTab !== 'discover' && <BottomNav />}

      {/* Profile detail dialog */}
      <ProfileDetail
        profile={selectedProfile}
        open={showProfileDetail}
        onClose={() => setShowProfileDetail(false)}
        onLike={(p) => {
          fetch('/api/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId: currentUser?.id, receiverId: p.id }),
          })
          setShowProfileDetail(false)
        }}
        onPass={() => setShowProfileDetail(false)}
        onRequest={handleRequestNumber}
      />

      {/* Number request dialog */}
      <NumberRequestDialog
        profile={requestTarget}
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        onSent={async () => {
          if (currentUser && requestTarget) {
            const res = await fetch(`/api/requests?userId=${currentUser.id}&type=sent`)
            const data = await res.json()
            if (data.requests) setSentRequests(data.requests)
            
            // Update the profile request status to 'pending' instead of removing it
            setTimeout(() => useAppStore.getState().updateProfileRequestStatus(requestTarget.id, 'pending'), 300)
          }
        }}
      />

      {/* Filter sheet */}
      <FilterSheet
        open={showFilter}
        onOpenChange={setShowFilter}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* ConnectCoin Store & Dialogs */}
      <CreditStore />
      <SpendConfirmDialog />
      <InsufficientBalanceDialog />

      {/* FoneLove Global Components */}
      <FoneLoveWallet />
      <SendFoneLoveDialog />
      <FoneLoveReceiveAnimation />

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/20 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="text-3xl">👋</span> Quitter FoneLove ?
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              Tu es sûr de vouloir quitter l'application ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl h-12 font-bold hover:bg-muted"
              onClick={() => setShowExitConfirm(false)}
            >
              Non, rester
            </Button>
            <Button
              className="flex-1 rounded-2xl h-12 bg-red-500 hover:bg-red-600 text-white font-bold"
              onClick={() => {
                setShowExitConfirm(false)
                // Go back twice to actually exit since we pushed a state
                window.history.go(-2)
              }}
            >
              Oui, quitter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ======== Export with Feedback Provider ========
export default function Home() {
  return (
    <FeedbackProvider>
      <AppContent />
      <FloatingChatBubble />
    </FeedbackProvider>
  )
}

function FloatingChatBubble() {
  const { minimizedConversation, setMinimizedConversation, setActiveTab, setAutoOpenRequestId } = useAppStore()
  
  if (!minimizedConversation) return null

  const photo = minimizedConversation.otherUser.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`

  return (
    <motion.div
      drag
      dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
      initial={{ scale: 0, x: 100 }}
      animate={{ scale: 1, x: 0 }}
      className="fixed bottom-24 right-4 z-[100] cursor-pointer"
      onClick={() => {
        setAutoOpenRequestId(minimizedConversation.requestId)
        setActiveTab('messages')
        setMinimizedConversation(null)
      }}
    >
       <div className="relative group">
          <motion.div
            className="h-16 w-16 rounded-full border-4 border-primary shadow-2xl overflow-hidden bg-background"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img 
              src={photo} 
              className="h-full w-full object-cover"
              alt="Mini Chat"
            />
          </motion.div>
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-fonelove rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-background animate-pulse">
            1
          </div>
          
          <button 
            className="absolute -top-2 -left-2 h-6 w-6 bg-muted rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            onClick={(e) => {
              e.stopPropagation()
              setMinimizedConversation(null)
            }}
          >
            ✕
          </button>
       </div>
    </motion.div>
  )
}
