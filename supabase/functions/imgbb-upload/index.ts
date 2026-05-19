// ============================================================
// ConnectPhone — Edge Function: imgbb-upload
// Proxy d'upload d'images vers ImgBB
// Évite d'exposer la clé API ImgBB côté client.
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const IMGBB_API_KEY = Deno.env.get('IMGBB_API_KEY')!
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non supportée. Utilisez POST.' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const formData = await req.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'Fichier image manquant. Envoyez un champ "image".' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier la taille
    if (imageFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: `Fichier trop volumineux. Maximum: ${MAX_FILE_SIZE / 1024 / 1024} Mo.` }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ error: `Type non supporté: ${imageFile.type}. Utilisez JPEG, PNG, GIF ou WebP.` }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Convertir en base64 pour ImgBB
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    // Optionnel: expiration (en secondes), par défaut pas d'expiration
    const expiration = formData.get('expiration') as string | null

    // Upload vers ImgBB
    const imgbbFormData = new FormData()
    imgbbFormData.append('key', IMGBB_API_KEY)
    imgbbFormData.append('image', base64)
    if (expiration) {
      imgbbFormData.append('expiration', expiration)
    }

    const controller = new AbortController()
    setTimeout(() => controller.abort(), 30000) // 30s timeout

    const imgbbRes = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: imgbbFormData,
      signal: controller.signal,
    })

    if (!imgbbRes.ok) {
      const errorText = await imgbbRes.text()
      console.error('ImgBB API error:', imgbbRes.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'upload vers ImgBB', details: errorText }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const imgbbData = await imgbbRes.json()

    if (!imgbbData.success) {
      return new Response(
        JSON.stringify({ error: 'ImgBB a rejeté l\'upload', details: imgbbData }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Retourner les infos utiles
    return new Response(
      JSON.stringify({
        success: true,
        url: imgbbData.data.url,
        displayUrl: imgbbData.data.display_url,
        deleteUrl: imgbbData.data.delete_url,
        thumbUrl: imgbbData.data.thumb?.url,
        mediumUrl: imgbbData.data.medium?.url,
        width: imgbbData.data.width,
        height: imgbbData.data.height,
        size: imgbbData.data.size,
        format: imgbbData.data.format,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('imgbb-upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
