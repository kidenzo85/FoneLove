const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client with the production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
    }
  }
});

const userId = 'cmpd5tirc0000l504g7gjdqsq';

async function testEndpoint(name, queryFn) {
  console.log(`\n===================================`);
  console.log(`Testing endpoint query: ${name}`);
  console.log(`===================================`);
  try {
    const start = Date.now();
    const result = await queryFn();
    console.log(`Success! (took ${Date.now() - start}ms)`);
    console.log('Result type:', Array.isArray(result) ? `Array (${result.length} items)` : typeof result);
    if (result && !Array.isArray(result)) {
      console.log('Keys:', Object.keys(result));
    }
  } catch (err) {
    console.error(`FAILED:`, err.message || err);
  }
}

async function run() {
  // 1. Visits endpoint: /api/profile/visits?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('Profile Visits', async () => {
    return await prisma.profileVisit.findMany({
      where: { profileId: userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            bio: true,
            mood: true,
            photos: {
              select: { id: true, url: true, position: true, isPrimary: true },
              orderBy: { position: 'asc' },
            },
            profile: true,
          },
        },
      },
      take: 20,
    });
  });

  // 2. Sent Requests endpoint: /api/requests?userId=cmpd5tirc0000l504g7gjdqsq&type=sent
  await testEndpoint('Sent Requests', async () => {
    return await prisma.numberRequest.findMany({
      where: { senderId: userId },
      include: {
        receiver: {
          include: {
            photos: { orderBy: { position: 'asc' } },
            profile: true,
            badges: true,
            prompts: true,
          },
        },
      },
    });
  });

  // 3. Messages endpoint: /api/messages?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('Messages', async () => {
    return await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, firstName: true, photos: { select: { url: true } } }
        },
        receiver: {
          select: { id: true, firstName: true, photos: { select: { url: true } } }
        }
      }
    });
  });

  // 4. Moments endpoint: /api/moments?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('Moments', async () => {
    return await prisma.moment.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true }
            }
          }
        }
      }
    });
  });

  // 5. Wallet endpoint: /api/fonelove/wallet?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('FoneLove Wallet', async () => {
    return await prisma.foneLoveWallet.findUnique({
      where: { userId },
    });
  });

  // 6. Connections endpoint: /api/connections?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('Connections', async () => {
    return await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            photos: { select: { url: true, isPrimary: true } }
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            photos: { select: { url: true, isPrimary: true } }
          }
        }
      }
    });
  });

  // 7. Streak endpoint: /api/credits/streak?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('Daily Streak', async () => {
    return await prisma.dailyStreak.findUnique({
      where: { userId },
    });
  });

  // 8. Pending Gifts endpoint: /api/fonelove/pending-gifts?userId=cmpd5tirc0000l504g7gjdqsq
  await testEndpoint('Pending Gifts', async () => {
    return await prisma.foneLoveGift.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            photos: {
              where: { isPrimary: true },
              select: { url: true },
            },
          },
        },
      },
    });
  });

  // Disconnect
  await prisma.$disconnect();
}

run();
