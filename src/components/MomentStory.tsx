'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { type MomentItem } from '@/lib/store'
import { useT } from '@/lib/i18n/context'

interface MomentStoryProps {
  moments: MomentItem[]
}

export default function MomentStory({ moments }: MomentStoryProps) {
  const { t } = useT()
  const [viewingIndex, setViewingIndex] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const openStory = (index: number) => {
    setViewingIndex(index)
    setProgress(0)
    startTimer()
  }

  const closeStory = () => {
    setViewingIndex(null)
    setProgress(0)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    let p = 0
    const interval = setInterval(() => {
      p += 2
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        // Auto advance
        setViewingIndex((prev) => {
          if (prev !== null && prev < moments.length - 1) {
            setProgress(0)
            return prev + 1
          }
          closeStory()
          return null
        })
      }
    }, 100)
    timerRef.current = interval as unknown as ReturnType<typeof setTimeout>
  }

  if (!moments || moments.length === 0) return null

  return (
    <>
      {/* Moment circles */}
      <div className="flex gap-3 overflow-x-auto px-1 py-2 no-scrollbar">
        {moments.map((moment, i) => {
          const photo = moment.mediaUrl || moment.user?.photos?.[0]?.url || `https://i.pravatar.cc/100?img=1`
          return (
            <button
              key={moment.id}
              onClick={() => openStory(i)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="rounded-full bg-gradient-to-br from-primary to-pink-500 p-[2px]">
                <img
                  src={photo}
                  alt={moment.user?.firstName || 'Moment'}
                  className="h-14 w-14 rounded-full object-cover border-2 border-background"
                />
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[56px]">
                {moment.user?.firstName || t('moment.fallback')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {viewingIndex !== null && moments[viewingIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center h-dvh"
          >
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 z-10 flex gap-1 safe-area-top">
              {moments.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{
                      width: i < viewingIndex ? '100%' : i === viewingIndex ? `${progress}%` : '0%',
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
              onClick={() => viewingIndex > 0 && openStory(viewingIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="size-8" />
            </button>
            <button
              onClick={() => viewingIndex < moments.length - 1 && openStory(viewingIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="size-8" />
            </button>

            {/* Content */}
            <div className="relative h-full w-full max-w-lg">
              {moments[viewingIndex].mediaUrl && (
                <img
                  src={moments[viewingIndex].mediaUrl!}
                  alt="Moment"
                  className="h-full w-full object-cover"
                />
              )}

              {/* User info */}
              <div className="absolute bottom-8 left-4 right-4 z-10 safe-area-bottom">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={moments[viewingIndex].user?.photos?.[0]?.url || `https://i.pravatar.cc/40?img=1`}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-semibold text-white">
                    {moments[viewingIndex].user?.firstName}
                  </span>
                </div>
                {moments[viewingIndex].content && (
                  <p className="text-sm text-white/90">{moments[viewingIndex].content}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
