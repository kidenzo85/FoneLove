'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface FoneLoveConfig {
  unitPriceEur: number
  withdrawValueEur: number
  commissionPercent: number
  minWithdrawAmount: number
  maxDailyGiftPerUser: number
  isActive: boolean
}

export interface FoneLoveGiftItem {
  id: string
  senderId: string
  receiverId: string
  amount: number
  message?: string
  createdAt: string
  senderName?: string
  receiverName?: string
}

export interface FoneLoveTransactionItem {
  id: string
  type: string
  amount: number
  description?: string
  createdAt: string
}

export interface SendDialogTarget {
  userId: string
  firstName: string
  photo?: string
}

export interface PaymentOrderItem {
  id: string
  packType: string
  amountXAF: number
  ccAmount: number
  status: string
  createdAt: string
  metadata?: string | null
}

interface FoneLoveState {
  // Wallet balances
  sendBalance: number       // FoneLove you can send
  receivedBalance: number   // FoneLove received (convertible)
  totalSent: number
  totalReceived: number
  totalWithdrawn: number

  // Config
  config: FoneLoveConfig | null

  // Transactions
  transactions: FoneLoveTransactionItem[]
  gifts: FoneLoveGiftItem[]
  orders: PaymentOrderItem[]

  // UI State
  showSendDialog: SendDialogTarget | null
  showWallet: boolean
  pendingReceivedGift: FoneLoveGiftItem | null  // for receive animation

  // Loading
  isLoading: boolean

  // Actions
  fetchWallet: (userId: string) => Promise<void>
  fetchConfig: () => Promise<void>
  fetchHistory: (userId: string) => Promise<void>
  sendFoneLove: (senderId: string, receiverId: string, amount: number, message?: string) => Promise<boolean>
  rechargeWallet: (userId: string, amount: number) => Promise<boolean>
  requestWithdraw: (userId: string, amount: number) => Promise<boolean>
  setShowSendDialog: (target: SendDialogTarget | null) => void
  setShowWallet: (show: boolean) => void
  setPendingReceivedGift: (gift: FoneLoveGiftItem | null) => void
}

export const useFoneLoveStore = create<FoneLoveState>()(
  persist(
    (set, get) => ({
      sendBalance: 0,
      receivedBalance: 0,
      totalSent: 0,
      totalReceived: 0,
      totalWithdrawn: 0,
      config: null,
      transactions: [],
      gifts: [],
      orders: [],
      showSendDialog: null,
      showWallet: false,
      pendingReceivedGift: null,
      isLoading: false,

      fetchWallet: async (userId: string) => {
        try {
          const res = await fetch(`/api/fonelove/wallet?userId=${userId}`)
          if (!res.ok) return
          const data = await res.json()
          if (data.error) return
          set({
            sendBalance: data.balance ?? 0,
            receivedBalance: data.receivedBalance ?? 0,
            totalSent: data.totalSent ?? 0,
            totalReceived: data.totalReceived ?? 0,
            totalWithdrawn: data.totalWithdrawn ?? 0,
          })
        } catch (err) {
          console.error('FoneLove fetchWallet error:', err)
        }
      },

      fetchConfig: async () => {
        try {
          const res = await fetch('/api/fonelove/config')
          if (!res.ok) return
          const data = await res.json()
          if (data.error) return
          set({ config: data.config })
        } catch (err) {
          console.error('FoneLove fetchConfig error:', err)
        }
      },

      fetchHistory: async (userId: string) => {
        try {
          const res = await fetch(`/api/fonelove/history?userId=${userId}`)
          if (!res.ok) return
          const data = await res.json()
          if (data.error) return
          set({
            transactions: data.transactions ?? [],
            gifts: data.gifts ?? [],
            orders: data.orders ?? [],
          })
        } catch (err) {
          console.error('FoneLove fetchHistory error:', err)
        }
      },

      sendFoneLove: async (senderId: string, receiverId: string, amount: number, message?: string) => {
        try {
          const res = await fetch('/api/fonelove/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId, receiverId, amount, message }),
          })
          const data = await res.json()
          if (data.error) {
            console.error('FoneLove send error:', data.error)
            return false
          }
          // Refresh wallet
          await get().fetchWallet(senderId)
          return true
        } catch (err) {
          console.error('FoneLove sendFoneLove error:', err)
          return false
        }
      },

      rechargeWallet: async (userId: string, amount: number) => {
        try {
          // FoneLove can ONLY be purchased with real money via CoolPay.
          // ConnectCoin→FoneLove conversion is NOT allowed.
          const res = await fetch('/api/fonelove/recharge/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, flAmount: amount }),
          })
          const data = await res.json()
          if (data.error) {
            console.error('FoneLove recharge initiate error:', data.error)
            return false
          }
          if (data.paymentUrl) {
            window.location.href = data.paymentUrl
            return true
          }
          return false
        } catch (err) {
          console.error('FoneLove rechargeWallet error:', err)
          return false
        }
      },

      requestWithdraw: async (userId: string, amount: number) => {
        try {
          const res = await fetch('/api/fonelove/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount }),
          })
          const data = await res.json()
          if (data.error) {
            console.error('FoneLove withdraw error:', data.error)
            return false
          }
          await get().fetchWallet(userId)
          return true
        } catch (err) {
          console.error('FoneLove requestWithdraw error:', err)
          return false
        }
      },

      setShowSendDialog: (target) => set({ showSendDialog: target }),
      setShowWallet: (show) => set({ showWallet: show }),
      setPendingReceivedGift: (gift) => set({ pendingReceivedGift: gift }),
    }),
    {
      name: 'fonelove-storage',
      partialize: (state) => ({
        sendBalance: state.sendBalance,
        receivedBalance: state.receivedBalance,
        totalSent: state.totalSent,
        totalReceived: state.totalReceived,
      }),
    }
  )
)
