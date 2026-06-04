import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const senderId = formData.get('senderId') as string | null
    const receiverId = formData.get('receiverId') as string | null
    const requestId = formData.get('requestId') as string | null

    if (!file || !senderId || !receiverId) {
      return NextResponse.json({ error: 'Fichier et identifiants requis' }, { status: 400 })
    }

    // Check message limit (3 messages total per person before number exchange)
    if (requestId) {
      const request = await prisma.numberRequest.findUnique({
        where: { id: requestId }
      })

      if (request && request.status === 'pending') {
        const totalMessages = await prisma.message.count({
          where: {
            OR: [
              { senderId, receiverId },
              { senderId: receiverId, receiverId: senderId }
            ]
          },
        })

        if (totalMessages >= 3) {
          return NextResponse.json({
            error: 'Limite de 3 messages atteinte. Échangez vos numéros pour continuer !',
          }, { status: 400 })
        }
      }
    }

    // Initialize Supabase Client to upload file
    const supabase = createAdminClient()

    // Ensure storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.name === 'voice-messages')
    if (!bucketExists) {
      await supabase.storage.createBucket('voice-messages', {
        public: true,
        allowedMimeTypes: ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/x-m4a'],
        fileSizeLimit: 10485760 // 10MB
      })
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Construct a unique filename
    const fileExtension = file.name.split('.').pop() || 'webm'
    const fileName = `${senderId}/${Date.now()}.${fileExtension}`

    // Upload file to bucket
    const { error: uploadError } = await supabase.storage
      .from('voice-messages')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'audio/webm',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Échec du téléchargement du fichier audio' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('voice-messages').getPublicUrl(fileName)

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    // Save message with type voice
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        requestId: requestId || null,
        content: publicUrl,
        type: 'voice',
        expiresAt,
      },
    })

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        requestId: message.requestId,
        content: message.content,
        type: message.type,
        isRead: message.isRead,
        createdAt: message.createdAt,
        expiresAt: message.expiresAt,
      },
    })
  } catch (error) {
    console.error('Voice Message POST error:', error)
    return NextResponse.json({ error: "Oups, problème de connexion. Réessaie d'envoyer ! 🔄" }, { status: 500 })
  }
}
