import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- DIAGNOSTIC BASE DE DONNÉES ---')
  
  const userCount = await prisma.user.count()
  console.log(`Nombre total d'utilisateurs : ${userCount}`)
  
  const realUsers = await prisma.user.findMany({
    where: {
      email: { not: { contains: 'fonelove.fr' } }
    },
    include: {
      profile: true,
      photos: true
    }
  })
  
  console.log(`Nombre d'utilisateurs réels : ${realUsers.length}`)
  
  realUsers.forEach(u => {
    console.log(`- ${u.firstName} (${u.email}) :`)
    console.log(`  ID: ${u.id}`)
    console.log(`  Onboarding Done: ${u.profile?.onboardingDone}`)
    console.log(`  Photos: ${u.photos.length}`)
    console.log(`  Active: ${u.isActive}`)
    console.log(`  Paused: ${u.isPaused}`)
  })
  
  const discoveryCount = await prisma.user.count({
    where: {
      isActive: true,
      isPaused: false,
      profile: { onboardingDone: true },
      photos: { some: {} }
    }
  })
  console.log(`Utilisateurs visibles en découverte : ${discoveryCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
