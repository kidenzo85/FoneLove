import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const user = await prisma.user.findFirst()
    console.log("Database connected. User:", user)
  } catch (e) {
    console.error("Database connection error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
