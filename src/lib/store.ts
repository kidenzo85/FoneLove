'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TabType = 'discover' | 'requests' | 'messages' | 'connections' | 'profile'

export interface UserProfile {
  id: string
  email: string
  phone: string
  firstName: string
  lastName?: string
  birthDate?: string
  gender?: string
  bio?: string
  isVerified: boolean
  isPremium: boolean
  profileScore: number
  streakDays: number
  dailyBoostUsed: boolean
  lookingFor?: string
  lookingForGender?: string
  city?: string
  countryCode?: string
  astrologicalSign?: string
  height?: number
  spotifyAnthem?: string
  mood?: string
  photos?: PhotoItem[]
  prompts?: PromptItem[]
  interests?: string[]
  badges?: BadgeItem[]
  phoneType?: 'whatsapp' | 'direct' | 'both'
  otherPhones?: PhoneItem[]
  role?: 'user' | 'admin' | 'super_admin'
  requestStatus?: 'pending' | 'accepted' | 'declined' | 'none'
  requestId?: string | null
}

export interface PhoneItem {
  number: string
  type: 'whatsapp' | 'direct' | 'both'
}

export interface PhotoItem {
  id: string
  url: string
  position: number
  isPrimary: boolean
}

export interface PromptItem {
  id: string
  question: string
  answer: string
}

export interface BadgeItem {
  id: string
  type: string
  earnedAt: string
}

export interface ProfileWithDetails extends UserProfile {
  city?: string
  jobTitle?: string
  company?: string
  education?: string
}

export interface NumberRequest {
  id: string
  senderId: string
  receiverId: string
  message?: string
  isSuper: boolean
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  respondedAt?: string
  sender?: ProfileWithDetails
  receiver?: ProfileWithDetails
}

export interface MessageItem {
  id: string
  senderId: string
  receiverId: string
  requestId?: string
  content: string
  type: string
  isRead: boolean
  createdAt: string
  expiresAt?: string
}

export interface ConnectionItem {
  id: string
  user1Id: string
  user2Id: string
  phoneNumber1?: string
  phoneNumber2?: string
  createdAt: string
  otherUser?: ProfileWithDetails
  phone?: string
}

export interface ConversationItem {
  requestId: string
  otherUser: ProfileWithDetails
  messages: MessageItem[]
  messageCount: number
  lastMessage?: MessageItem
  status?: string
}

export interface LikeItem {
  id: string
  senderId: string
  receiverId: string
  isMutual: boolean
  createdAt: string
}

export interface MomentItem {
  id: string
  userId: string
  content?: string
  mediaUrl?: string
  type: string
  expiresAt: string
  createdAt: string
  user?: ProfileWithDetails
  isOptimistic?: boolean
}

export interface FilterState {
  ageMin: number
  ageMax: number
  distanceMax: number
  lookingFor: string
  gender: string
  withPhotosOnly?: boolean
  verifiedOnly?: boolean
}

export interface PremiumActionConfig {
  action: string
  durationMinutes: number
  isEnabled: boolean
  costCC: number
  label: string
  emoji: string
}

export interface AppConfig {
  requirePhoneVerification: boolean
}

interface AppState {
  // Config
  config: AppConfig
  setConfig: (config: Partial<AppConfig>) => void

  // Auth
  currentUser: UserProfile | null
  isAuthenticated: boolean
  onboardingDone: boolean
  onboardingStep: number

  // Navigation
  activeTab: TabType

  // Data
  profiles: ProfileWithDetails[]
  receivedRequests: NumberRequest[]
  sentRequests: NumberRequest[]
  connections: ConnectionItem[]
  conversations: ConversationItem[]
  likes: LikeItem[]
  moments: MomentItem[]
  profileVisits: ProfileWithDetails[]
  premiumActions: PremiumActionConfig[]
  nextCursor: string | null
  hasMore: boolean
  isLoadingMore: boolean

  // UI state
  selectedProfile: ProfileWithDetails | null
  showProfileDetail: boolean
  showFilter: boolean
  viewMode: 'swipe' | 'grid'
  isLoading: boolean
  minimizedConversation: ConversationItem | null
  autoOpenRequestId: string | null
  activeChatUserId: string | null

  // Filters
  filters: FilterState

