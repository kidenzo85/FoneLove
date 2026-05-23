const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing Prisma PaymentOrder table query...');
    const count = await prisma.paymentOrder.count();
    console.log('PaymentOrder count:', count);
    
    // Create a mock order to test write capability
    console.log('\nCreating a test order...');
    const order = await prisma.paymentOrder.create({
      data: {
        userId: 'cmp59xnt80000v1ug6kwgzkvo', // using a mock/test user ID from the database or existing
        packType: 'decouverte',
        amountXAF: 2000,
        ccAmount: 30,
        bonusCC: 0,
        status: 'pending',
        appTransactionRef: 'FL-TEST-123456',
        coolpayRef: 'CP-TEST-123456',
        paymentUrl: 'https://my-coolpay.com/paylink/test',
        metadata: JSON.stringify({ test: true }),
      }
    });
    console.log('Successfully created test order:', order.id);
    
    // Delete the mock order to clean up
    console.log('\nCleaning up test order...');
    await prisma.paymentOrder.delete({
      where: { id: order.id }
    });
    console.log('Cleaned up successfully!');
    
  } catch (e) {
    console.error('Error during Prisma test:', e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
