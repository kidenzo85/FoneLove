'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Image as ImageIcon, X, Loader2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { useConnectCoinStore } from '@/lib/connectcoin-store'
import { useT } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'
import { optimizeImage } from '@/lib/image-optimizer'

export default function AddMomentDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { t } = useT()
  const { currentUser, premiumActions, setMoments, moments } = useAppStore()
  const { balance, setShowCreditStore } = useConnectCoinStore()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Find cost from premium actions
  const momentConfig = premiumActions.find(a => a.action === 'post_moment')
  const baseCost = momentConfig?.costCC || 50
  const cost = selectedFiles.length > 0 ? baseCost * selectedFiles.length : baseCost
  const canAfford = balance >= cost

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Check max files limit (e.g. 5)
      if (selectedFiles.length + files.length > 5) {
        setError('Tu peux ajouter un maximum de 5 photos à la fois.')
        return
      }

      const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024)
      if (validFiles.length < files.length) {
        setError('Certaines photos sont trop grandes (max 5 Mo). Elles ont été ignorées.')
      } else {
        setError('')
      }

      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles])
        const newPreviewUrls = validFiles.map(f => URL.createObjectURL(f))
        setPreviewUrls(prev => [...prev, ...newPreviewUrls])
      }
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setError('')
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !currentUser) return
    
    // 1. Générer des moments "optimistes"
    const tempIds = previewUrls.map((_, i) => `temp-${Date.now()}-${i}`)
    const optimisticMoments = previewUrls.map((url, i) => ({
      id: tempIds[i],
      userId: currentUser.id,
      type: 'photo',
      mediaUrl: url,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user: currentUser,
      isOptimistic: true // pour les styliser avec un spinner si on veut
    }))

    // 2. Mettre à jour l'UI instantanément (fermer la modale, ajouter les moments, déduire les CC localement)
    const store = useAppStore.getState()
    store.setMoments([...optimisticMoments, ...store.moments])
    
    // On déduit les CC de manière optimiste pour éviter les doubles dépenses
    useConnectCoinStore.setState(prev => ({
      balance: prev.balance - cost
    }))

    toast.success('🚀 Envoi en cours...', { description: 'Tes photos s\'ajoutent en arrière-plan.' })
    onClose()
    setSelectedFiles([])
    setPreviewUrls([])

    // 3. Processus en arrière-plan
    try {
      // Optimisation des images (WebP systématique)
      const optimizedFiles = await Promise.all(selectedFiles.map(f => optimizeImage(f, { maxWidth: 1080, maxHeight: 1080, quality: 0.8 })))
      
      const { uploadMultipleToImgBB } = await import('@/lib/imgbb')
      const imgResults = await uploadMultipleToImgBB(optimizedFiles)
      const mediaUrls = imgResults.map(res => res.data.url)

      // 4. Poster à l'API
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          mediaUrls,
          type: 'photo',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Oups, l\'envoi a échoué.')
      }

      // 5. Remplacer les moments optimistes par les réels
      const currentMoments = useAppStore.getState().moments
      // Filtrer les optimistes qu'on vient d'ajouter
      const filteredMoments = currentMoments.filter(m => !tempIds.includes(m.id))
      
      let newMoments: any[] = []
      if (data.moments && data.moments.length > 0) {
        newMoments = data.moments.map((m: any) => ({ ...m, user: currentUser }))
      } else if (data.moment) {
        newMoments = [{ ...data.moment, user: currentUser }]
      }

      useAppStore.getState().setMoments([...newMoments, ...filteredMoments])
      
      // Mettre à jour la balance réelle depuis la base de données
      useConnectCoinStore.getState().fetchBalance(currentUser.id)
      
      toast.success('✨ Moments publiés !', { description: 'Tes photos sont maintenant visibles en haut.' })

    } catch (err: any) {
      console.error('Upload moment error:', err)
      toast.error('Erreur lors de la publication', { description: err.message || 'L\'envoi a échoué. Réessaie.' })
      
      // En cas d'erreur, retirer les moments optimistes et restaurer les CC
      const currentMoments = useAppStore.getState().moments
      const filteredMoments = currentMoments.filter(m => !tempIds.includes(m.id))
      useAppStore.getState().setMoments(filteredMoments)
      useConnectCoinStore.getState().fetchBalance(currentUser.id) // resynchronise la balance réelle
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md rounded-3xl mx-auto bg-card text-card-foreground shadow-2xl p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-center text-xl font-black px-2">
            Ajoute tes photos en haut
          </DialogTitle>
          <DialogDescription className="text-center font-medium text-amber-500 text-sm px-2">
            🔥 Tes photos seront visibles par tous en haut de l'écran pendant 24h !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2 w-full overflow-hidden">
          {/* Photo Picker */}
          {previewUrls.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x w-full">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] w-[140px] shrink-0 rounded-2xl overflow-hidden border-2 border-primary/30 snap-start">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80 transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {selectedFiles.length < 5 && (
                <div 
                  className="aspect-[3/4] w-[140px] shrink-0 rounded-2xl border-2 border-dashed border-primary/30 bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors snap-start"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="size-8 text-primary mb-2" />
                  <span className="text-xs font-semibold text-center px-2">Ajouter</span>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="relative aspect-[3/4] w-full max-w-[240px] mx-auto rounded-2xl border-2 border-dashed border-primary/30 bg-muted/50 overflow-hidden cursor-pointer hover:bg-muted/80 transition-colors flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <ImageIcon className="size-6 text-primary" />
                </div>
                <span className="text-sm font-semibold">Appuie ici pour choisir tes photos</span>
                <span className="text-[10px] mt-1 opacity-70">Jusqu'à 5 photos à la fois</span>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={handleFileSelect} 
          />

          {error && (
            <div className="text-red-500 text-xs font-semibold text-center bg-red-500/10 p-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Pricing Info */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm font-bold text-amber-600">Prix pour {selectedFiles.length || 1} photo(s)</span>
            <div className="flex items-center gap-1 bg-white dark:bg-black rounded-full px-2 py-0.5 shadow-sm">
              <span className="text-[10px]">🪙</span>
              <span className="text-sm font-black text-amber-500">{cost} CC</span>
            </div>
          </div>

          {/* Action Button */}
          {canAfford ? (
            <Button
              className="w-full h-14 rounded-xl text-white font-black text-sm shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-pink-500 active:scale-95 transition-all"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
            >
              🚀 Oui, je partage ({cost} pièces)
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-center text-xs text-red-500 font-bold">
                Tu n'as pas assez de pièces (Tu as {balance} pièces)
              </div>
              <Button
                className="w-full h-14 rounded-xl text-slate-900 font-black text-sm shadow-lg bg-gradient-to-r from-amber-400 to-yellow-500 active:scale-95 transition-all flex gap-2"
                onClick={() => {
                  onClose()
                  setShowCreditStore(true, 'starter')
                }}
              >
                <span>🪙</span>
                Il me faut plus de pièces
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
