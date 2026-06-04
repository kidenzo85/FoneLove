'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, MapPin, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/context'
import type { UserProfile } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DatingPosterProps {
  user: UserProfile
  onClose: () => void
}

const CARD_STYLES = [
  { id: 'classic', labelKey: 'poster.style.classic', emoji: '🏠' },
  { id: 'neon', labelKey: 'poster.style.neon', emoji: '⚡' },
  { id: 'chic', labelKey: 'poster.style.chic', emoji: '🤍' },
  { id: 'gold', labelKey: 'poster.style.gold', emoji: '👑' },
  { id: 'love', labelKey: 'poster.style.love', emoji: '❤️' },
  { id: 'magazine', labelKey: 'poster.style.magazine', emoji: '📖' },
  { id: 'vintage', labelKey: 'poster.style.vintage', emoji: '📷' },
  { id: 'pop', labelKey: 'poster.style.pop', emoji: '💥' },
  { id: 'holo', labelKey: 'poster.style.holo', emoji: '🦄' },
  { id: 'boho', labelKey: 'poster.style.boho', emoji: '🌿' }
] as const

type StyleId = typeof CARD_STYLES[number]['id']

const IRRESISTIBLE_TAGLINES: Record<'fr' | 'en', string[]> = {
  fr: [
    "Je cherche l'amour sur Fonelove... Et si c'était toi ? 💖",
    "On dit que mon futur amour est dans mes contacts... C'est toi ? 😉",
    "Qui est libre pour prendre un verre cette semaine ? ☕",
    "Je cherche une vraie rencontre, pas un simple match ! ✨",
    "Si tu lis ça, c'est ton signe pour m'envoyer un message ! ✉️",
    "Plutôt balades au coucher du soleil ou soirées cinéma ? 🌅🎬",
    "Je cherche quelqu'un de vrai et de complice. Et toi ? 🤝",
    "Dis-moi ton plus grand rêve en privé ! 🌟",
    "Faisons connaissance tout simplement, sans prise de tête. 😊",
    "Un simple coucou peut changer une journée. Dis-moi coucou ! 👋",
    "Devine à quoi je pense en ce moment... 💭",
    "Si tu devais me décrire en un mot, ce serait quoi ? 😏",
    "Je cherche la complicité avant tout. Écris-moi ! ✨",
    "Qui relève le défi de me faire sourire aujourd'hui ? 😜",
    "Mon statut WhatsApp t'invite à venir me parler en privé. 📲",
    "Un petit message de toi me ferait tellement plaisir... 💛",
    "Cap ou pas cap de venir me parler ? 😉",
    "Qui veut partager des sourires aujourd'hui ? 😄",
    "On s'écrit un petit mot doux ? ✉️",
    "Quel est ton coin préféré de la ville ? 🗺️",
    "Plutôt café du matin ou discussion sous les étoiles ? 🌙",
    "Si tu as du temps pour rire, écris-moi ! 🌸",
    "Qui veut être ma plus belle surprise de la semaine ? 🎁",
    "À la recherche de belles ondes et de positivité ! 🌈",
    "Je ne mords pas... viens me dire bonjour ! 😇"
  ],
  en: [
    "I'm looking for love on Fonelove... Could it be you? 💖",
    "They say my future love is in my contacts... Is it you? 😉",
    "Who is free for a drink this week? ☕",
    "Looking for a real connection, not just a match! ✨",
    "If you're reading this, it's your sign to message me! ✉️",
    "Sunset walks or movie nights? 🌅🎬",
    "Looking for someone real and close. What about you? 🤝",
    "Tell me your biggest dream in private! 🌟",
    "Let's get to know each other, simple and easy. 😊",
    "A simple hello can change a day. Say hello! 👋",
    "Guess what I'm thinking about right now... 💭",
    "If you had to describe me in one word, what would it be? 😏",
    "I value chemistry above everything. Write to me! ✨",
    "Who dares to make me smile today? 😜",
    "My WhatsApp status is an invite to chat in private. 📲",
    "A little text from you would make my day... 💛",
    "Dare to come and talk to me? 😉",
    "Who wants to share some smiles today? 😄",
    "Shall we write a sweet note? ✉️",
    "What's your favorite spot in town? 🗺️",
    "Morning coffee or stargazing chats? 🌙",
    "If you have time to laugh, message me! 🌸",
    "Who wants to be my best surprise of the week? 🎁",
    "Looking for good vibes and positivity! 🌈",
    "I don't bite... come say hello! 😇"
  ]
}

