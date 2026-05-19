'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SmilePlus, Heart, Sparkles, Flame, Coffee, Activity } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export const EMOJI_CATEGORIES = [
  {
    id: 'love',
    label: 'Amour & Flirt',
    icon: Heart,
    emojis: ['❤️', '💖', '💘', '💝', '💕', '💞', '💓', '💗', '💟', '💌', '💋', '💍', '🌹', '💐', '🥂'],
  },
  {
    id: 'reactions',
    label: 'Réactions',
    icon: Sparkles,
    emojis: ['😍', '🥰', '😘', '🥵', '😈', '🥺', '🤭', '😉', '🤩', '🤤', '🫶', '🤌'],
  },
  {
    id: 'faces',
    label: 'Visages',
    icon: SmilePlus,
    emojis: ['😂', '😅', '😌', '😎', '🤪', '😇', '🤫', '😋', '🙄', '😮‍💨', '🫠', '🫣'],
  },
  {
    id: 'dates',
    label: 'Dates & Fun',
    icon: Coffee,
    emojis: ['🍷', '🍸', '🍕', '🍿', '🎬', '🎟️', '🎮', '🎳', '🎪', '🎢', '🌙', '✨', '🔥', '🎈', '🎉'],
  },
]

interface DatingEmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function DatingEmojiPicker({ onSelect }: DatingEmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id)

  const activeEmojis = EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis || []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.8 }}
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors shadow-sm"
        >
          <SmilePlus className="size-5" />
        </motion.button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top" 
        align="end" 
        sideOffset={16}
        className="w-80 p-0 rounded-3xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/20 overflow-hidden"
      >
        <div className="flex flex-col h-72">
          {/* Header Categories */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1 border-b border-border/40">
            {EMOJI_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "relative p-2 rounded-xl transition-all",
                    isActive ? "text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Emoji Grid */}
          <div className="flex-1 overflow-y-auto p-3 no-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-5 gap-2"
              >
                {activeEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSelect(emoji)}
                    className="flex aspect-square items-center justify-center text-3xl hover:bg-muted rounded-xl transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Footer gradient flair */}
          <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-primary to-amber-500 opacity-50" />
        </div>
      </PopoverContent>
    </Popover>
  )
}
