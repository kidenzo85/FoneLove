import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function run() {
  try {
    const userId = "cmpd5tirc0000l504g7gjdqsq"

    const gift = await prisma.foneLoveGift.findFirst({
      where: {
        receiverId: userId,
        isSeen: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          include: {
            user: {
              select: { firstName: true }
            }
          }
        }
      }
    })

    console.log("Success:", gift)
  } catch (err) {
    console.error("Prisma error:", err)
  } finally {
    await prisma.$disconnect()
  }
}

run()
