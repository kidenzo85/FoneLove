'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { type MomentItem, useAppStore } from '@/lib/store'
import { useT } from '@/lib/i18n/context'
import AddMomentDialog from './AddMomentDialog'

interface UserStory {
  user: any
  moments: MomentItem[]
}

interface MomentStoryProps {
  moments: MomentItem[]
}

export default function MomentStory({ moments }: MomentStoryProps) {
  const { t } = useT()
  const { currentUser } = useAppStore()
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null)
  const [viewingSubIndex, setViewingSubIndex] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stories = useMemo(() => {
    const grouped = (moments || []).reduce((acc, m) => {
      const uid = m.user?.id || 'unknown'
      if (!acc[uid]) acc[uid] = { user: m.user, moments: [] }
      acc[uid].moments.push(m)
      return acc
    }, {} as Record<string, UserStory>)
    return Object.values(grouped)
  }, [moments])

  const advance = () => {
    if (viewingStoryIndex === null) return
    const currentStory = stories[viewingStoryIndex]
    if (viewingSubIndex < currentStory.moments.length - 1) {
      setViewingSubIndex(prev => prev + 1)
    } else if (viewingStoryIndex < stories.length - 1) {
      setViewingStoryIndex(prev => (prev !== null ? prev + 1 : null))
      setViewingSubIndex(0)
    } else {
      closeStory()
    }
  }

  const goBack = () => {
    if (viewingStoryIndex === null) return
    if (viewingSubIndex > 0) {
      setViewingSubIndex(prev => prev - 1)
    } else if (viewingStoryIndex > 0) {
      const prevStory = stories[viewingStoryIndex - 1]
      setViewingStoryIndex(prev => (prev !== null ? prev - 1 : null))
      setViewingSubIndex(prevStory.moments.length - 1)
    } else {
      setProgress(0)
    }
  }

  const openStory = (index: number, subIndex: number = 0) => {
    setViewingStoryIndex(index)
    setViewingSubIndex(subIndex)
  }

  const closeStory = () => {
    setViewingStoryIndex(null)
    setViewingSubIndex(0)
    setProgress(0)
  }

  useEffect(() => {
    if (viewingStoryIndex === null) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    
    setProgress(0)
    let p = 0
    timerRef.current = setInterval(() => {
      p += 2
      setProgress(p)
      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current)
        advance()
      }
    }, 100)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [viewingStoryIndex, viewingSubIndex, stories])

  if (!moments || moments.length === 0) return (
    <>
      <div className="flex gap-3 overflow-x-auto px-1 py-2 no-scrollbar">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex flex-col items-center gap-1 shrink-0 group relative"
        >
          <div className="rounded-full bg-muted p-[2px] border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors">
            <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center">
              <Plus className="size-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary truncate max-w-[56px]">
            Moi
          </span>
          <div className="absolute top-0 right-0 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-background shadow-sm">
            <Plus className="size-3" />
          </div>
        </button>
      </div>
      <AddMomentDialog open={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  )

  return (
    <>
      {/* Moment circles */}
      <div className="flex gap-3 overflow-x-auto px-1 py-2 no-scrollbar">
        {/* Add Moment Button for Current User */}
        <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center gap-1 shrink-0 group relative"
          >
            <div className="rounded-full bg-muted p-[2px] border-2 border-dashed border-primary/50 group-hover:border-primary transition-colors">
              <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center">
                <Plus className="size-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary truncate max-w-[56px]">
              Moi
            </span>
            <div className="absolute top-0 right-0 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-background shadow-sm">
              <Plus className="size-3" />
            </div>
          </button>

        {stories.map((story, i) => {
          const photo = story.moments[0].mediaUrl || story.user?.photos?.[0]?.url || `https://i.pravatar.cc/100?img=1`
          return (
            <button
              key={story.user?.id || i}
              onClick={() => openStory(i)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="rounded-full bg-gradient-to-br from-primary to-pink-500 p-[2px]">
                <img
                  src={photo}
                  alt={story.user?.firstName || 'Moment'}
                  className="h-14 w-14 rounded-full object-cover border-2 border-background"
                />
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[56px]">
                {story.user?.firstName || t('moment.fallback')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {viewingStoryIndex !== null && stories[viewingStoryIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center h-dvh"
          >
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 z-10 flex gap-1 safe-area-top">
              {stories[viewingStoryIndex].moments.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{
                      width: i < viewingSubIndex ? '100%' : i === viewingSubIndex ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Close */}
            <button
              onClick={closeStory}
              className="absolute top-8 right-4 z-10 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="size-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={goBack}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="size-8" />
            </button>
            <button
              onClick={advance}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="size-8" />
            </button>

            {/* Content */}
            <div className="relative h-full w-full max-w-lg">
              {stories[viewingStoryIndex].moments[viewingSubIndex].mediaUrl && (
                <img
                  src={stories[viewingStoryIndex].moments[viewingSubIndex].mediaUrl!}
                  alt="Moment"
                  className="h-full w-full object-cover"
                />
              )}

              {/* User info */}
              <div className="absolute bottom-8 left-4 right-4 z-10 safe-area-bottom">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={stories[viewingStoryIndex].user?.photos?.[0]?.url || `https://i.pravatar.cc/40?img=1`}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-semibold text-white">
                    {stories[viewingStoryIndex].user?.firstName}
                  </span>
                </div>
                {stories[viewingStoryIndex].moments[viewingSubIndex].content && (
                  <p className="text-sm text-white/90">{stories[viewingStoryIndex].moments[viewingSubIndex].content}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Moment Dialog */}
      <AddMomentDialog open={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  )
}
