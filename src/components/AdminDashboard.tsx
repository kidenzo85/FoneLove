'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Users, Phone, MessageCircle, Link2, Camera, AlertTriangle,
  Crown, Settings, Trophy, Search, Bell, ChevronLeft, ChevronRight,
  ArrowLeft, TrendingUp, TrendingDown, Eye, CheckCircle, XCircle,
  Clock, MoreHorizontal, Filter, Download, Plus, Edit, Trash2,
  Shield, Star, Zap, Award, Flame, Target, Activity, DollarSign,
  Mail, Calendar, MapPin, Heart, Ban, AlertOctagon, Check,
  X, ChevronDown, RefreshCw, Copy, Key, ToggleLeft, ToggleRight,
  Image, ThumbsUp, MessageSquare, UserCheck, UserX, Globe,
  Smartphone, Timer, Gift, BadgeCheck, Sparkles, ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  LineChart, BarChart, PieChart, AreaChart,
  Line, Bar, Pie, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { cn } from '@/lib/utils'
import { ConfigProvider, useConfigStore } from '@/lib/config-store'
import { PacksConfigTable } from './PacksConfigTable'
import { useAppStore } from '@/lib/store'

// ============================================
// TYPES
// ============================================
interface AdminDashboardProps {
  currentUser: any
  onBackToApp: () => void
}

type PageKey =
  | 'overview'
  | 'users'
  | 'requests'
  | 'messages'
  | 'connections'
  | 'moments'
  | 'reports'
  | 'premium'
  | 'notifications'
  | 'settings'
  | 'gamification'

interface MockUser {
  id: string
  firstName: string
  lastName: string
  email: string
  gender: 'Homme' | 'Femme' | 'Non-binaire'
  age: number
  city: string
  score: number
  premium: boolean
  verified: boolean
  status: 'Actif' | 'Suspendu' | 'Banni'
  avatar: string
  inscription: string
  lastActive: string
  role?: string
}

interface MockRequest {
  id: string
  sender: string
  senderAvatar: string
  receiver: string
  receiverAvatar: string
  message: string
  isSuper: boolean
  status: 'En attente' | 'Acceptée' | 'Refusée'
  date: string
}

interface MockConversation {
  id: string
  user1: string
  user1Avatar: string
  user2: string
  user2Avatar: string
  messages: number
  lastMessage: string
  date: string
  preNumber: boolean
}

interface MockConnection {
  id: string
  user1: string
  user1Avatar: string
  user2: string
  user2Avatar: string
  date: string
  phone1: string
  phone2: string
}

interface MockMoment {
  id: string
  user: string
  userAvatar: string
  thumbnail: string
  caption: string
  status: 'Actif' | 'Expiré' | 'Signalé'
  date: string
  likes: number
  comments: number
}

interface MockReport {
  id: string
  reporter: string
  reporterAvatar: string
  reported: string
  reportedAvatar: string
  reason: string
  date: string
  status: 'En cours' | 'Résolu' | 'Ignoré'
}

interface MockPremium {
  id: string
  user: string
  userAvatar: string
  plan: 'Mensuel' | 'Trimestriel' | 'Annuel'
  price: number
  startDate: string
  nextBilling: string
  status: 'Actif' | 'Expiré' | 'Annulé'
}

// ============================================
// MOCK DATA
// ============================================
const FRENCH_FIRST_NAMES_M = ['Lucas', 'Gabriel', 'Raphaël', 'Arthur', 'Louis', 'Jules', 'Hugo', 'Léo', 'Ethan', 'Nathan', 'Adam', 'Sacha', 'Gabin', 'Paul', 'Noé', 'Mathis', 'Clément', 'Enzo', 'Théo', 'Maxime']
const FRENCH_FIRST_NAMES_F = ['Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Léa', 'Inès', 'Rose', 'Manon', 'Juliette', 'Camille', 'Zoé', 'Lina', 'Mila', 'Ambre', 'Clara', 'Léna', 'Sarah', 'Eva', 'Maëlys']
const FRENCH_LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier']
const FRENCH_CITIES = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Toulon', 'Le Havre', 'Grenoble']
const AVATAR_BASE = 'https://i.pravatar.cc/100?img='

function generateMockUsers(): MockUser[] {
  const users: MockUser[] = []
  for (let i = 0; i < 50; i++) {
    const isMale = i < 25
    const firstNames = isMale ? FRENCH_FIRST_NAMES_M : FRENCH_FIRST_NAMES_F
    const firstName = firstNames[i % firstNames.length]
    const lastName = FRENCH_LAST_NAMES[i % FRENCH_LAST_NAMES.length]
    const gender: MockUser['gender'] = i < 25 ? 'Homme' : i < 47 ? 'Femme' : 'Non-binaire'
    users.push({
      id: `u${i + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.fr`,
      gender,
      age: 20 + Math.floor(Math.random() * 25),
      city: FRENCH_CITIES[i % FRENCH_CITIES.length],
      score: 30 + Math.floor(Math.random() * 70),
      premium: Math.random() > 0.7,
      verified: Math.random() > 0.4,
      status: Math.random() > 0.85 ? (Math.random() > 0.5 ? 'Suspendu' : 'Banni') : 'Actif',
      avatar: `${AVATAR_BASE}${i + 1}`,
      inscription: `2025-${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      lastActive: `2026-05-${String(Math.floor(Math.random() * 4) + 1).padStart(2, '0')}`,
    })
  }
  return users
}

function generateMockRequests(users: MockUser[]): MockRequest[] {
  const statuses: MockRequest['status'][] = ['En attente', 'Acceptée', 'Refusée']
  const messages = [
    "Salut ! J'aimerais faire ta connaissance 😊",
    "Ton profil m'intrigue, on échange ?",
    "Coucou ! On se connaît peut-être ?",
    "Tu as l'air super sympa !",
    "Hey ! Tes photos sont trop belles 🔥",
    "On pourrait sortir un de ces jours ?",
    "Je t'ai trouvée via Moments, trop cute !",
    "Dis-moi en plus sur toi ?",
    "Tu aimes la musique ? Moi aussi !",
    "Salut belle personne ✨",
  ]
  const requests: MockRequest[] = []
  for (let i = 0; i < 30; i++) {
    const senderIdx = Math.floor(Math.random() * users.length)
    let receiverIdx = Math.floor(Math.random() * users.length)
    while (receiverIdx === senderIdx) receiverIdx = Math.floor(Math.random() * users.length)
    requests.push({
      id: `r${i + 1}`,
      sender: `${users[senderIdx].firstName} ${users[senderIdx].lastName}`,
      senderAvatar: users[senderIdx].avatar,
      receiver: `${users[receiverIdx].firstName} ${users[receiverIdx].lastName}`,
      receiverAvatar: users[receiverIdx].avatar,
      message: messages[i % messages.length],
      isSuper: Math.random() > 0.75,
      status: statuses[Math.floor(Math.random() * 3)],
      date: `2026-04-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
    })
  }
  return requests
}

function generateMockConversations(users: MockUser[]): MockConversation[] {
  const lastMessages = [
    "On se voit demain ? 😄", "Trop bien merci !", "C'est noté 👍",
    "Haha trop drôle 😂", "Oui carrément !", "Bonne nuit 💤",
    "T'es libre ce week-end ?", "Trop cool ton profil", "Merci beaucoup !",
    "On en reparle bientôt", "Super idée !", "C'est quoi ton insta ?",
    "T'as vu le match hier ?", "Je t'envoie ma playlist", "Coucou c'est moi 😊",
    "T'es trop mignonne", "Ok parfait !", "Bisous 😘", "À toute !",
    "J'ai hâte de te rencontrer",
  ]
  const conversations: MockConversation[] = []
  for (let i = 0; i < 20; i++) {
    const u1 = Math.floor(Math.random() * users.length)
    let u2 = Math.floor(Math.random() * users.length)
    while (u2 === u1) u2 = Math.floor(Math.random() * users.length)
    conversations.push({
      id: `c${i + 1}`,
      user1: `${users[u1].firstName} ${users[u1].lastName}`,
      user1Avatar: users[u1].avatar,
      user2: `${users[u2].firstName} ${users[u2].lastName}`,
      user2Avatar: users[u2].avatar,
      messages: 3 + Math.floor(Math.random() * 40),
      lastMessage: lastMessages[i % lastMessages.length],
      date: `2026-05-0${Math.floor(Math.random() * 4) + 1}`,
      preNumber: Math.random() > 0.6,
    })
  }
  return conversations
}

