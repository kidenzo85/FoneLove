import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadToImgBB } from '@/lib/imgbb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 })

    const photos = await prisma.photo.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
    })

    const formatted = photos.map((p) => ({
      id: p.id,
      url: p.url,
      position: p.position,
      isPrimary: p.isPrimary,
    }))

    return NextResponse.json({ photos: formatted })
  } catch (error) {
    console.error('Photos GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const userId = formData.get('userId') as string
    const file = formData.get('file') as File
    const position = parseInt(formData.get('position') as string) || 0
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!userId || !file) {
      return NextResponse.json({ error: 'userId et fichier requis' }, { status: 400 })
    }

    // Upload to ImgBB
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString('base64')
    const imgResult = await uploadToImgBB(base64Data, `connectphone_${userId}_${Date.now()}`)

    // If this is primary, unset other primary photos
    if (isPrimary) {
      await prisma.photo.updateMany({
        where: {
          userId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      })
    }

    // Save photo reference to database
    const photo = await prisma.photo.create({
      data: {
        userId,
        url: imgResult.data.url,
        position,
        isPrimary,
      },
    })

    return NextResponse.json({
      photo: {
        id: photo.id,
        url: photo.url,
        position: photo.position,
        isPrimary: photo.isPrimary,
      },
    })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { photoId, userId } = await req.json()

    if (!photoId || !userId) {
      return NextResponse.json({ error: 'photoId et userId requis' }, { status: 400 })
    }

    await prisma.photo.deleteMany({
      where: {
        id: photoId,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