  // Actions
  setUser: (user: UserProfile | null) => void
  setAuthenticated: (val: boolean) => void
  setOnboardingDone: (val: boolean) => void
  setOnboardingStep: (step: number) => void
  setActiveTab: (tab: TabType) => void
  setProfiles: (profiles: ProfileWithDetails[]) => void
  setReceivedRequests: (requests: NumberRequest[]) => void
  setSentRequests: (requests: NumberRequest[]) => void
  setConnections: (connections: ConnectionItem[]) => void
  setConversations: (conversations: ConversationItem[]) => void
  setLikes: (likes: LikeItem[]) => void
  setMoments: (moments: MomentItem[]) => void
  setProfileVisits: (visits: ProfileWithDetails[]) => void
  setPremiumActions: (actions: PremiumActionConfig[]) => void
  setSelectedProfile: (profile: ProfileWithDetails | null) => void
  setShowProfileDetail: (val: boolean) => void
  setShowFilter: (val: boolean) => void
  setViewMode: (mode: 'swipe' | 'grid') => void
  setIsLoading: (val: boolean) => void
  setMinimizedConversation: (conv: ConversationItem | null) => void
  setAutoOpenRequestId: (id: string | null) => void
  setActiveChatUserId: (id: string | null) => void
  setFilters: (filters: FilterState) => void
  setNextCursor: (cursor: string | null) => void
  setHasMore: (val: boolean) => void
  setIsLoadingMore: (val: boolean) => void
  appendProfiles: (profiles: ProfileWithDetails[]) => void
  removeProfile: (id: string) => void
  updateProfileRequestStatus: (id: string, status: 'pending' | 'accepted' | 'declined') => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Config
      config: {
        requirePhoneVerification: false,
      },
      setConfig: (newConfig) =>
        set((state) => ({ config: { ...state.config, ...newConfig } })),

      // Auth defaults
      currentUser: null,
      isAuthenticated: false,
      onboardingDone: false,
      onboardingStep: 0,

      // Navigation
      activeTab: 'discover',

      // Data
      profiles: [],
      receivedRequests: [],
      sentRequests: [],
      connections: [],
      conversations: [],
      likes: [],
      moments: [],
      profileVisits: [],
      premiumActions: [],
      nextCursor: null,
      hasMore: true,
      isLoadingMore: false,

      // UI state
      selectedProfile: null,
      showProfileDetail: false,
      showFilter: false,
      viewMode: 'swipe',
      isLoading: false,
      minimizedConversation: null,
      autoOpenRequestId: null,
      activeChatUserId: null,

      // Filters
      filters: {
        ageMin: 18,
        ageMax: 45,
        distanceMax: 50,
        lookingFor: 'all',
        gender: 'all',
        withPhotosOnly: false,
        verifiedOnly: false,
      },

      // Actions
      setUser: (user) => set({ currentUser: user }),
      setAuthenticated: (val) => set({ isAuthenticated: val }),
      setOnboardingDone: (val) => set({ onboardingDone: val }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setProfiles: (profiles) => set({ profiles }),
      setReceivedRequests: (requests) => set({ receivedRequests: requests }),
      setSentRequests: (requests) => set({ sentRequests: requests }),
      setConnections: (connections) => set({ connections }),
      setConversations: (conversations) => set({ conversations }),
      setLikes: (likes) => set({ likes }),
      setMoments: (moments) => set({ moments }),
      setProfileVisits: (visits) => set({ profileVisits: visits }),
      setPremiumActions: (actions) => set({ premiumActions: actions }),
      setSelectedProfile: (profile) => set({ selectedProfile: profile }),
      setShowProfileDetail: (val) => set({ showProfileDetail: val }),
      setShowFilter: (val) => set({ showFilter: val }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsLoading: (val) => set({ isLoading: val }),
      setMinimizedConversation: (conv) => set({ minimizedConversation: conv }),
      setAutoOpenRequestId: (id) => set({ autoOpenRequestId: id }),
      setActiveChatUserId: (id) => set({ activeChatUserId: id }),
      setFilters: (filters) => set({ filters }),
      setNextCursor: (cursor) => set({ nextCursor: cursor }),
      setHasMore: (val) => set({ hasMore: val }),
      setIsLoadingMore: (val) => set({ isLoadingMore: val }),
      appendProfiles: (newProfiles) =>
        set((state) => ({ profiles: [...state.profiles, ...newProfiles] })),
      removeProfile: (id) =>
        set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) })),
      updateProfileRequestStatus: (id, status) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, requestStatus: status } : p
          ),
        })),
      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          onboardingDone: false,
          onboardingStep: 0,
          profiles: [],
          receivedRequests: [],
          sentRequests: [],
          connections: [],
          conversations: [],
          likes: [],
          moments: [],
          profileVisits: [],
          premiumActions: [],
          activeTab: 'discover',
        }),
    }),
    {
      name: 'fonelove-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (state) => ({
        config: state.config,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        onboardingDone: state.onboardingDone,
        onboardingStep: state.onboardingStep,
        activeTab: state.activeTab,
        viewMode: state.viewMode,
        filters: state.filters,
      }),
    }
  )
)
