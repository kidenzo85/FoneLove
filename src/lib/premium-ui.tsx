import React from 'react'
import { Flame, Ghost, Eye, Check, SlidersHorizontal, Shield, Sparkles, Star, Droplet, Tag, Zap, Phone, Heart, StarHalf, Medal, Palette } from 'lucide-react'

// Utilitaire de formatage de temps
export function formatTimeRemaining(remainingMs: number): { text: string; isExpiring: boolean; progressPct: number } {
  const totalSeconds = Math.floor(Math.max(0, remainingMs) / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let text = ''
  if (days > 0) {
    text = `${days}j ${hours}h`
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`
  } else {
    text = `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }

  // Considéré sur le point d'expirer si moins de 5 minutes
  const isExpiring = days === 0 && hours === 0 && minutes < 5

  return { text, isExpiring, progressPct: 0 } // progressPct est calculé séparément
}

// Fonction pour récupérer la durée totale à partir des dates
export function calculateProgress(activatedAt: string | Date, expiresAt: string | Date, now: number): number {
  const start = new Date(activatedAt).getTime()
  const end = new Date(expiresAt).getTime()
  const totalDuration = end - start
  if (totalDuration <= 0) return 0
  const remaining = Math.max(0, end - now)
  return Math.min(100, Math.max(0, 100 - (remaining / totalDuration) * 100))
}

export type FeatureConfig = {
  icon: React.ReactNode
  label: string
  shortLabel: string
  color: string
  bg: string
  gradient: string
}

// Dictionnaire unifié de tous les avantages
export const FEATURE_MAP: Record<string, FeatureConfig> = {
  boost: { 
    icon: <Flame className="size-4" />, 
    label: 'Ton profil est très visible', 
    shortLabel: 'Boost', 
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    gradient: 'from-amber-500/20 via-orange-500/20 to-rose-500/20'
  },
  ghost_mode: { 
    icon: <Ghost className="size-4" />, 
    label: 'Personne ne te voit visiter', 
    shortLabel: 'Fantôme', 
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    gradient: 'from-purple-500/20 to-indigo-500/20'
  },
  see_visitors: { 
    icon: <Eye className="size-4" />, 
    label: 'Tu vois qui visite ton profil', 
    shortLabel: 'Visiteurs', 
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
  read_receipt: {
    icon: <Check className="size-4" />,
    label: 'Tu sais quand on lit tes messages',
    shortLabel: 'Lecture',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    gradient: 'from-emerald-500/20 to-teal-500/20'
  },
  filters_plus: {
    icon: <SlidersHorizontal className="size-4" />,
    label: 'Filtres de recherche avancés',
    shortLabel: 'Filtres+',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    gradient: 'from-blue-500/20 to-sky-500/20'
  },
  theme_flame: {
    icon: <Flame className="size-4" />,
    label: 'Ton profil est en feu',
    shortLabel: 'Thème Flamme',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    gradient: 'from-red-500/20 via-orange-500/20 to-yellow-500/20'
  },
  theme_star: {
    icon: <Star className="size-4" />,
    label: 'Thème Étoile activé',
    shortLabel: 'Thème Étoile',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    gradient: 'from-yellow-400/20 to-amber-500/20'
  },
  theme_aura: {
    icon: <Sparkles className="size-4" />,
    label: 'Aura mystique autour de toi',
    shortLabel: 'Thème Aura',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    gradient: 'from-fuchsia-500/20 to-purple-500/20'
  },
  custom_badge: {
    icon: <Shield className="size-4" />,
    label: 'Badge personnalisé sur ton profil',
    shortLabel: 'Badge Spécial',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    gradient: 'from-indigo-500/20 to-violet-500/20'
  },
  request_animation: {
    icon: <Zap className="size-4" />,
    label: 'Animation spéciale lors des demandes',
    shortLabel: 'Demande VIP',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    gradient: 'from-pink-500/20 to-rose-500/20'
  },
  super_request: {
    icon: <Medal className="size-4" />,
    label: 'Super Demande disponible',
    shortLabel: 'Super Demande',
    color: 'text-amber-300',
    bg: 'bg-amber-300/10',
    gradient: 'from-amber-300/20 to-yellow-500/20'
  },
  extra_request: {
    icon: <Phone className="size-4" />,
    label: 'Demande supplémentaire disponible',
    shortLabel: '+1 Demande',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    gradient: 'from-sky-400/20 to-blue-500/20'
  },
  rose_connect: {
    icon: <Heart className="size-4 fill-rose-500" />,
    label: 'Rose Connect disponible',
    shortLabel: 'Rose',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    gradient: 'from-rose-500/20 to-red-500/20'
  }
}

export function getFeatureConfig(action: string): FeatureConfig {
  // Prise en compte de la rétrocompatibilité (si incognito est utilisé au lieu de ghost_mode)
  if (action === 'incognito') return FEATURE_MAP['ghost_mode']
  
  return FEATURE_MAP[action] || {
    icon: <Sparkles className="size-4" />,
    label: 'Avantage exclusif actif',
    shortLabel: 'Avantage',
    color: 'text-primary',
    bg: 'bg-primary/10',
    gradient: 'from-primary/20 to-primary/5'
  }
}