export default function DatingPoster({ user, onClose }: DatingPosterProps) {
  const { t, locale } = useT()
  const posterRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<StyleId>('classic')
  
  // New customized catching messages state
  const [selectedTaglineIndex, setSelectedTaglineIndex] = useState(0)
  const [customTagline, setCustomTagline] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [showAllTaglines, setShowAllTaglines] = useState(false)

  const photo = user.photos?.[0]?.url || 'https://i.pravatar.cc/600?img=11'
  const age = user.birthDate
    ? Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const taglines = IRRESISTIBLE_TAGLINES[locale === 'fr' ? 'fr' : 'en'] || IRRESISTIBLE_TAGLINES.fr
  const activeTagline = customTagline.trim() !== '' ? customTagline : taglines[selectedTaglineIndex]

  const handleDownload = async () => {
    if (!posterRef.current) return
    setIsGenerating(true)
    
    try {
      // Small delay to ensure images are loaded
      await new Promise(r => setTimeout(r, 150))
      
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High res for mobile
        cacheBust: true,
      })
      
      const link = document.createElement('a')
      link.download = `fonelove-${user.firstName}-${selectedStyle}.png`
      link.href = dataUrl
      link.click()
      
      toast.success(t('poster.success'))
    } catch (err) {
      console.error('Error generating poster', err)
      toast.error(t('poster.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (!posterRef.current) return
    setIsGenerating(true)
    
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      })
      
      // Convert dataUrl to File object for native sharing
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `fonelove-${user.firstName}-${selectedStyle}.png`, { type: 'image/png' })
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t('poster.title'),
          text: activeTagline,
        })
      } else {
        // Fallback to download if Web Share API with files is not supported
        handleDownload()
      }
    } catch (err) {
      console.error('Error sharing poster', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-area-top shrink-0">
        <h2 className="text-lg font-bold text-white">{t('poster.title')}</h2>
        <button
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"
        >
          <X className="size-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col items-center">
        <p className="text-xs text-white/70 text-center mb-3 max-w-[320px]">
          {t('poster.description')}
        </p>

        {/* The Poster Container */}
        <div className="relative w-full max-w-[320px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-white/10 shrink-0">
          
          {/* This is the element we capture */}
          <div
            ref={posterRef}
            className={cn(
              "relative aspect-[3/4] w-full bg-black overflow-hidden transition-all duration-300",
              selectedStyle === 'chic' && 'p-4 pb-14 bg-white',
              selectedStyle === 'vintage' && 'p-4 pb-16 bg-[#f4efe2] border-[8px] border-[#f4efe2]',
              selectedStyle === 'magazine' && 'border-[6px] border-white',
              selectedStyle === 'pop' && 'border-[8px] border-black',
              selectedStyle === 'gold' && 'border-4 border-double border-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.5)]',
              selectedStyle === 'neon' && 'border-[4px] border-pink-500 shadow-[inset_0_0_20px_rgba(236,72,153,0.5)]',
              selectedStyle === 'love' && 'border-[4px] border-rose-400',
              selectedStyle === 'boho' && 'border-[8px] border-[#eaddca]'
            )}
            style={{ backgroundColor: selectedStyle === 'chic' ? '#fff' : selectedStyle === 'vintage' ? '#f4efe2' : '#000' }}
          >
            {/* Background Image */}
            <img 
              src={photo} 
              alt={user.firstName}
              crossOrigin="anonymous" 
              className={cn(
                "absolute object-cover transition-all duration-300",
                selectedStyle === 'chic'
                  ? "top-4 left-4 right-4 bottom-14 rounded-lg"
                  : selectedStyle === 'vintage'
                  ? "top-4 left-4 right-4 bottom-16 rounded-sm filter sepia-[0.25] saturate-[0.8] contrast-[0.95]"
                  : "top-0 left-0 right-0 bottom-0 w-full h-full"
              )}
            />
            
            {/* Gradient Overlay for Text Readability */}
            {selectedStyle !== 'chic' && selectedStyle !== 'vintage' && (
              <div className={cn(
                "absolute inset-0 transition-all duration-300",
                selectedStyle === 'classic' && "bg-gradient-to-t from-black/90 via-black/30 to-transparent",
                selectedStyle === 'neon' && "bg-gradient-to-t from-fuchsia-950/95 via-black/20 to-transparent",
                selectedStyle === 'gold' && "bg-gradient-to-t from-stone-950/95 via-black/30 to-transparent",
                selectedStyle === 'love' && "bg-gradient-to-t from-rose-950/90 via-rose-500/20 to-transparent",
                selectedStyle === 'magazine' && "bg-gradient-to-t from-black/80 via-black/10 to-transparent",
                selectedStyle === 'pop' && "bg-gradient-to-t from-black/70 to-transparent",
                selectedStyle === 'holo' && "bg-gradient-to-tr from-indigo-900/90 via-purple-900/40 to-pink-900/20 mix-blend-color-dodge",
                selectedStyle === 'boho' && "bg-gradient-to-t from-amber-950/80 via-black/10 to-transparent"
              )} />
            )}

            {/* Holographic light leak effect */}
            {selectedStyle === 'holo' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 via-purple-500/20 to-pink-500/40 mix-blend-color-screen pointer-events-none" />
            )}

            {/* Hearts for Love Theme */}
            {selectedStyle === 'love' && (
              <>
                <div className="absolute top-16 right-8 text-rose-400 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>❤️</div>
                <div className="absolute top-28 left-6 text-rose-300 text-lg animate-bounce" style={{ animationDelay: '0.7s' }}>❤️</div>
                <div className="absolute bottom-24 right-10 text-rose-500 text-xl animate-pulse">💖</div>
              </>
            )}

            {/* Comic stickers for Pop Art */}
            {selectedStyle === 'pop' && (
              <>
                <div className="absolute top-16 right-6 bg-yellow-300 text-black border-2 border-black font-black text-[9px] px-2 py-0.5 uppercase tracking-widest rotate-[5deg] shadow-[2px_2px_0px_#000]">
                  BAM!
                </div>
                <div className="absolute top-24 left-6 bg-pink-500 text-white border-2 border-black font-black text-[9px] px-2 py-0.5 uppercase tracking-widest rotate-[-8deg] shadow-[2px_2px_0px_#000]">
                  LOVE!
                </div>
              </>
            )}

            {/* Vintage timestamp */}
            {selectedStyle === 'vintage' && (
              <div className="absolute bottom-20 right-6 font-mono text-amber-500 text-xs font-bold tracking-wider opacity-85 select-none">
                '26  5 18
              </div>
            )}
            
            {/* Brand Banner */}
            {selectedStyle === 'magazine' ? (
              <div className="absolute top-6 left-0 right-0 text-center px-4">
                <h2 className="font-serif text-[38px] font-black text-white tracking-widest uppercase leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  FONELOVE
                </h2>
                <p className="text-white text-[8px] tracking-widest uppercase font-bold mt-1 opacity-90 drop-shadow">
                  L'amour au bout du fil • N°1
                </p>
              </div>
            ) : selectedStyle === 'chic' ? (
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="font-serif text-neutral-400 text-[10px] tracking-widest uppercase">FONELOVE</span>
              </div>
            ) : selectedStyle === 'vintage' ? (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="font-mono text-neutral-500 text-[10px] tracking-wider uppercase">F O N E L O V E</span>
              </div>
            ) : (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className={cn(
                  "backdrop-blur-md px-3 py-1.5 rounded-full border transition-all duration-300",
                  selectedStyle === 'classic' && "bg-black/40 border-white/10 text-white",
                  selectedStyle === 'neon' && "bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]",
                  selectedStyle === 'gold' && "bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                  selectedStyle === 'love' && "bg-rose-500/20 border-rose-400 text-rose-300",
                  selectedStyle === 'pop' && "bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_#000]",
                  selectedStyle === 'holo' && "bg-white/10 border-white/20 text-white shadow-lg",
                  selectedStyle === 'boho' && "bg-[#8fbc8f]/30 border-[#eaddca]/30 text-[#eaddca]"
                )}>
                  <span className={cn(
                    "font-black text-xs tracking-widest",
                    selectedStyle === 'pop' ? "font-serif tracking-normal font-extrabold" : ""
                  )}>
                    FONELOVE
                  </span>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-6 transition-all duration-300",
              selectedStyle === 'chic' && "bg-white p-4 pt-1 px-4 text-left",
              selectedStyle === 'vintage' && "bg-[#f4efe2] p-4 pt-0.5 px-4 text-left"
            )}>
              {/* Name & Age */}
              <div className="flex items-center gap-2 mb-1">
                <h1 className={cn(
                  "transition-all duration-300",
                  selectedStyle === 'chic' && "text-xl font-serif font-black text-neutral-800",
                  selectedStyle === 'vintage' && "text-xl font-mono font-bold text-neutral-800",
                  selectedStyle === 'pop' && "text-3xl font-black text-yellow-300 drop-shadow-[2px_2px_0px_#000] [text-stroke:1px_black]",
                  selectedStyle === 'classic' && "text-3xl font-black text-white drop-shadow-lg",
                  selectedStyle === 'neon' && "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]",
                  selectedStyle === 'gold' && "text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-lg",
                  selectedStyle === 'love' && "text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(244,63,94,0.5)]",
                  selectedStyle === 'magazine' && "text-3xl font-black text-white drop-shadow-lg",
                  selectedStyle === 'holo' && "text-3xl font-black text-white drop-shadow-md",
                  selectedStyle === 'boho' && "text-2xl font-serif font-bold text-[#4a3b32]"
                )}>
                  {user.firstName}
                </h1>
                {age && (
                  <span className={cn(
                    "text-2xl transition-all duration-300",
                    selectedStyle === 'chic' && "text-lg font-serif text-neutral-500",
                    selectedStyle === 'vintage' && "text-lg font-mono text-neutral-500",
                    selectedStyle === 'pop' && "text-2xl font-black text-white drop-shadow-[2px_2px_0px_#000] [text-stroke:1px_black]",
                    selectedStyle === 'classic' && "text-white/90 drop-shadow-lg",
                    selectedStyle === 'neon' && "text-cyan-300 font-bold drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]",
                    selectedStyle === 'gold' && "text-amber-300 font-bold drop-shadow-md",
                    selectedStyle === 'love' && "text-rose-200 drop-shadow-md",
                    selectedStyle === 'magazine' && "text-white/90 drop-shadow-lg",
                    selectedStyle === 'holo' && "text-white/90 drop-shadow-md",
                    selectedStyle === 'boho' && "text-lg font-serif text-[#4a3b32]/80"
                  )}>
                    {age}
                  </span>
                )}
                {user.isVerified && (
                  <Shield className={cn(
                    "size-6 transition-all duration-300",
                    selectedStyle === 'chic' && "text-neutral-700",
                    selectedStyle === 'vintage' && "text-neutral-700",
                    selectedStyle === 'pop' && "text-yellow-300 stroke-black fill-black size-5",
                    selectedStyle === 'gold' && "text-amber-400 drop-shadow-lg",
                    selectedStyle === 'neon' && "text-pink-500 drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]",
                    selectedStyle === 'classic' && "text-primary drop-shadow-lg",
                    selectedStyle === 'love' && "text-rose-400 drop-shadow-md",
                    selectedStyle === 'magazine' && "text-white/90 drop-shadow-lg",
                    selectedStyle === 'holo' && "text-cyan-300 drop-shadow-md",
                    selectedStyle === 'boho' && "text-[#8fbc8f]"
                  )} />
                )}
              </div>

              {/* City */}
              {user.city && (
                <div className={cn(
                  "flex items-center gap-1.5 mb-3 transition-all duration-300",
                  selectedStyle === 'chic' && "text-neutral-500 mb-1.5",
                  selectedStyle === 'vintage' && "text-neutral-500 mb-1.5",
                  selectedStyle === 'pop' && "text-yellow-200 font-bold mb-2.5 drop-shadow-[1px_1px_0px_#000]",
                  selectedStyle === 'boho' && "text-[#4a3b32]/70 mb-1.5"
                )}>
                  <MapPin className="size-4 shrink-0" />
                  <span className={cn(
                    "text-base font-medium drop-shadow-md",
                    selectedStyle === 'chic' && "text-xs font-sans font-normal no-drop-shadow",
                    selectedStyle === 'vintage' && "text-xs font-mono font-normal no-drop-shadow",
                    selectedStyle === 'pop' && "text-sm",
                    selectedStyle === 'boho' && "text-xs font-serif"
                  )}>{user.city}</span>
                </div>
              )}

              {/* Tagline */}
              {selectedStyle === 'magazine' ? (
                <div className="space-y-0.5">
                  <p className="text-yellow-300 font-extrabold text-[9px] tracking-widest uppercase">
                    EXCLUSIF!
                  </p>
                  <p className="text-white font-serif font-black text-base leading-tight uppercase tracking-wide">
                    CÉLIBATAIRE DE L'ANNÉE 💖
                  </p>
                  <p className="text-white/80 font-bold text-[11px] italic">
                    "{activeTagline}"
                  </p>
                </div>
              ) : (
                <div className={cn(
                  "transition-all duration-300",
                  selectedStyle === 'classic' && "bg-primary/90 backdrop-blur-md rounded-2xl p-2.5 inline-block max-w-full",
                  selectedStyle === 'neon' && "bg-pink-600/90 backdrop-blur-md rounded-2xl p-2.5 inline-block shadow-[0_0_15px_rgba(236,72,153,0.8)] border border-pink-400 max-w-full",
                  selectedStyle === 'chic' && "border border-neutral-800 rounded-full px-3 py-1 mt-1 inline-block max-w-full",
                  selectedStyle === 'gold' && "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-2xl p-2.5 inline-block shadow-lg border border-amber-300 max-w-full",
                  selectedStyle === 'love' && "bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-2.5 inline-block shadow-md max-w-full",
                  selectedStyle === 'vintage' && "border-b border-neutral-700 font-mono text-[10px] pb-0.5 inline-block max-w-full",
                  selectedStyle === 'pop' && "bg-yellow-300 border-2 border-black p-2 rounded-xl rotate-[-2deg] shadow-[3px_3px_0px_#000] inline-block max-w-full",
                  selectedStyle === 'holo' && "bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 inline-block shadow-lg max-w-full",
                  selectedStyle === 'boho' && "bg-[#8fbc8f]/90 rounded-xl p-2 inline-block max-w-full"
                )}>
                  <p className={cn(
                    "text-xs transition-all duration-300 break-words",
                    selectedStyle === 'classic' && "text-white font-bold",
                    selectedStyle === 'neon' && "text-white font-bold",
                    selectedStyle === 'chic' && "text-neutral-800 font-medium text-xs",
                    selectedStyle === 'gold' && "text-neutral-950 font-black",
                    selectedStyle === 'love' && "text-white font-bold flex items-center gap-1",
                    selectedStyle === 'vintage' && "text-neutral-800 font-bold",
                    selectedStyle === 'pop' && "text-black font-black uppercase text-xs",
                    selectedStyle === 'holo' && "bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent font-extrabold",
                    selectedStyle === 'boho' && "text-white font-serif font-bold text-xs"
                  )}>
                    {activeTagline}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Catchy Tagline Selector */}
        <div className="w-full max-w-[320px] mt-4 flex flex-col gap-2 shrink-0">
          <p className="text-xs font-bold text-white/95 text-left px-1">
            {t('poster.taglineLabel')}
          </p>
          
          {/* Cycling messages system with big touch targets */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
            <button
              onClick={() => {
                setCustomTagline('')
                setSelectedTaglineIndex((prev) => (prev === 0 ? taglines.length - 1 : prev - 1))
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl hover:bg-white/20 active:scale-90"
              aria-label={t('poster.prev')}
            >
              ⬅️
            </button>
            
            <div className="flex-1 text-center px-1 py-1 min-h-[48px] flex items-center justify-center">
              <p className="text-xs font-bold text-white/90 leading-tight line-clamp-2">
                {activeTagline}
              </p>
            </div>
            
            <button
              onClick={() => {
                setCustomTagline('')
                setSelectedTaglineIndex((prev) => (prev === taglines.length - 1 ? 0 : prev + 1))
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl hover:bg-white/20 active:scale-90"
              aria-label={t('poster.next')}
            >
              ➡️
            </button>
          </div>

          <div className="flex items-center justify-between px-1 mt-0.5">
            <button
              onClick={() => setShowAllTaglines(true)}
              className="text-[11px] font-black text-primary hover:underline flex items-center gap-1"
            >
              📋 {t('poster.viewAllTags')}
            </button>

            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[11px] font-black text-amber-400 hover:underline flex items-center gap-1"
            >
              ✍️ {t('poster.customTagline')}
            </button>
          </div>

          {/* Custom text input */}
          {showCustomInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-1 overflow-hidden"
            >
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                placeholder={t('poster.customPlaceholder')}
                maxLength={45}
                className="w-full bg-white/10 text-white text-xs px-3 py-3 rounded-xl border border-white/20 focus:outline-none focus:border-primary placeholder:text-white/40 shadow-inner"
              />
            </motion.div>
          )}
        </div>

        {/* Style Selector Container */}
        <div className="w-full max-w-[320px] mt-4 flex flex-col gap-2 shrink-0">
          <p className="text-xs font-bold text-white/90 text-left px-1 flex items-center gap-1">
            {t('poster.styleLabel')}
          </p>
          
          {/* Horizontal Scroller of Cards */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x select-none w-full">
            {CARD_STYLES.map((style) => {
              const isActive = selectedStyle === style.id
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-200 snap-center shrink-0 w-[68px] h-[78px] border-2",
                    isActive 
                      ? "border-primary bg-primary/10 text-white shadow-lg shadow-primary/10 scale-105"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  )}
                >
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5">
                    <span className="text-xl">{style.emoji}</span>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-black border border-black shadow">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase text-center w-full truncate tracking-tighter">
                    {t(style.labelKey).split(' ')[1] || t(style.labelKey)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-[320px] mt-4 flex flex-col gap-2.5 shrink-0">
          <Button
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full h-13 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base hover:opacity-90 shadow-lg shadow-green-500/10"
          >
            {isGenerating ? t('poster.generating') : (
              <>
                <Share2 className="mr-2 size-5" />
                {t('poster.share')}
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            variant="outline"
            className="w-full h-13 rounded-2xl border-white/20 bg-white/5 text-white font-bold text-base hover:bg-white/10"
          >
            <Download className="mr-2 size-5" />
            {t('poster.download')}
          </Button>
        </div>
      </div>

      {/* Drawer / Modal showing all 25 messages */}
      <AnimatePresence>
        {showAllTaglines && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex flex-col justify-end bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-neutral-900 border-t border-white/10 rounded-t-3xl p-4 max-h-[75vh] flex flex-col max-w-md mx-auto w-full"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <h3 className="text-sm font-bold text-white">📋 {t('poster.taglineLabel')}</h3>
                <button
                  onClick={() => setShowAllTaglines(false)}
                  className="px-3.5 py-1.5 bg-white/10 text-white rounded-full text-xs font-bold active:scale-95"
                >
                  {t('poster.close')}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pb-6 pr-1">
                {taglines.map((tag, idx) => {
                  const isSel = !customTagline && selectedTaglineIndex === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCustomTagline('')
                        setSelectedTaglineIndex(idx)
                        setShowAllTaglines(false)
                      }}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl text-xs font-bold transition-all duration-150 border leading-relaxed",
                        isSel
                          ? "bg-primary/20 border-primary text-white"
                          : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10 active:scale-[0.98]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{tag}</span>
                        {isSel && <Check className="size-4 text-primary shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

