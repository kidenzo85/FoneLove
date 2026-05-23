const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const userId = 'cmp59xnt80000v1ug6kwgzkvo';
  try {
    console.log('Testing profiles GET query with non-existent userId...');
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        isPaused: false,
        profile: {
          onboardingDone: true,
        },
        photos: {
          some: {},
        },
        ...(userId ? {
          NOT: [
            { id: userId },
            {
              receivedRequests: {
                some: {
                  senderId: userId,
                  status: 'accepted'
                }
              }
            }
          ]
        } : {}),
      },
      include: {
        profile: true,
        photos: { orderBy: { position: 'asc' } },
        prompts: true,
        badges: true,
        activeFeatures: {
          where: {
            action: 'boost',
            expiresAt: { gt: new Date() },
          },
        },
        receivedRequests: userId ? {
          where: {
            senderId: userId,
          },
        } : false,
      },
    });
    console.log('Query succeeded, found users count:', allUsers.length);
  } catch (error) {
    console.error('Error in profiles query:', error.message);
    console.error('Full details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
