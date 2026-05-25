const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const userId = 'cmpd5tirc0000l504g7gjdqsq';
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
    });
    console.log(JSON.stringify(gift, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
