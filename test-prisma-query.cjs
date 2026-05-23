// Test Prisma connection directly
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('Testing Prisma connection...');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    // Test wallet
    const walletCount = await prisma.wallet.count();
    console.log('Wallet count:', walletCount);

    // Test FoneLoveWallet
    const flCount = await prisma.foneLoveWallet.count();
    console.log('FoneLoveWallet count:', flCount);

    // Test profile
    const profileCount = await prisma.profile.count();
    console.log('Profile count:', profileCount);

    // Test the exact query from the wallet route
    const testUserId = 'cmp59xnt80000v1ug6kwgzkvo';
    console.log('\nTesting wallet query for userId:', testUserId);
    
    const wallet = await prisma.foneLoveWallet.findUnique({
      where: { userId: testUserId },
    });
    console.log('FoneLoveWallet result:', wallet);

    // Test user query
    const user = await prisma.user.findUnique({
      where: { id: testUserId },
      select: { id: true, firstName: true, email: true },
    });
    console.log('User result:', user);

  } catch (e) {
    console.error('Prisma error:', e.message);
    console.error('Full error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
