'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Phone, Mic, ArrowLeft, Clock, Sparkles, AlertCircle, Gift, Heart, Plus, Minus, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import MessageBubble from '@/components/MessageBubble'
import { type ConversationItem, type MessageItem, useAppStore } from '@/lib/store'
import { useFeedback } from '@/components/FeedbackSystem'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n/context'
import FoneLoveButton from '@/components/FoneLoveButton'
import DatingEmojiPicker from '@/components/DatingEmojiPicker'
import { optimizeImage } from '@/lib/image-optimizer'

interface ChatViewProps {
  conversation: ConversationItem
  onBack: () => void
}

const ICE_BREAKER_KEYS = [
  'chat.iceBreaker1',
  'chat.iceBreaker2',
  'chat.iceBreaker3',
  'chat.iceBreaker4',
  'chat.iceBreaker5',
] as const

export default function ChatView({ conversation, onBack }: ChatViewProps) {
  const { currentUser } = useAppStore()
  const { trigger } = useFeedback()
  const { t, localeStr } = useT()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState(conversation.messages || [])
  const [showIceBreakers, setShowIceBreakers] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserIsTyping, setOtherUserIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [showSurpriseInput, setShowSurpriseInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastTypedRef = useRef<number>(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const remaining = 3 - messages.length
  const isAccepted = conversation.status === 'accepted'
  const otherUser = conversation.otherUser
  const photo = otherUser?.photos?.[0]?.url || `https://i.pravatar.cc/200?img=1`

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Polling ultra-optimisé (Delta Sync) toutes les 2.5 secondes (plus réactif et consomme 95% de moins !)
  useEffect(() => {
    if (!currentUser || !conversation.requestId) return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/status?requestId=${conversation.requestId}&userId=${currentUser.id}`)
        if (res.ok) {
          const { otherUserIsTyping: typing, messageCount, lastMessageRead } = await res.json()
          
          // 1. Mettre à jour l'indicateur de saisie de l'autre
          setOtherUserIsTyping(typing)

          // 2. Synchroniser les coches de lecture instantanément si l'interlocuteur a lu
          if (lastMessageRead) {
            setMessages(prev => prev.map(m => m.senderId === currentUser.id ? { ...m, isRead: true } : m))
          }

          // 3. Charger les nouveaux messages uniquement si le nombre a changé
          if (messageCount > messages.length) {
            const messagesRes = await fetch(`/api/messages?requestId=${conversation.requestId}&userId=${currentUser.id}`)
            if (messagesRes.ok) {
              const data = await messagesRes.json()
              if (data.conversation && data.conversation.messages) {
                const newMsgs = data.conversation.messages
                setMessages(newMsgs)

                // Si le dernier message vient de l'autre, notifier
                const lastMsg = newMsgs[newMsgs.length - 1]
                if (lastMsg.senderId !== currentUser.id) {
                  trigger('message-received', {
                    name: otherUser?.firstName,
                    content: lastMsg.content,
                    requestId: conversation.requestId
                  })
                }

                // Synchroniser avec le store global
                const currentConversations = useAppStore.getState().conversations
                const updatedConvs = currentConversations.map(c => 
                  c.requestId === conversation.requestId 
                    ? data.conversation
                    : c
                )
                useAppStore.setState({ conversations: updatedConvs })
              }
            }
          }
        }
      } catch (err) {
        console.error('Optimized polling error:', err)
      }
    }, 2500)

    return () => {
      clearInterval(pollInterval)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [currentUser, conversation.requestId, messages.length, trigger, otherUser?.firstName])

  // Notifier le serveur quand l'utilisateur écrit (avec Throttle à 3s pour préserver le serveur)
  const handleTyping = () => {
    if (!currentUser || !conversation.requestId) return

    const now = Date.now()
    if (now - lastTypedRef.current > 3000) {
      lastTypedRef.current = now
      fetch('/api/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          requestId: conversation.requestId,
          isTyping: true
        })
      }).catch(err => console.error('Typing indicator error:', err))
    }

    // Effacer le timeout existant et relancer pour expirer la saisie après 3.5 secondes
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetch('/api/messages/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          requestId: conversation.requestId,
          isTyping: false
        })
      }).catch(err => console.error('Typing indicator error:', err))
    }, 3500)
  }

  // S'assurer de nettoyer le statut de saisie si l'utilisateur quitte l'écran de chat
  useEffect(() => {
    return () => {
      if (currentUser && conversation.requestId) {
        fetch('/api/messages/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            requestId: conversation.requestId,
            isTyping: false
          })
        }).catch(err => {})
      }
    }
  }, [currentUser, conversation.requestId])

  // Mark as read when opening chat or receiving new messages
  useEffect(() => {
    if (!currentUser || !conversation.requestId) return

    const markAsRead = async () => {
      try {
        await fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            requestId: conversation.requestId, 
            userId: currentUser.id,
            otherUserId: otherUser?.id 
          }),
        })
        
        // Update global store to reflect that messages are now read
        const updatedConvs = useAppStore.getState().conversations.map(c => 
          c.requestId === conversation.requestId 
            ? { ...c, messages: c.messages.map(m => m.receiverId === currentUser.id ? { ...m, isRead: true } : m) }
            : c
        )
        useAppStore.setState({ conversations: updatedConvs })
      } catch (err) {
        console.error('Failed to mark messages as read:', err)
      }
    }

    // Only mark as read if there are unread messages for the current user
    const hasUnread = messages.some(m => !m.isRead && m.receiverId === currentUser.id)
    if (hasUnread) {
      markAsRead()
    }
  }, [currentUser, conversation.requestId, messages])

  const setMinimizedConversation = useAppStore((state) => state.setMinimizedConversation)

  const handleMinimize = () => {
    setMinimizedConversation(conversation)
    onBack()
  }

  const sendMessage = async (content?: string, type: string = 'text') => {
    const textToSend = content || newMessage.trim()
    if (!textToSend || (remaining <= 0 && !isAccepted)) return

    // Optimistic update
    const tempId = `msg-${Date.now()}`
    const tempMsg: MessageItem = {
      id: tempId,
      senderId: currentUser?.id || '',
      receiverId: otherUser?.id || '',
      requestId: conversation.requestId,
      content: textToSend,
      type: type,
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    setMessages([...messages, tempMsg])
    setNewMessage('')
    setShowIceBreakers(false)
    setShowSurpriseInput(false)
    setJustSent(true)
    trigger('message-sent')
    setTimeout(() => setJustSent(false), 600)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id,
          receiverId: otherUser?.id,
          requestId: conversation.requestId,
          content: textToSend,
          type: type,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setMessages(prev => prev.filter(m => m.id !== tempId))
        // Show error message
        alert(errorData.error || 'Erreur lors de l\'envoi')
        return
      }

      const data = await res.json()
      // Replace temp message with real one from DB
      setMessages(prev => prev.map(m => m.id === tempId ? data.message : m))
      
      // Update global store
      const currentConversations = useAppStore.getState().conversations
      const updatedConvs = currentConversations.map(c => 
        c.requestId === conversation.requestId 
          ? { ...c, messages: [...c.messages.filter(m => m.id !== tempId), data.message], messageCount: c.messageCount + 1 }
          : c
      )
      useAppStore.setState({ conversations: updatedConvs })

    } catch (err) {
      console.error('Send message error:', err)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Optimisation systématique en WebP à l'aide de l'utilitaire existant
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1080,
        maxHeight: 1080,
        quality: 0.8
      })

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        sendMessage(base64String, 'image')
      }
      reader.readAsDataURL(optimizedFile)
    } catch (error) {
      console.error('Failed to optimize and send image:', error)
      alert("Erreur lors de l'optimisation de l'image.")
    }
    
    // Réinitialiser le sélecteur
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const sendIceBreaker = (text: string) => {
    sendMessage(text)
  }

  const handleMicPress = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (audioBlob.size > 1000) {
          await uploadAndSendVoiceMessage(audioBlob)
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (err) {
      console.error('Microphone access denied or error:', err)
      alert('Veuillez autoriser l\'accès au microphone pour envoyer un message vocal.')
    }
  }

  const handleStopAndSend = () => {
    if (isRecording) {
      setIsRecording(false)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }

  const handleCancelRecording = () => {
    setIsRecording(false)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      audioChunksRef.current = []
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const uploadAndSendVoiceMessage = async (audioBlob: Blob) => {
    if (remaining <= 0 && !isAccepted) return

    // Optimistic update
    const tempId = `msg-${Date.now()}`
    const tempMsg: MessageItem = {
      id: tempId,
      senderId: currentUser?.id || '',
      receiverId: otherUser?.id || '',
      requestId: conversation.requestId,
      content: URL.createObjectURL(audioBlob),
      type: 'voice',
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, tempMsg])
    setShowIceBreakers(false)
    setShowSurpriseInput(false)
    setJustSent(true)
    trigger('message-sent')
    setTimeout(() => setJustSent(false), 600)

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'voice.webm')
      formData.append('senderId', currentUser?.id || '')
      formData.append('receiverId', otherUser?.id || '')
      if (conversation.requestId) {
        formData.append('requestId', conversation.requestId)
      }

      const res = await fetch('/api/messages/voice', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        setMessages(prev => prev.filter(m => m.id !== tempId))
        alert(errorData.error || 'Erreur lors de l\'envoi du message vocal')
        return
      }

      const data = await res.json()
      setMessages(prev => prev.map(m => m.id === tempId ? data.message : m))

      const currentConversations = useAppStore.getState().conversations
      const updatedConvs = currentConversations.map(c =>
        c.requestId === conversation.requestId
          ? { ...c, messages: [...c.messages.filter(m => m.id !== tempId), data.message], messageCount: c.messageCount + 1 }
          : c
      )
      useAppStore.setState({ conversations: updatedConvs })

    } catch (err) {
      console.error('Send voice message error:', err)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  return (
    <div className="flex h-full flex-col bg-background/50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3 safe-area-top bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <motion.button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground p-2 -ml-2"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="size-5" />
        </motion.button>
        <div className="relative">
          <motion.img
            src={photo}
            alt={otherUser?.firstName}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
            whileTap={{ scale: 0.9 }}
          />
          {isAccepted && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{otherUser?.firstName}</h4>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-bold">
            {isAccepted ? (
              <span className="text-green-500 flex items-center gap-1">
                {t('chat.exchanged')}
              </span>
            ) : (
              <span className="text-primary flex items-center gap-1">
                🔒 {t('chat.remaining', { n: remaining })}
              </span>
            )}
          </p>
        </div>

        <motion.button
          onClick={handleMinimize}
          className="text-muted-foreground hover:text-primary p-2 h-10 w-10 flex items-center justify-center rounded-full bg-primary/5"
          whileTap={{ scale: 0.9 }}
          title="Miniaturiser"
        >
          <Minus className="size-5" />
        </motion.button>

        {isAccepted && otherUser && (
          <div className="flex items-center gap-1">
            <motion.a href={`tel:${otherUser.id}`} whileTap={{ scale: 0.9 }}>
              <Button size="icon" variant="ghost" className="text-primary h-10 w-10">
                <Phone className="size-5" />
              </Button>
            </motion.a>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 no-scrollbar">
        {/* Limit warning */}
        <AnimatePresence>
          {!isAccepted && remaining <= 1 && remaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400 shadow-sm"
            >
              <AlertCircle className="size-4 shrink-0" />
              {t('chat.almostLimit', { n: remaining })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message limit reached */}
        {!isAccepted && remaining <= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/20 p-6 text-center shadow-xl backdrop-blur-sm"
          >
            <motion.div
              className="text-5xl block mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              📱
            </motion.div>
            <p className="text-lg font-bold text-primary mb-2">{t('chat.limitReached')}</p>
            <p className="text-sm text-muted-foreground mb-4">{t('chat.limitHint')}</p>
            <Button className="w-full h-12 rounded-2xl font-bold bg-fonelove text-white shadow-lg">
               {t('chat.exchangePrompt')}
            </Button>
          </motion.div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUser?.id}
            showExpiry={!isAccepted}
            onSayThanks={() => {
              setNewMessage("Merci beaucoup pour le FoneLove ! 💖")
              setTimeout(() => {
                inputRef.current?.focus()
              }, 50)
            }}
          />
        ))}

        {otherUserIsTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4 animate-pulse-subtle"
          >
            <div className="bg-muted/60 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-2 shadow-sm border border-muted/10">
              <span className="text-xs text-muted-foreground font-medium select-none">
                {otherUser?.firstName || 'Quelqu\'un'} écrit
              </span>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ y: [0, -3, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              className="text-7xl mb-6 relative"
              animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              💬
              <motion.span 
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ scale: [0, 1.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              >
                ✨
              </motion.span>
            </motion.div>
            <p className="text-base font-medium text-muted-foreground max-w-[200px]">
              {t('chat.startConversation', { name: otherUser?.firstName || '' })}
            </p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Area */}
      <div className="border-t bg-background/95 backdrop-blur-md px-4 py-4 safe-area-bottom">
        
        {/* Quick Actions (Emoji bar) */}
        <AnimatePresence>
          {!isRecording && !showSurpriseInput && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4 w-full"
            >
              <FoneLoveButton
                target={{ userId: conversation.otherUser.id, firstName: conversation.otherUser.firstName, photo: conversation.otherUser.photos?.[0]?.url }}
                variant="chat"
              />
              <div className="text-[11px] text-muted-foreground italic flex items-start gap-1 flex-1 min-w-0 select-none animate-pulse-subtle ml-1 leading-tight whitespace-normal">
                <Sparkles className="size-3 text-pink-400 shrink-0 mt-[1px]" />
                <span className="break-words">Envoyer un FoneLove pour lui faire plaisir ! 💝</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Controls */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between gap-4 h-[64px] bg-primary rounded-3xl px-6 text-white shadow-xl shadow-primary/30"
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="size-3 bg-white rounded-full"
                  />
                  <span className="font-bold tracking-wide uppercase text-xs">{t('chat.recording')}</span>
                </div>
                <div className="flex-1 flex justify-center gap-1">
                  {[0,1,2,3,4,5,6,7].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-white/40 rounded-full"
                      animate={{ height: [8, Math.random() * 24 + 8, 8] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className="text-white font-bold hover:bg-white/10 rounded-xl px-2 sm:px-4"
                    onClick={handleCancelRecording}
                  >
                    <X className="size-5 sm:hidden" />
                    <span className="hidden sm:inline">{t('common.cancel')}</span>
                  </Button>
                  <Button 
                    onClick={handleStopAndSend}
                    className="bg-white text-primary rounded-xl font-bold px-3 sm:px-4 hover:bg-white/90 shadow-sm"
                  >
                    <Send className="size-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Envoyer</span>
                  </Button>
                </div>
              </motion.div>
            ) : showSurpriseInput ? (
              <motion.div
                key="surprise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col gap-3 p-4 bg-muted/30 rounded-3xl border border-primary/20 mb-2 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Gift className="size-3" /> {t('chat.giftTitle')}
                  </span>
                  <motion.button 
                    onClick={() => setShowSurpriseInput(false)}
                    className="text-muted-foreground hover:text-foreground"
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="size-4" />
                  </motion.button>
                </div>
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    placeholder="Tape ton secret ici..."
                    className="h-12 rounded-2xl bg-background border-2 border-primary/20 px-4"
                  />
                  <Button 
                    className="h-12 w-12 rounded-2xl bg-primary text-white shadow-lg"
                    onClick={() => sendMessage(newMessage, 'gift')}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="size-5" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-end gap-2 w-full">
                <div className="flex-1 relative flex items-end bg-background border border-muted rounded-[24px] focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm min-h-[48px]">
                  
                  <div className="absolute left-1 bottom-[4px] flex items-center">
                    <DatingEmojiPicker onSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
                  </div>

                  <textarea
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                      }
                      // @ts-ignore
                      inputRef.current = el;
                    }}
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={t('chat.inputPlaceholder')}
                    rows={1}
                    className="w-full resize-none bg-transparent pl-[52px] pr-[52px] py-[12px] text-[15px] outline-none no-scrollbar rounded-[24px]"
                    style={{ maxHeight: '120px' }}
                  />

                  <div className="absolute right-1 bottom-[4px] flex items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      hidden 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="size-5" />
                    </Button>
                  </div>
                </div>

                {newMessage.trim() ? (
                  <motion.div whileTap={{ scale: 0.9 }} className="shrink-0 mb-0">
                    <Button
                      size="icon"
                      className="h-[48px] w-[48px] rounded-full bg-fonelove text-white shadow-lg border-0"
                      onClick={() => sendMessage()}
                    >
                      <Send className="size-5 -ml-0.5" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="relative shrink-0 mb-0"
                  >
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={handleMicPress}
                      className={cn(
                        "h-[48px] w-[48px] rounded-full transition-all duration-300 border-0",
                        isRecording ? "bg-primary text-white scale-[1.3] shadow-lg shadow-primary/30" : "bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      <Mic className="size-5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