function generateMockConnections(users: MockUser[]): MockConnection[] {
  const connections: MockConnection[] = []
  for (let i = 0; i < 15; i++) {
    const u1 = Math.floor(Math.random() * users.length)
    let u2 = Math.floor(Math.random() * users.length)
    while (u2 === u1) u2 = Math.floor(Math.random() * users.length)
    connections.push({
      id: `co${i + 1}`,
      user1: `${users[u1].firstName} ${users[u1].lastName}`,
      user1Avatar: users[u1].avatar,
      user2: `${users[u2].firstName} ${users[u2].lastName}`,
      user2Avatar: users[u2].avatar,
      date: `2026-04-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
      phone1: `+33 6 ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)}`,
      phone2: `+33 6 ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)} ${String(Math.floor(Math.random() * 90) + 10)}`,
    })
  }
  return connections
}

function generateMockMoments(users: MockUser[]): MockMoment[] {
  const captions = [
    "Sunset à Paris 🌅", "Brunch du dimanche 🥐", "Moi aujourd'hui ✨",
    "Vibes positives 🌈", "Soirée entre amis 🎉", "Mon chat est trop mignon 🐱",
    "Workout done 💪", "Nouveau look 🔥", "La vie est belle 💕",
    "Road trip ! 🚗",
  ]
  const statuses: MockMoment['status'][] = ['Actif', 'Expiré', 'Signalé']
  const moments: MockMoment[] = []
  for (let i = 0; i < 10; i++) {
    const u = users[Math.floor(Math.random() * users.length)]
    moments.push({
      id: `m${i + 1}`,
      user: `${u.firstName} ${u.lastName}`,
      userAvatar: u.avatar,
      thumbnail: `https://picsum.photos/300/400?random=${i + 1}`,
      caption: captions[i],
      status: i < 6 ? 'Actif' : i < 8 ? 'Expiré' : 'Signalé',
      date: `2026-05-0${Math.floor(Math.random() * 4) + 1}`,
      likes: Math.floor(Math.random() * 200),
      comments: Math.floor(Math.random() * 50),
    })
  }
  return moments
}

