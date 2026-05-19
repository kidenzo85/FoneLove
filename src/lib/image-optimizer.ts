/**
 * Utilitaire de conversion et d'optimisation d'images côté client
 * Convertit systématiquement en WebP pour un chargement ultra-rapide
 */

interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0 à 1
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const { maxWidth = 1080, maxHeight = 1080, quality = 0.8 } = options

  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image, on rejette
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier fourni n\'est pas une image'))
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculer les nouvelles dimensions en conservant le ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }

        // Dessiner l'image redimensionnée sur le canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir en WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la conversion de l\'image'))
              return
            }
            
            // Créer un nouveau fichier WebP
            const originalName = file.name.split('.')[0] || 'photo'
            const optimizedFile = new File([blob], `${originalName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            
            resolve(optimizedFile)
          },
          'image/webp',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Erreur lors du chargement de l\'image'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }
  })
}
