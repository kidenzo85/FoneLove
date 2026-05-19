/**
 * ImgBB Image Upload Utility
 * Uploads images to ImgBB and returns the public URL
 */

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || ''
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

export interface ImgBBResponse {
  success: boolean
  data: {
    id: string
    title: string
    url: string
    display_url: string
    width: number
    height: number
    size: number
    time: string
    expiration: string | null
    image: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    thumb: string
    medium: string
    delete_url: string
  }
}

/**
 * Upload an image file to ImgBB
 * @param file - The File object or Buffer to upload
 * @param name - Optional name for the image
 * @param expiration - Optional expiration in seconds (null = no expiration)
 * @returns The ImgBB response with image URLs
 */
export async function uploadToImgBB(
  file: File | Buffer | string,
  name?: string,
  expiration?: number
): Promise<ImgBBResponse> {
  let base64Data: string

  if (!IMGBB_API_KEY) {
    throw new Error('La clé API ImgBB est manquante. Ajoutez NEXT_PUBLIC_IMGBB_API_KEY dans votre fichier .env.local')
  }

  if (typeof file === 'string') {
    // Already a base64 string
    base64Data = file
  } else if (file instanceof File) {
    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer()
    base64Data = Buffer.from(arrayBuffer).toString('base64')
  } else {
    // Buffer
    base64Data = file.toString('base64')
  }

  const formData = new FormData()
  formData.append('key', IMGBB_API_KEY)
  formData.append('image', base64Data)

  if (name) {
    formData.append('name', name)
  }

  if (expiration) {
    formData.append('expiration', expiration.toString())
  }

  const response = await fetch(IMGBB_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ImgBB upload failed: ${response.status} - ${errorText}`)
  }

  const result: ImgBBResponse = await response.json()

  if (!result.success) {
    throw new Error('ImgBB upload was not successful')
  }

  return result
}

/**
 * Upload multiple images to ImgBB
 * @param files - Array of File objects or base64 strings
 * @returns Array of ImgBB responses
 */
export async function uploadMultipleToImgBB(
  files: (File | Buffer | string)[]
): Promise<ImgBBResponse[]> {
  const results = await Promise.all(
    files.map((file, index) =>
      uploadToImgBB(file, `connectphone_${Date.now()}_${index}`)
    )
  )
  return results
}

/**
 * Delete an image from ImgBB (requires delete URL from upload response)
 */
export async function deleteFromImgBB(deleteUrl: string): Promise<boolean> {
  try {
    const response = await fetch(deleteUrl, { method: 'DELETE' })
    return response.ok
  } catch {
    return false
  }
}