function generateMockReports(users: MockUser[]): MockReport[] {
  const reasons = [
    "Comportement inapproprié", "Spam / Publicité", "Faux profil",
    "Harcèlement", "Contenu offensant", "Photos inappropriées",
    "Menaces", "Usurpation d'identité",
  ]
  const statuses: MockReport['status'][] = ['En cours', 'Résolu', 'Ignoré']
  const reports: MockReport[] = []
  for (let i = 0; i < 8; i++) {
    const rIdx = Math.floor(Math.random() * users.length)
    let tIdx = Math.floor(Math.random() * users.length)
    while (tIdx === rIdx) tIdx = Math.floor(Math.random() * users.length)
    reports.push({
      id: `rep${i + 1}`,
      reporter: `${users[rIdx].firstName} ${users[rIdx].lastName}`,
      reporterAvatar: users[rIdx].avatar,
      reported: `${users[tIdx].firstName} ${users[tIdx].lastName}`,
      reportedAvatar: users[tIdx].avatar,
      reason: reasons[i % reasons.length],
      date: `2026-04-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
      status: statuses[i % 3],
    })
  }
  return reports
}

function generateMockPremium(users: MockUser[]): MockPremium[] {
  const plans: MockPremium['plan'][] = ['Mensuel', 'Trimestriel', 'Annuel']
  const prices = { Mensuel: 9.99, Trimestriel: 24.99, Annuel: 79.99 }
  const premiumUsers = users.filter(u => u.premium).slice(0, 12)
  const premiums: MockPremium[] = premiumUsers.map((u, i) => {
    const plan = plans[i % 3]
    return {
      id: `p${i + 1}`,
      user: `${u.firstName} ${u.lastName}`,
      userAvatar: u.avatar,
      plan,
      price: prices[plan],
      startDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
      nextBilling: `2026-06-01`,
      status: i < 9 ? 'Actif' : i < 11 ? 'Expiré' : 'Annulé',
    }
  })
  return premiums
}

function generateChart30Days() {
  const data: any[] = []
  for (let i = 30; i >= 1; i--) {
    const day = 30 - i + 1
    data.push({
      name: `${String(day).padStart(2, '0')}/04`,
      inscriptions: Math.floor(Math.random() * 30) + 10,
      messages: Math.floor(Math.random() * 150) + 50,
      demandes: Math.floor(Math.random() * 40) + 15,
      connexions: Math.floor(Math.random() * 20) + 5,
    })
  }
  return data
}

// ============================================
// CHART COLORS
// ============================================
const CHART_COLORS = {
  primary: '#e11d48',
  rose: '#f43f5e',
  pink: '#ec4899',
  amber: '#f59e0b',
  emerald: '#10b981',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  orange: '#f97316',
}

const PIE_COLORS = ['#e11d48', '#8b5cf6', '#0ea5e9', '#f59e0b', '#10b981']

// ============================================
// STATUS BADGE HELPER
// ============================================
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { bg: string; text: string }> = {
    'Actif': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    'Acceptée': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    'Résolu': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    'En attente': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    'En cours': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    'Suspendu': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    'Refusée': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    'Banni': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    'Signalé': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    'Expiré': { bg: 'bg-gray-100 dark:bg-gray-800/30', text: 'text-gray-500 dark:text-gray-400' },
    'Ignoré': { bg: 'bg-gray-100 dark:bg-gray-800/30', text: 'text-gray-500 dark:text-gray-400' },
    'Annulé': { bg: 'bg-gray-100 dark:bg-gray-800/30', text: 'text-gray-500 dark:text-gray-400' },
  }
  const v = variants[status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', v.bg, v.text)}>
      {status}
    </span>
  )
}

function PremiumBadge({ isPremium }: { isPremium: boolean }) {
  if (!isPremium) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
      <Crown className="size-3" /> Premium
    </span>
  )
}

// ============================================
// SIDEBAR NAV ITEMS
// ============================================
const NAV_ITEMS: { key: PageKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'requests', label: 'Demandes de numéro', icon: Phone },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'connections', label: 'Connexions', icon: Link2 },
  { key: 'moments', label: 'Moments', icon: Camera },
  { key: 'reports', label: 'Signalements', icon: AlertTriangle },
  { key: 'premium', label: 'Premium', icon: Crown },
  { key: 'notifications', label: 'Notifications Push', icon: Bell },
  { key: 'settings', label: 'Configuration', icon: Settings },
  { key: 'gamification', label: 'Gamification', icon: Trophy },
]

// ============================================
// PAGE: VUE D'ENSEMBLE
// ============================================
function OverviewPage({
  users, requests, chartData, connections, premiumSubs
}: {
  users: MockUser[]
  requests: MockRequest[]
  chartData: ReturnType<typeof generateChart30Days>
  connections: MockConnection[]
  premiumSubs: MockPremium[]
}) {
  const activeUsers = users.filter(u => u.status === 'Actif').length
  const todayRequests = requests.filter(r => r.status === 'En attente').length
  const acceptedRequests = requests.filter(r => r.status === 'Acceptée').length
  const acceptanceRate = requests.length > 0 ? Math.round((acceptedRequests / requests.length) * 100) : 0
  const premiumRevenue = premiumSubs.filter(p => p.status === 'Actif').reduce((a, b) => a + b.price, 0)
  const monthlyConnections = connections.length

  const requestByStatus = [
    { name: 'En attente', value: requests.filter(r => r.status === 'En attente').length, color: CHART_COLORS.amber },
    { name: 'Acceptée', value: requests.filter(r => r.status === 'Acceptée').length, color: CHART_COLORS.emerald },
    { name: 'Refusée', value: requests.filter(r => r.status === 'Refusée').length, color: CHART_COLORS.primary },
  ]

  const premiumVsFree = [
    { name: 'Premium', value: users.filter(u => u.premium).length, color: CHART_COLORS.amber },
    { name: 'Gratuit', value: users.filter(u => !u.premium).length, color: CHART_COLORS.sky },
  ]

  const recentActivity = [
    { icon: Users, text: 'Nouvel utilisateur : Emma Dubois', time: 'il y a 5 min', color: 'text-blue-500' },
    { icon: Phone, text: 'Demande acceptée : Lucas → Chloé', time: 'il y a 12 min', color: 'text-emerald-500' },
    { icon: AlertTriangle, text: 'Signalement : profil #1042', time: 'il y a 25 min', color: 'text-amber-500' },
    { icon: Crown, text: 'Nouvel abonnement Premium (Annuel)', time: 'il y a 32 min', color: 'text-amber-500' },
    { icon: Camera, text: 'Moment signalé : Arthur M.', time: 'il y a 45 min', color: 'text-red-500' },
    { icon: Link2, text: 'Nouvelle connexion : Léo ↔ Inès', time: 'il y a 1h', color: 'text-violet-500' },
    { icon: Phone, text: 'Demande refusée : Nathan → Rose', time: 'il y a 1h30', color: 'text-red-400' },
    { icon: Users, text: 'Compte suspendu : spam#887', time: 'il y a 2h', color: 'text-orange-500' },
    { icon: Shield, text: 'Vérification approuvée : Manon L.', time: 'il y a 2h15', color: 'text-emerald-500' },
    { icon: MessageCircle, text: 'Conversation expirée : #conv-2244', time: 'il y a 3h', color: 'text-gray-500' },
  ]

  const kpis = [
    { label: 'Total utilisateurs', value: users.length.toLocaleString('fr-FR'), icon: Users, trend: '+12%', up: true, color: 'from-blue-500 to-blue-600' },
    { label: 'Utilisateurs actifs', value: activeUsers.toLocaleString('fr-FR'), icon: Activity, trend: '+8%', up: true, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Demandes aujourd\'hui', value: todayRequests.toString(), icon: Phone, trend: '+24%', up: true, color: 'from-rose-500 to-pink-600' },
    { label: 'Taux d\'acceptation', value: `${acceptanceRate}%`, icon: TrendingUp, trend: '+3%', up: true, color: 'from-violet-500 to-purple-600' },
    { label: 'Revenus Premium', value: `${premiumRevenue.toFixed(0)}€`, icon: DollarSign, trend: '+18%', up: true, color: 'from-amber-500 to-orange-600' },
    { label: 'Connexions ce mois', value: monthlyConnections.toString(), icon: Link2, trend: '+5%', up: true, color: 'from-cyan-500 to-teal-600' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', kpi.color)} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br', kpi.color)}>
                    <kpi.icon className="size-4 text-white" />
                  </div>
                  <div className={cn('flex items-center gap-0.5 text-xs font-medium', kpi.up ? 'text-emerald-600' : 'text-red-500')}>
                    {kpi.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {kpi.trend}
                  </div>
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inscriptions sur 30 jours</CardTitle>
            <CardDescription>Évolution des nouveaux utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                  <Line type="monotone" dataKey="inscriptions" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={false} name="Inscriptions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition Premium vs Gratuit</CardTitle>
            <CardDescription>Types d'abonnement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={premiumVsFree} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {premiumVsFree.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Demandes par statut</CardTitle>
            <CardDescription>Répartition des demandes de numéro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                  <Bar dataKey="value" name="Demandes" radius={[6, 6, 0, 0]}>
                    {requestByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activité quotidienne</CardTitle>
            <CardDescription>Messages, demandes et connexions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="messages" stackId="1" stroke={CHART_COLORS.sky} fill={CHART_COLORS.sky} fillOpacity={0.3} name="Messages" />
                  <Area type="monotone" dataKey="demandes" stackId="2" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.3} name="Demandes" />
                  <Area type="monotone" dataKey="connexions" stackId="3" stroke={CHART_COLORS.emerald} fill={CHART_COLORS.emerald} fillOpacity={0.3} name="Connexions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activité récente</CardTitle>
          <CardDescription>Dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={cn('flex items-center justify-center h-8 w-8 rounded-full bg-muted', activity.color)}>
                  <activity.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.text}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// PAGE: UTILISATEURS
// ============================================
function UsersPage({
  users,
  currentUser,
  onRoleChange
}: {
  users: MockUser[]
  currentUser: any
  onRoleChange: (targetUserId: string, newRole: 'user' | 'admin') => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPremium, setFilterPremium] = useState<string>('all')
  const [filterGender, setFilterGender] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || u.status === filterStatus
      const matchPremium = filterPremium === 'all' || (filterPremium === 'premium' ? u.premium : !u.premium)
      const matchGender = filterGender === 'all' || u.gender === filterGender
      return matchSearch && matchStatus && matchPremium && matchGender
    })
  }, [users, search, filterStatus, filterPremium, filterGender])

  const totalActive = users.filter(u => u.status === 'Actif').length
  const totalPremium = users.filter(u => u.premium).length
  const totalVerified = users.filter(u => u.verified).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: users.length, icon: Users, color: 'text-blue-500' },
          { label: 'Actifs', value: totalActive, icon: Activity, color: 'text-emerald-500' },
          { label: 'Premium', value: totalPremium, icon: Crown, color: 'text-amber-500' },
          { label: 'Vérifiés', value: totalVerified, icon: Shield, color: 'text-violet-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-base" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Suspendu">Suspendu</SelectItem>
                <SelectItem value="Banni">Banni</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPremium} onValueChange={setFilterPremium}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Premium" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Genre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="Homme">Homme</SelectItem>
                <SelectItem value="Femme">Femme</SelectItem>
                <SelectItem value="Non-binaire">Non-binaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 20).map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => { setSelectedUser(user); setShowDetail(true) }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.gender}</TableCell>
                    <TableCell className="text-sm">{user.age}</TableCell>
                    <TableCell className="text-sm">{user.city}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={user.score} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{user.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'super_admin' ? (
                        <Badge className="bg-rose-500 text-white font-bold text-[10px]">Super Admin</Badge>
                      ) : user.role === 'admin' ? (
                        <Badge className="bg-indigo-500 text-white font-bold text-[10px]">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">User</Badge>
                      )}
                    </TableCell>
                    <TableCell><PremiumBadge isPremium={user.premium} /></TableCell>
                    <TableCell>
                      {user.verified ? <CheckCircle className="size-4 text-emerald-500" /> : <XCircle className="size-4 text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell><StatusBadge status={user.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowDetail(true) }}><Eye className="mr-2 size-4" /> Voir</DropdownMenuItem>
                          
                          {/* Secure Admin promotion/demotion strictly for Super Admin */}
                          {(currentUser.role === 'super_admin' || currentUser.email === 'fabricewilliam73@gmail.com') && user.role !== 'super_admin' && (
                            user.role === 'admin' ? (
                              <DropdownMenuItem 
                                className="text-orange-600 font-bold" 
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await onRoleChange(user.id, 'user')
                                }}
                              >
                                <UserX className="mr-2 size-4" /> Rétrograder en Utilisateur
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-indigo-600 font-bold" 
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await onRoleChange(user.id, 'admin')
                                }}
                              >
                                <UserCheck className="mr-2 size-4" /> Promouvoir Admin
                              </DropdownMenuItem>
                            )
                          )}
                          
                          <DropdownMenuItem><Shield className="mr-2 size-4" /> Vérifier</DropdownMenuItem>
                          <DropdownMenuItem><Ban className="mr-2 size-4" /> Suspendre</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 size-4" /> Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length > 20 && (
            <div className="p-3 text-center text-sm text-muted-foreground border-t">
              Affichage de 20 sur {filtered.length} utilisateurs
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-border/50">
        <DialogTitle className="sr-only">Profil de {selectedUser?.firstName || 'Utilisateur'}</DialogTitle>
        <DialogDescription className="sr-only">Détails du profil utilisateur pour l'administration</DialogDescription>
          {selectedUser && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedUser.firstName} {selectedUser.lastName}</div>
                    <div className="text-sm text-muted-foreground font-normal">{selectedUser.email}</div>
                  </div>
                </DialogTitle>
                <DialogDescription><VisuallyHidden>Détails du profil utilisateur</VisuallyHidden></DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4 p-6 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Genre</div><div className="font-medium">{selectedUser.gender}</div></div>
                  <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Âge</div><div className="font-medium">{selectedUser.age} ans</div></div>
                  <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Ville</div><div className="font-medium">{selectedUser.city}</div></div>
                  <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Score</div><div className="font-medium">{selectedUser.score}%</div></div>
                  <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Inscription</div><div className="font-medium">{selectedUser.inscription}</div></div>
                  <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Dernière activité</div><div className="font-medium">{selectedUser.lastActive}</div></div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={selectedUser.status} />
                  <PremiumBadge isPremium={selectedUser.premium} />
                  {selectedUser.verified && <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="size-3" /> Vérifié</span>}
                  {selectedUser.role === 'super_admin' ? (
                    <Badge className="bg-rose-500 text-white font-bold text-xs">Super Admin</Badge>
                  ) : selectedUser.role === 'admin' ? (
                    <Badge className="bg-indigo-500 text-white font-bold text-xs">Admin</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">User</Badge>
                  )}
                </div>
              </div>
              <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 p-6">
                <div className="flex items-center gap-2">
                  {/* Super admin promote/demote button inside dialog */}
                  {(currentUser.role === 'super_admin' || currentUser.email === 'fabricewilliam73@gmail.com') && selectedUser.role !== 'super_admin' && (
                    selectedUser.role === 'admin' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-bold"
                        onClick={async () => {
                          await onRoleChange(selectedUser.id, 'user')
                          setSelectedUser({ ...selectedUser, role: 'user' })
                        }}
                      >
                        <UserX className="mr-2 size-4" /> Rétrograder
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 font-bold"
                        onClick={async () => {
                          await onRoleChange(selectedUser.id, 'admin')
                          setSelectedUser({ ...selectedUser, role: 'admin' })
                        }}
                      >
                        <UserCheck className="mr-2 size-4" /> Promouvoir Admin
                      </Button>
                    )
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"><Shield className="mr-2 size-4" /> Vérifier</Button>
                  <Button variant="outline" size="sm"><Ban className="mr-2 size-4" /> Suspendre</Button>
                  <Button variant="destructive" size="sm"><Trash2 className="mr-2 size-4" /> Supprimer</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PAGE: DEMANDES DE NUMÉRO
// ============================================
function RequestsPage({ requests }: { requests: MockRequest[] }) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<MockRequest | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus)
  const pending = requests.filter(r => r.status === 'En attente').length
  const accepted = requests.filter(r => r.status === 'Acceptée').length
  const acceptanceRate = requests.length > 0 ? Math.round((accepted / requests.length) * 100) : 0
  const avgResponseTime = '4h 32min'

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total demandes', value: requests.length, icon: Phone, color: 'text-rose-500' },
          { label: 'En attente', value: pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Taux d\'acceptation', value: `${acceptanceRate}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Temps moyen', value: avgResponseTime, icon: Timer, color: 'text-violet-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="En attente">En attente</SelectItem>
            <SelectItem value="Acceptée">Acceptée</SelectItem>
            <SelectItem value="Refusée">Refusée</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} résultats</Badge>
      </div>

      {/* Table */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expéditeur</TableHead>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Super</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => { setSelectedRequest(req); setShowDetail(true) }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={req.senderAvatar} /><AvatarFallback>{req.sender[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{req.sender}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={req.receiverAvatar} /><AvatarFallback>{req.receiver[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{req.receiver}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{req.message}</TableCell>
                    <TableCell>{req.isSuper ? <Star className="size-4 text-amber-500" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell><StatusBadge status={req.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{req.date}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 size-4" /> Détail</DropdownMenuItem>
                          <DropdownMenuItem><Check className="mr-2 size-4" /> Accepter</DropdownMenuItem>
                          <DropdownMenuItem><X className="mr-2 size-4" /> Refuser</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-3xl p-0 overflow-hidden rounded-2xl border-border/50">
        <DialogTitle className="sr-only">Détail de la connexion</DialogTitle>
        <DialogDescription className="sr-only">Historique et détails de la mise en relation</DialogDescription>
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Détail de la demande</DialogTitle>
                <DialogDescription>{selectedRequest.sender} → {selectedRequest.receiver}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-4 justify-center">
                  <div className="text-center">
                    <Avatar className="h-14 w-14 mx-auto mb-1"><AvatarImage src={selectedRequest.senderAvatar} /></Avatar>
                    <span className="text-sm font-medium">{selectedRequest.sender}</span>
                  </div>
                  <ArrowLeft className="size-5 text-muted-foreground rotate-180" />
                  <div className="text-center">
                    <Avatar className="h-14 w-14 mx-auto mb-1"><AvatarImage src={selectedRequest.receiverAvatar} /></Avatar>
                    <span className="text-sm font-medium">{selectedRequest.receiver}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs text-muted-foreground mb-1">Message</div>
                  <div className="text-sm">{selectedRequest.message}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2"><div className="text-xs text-muted-foreground">Super</div><div className="font-medium">{selectedRequest.isSuper ? '⭐ Oui' : 'Non'}</div></div>
                  <div className="rounded-lg bg-muted p-2"><div className="text-xs text-muted-foreground">Statut</div><div><StatusBadge status={selectedRequest.status} /></div></div>
                  <div className="rounded-lg bg-muted p-2"><div className="text-xs text-muted-foreground">Date</div><div className="font-medium text-sm">{selectedRequest.date}</div></div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PAGE: MESSAGES
// ============================================
function MessagesPage({ conversations }: { conversations: MockConversation[] }) {
  const [search, setSearch] = useState('')
  const [selectedConv, setSelectedConv] = useState<MockConversation | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  
  const totalMessages = conversations.reduce((a, c) => a + c.messages, 0)
  const todayMessages = Math.floor(totalMessages * 0.15)
  const avgPerConv = conversations.length > 0 ? Math.round(totalMessages / conversations.length) : 0
  const preNumberConv = conversations.filter(c => c.preNumber).length
  const expiredMessages = 7

  const filtered = conversations.filter(c =>
    `${c.user1} ${c.user2}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total messages', value: totalMessages.toLocaleString('fr-FR'), icon: MessageCircle, color: 'text-rose-500' },
          { label: "Aujourd'hui", value: todayMessages.toString(), icon: Zap, color: 'text-amber-500' },
          { label: 'Moy. / conversation', value: avgPerConv.toString(), icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Pré-numéro', value: preNumberConv.toString(), icon: Clock, color: 'text-violet-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Rechercher une conversation..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 text-base" />
      </div>

      {/* Conversations Table */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur 1</TableHead>
                  <TableHead>Utilisateur 2</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Dernier message</TableHead>
                  <TableHead>Pré-numéro</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((conv) => (
                  <TableRow 
                    key={conv.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => { setSelectedConv(conv); setShowDetail(true) }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={conv.user1Avatar} /><AvatarFallback>{conv.user1[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{conv.user1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={conv.user2Avatar} /><AvatarFallback>{conv.user2[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{conv.user2}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{conv.messages}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{conv.lastMessage}</TableCell>
                    <TableCell>
                      {conv.preNumber
                        ? <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Clock className="size-3" /> 3 msg max</span>
                        : <span className="text-xs text-emerald-600">✓ Numéro échangé</span>
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{conv.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Expired Messages */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertOctagon className="size-4 text-amber-500" />
            Messages expirés
          </CardTitle>
          <CardDescription>Conversations dont le délai de réponse a expiré</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <div>
              <div className="text-2xl font-bold text-amber-600">{expiredMessages}</div>
              <div className="text-sm text-muted-foreground">Messages expirés cette semaine</div>
            </div>
            <Button variant="outline" size="sm"><RefreshCw className="mr-2 size-4" /> Relancer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 rounded-3xl border-0 shadow-2xl">
          {selectedConv && (
            <>
              <DialogHeader className="p-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="size-5" /> Conversation
                  </DialogTitle>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                    ID: {selectedConv.id}
                  </Badge>
                </div>
                <DialogDescription className="text-rose-100">
                  Détails des échanges entre {selectedConv.user1} et {selectedConv.user2}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center space-y-2">
                    <Avatar className="h-16 w-16 mx-auto ring-4 ring-rose-500/20">
                      <AvatarImage src={selectedConv.user1Avatar} />
                      <AvatarFallback>{selectedConv.user1[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{selectedConv.user1}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-px w-20 bg-muted-foreground/30 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2">
                        <Sparkles className="size-4 text-rose-500" />
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-4">{selectedConv.messages} messages</Badge>
                  </div>
                  <div className="text-center space-y-2">
                    <Avatar className="h-16 w-16 mx-auto ring-4 ring-rose-500/20">
                      <AvatarImage src={selectedConv.user2Avatar} />
                      <AvatarFallback>{selectedConv.user2[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{selectedConv.user2}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/50 border-0">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Dernier message</p>
                      <p className="text-sm italic">&quot;{selectedConv.lastMessage}&quot;</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50 border-0">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Statut du numéro</p>
                      <p className="text-sm font-medium">
                        {selectedConv.preNumber ? "⏳ En attente (Pré-numéro)" : "✅ Échangé"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="size-4 text-rose-500" /> Actions rapides
                  </h4>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl">Voir le profil de {selectedConv.user1}</Button>
                    <Button variant="outline" className="flex-1 rounded-xl">Voir le profil de {selectedConv.user2}</Button>
                  </div>
                  <Button variant="destructive" className="w-full rounded-xl" onClick={() => setShowDetail(false)}>
                    <Ban className="mr-2 size-4" /> Suspendre la conversation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PAGE: CONNEXIONS
// ============================================
function ConnectionsPage({ connections, chartData }: { connections: MockConnection[]; chartData: ReturnType<typeof generateChart30Days> }) {
  const [selectedConn, setSelectedConn] = useState<MockConnection | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const thisMonth = connections.length
  const growthRate = '+15%'
  const totalConnections = connections.length * 12 // simulated

  const connectionTrend = chartData.map(d => ({ name: d.name, connexions: d.connexions }))

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total connexions', value: totalConnections.toLocaleString('fr-FR'), icon: Link2, color: 'text-violet-500' },
          { label: 'Ce mois', value: thisMonth.toString(), icon: Calendar, color: 'text-rose-500' },
          { label: 'Taux de croissance', value: growthRate, icon: TrendingUp, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tendance des connexions</CardTitle>
          <CardDescription>Évolution sur 30 jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={connectionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                <Area type="monotone" dataKey="connexions" stroke={CHART_COLORS.violet} fill={CHART_COLORS.violet} fillOpacity={0.3} name="Connexions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Détail des connexions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur 1</TableHead>
                  <TableHead>Utilisateur 2</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Téléphone 1</TableHead>
                  <TableHead>Téléphone 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((conn) => (
                  <TableRow 
                    key={conn.id} 
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => { setSelectedConn(conn); setShowDetail(true) }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={conn.user1Avatar} /><AvatarFallback>{conn.user1[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{conn.user1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={conn.user2Avatar} /><AvatarFallback>{conn.user2[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{conn.user2}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{conn.date}</TableCell>
                    <TableCell className="text-sm font-mono">{conn.phone1}</TableCell>
                    <TableCell className="text-sm font-mono">{conn.phone2}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-md overflow-hidden p-0 rounded-3xl border-0 shadow-2xl">
          {selectedConn && (
            <>
              <DialogHeader className="p-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Link2 className="size-5" /> Connexion établie
                  </DialogTitle>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                    {selectedConn.date}
                  </Badge>
                </div>
                <DialogDescription className="text-violet-100">
                  Échange de coordonnées réussi
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border-0">
                  <div className="text-center space-y-1">
                    <Avatar className="h-12 w-12 mx-auto">
                      <AvatarImage src={selectedConn.user1Avatar} />
                      <AvatarFallback>{selectedConn.user1[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-bold">{selectedConn.user1}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{selectedConn.phone1}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <Check className="size-4 text-emerald-500" />
                  </div>
                  <div className="text-center space-y-1">
                    <Avatar className="h-12 w-12 mx-auto">
                      <AvatarImage src={selectedConn.user2Avatar} />
                      <AvatarFallback>{selectedConn.user2[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-bold">{selectedConn.user2}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{selectedConn.phone2}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Shield className="size-4 text-violet-500" /> Audit & Sécurité
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs p-2 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">ID Connexion</span>
                      <span className="font-mono">{selectedConn.id}</span>
                    </div>
                    <div className="flex justify-between text-xs p-2 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Méthode</span>
                      <span className="font-medium text-emerald-600">Consentement mutuel</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowDetail(false)}>Fermer</Button>
                  <Button className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700">Exporter log</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PAGE: MOMENTS
// ============================================
function MomentsPage({ moments }: { moments: MockMoment[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? moments : moments.filter(m => m.status === filter)
  const activeCount = moments.filter(m => m.status === 'Actif').length
  const reportedCount = moments.filter(m => m.status === 'Signalé').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Moments', value: moments.length, icon: Camera, color: 'text-rose-500' },
          { label: 'Actifs', value: activeCount, icon: Image, color: 'text-emerald-500' },
          { label: 'Signalés', value: reportedCount, icon: AlertTriangle, color: 'text-red-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'Actif', 'Expiré', 'Signalé'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tous' : f}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((moment, i) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow group">
              <div className="relative aspect-[3/4] bg-muted">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${moment.thumbnail})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={moment.status} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6"><AvatarImage src={moment.userAvatar} /><AvatarFallback>{moment.user[0]}</AvatarFallback></Avatar>
                    <span className="text-xs font-medium text-white">{moment.user}</span>
                  </div>
                  <p className="text-xs text-white/80 line-clamp-2">{moment.caption}</p>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="size-3" /> {moment.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {moment.comments}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-7 text-red-500 hover:text-red-600"><Trash2 className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-7 text-amber-500 hover:text-amber-600"><AlertTriangle className="size-3" /></Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{moment.date}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// PAGE: SIGNALEMENTS
// ============================================
function ReportsPage({ reports }: { reports: MockReport[] }) {
  const reportsTrend = [
    { name: 'Jan', signalements: 12 }, { name: 'Fév', signalements: 18 },
    { name: 'Mar', signalements: 15 }, { name: 'Avr', signalements: 22 },
    { name: 'Mai', signalements: reports.length },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total signalements', value: reports.length, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'En cours', value: reports.filter(r => r.status === 'En cours').length, icon: Clock, color: 'text-amber-500' },
          { label: 'Résolus', value: reports.filter(r => r.status === 'Résolu').length, icon: CheckCircle, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tendance des signalements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                <Bar dataKey="signalements" name="Signalements" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signalé par</TableHead>
                  <TableHead>Utilisateur signalé</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={report.reporterAvatar} /><AvatarFallback>{report.reporter[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{report.reporter}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={report.reportedAvatar} /><AvatarFallback>{report.reported[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{report.reported}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{report.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{report.date}</TableCell>
                    <TableCell><StatusBadge status={report.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><AlertOctagon className="mr-2 size-4" /> Avertissement</DropdownMenuItem>
                          <DropdownMenuItem><Ban className="mr-2 size-4" /> Suspension</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><XCircle className="mr-2 size-4" /> Ban définitif</DropdownMenuItem>
                          <DropdownMenuItem><Eye className="mr-2 size-4" /> Ignorer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// PAGE: PREMIUM
// ============================================
function PremiumPage({ premiumSubs, chartData }: { premiumSubs: MockPremium[]; chartData: ReturnType<typeof generateChart30Days> }) {
  const activePremiums = premiumSubs.filter(p => p.status === 'Actif')
  const monthlyRevenue = activePremiums.reduce((a, p) => a + p.price, 0)
  const conversionRate = 24 // simulated percentage

  const revenueData = [
    { name: 'Jan', revenus: 680 }, { name: 'Fév', revenus: 720 },
    { name: 'Mar', revenus: 790 }, { name: 'Avr', revenus: 850 },
    { name: 'Mai', revenus: monthlyRevenue },
  ]

  const featureUsage = [
    { name: 'Voir qui t\'aime', value: 85, color: CHART_COLORS.primary },
    { name: 'Boost quotidien', value: 62, color: CHART_COLORS.amber },
    { name: 'Mode incognito', value: 48, color: CHART_COLORS.violet },
    { name: 'Super demandes', value: 35, color: CHART_COLORS.sky },
    { name: 'Filtres avancés', value: 71, color: CHART_COLORS.emerald },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Abonnés Premium', value: activePremiums.length, icon: Crown, color: 'text-amber-500' },
          { label: 'Revenus mensuels', value: `${monthlyRevenue.toFixed(0)}€`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Taux de conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-violet-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenus sur 5 mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }} />
                  <Bar dataKey="revenus" name="Revenus (€)" fill={CHART_COLORS.amber} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Utilisation des fonctionnalités</CardTitle>
            <CardDescription>Pourcentage des abonnés Premium utilisant chaque fonctionnalité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsage.map((feature) => (
                <div key={feature.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{feature.name}</span>
                    <span className="font-medium">{feature.value}%</span>
                  </div>
                  <Progress value={feature.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card className="shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Abonnés Premium</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Prochaine facturation</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {premiumSubs.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={sub.userAvatar} /><AvatarFallback>{sub.user[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{sub.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.plan === 'Annuel' ? 'default' : 'secondary'}>{sub.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{sub.price.toFixed(2)}€</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sub.startDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sub.nextBilling}</TableCell>
                    <TableCell><StatusBadge status={sub.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// COMPONENT: PREMIUM CONFIGS TABLE
// ============================================
function PremiumConfigsTable({ currentUserId }: { currentUserId: string }) {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/credits/active-features/configs')
      if (res.ok) {
        const data = await res.json()
        setConfigs(data.configs)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  const handleSave = async (action: string, updates: any) => {
    setSaving(action)
    try {
      const res = await fetch('/api/credits/active-features/configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...updates, requesterId: currentUserId }),
      })
      if (res.ok) {
        await loadConfigs() // Reload to reflect changes
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="p-4 text-center">Chargement des configurations...</div>

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Crown className="size-5" /> Fonctionnalités Premium (ConnectCoins)</CardTitle>
        <CardDescription>Configurer les coûts (CC) et durées (minutes) des actions premium.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonctionnalité</TableHead>
                <TableHead>Durée (min)</TableHead>
                <TableHead>Coût (CC)</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((c) => (
                <TableRow key={c.action} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.emoji}</span>
                      <div>
                        <div className="text-sm font-bold">{c.label}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{c.action}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue={c.durationMinutes} 
                      className="w-24 h-8"
                      onBlur={(e) => handleSave(c.action, { durationMinutes: parseInt(e.target.value) || 0 })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue={c.costCC} 
                      className="w-20 h-8"
                      onBlur={(e) => handleSave(c.action, { costCC: parseInt(e.target.value) || 0 })}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={c.isEnabled} 
                      onCheckedChange={(val) => handleSave(c.action, { isEnabled: val })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {saving === c.action ? (
                      <RefreshCw className="size-4 animate-spin ml-auto text-muted-foreground" />
                    ) : (
                      <CheckCircle className="size-4 ml-auto text-emerald-500 opacity-0 transition-opacity" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PAGE: CONFIGURATION
// ============================================
function SettingsPage({ currentUserId }: { currentUserId: string }) {
  const { config, setConfig } = useAppStore()
  const [appName, setAppName] = useState('Fonelove')
  const [appDesc, setAppDesc] = useState('La dating app où le numéro est la destination')
  const [contactEmail, setContactEmail] = useState('support@connectphone.fr')
  const [openSignups, setOpenSignups] = useState(true)
  const [preNumberLimit, setPreNumberLimit] = useState('3')
  const [momentsDuration, setMomentsDuration] = useState('24')
  const [boostsDuration, setBoostsDuration] = useState('30')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [reportNotif, setReportNotif] = useState(true)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* App Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="size-5" /> Paramètres de l'application</CardTitle>
          <CardDescription>Informations générales de l'application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Nom de l'app</Label>
            <Input id="appName" value={appName} onChange={e => setAppName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appDesc">Description</Label>
            <Textarea id="appDesc" value={appDesc} onChange={e => setAppDesc(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email de contact</Label>
            <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
          </div>
          <Button className="bg-rose-600 hover:bg-rose-700">Sauvegarder</Button>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ToggleRight className="size-5" /> Fonctionnalités</CardTitle>
          <CardDescription>Activer ou désactiver les fonctionnalités</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Inscriptions ouvertes</div>
              <div className="text-xs text-muted-foreground">Permettre les nouvelles inscriptions</div>
            </div>
            <Switch checked={openSignups} onCheckedChange={setOpenSignups} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Vérification obligatoire</div>
              <div className="text-xs text-muted-foreground">Exiger la vérification du numéro de téléphone par SMS</div>
            </div>
            <Switch 
              checked={config.requirePhoneVerification} 
              onCheckedChange={(val) => setConfig({ requirePhoneVerification: val })} 
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Limite de messages pré-numéro</Label>
            <Select value={preNumberLimit} onValueChange={setPreNumberLimit}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 message</SelectItem>
                <SelectItem value="2">2 messages</SelectItem>
                <SelectItem value="3">3 messages</SelectItem>
                <SelectItem value="5">5 messages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Durée des Moments (heures)</Label>
            <Select value={momentsDuration} onValueChange={setMomentsDuration}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 heures</SelectItem>
                <SelectItem value="24">24 heures</SelectItem>
                <SelectItem value="48">48 heures</SelectItem>
                <SelectItem value="72">72 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Durée des boosters (minutes)</Label>
            <Select value={boostsDuration} onValueChange={setBoostsDuration}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* FoneLove Economy */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift className="size-5" /> Économie FoneLove</CardTitle>
          <CardDescription>Paramètres de la monnaie FoneLove</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Commission (en %)</Label>
            <Input type="number" defaultValue="40" min="0" max="100" />
            <p className="text-xs text-muted-foreground">La plateforme prend 40% sur les FoneLove retirés</p>
          </div>
          <div className="space-y-2">
            <Label>Valeur de retrait (en € par FoneLove)</Label>
            <Input type="number" step="0.01" defaultValue="0.30" min="0" />
          </div>
          <div className="space-y-2">
            <Label>Seuil minimum de retrait (FoneLove)</Label>
            <Input type="number" defaultValue="10" min="1" />
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">Sauvegarder FoneLove</Button>
        </CardContent>
      </Card>

      {/* Packs Configurations (CC & FoneLove) */}
      <PacksConfigTable />

      {/* Premium Actions Configuration */}
      <PremiumConfigsTable currentUserId={currentUserId} />

      {/* Notification Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="size-5" /> Notifications</CardTitle>
          <CardDescription>Paramètres de notification administrateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Notifications email</div>
              <div className="text-xs text-muted-foreground">Recevoir les alertes par email</div>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Notifications push</div>
              <div className="text-xs text-muted-foreground">Notifications navigateur en temps réel</div>
            </div>
            <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Alerte signalement</div>
              <div className="text-xs text-muted-foreground">Notification immédiate pour chaque signalement</div>
            </div>
            <Switch checked={reportNotif} onCheckedChange={setReportNotif} />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="size-5" /> Clés API</CardTitle>
          <CardDescription>Gestion des clés d'API pour les intégrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'Clé de production', key: 'cp_prod_****7f2a' },
            { name: 'Clé de test', key: 'cp_test_****3b1c' },
            { name: 'Webhook secret', key: 'whsec_****9d4e' },
          ].map((apiKey) => (
            <div key={apiKey.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <div className="text-sm font-medium">{apiKey.name}</div>
                <div className="text-xs font-mono text-muted-foreground">{apiKey.key}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-8"><Copy className="size-4" /></Button>
                <Button variant="ghost" size="icon" className="size-8"><RefreshCw className="size-4" /></Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm"><Plus className="mr-2 size-4" /> Ajouter une clé</Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// PAGE: NOTIFICATIONS PUSH
// ============================================
interface CampaignItem {
  id: string
  title: string
  body: string
  imageUrl: string | null
  type: string
  targetAudience: string
  status: string
  totalSent: number
  totalDelivered: number
  totalClicked: number
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
}

function NotificationsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formType, setFormType] = useState('info')
  const [formTarget, setFormTarget] = useState('all')
  const [formUrl, setFormUrl] = useState('/')
  const [formImage, setFormImage] = useState<string | null>(null)
  const [formTag, setFormTag] = useState('')
  const [formSendNow, setFormSendNow] = useState(true)

  // Stats
  const [totalSubs, setTotalSubs] = useState(0)
  const [totalSent, setTotalSent] = useState(0)
  const [totalDelivered, setTotalDelivered] = useState(0)

  // Load campaigns
  const loadCampaigns = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications/campaigns')
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.campaigns || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          body: c.body,
          imageUrl: c.image_url,
          type: c.type,
          targetAudience: c.target_audience,
          status: c.status,
          totalSent: c.total_sent || 0,
          totalDelivered: c.total_delivered || 0,
          totalClicked: c.total_clicked || 0,
          scheduledAt: c.scheduled_at,
          sentAt: c.sent_at,
          createdAt: c.created_at,
        }))
        setCampaigns(mapped)
        setTotalSent(mapped.reduce((acc: number, c: CampaignItem) => acc + c.totalSent, 0))
        setTotalDelivered(mapped.reduce((acc: number, c: CampaignItem) => acc + c.totalDelivered, 0))
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err)
    }
    setIsLoading(false)
  }

  // Load subscription count
  const loadSubCount = async () => {
    try {
      const res = await fetch('/api/notifications/campaigns?count=subs')
      if (res.ok) {
        const data = await res.json()
        if (data.totalSubs !== undefined) setTotalSubs(data.totalSubs)
      }
    } catch {}
  }

  useEffect(() => {
    loadCampaigns()
    loadSubCount()
  }, [])

  // Upload image to ImgBB
  const uploadImage = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=9b7dd23efd95fbb3a3232e70b094d810`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setFormImage(data.data.url)
      }
    } catch (err) {
      console.error('Image upload failed:', err)
    }
    setUploading(false)
  }

  // Create & send campaign
  const handleCreateCampaign = async () => {
    if (!formTitle || !formBody) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          body: formBody,
          type: formType,
          targetAudience: formTarget,
          url: formUrl,
          imageUrl: formImage,
          tag: formTag || null,
          sendNow: formSendNow,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setShowCreateDialog(false)
        resetForm()
        await loadCampaigns()
      }
    } catch (err) {
      console.error('Campaign creation failed:', err)
    }
    setIsLoading(false)
  }

  // Send existing campaign
  const handleSendCampaign = async (campaignId: string) => {
    setSendingCampaign(campaignId)
    try {
      // Send via our server-side API route (keeps secrets secure)
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_campaign', campaignId }),
      })

      await loadCampaigns()
    } catch (err) {
      console.error('Send campaign failed:', err)
    }
    setSendingCampaign(null)
  }

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await fetch(`/api/notifications/campaigns?id=${campaignId}`, { method: 'DELETE' })
      await loadCampaigns()
    } catch (err) {
      console.error('Delete campaign failed:', err)
    }
  }

  const resetForm = () => {
    setFormTitle('')
    setFormBody('')
    setFormType('info')
    setFormTarget('all')
    setFormUrl('/')
    setFormImage(null)
    setFormTag('')
    setFormSendNow(true)
  }

  const typeLabels: Record<string, { label: string; color: string }> = {
    info: { label: 'Info', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    marketing: { label: 'Marketing', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    alert: { label: 'Alerte', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    match: { label: 'Match', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
    message: { label: 'Message', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
    request: { label: 'Demande', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400' },
    scheduled: { label: 'Planifiée', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    sending: { label: 'Envoi...', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    sent: { label: 'Envoyée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    failed: { label: 'Échouée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }

  const targetLabels: Record<string, string> = {
    all: 'Tous les utilisateurs',
    premium: 'Premium uniquement',
    free: 'Gratuits uniquement',
    new_users: 'Nouveaux (7 jours)',
    inactive: 'Inactifs (14+ jours)',
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Abonnés push', value: totalSubs, icon: Smartphone, color: 'text-blue-500' },
          { label: 'Campagnes', value: campaigns.length, icon: Bell, color: 'text-rose-500' },
          { label: 'Total envoyés', value: totalSent, icon: Zap, color: 'text-amber-500' },
          { label: 'Délivrés', value: totalDelivered, icon: Check, color: 'text-emerald-500' },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-md">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={cn('size-8', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Campagnes de notification</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCampaigns}>
            <RefreshCw className="mr-2 size-4" /> Actualiser
          </Button>
          <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 size-4" /> Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="p-0">
          {isLoading && campaigns.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="mx-auto mb-3 size-10 opacity-20" />
              <p>Aucune campagne de notification</p>
              <p className="text-sm mt-1">Créez votre première campagne pour envoyer des notifications push</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Envoyés</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{campaign.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{campaign.body}</div>
                          {campaign.imageUrl && (
                            <div className="mt-1">
                              <img src={campaign.imageUrl} alt="" className="h-8 w-12 rounded object-cover" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', typeLabels[campaign.type]?.color || typeLabels.info.color)}>
                          {typeLabels[campaign.type]?.label || campaign.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{targetLabels[campaign.targetAudience] || campaign.targetAudience}</TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusLabels[campaign.status]?.color || statusLabels.draft.color)}>
                          {statusLabels[campaign.status]?.label || campaign.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{campaign.totalSent}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(campaign.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {campaign.status === 'draft' && (
                            <Button size="sm" variant="outline" onClick={() => handleSendCampaign(campaign.id)} disabled={sendingCampaign === campaign.id}>
                              {sendingCampaign === campaign.id ? <RefreshCw className="mr-1 size-3 animate-spin" /> : <Zap className="mr-1 size-3" />}
                              Envoyer
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteCampaign(campaign.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="size-5" /> Nouvelle campagne de notification
            </DialogTitle>
            <DialogDescription>Créez et envoyez une notification push aux utilisateurs</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Quick Templates */}
            <div className="space-y-2">
              <Label className="text-xs text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="size-3" /> Modèles de notification accrocheurs (clic pour remplir)
              </Label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                {[
                  {
                    label: '💕 Retrouvailles',
                    title: 'Tu nous manques ! 💕',
                    body: 'Quelqu\'un a visité ton profil aujourd\'hui. Viens voir de qui il s\'agit !',
                    type: 'marketing',
                    target: 'inactive',
                    url: '/',
                    tag: 'retention-inactif'
                  },
                  {
                    label: '🔥 Série',
                    title: '🔥 Série en danger !',
                    body: 'N\'oublie pas de réclamer tes ConnectCoins gratuits aujourd\'hui pour garder ton bonus !',
                    type: 'alert',
                    target: 'all',
                    url: '/',
                    tag: 'streak-saver'
                  },
                  {
                    label: '👀 J\'aime',
                    title: '👀 Nouveau J\'aime !',
                    body: 'Une nouvelle personne a flashé sur ton profil ! Ouvre vite pour la découvrir.',
                    type: 'match',
                    target: 'free',
                    url: '/',
                    tag: 'like-alert'
                  },
                  {
                    label: '🎁 FoneLove',
                    title: '🎁 FoneLove en attente !',
                    body: 'Les cadeaux FoneLove pleuvent en ce moment ! Ouvre ton coffre pour voir tes pièces reçues.',
                    type: 'marketing',
                    target: 'all',
                    url: '/?tab=messages',
                    tag: 'gifting-marketing'
                  },
                  {
                    label: '👑 Premium 50%',
                    title: '👑 Offre Premium flash !',
                    body: 'Profite de 50% de réduction sur ton abonnement FoneLove aujourd\'hui uniquement !',
                    type: 'marketing',
                    target: 'free',
                    url: '/?tab=profile',
                    tag: 'promo-flash'
                  }
                ].map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setFormTitle(tpl.title)
                      setFormBody(tpl.body)
                      setFormType(tpl.type)
                      setFormTarget(tpl.target)
                      setFormUrl(tpl.url)
                      setFormTag(tpl.tag)
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input placeholder="Ex: Nouvelle fonctionnalité !" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea placeholder="Décrivez votre notification..." value={formBody} onChange={e => setFormBody(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="alert">Alerte</SelectItem>
                    <SelectItem value="match">Match</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="request">Demande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Audience cible</Label>
                <Select value={formTarget} onValueChange={setFormTarget}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="free">Gratuits</SelectItem>
                    <SelectItem value="new_users">Nouveaux (7j)</SelectItem>
                    <SelectItem value="inactive">Inactifs (14j+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL de redirection</Label>
              <Input placeholder="/" value={formUrl} onChange={e => setFormUrl(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tag (groupe)</Label>
              <Input placeholder="Ex: promo-été" value={formTag} onChange={e => setFormTag(e.target.value)} />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image jointe</Label>
              {formImage ? (
                <div className="relative rounded-lg overflow-hidden border">
                  <img src={formImage} alt="Notification" className="w-full h-32 object-cover" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setFormImage(null)}>
                    <X className="size-3" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) await uploadImage(file)
                    }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <RefreshCw className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Format: JPG, PNG, WebP. Max 5MB. Hébergée via ImgBB.</p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <div className="font-medium text-sm">Envoyer immédiatement</div>
                <div className="text-xs text-muted-foreground">Sinon, la campagne sera enregistrée comme brouillon</div>
              </div>
              <Switch checked={formSendNow} onCheckedChange={setFormSendNow} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm() }}>Annuler</Button>
            <Button onClick={handleCreateCampaign} disabled={!formTitle || !formBody || isLoading} className="bg-rose-600 hover:bg-rose-700">
              {isLoading ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Zap className="mr-2 size-4" />}
              {formSendNow ? 'Créer et envoyer' : 'Créer comme brouillon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// PAGE: GAMIFICATION
// ============================================
function GamificationPage() {
  const [badges, setBadges] = useState([
    { id: 'b1', name: 'Vérifié', icon: '✅', description: 'Profil vérifié', condition: 'Vérification du numéro', active: true },
    { id: 'b2', name: 'Populaire', icon: '🔥', description: 'Très demandé', condition: '50+ demandes reçues', active: true },
    { id: 'b3', name: 'Réponse rapide', icon: '⚡', description: 'Répond vite aux demandes', condition: 'Moyenne < 1h', active: true },
    { id: 'b4', name: 'Fidèle', icon: '💎', description: 'Membre depuis longtemps', condition: '6+ mois d\'activité', active: true },
    { id: 'b5', name: 'Premium', icon: '👑', description: 'Abonné Premium', condition: 'Abonnement actif', active: true },
    { id: 'b6', name: 'Streak 5', icon: '🔥', description: '5 jours consécutifs', condition: 'Connexion 5 jours de suite', active: true },
    { id: 'b7', name: 'Sociable', icon: '🤝', description: 'Beaucoup de connexions', condition: '10+ connexions', active: false },
    { id: 'b8', name: 'Photogénique', icon: '📸', description: 'Profil avec de belles photos', condition: '3+ photos avec score élevé', active: false },
  ])

  const [streakResetTime, setStreakResetTime] = useState('04:00')
  const [streakReward, setStreakReward] = useState('boost')
  const [boostDuration, setBoostDuration] = useState('30')
  const [boostCooldown, setBoostCooldown] = useState('24')
  const [scoreWeights, setScoreWeights] = useState({
    photos: 30,
    verification: 20,
    activity: 25,
    connections: 15,
    streak: 10,
  })

  const [showBadgeDialog, setShowBadgeDialog] = useState(false)
  const [newBadgeName, setNewBadgeName] = useState('')
  const [newBadgeIcon, setNewBadgeIcon] = useState('')
  const [newBadgeDesc, setNewBadgeDesc] = useState('')
  const [newBadgeCondition, setNewBadgeCondition] = useState('')

  const handleAddBadge = () => {
    if (!newBadgeName || !newBadgeIcon) return
    setBadges([...badges, {
      id: `b${badges.length + 1}`,
      name: newBadgeName,
      icon: newBadgeIcon,
      description: newBadgeDesc,
      condition: newBadgeCondition,
      active: true,
    }])
    setShowBadgeDialog(false)
    setNewBadgeName('')
    setNewBadgeIcon('')
    setNewBadgeDesc('')
    setNewBadgeCondition('')
  }

  const totalWeight = Object.values(scoreWeights).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Badge Management */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Award className="size-5" /> Gestion des badges</CardTitle>
              <CardDescription>Créer et modifier les badges disponibles</CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowBadgeDialog(true)} className="bg-rose-600 hover:bg-rose-700">
              <Plus className="mr-2 size-4" /> Nouveau badge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'relative p-4 rounded-xl border transition-all hover:shadow-md',
                  badge.active ? 'bg-card' : 'bg-muted/50 opacity-60'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-7"><Edit className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-7 text-red-500"><Trash2 className="size-3" /></Button>
                  </div>
                </div>
                <div className="font-medium text-sm">{badge.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{badge.description}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Target className="size-3" /> {badge.condition}
                </div>
                <div className="absolute top-2 right-2">
                  <Switch checked={badge.active} onCheckedChange={(v) => {
                    setBadges(badges.map(b => b.id === badge.id ? { ...b, active: v } : b))
                  }} className="scale-75" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streak Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="size-5" /> Paramètres des streaks</CardTitle>
          <CardDescription>Configuration du système de streaks quotidiennes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure de réinitialisation</Label>
              <Input type="time" value={streakResetTime} onChange={e => setStreakResetTime(e.target.value)} />
              <p className="text-xs text-muted-foreground">Les streaks se réinitialisent à cette heure chaque jour</p>
            </div>
            <div className="space-y-2">
              <Label>Récompense de streak</Label>
              <Select value={streakReward} onValueChange={setStreakReward}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="boost">Booster gratuit</SelectItem>
                  <SelectItem value="super">Super demande gratuite</SelectItem>
                  <SelectItem value="badge">Badge exclusif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boost Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="size-5" /> Paramètres des boosters</CardTitle>
          <CardDescription>Configuration du système de boosters de visibilité</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Durée du booster (minutes)</Label>
              <Select value={boostDuration} onValueChange={setBoostDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temps de recharge (heures)</Label>
              <Select value={boostCooldown} onValueChange={setBoostCooldown}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 heures</SelectItem>
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="48">48 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Score Algorithm */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="size-5" /> Algorithme du score de profil</CardTitle>
          <CardDescription>Poids des critères dans le calcul du score (total : {totalWeight}%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(scoreWeights).map(([key, value]) => {
            const labels: Record<string, string> = {
              photos: '📸 Qualité des photos',
              verification: '✅ Vérification',
              activity: '📊 Activité',
              connections: '🤝 Connexions',
              streak: '🔥 Streak',
            }
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{labels[key]}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={value}
                      onChange={e => setScoreWeights({ ...scoreWeights, [key]: parseInt(e.target.value) || 0 })}
                      className="w-16 h-7 text-center text-xs"
                      min={0}
                      max={100}
                    />
                    <span className="text-xs text-muted-foreground w-6">%</span>
                  </div>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            )
          })}
          {totalWeight !== 100 && (
            <div className={cn('text-sm font-medium p-2 rounded-lg', totalWeight > 100 ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600')}>
              ⚠️ Le total des poids est de {totalWeight}% au lieu de 100%
            </div>
          )}
          <Button className="bg-rose-600 hover:bg-rose-700">Sauvegarder les poids</Button>
        </CardContent>
      </Card>

      {/* New Badge Dialog */}
      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau badge</DialogTitle>
            <DialogDescription>Ajoutez un badge à la collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du badge</Label>
                <Input value={newBadgeName} onChange={e => setNewBadgeName(e.target.value)} placeholder="Ex: Sociable" />
              </div>
              <div className="space-y-2">
                <Label>Icône (emoji)</Label>
                <Input value={newBadgeIcon} onChange={e => setNewBadgeIcon(e.target.value)} placeholder="Ex: 🤝" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newBadgeDesc} onChange={e => setNewBadgeDesc(e.target.value)} placeholder="Ex: Beaucoup de connexions" />
            </div>
            <div className="space-y-2">
              <Label>Condition d'obtention</Label>
              <Input value={newBadgeCondition} onChange={e => setNewBadgeCondition(e.target.value)} placeholder="Ex: 10+ connexions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBadgeDialog(false)}>Annuler</Button>
            <Button onClick={handleAddBadge} className="bg-rose-600 hover:bg-rose-700">Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================
// MAIN: ADMIN DASHBOARD
// ============================================
export default function AdminDashboard({ currentUser, onBackToApp }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState<PageKey>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  // Generate and manage real database users & fallback mocks
  const [users, setUsers] = useState<MockUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  useEffect(() => {
    async function loadUsers() {
      if (!currentUser?.id) return
      try {
        setIsLoadingUsers(true)
        const res = await fetch(`/api/admin/users?requesterId=${currentUser.id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.users) {
            setUsers(data.users)
          }
        }
      } catch (err) {
        console.error("Failed to load real users", err)
      } finally {
        setIsLoadingUsers(false)
      }
    }
    loadUsers()
  }, [currentUser])

  const handleRoleChange = async (targetUserId: string, newRole: 'user' | 'admin') => {
    try {
      const res = await fetch('/api/admin/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: currentUser.id,
          targetUserId,
          newRole,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        // Update local users list
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
        )
      } else {
        alert(data.error || 'Erreur lors de la modification du rôle')
      }
    } catch (error) {
      console.error('Failed to change role:', error)
      alert('Erreur serveur lors de la communication.')
    }
  }

  // Fallbacks for other mock data pages (requests, conversations, connections, etc.)
  const usersForMocks = useMemo(() => users.length ? users : generateMockUsers(), [users])
  const requests = useMemo(() => generateMockRequests(usersForMocks), [usersForMocks])
  const conversations = useMemo(() => generateMockConversations(usersForMocks), [usersForMocks])
  const connections = useMemo(() => generateMockConnections(usersForMocks), [usersForMocks])
  const moments = useMemo(() => generateMockMoments(usersForMocks), [usersForMocks])
  const reports = useMemo(() => generateMockReports(usersForMocks), [usersForMocks])
  const premiumSubs = useMemo(() => generateMockPremium(usersForMocks), [usersForMocks])
  const chartData = useMemo(() => generateChart30Days(), [])

  const notifications = [
    { text: '3 nouveaux signalements en attente', time: 'il y a 5 min', read: false },
    { text: 'Pic d\'inscriptions détecté', time: 'il y a 30 min', read: false },
    { text: 'Mise à jour serveur planifiée', time: 'il y a 2h', read: true },
    { text: 'Rapport hebdomadaire disponible', time: 'il y a 5h', read: true },
  ]

  const pageTitle: Record<PageKey, string> = {
    overview: 'Vue d\'ensemble',
    users: 'Utilisateurs',
    requests: 'Demandes de numéro',
    messages: 'Messages',
    connections: 'Connexions',
    moments: 'Moments',
    reports: 'Signalements',
    premium: 'Premium',
    notifications: 'Notifications Push',
    settings: 'Configuration',
    gamification: 'Gamification',
  }

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white shrink-0 overflow-hidden z-30"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30 shrink-0">
            <Phone className="size-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <h1 className="font-bold text-lg whitespace-nowrap">Fonelove</h1>
              <p className="text-[10px] text-gray-400 whitespace-nowrap">Administration</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 overscroll-y-contain">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.key
            return (
              <motion.button
                key={item.key}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage(item.key)}
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-gradient-to-r from-rose-600/90 to-pink-600/90 text-white shadow-md shadow-rose-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </motion.button>
            )
          })}
        </nav>

        {/* Back to App */}
        <div className="px-2 pb-3">
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackToApp}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="size-5 shrink-0" />
            {!sidebarCollapsed && <span>Retour à l&apos;app</span>}
          </motion.button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-7 flex items-center justify-center h-6 w-6 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-40"
        >
          {sidebarCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b bg-background shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{pageTitle[activePage]}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-[250px] h-9 text-base"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="size-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-80 rounded-xl border bg-background shadow-xl z-50"
                >
                  <div className="p-3 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif, i) => (
                      <div key={i} className={cn('px-3 py-2.5 hover:bg-muted/50 transition-colors border-b last:border-0', !notif.read && 'bg-rose-50/50 dark:bg-rose-900/10')}>
                        <p className="text-sm">{notif.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Admin Info */}
            <div className="flex items-center gap-2 pl-3 border-l">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar || `${AVATAR_BASE}68`} />
                <AvatarFallback>{currentUser?.firstName?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{currentUser?.firstName || 'Admin'}</div>
                <div className="text-xs text-muted-foreground">
                  {currentUser?.role === 'super_admin' ? 'Super admin' : 'Administrateur'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-y-contain">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'overview' && (
                <OverviewPage users={usersForMocks} requests={requests} chartData={chartData} connections={connections} premiumSubs={premiumSubs} />
              )}
              {activePage === 'users' && (
                isLoadingUsers ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <RefreshCw className="size-8 text-rose-500 animate-spin" />
                    <span className="text-muted-foreground text-sm font-medium">Chargement des utilisateurs en cours...</span>
                  </div>
                ) : (
                  <UsersPage users={users} currentUser={currentUser} onRoleChange={handleRoleChange} />
                )
              )}
              {activePage === 'requests' && <RequestsPage requests={requests} />}
              {activePage === 'messages' && <MessagesPage conversations={conversations} />}
              {activePage === 'connections' && <ConnectionsPage connections={connections} chartData={chartData} />}
              {activePage === 'moments' && <MomentsPage moments={moments} />}
              {activePage === 'reports' && <ReportsPage reports={reports} />}
              {activePage === 'premium' && <PremiumPage premiumSubs={premiumSubs} chartData={chartData} />}
              {activePage === 'notifications' && <NotificationsPage />}
              {activePage === 'settings' && <SettingsPage currentUserId={currentUser?.id} />}
              {activePage === 'gamification' && <GamificationPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
