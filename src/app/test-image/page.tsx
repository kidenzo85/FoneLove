'use client'

import { useState } from 'react'
import { optimizeImage } from '@/lib/image-optimizer'
import { uploadToImgBB } from '@/lib/imgbb'
import { Button } from '@/components/ui/button'

export default function TestImagePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [optimizedFile, setOptimizedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('En attente...')
  const [finalUrl, setFinalUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleTest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setOriginalFile(file)
    setOptimizedFile(null)
    setFinalUrl('')
    setIsProcessing(true)
    setStatus('1. Optimisation en cours (Canvas WebP)...')

    try {
      const startTime = performance.now()
      const webpFile = await optimizeImage(file)
      const endTime = performance.now()
      
      setOptimizedFile(webpFile)
      setStatus(`2. Optimisé en ${(endTime - startTime).toFixed(0)}ms. Upload vers ImgBB en cours...`)

      const result = await uploadToImgBB(webpFile, `test_fonelove_${Date.now()}`)
      
      if (result.success) {
        setFinalUrl(result.data.url)
        setStatus('✅ Succès ! Image optimisée et uploadée.')
      } else {
        setStatus('❌ Erreur lors de l\'upload ImgBB.')
      }
    } catch (err: any) {
      console.error(err)
      setStatus(`❌ Erreur: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(2) + ' Ko'
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 mt-10 border rounded-2xl bg-card">
      <h1 className="text-2xl font-bold">Labo de Test : Images WebP</h1>
      
      <p className="text-sm text-muted-foreground">
        Testez l'algorithme de compression et l'upload ImgBB en temps réel.
      </p>

      <input 
        type="file" 
        accept="image/*" 
        onChange={handleTest}
        disabled={isProcessing}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-primary/10 file:text-primary
          hover:file:bg-primary/20"
      />

      <div className="p-4 bg-muted rounded-xl space-y-2 text-sm font-medium">
        <p>Statut : <span className="text-primary">{status}</span></p>
        
        {originalFile && (
          <p>📦 Poids original : <span className="text-red-500">{formatSize(originalFile.size)}</span></p>
        )}
        
        {optimizedFile && originalFile && (
          <p>
            🚀 Poids WebP : <span className="text-green-500">{formatSize(optimizedFile.size)}</span> 
            <span className="text-muted-foreground ml-2">
              (-{((1 - optimizedFile.size / originalFile.size) * 100).toFixed(0)}%)
            </span>
          </p>
        )}
      </div>

      {finalUrl && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-green-500">✅ URL ImgBB Finale :</p>
          <a href={finalUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 break-all underline">
            {finalUrl}
          </a>
          <img src={finalUrl} alt="Résultat" className="mt-4 rounded-xl border-2 border-primary w-full h-auto" />
        </div>
      )}
    </div>
  )
}
