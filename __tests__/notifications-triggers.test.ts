import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as likePOST } from '../src/app/api/likes/route'
import prisma from '../src/lib/prisma'

// Mock Prisma
vi.mock('../src/lib/prisma', () => {
  return {
    default: {
      like: {
        findFirst: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      appNotification: {
        create: vi.fn().mockResolvedValue({}),
      }
    }
  }
})

// Mock the push-service module
const mockSendPushToUser = vi.fn()
vi.mock('../src/lib/push-service', () => {
  return {
    sendPushToUser: (...args: any[]) => mockSendPushToUser(...args)
  }
})

describe('Notifications Triggers in APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait déclencher une notification push lors de la création dun J aime', async () => {
    // Simuler l'absence de like existant (nouveau like)
    ;(prisma.like.findFirst as any).mockResolvedValueOnce(null) // existing
    ;(prisma.like.findFirst as any).mockResolvedValueOnce(null) // reverseLike (non mutuel)
    
    ;(prisma.like.create as any).mockResolvedValueOnce({ id: 'like1', senderId: 'user1', receiverId: 'user2', isMutual: false })

    ;(prisma.user.findMany as any).mockResolvedValueOnce([
      { id: 'user1', firstName: 'Alice' },
      { id: 'user2', firstName: 'Bob' }
    ])

    const req = new NextRequest('http://localhost/api/likes', {
      method: 'POST',
      body: JSON.stringify({ senderId: 'user1', receiverId: 'user2' })
    })

    const response = await likePOST(req)
    expect(response.status).toBe(200)

    // Laisser les promesses asynchrones se résoudre
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(prisma.appNotification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user2',
          type: 'profile_liked'
        })
      })
    )

    expect(mockSendPushToUser).toHaveBeenCalledTimes(1)
    expect(mockSendPushToUser).toHaveBeenCalledWith('user2', expect.objectContaining({
      type: 'match',
      title: '👀 Nouveau J\'aime !'
    }))
  })

  it('devrait déclencher 2 notifications push lors dun Match Mutuel', async () => {
    // Simuler un reverse like existant (Match mutuel)
    ;(prisma.like.findFirst as any).mockResolvedValueOnce(null) // existing
    ;(prisma.like.findFirst as any).mockResolvedValueOnce({ id: 'like0', senderId: 'user2', receiverId: 'user1' }) // reverseLike
    
    ;(prisma.like.create as any).mockResolvedValueOnce({ id: 'like1', senderId: 'user1', receiverId: 'user2', isMutual: true })
    ;(prisma.like.update as any).mockResolvedValueOnce({})

    ;(prisma.user.findMany as any).mockResolvedValueOnce([
      { id: 'user1', firstName: 'Alice' },
      { id: 'user2', firstName: 'Bob' }
    ])

    const req = new NextRequest('http://localhost/api/likes', {
      method: 'POST',
      body: JSON.stringify({ senderId: 'user1', receiverId: 'user2' })
    })

    const response = await likePOST(req)
    expect(response.status).toBe(200)

    // Laisser les promesses asynchrones se résoudre
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(prisma.appNotification.create).toHaveBeenCalledTimes(2)

    expect(mockSendPushToUser).toHaveBeenCalledTimes(2)
    expect(mockSendPushToUser).toHaveBeenCalledWith('user1', expect.objectContaining({ type: 'match' }))
    expect(mockSendPushToUser).toHaveBeenCalledWith('user2', expect.objectContaining({ type: 'match' }))
  })
})
