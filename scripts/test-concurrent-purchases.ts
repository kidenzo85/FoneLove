import { test } from 'node:test';
import * as assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables for the test
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-concurrent-user-' + Date.now();
const CONCURRENT_REQUESTS = 20;

async function runConcurrentTest() {
  console.log('🔄 Setting up test environment...');
  
  // 1. Create a test user
  const user = await prisma.user.create({
    data: {
      id: TEST_USER_ID,
      firstName: 'Concurrent',
      lastName: 'Tester',
      email: `tester-${Date.now()}@example.com`,
      phone: `+237${Math.floor(100000000 + Math.random() * 900000000)}`,
      gender: 'MALE',
      role: 'USER',
      password: 'password123',
    }
  });
  console.log(`✅ Created test user: ${user.id}`);

  // 2. Create a payment order manually (simulating the /initiate endpoint)
  const appTransactionRef = `ORDER-${Date.now()}`;
  const packType = 'fonelove_1000'; // Or a CC pack
  
  const order = await prisma.paymentOrder.create({
    data: {
      userId: user.id,
      packType: packType,
      amountXAF: 1000,
      ccAmount: 0,
      bonusCC: 0,
      status: 'pending',
      appTransactionRef: appTransactionRef,
      customerPhone: user.phone!,
      customerEmail: user.email,
      metadata: JSON.stringify({
        type: 'fonelove_recharge',
        packLabel: '1000 FoneLove',
        flAmount: 1000,
      }),
      coolpayRef: `CP-${Date.now()}`
    }
  });
  console.log(`✅ Created pending order: ${order.id} with ref: ${appTransactionRef}`);

  // 3. Prepare the webhook payload
  const payload = {
    transaction_ref: order.coolpayRef,
    app_transaction_ref: appTransactionRef,
    transaction_status: 'SUCCESSFUL',
    operator: 'MTN',
    operator_ref: `MTN-${Date.now()}`
  };

  console.log(`🚀 Firing ${CONCURRENT_REQUESTS} concurrent webhooks...`);

  // 4. Fire concurrent requests to the local server
  // Note: The Next.js dev server must be running!
  const requests = Array.from({ length: CONCURRENT_REQUESTS }).map((_, index) => {
    return fetch(`${BASE_URL}/api/payments/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then(res => {
        console.log(`Request ${index + 1} completed with status: ${res.status}`);
        return res.json();
    }).catch(err => {
        console.error(`Request ${index + 1} failed:`, err.message);
        return { error: err.message };
    });
  });

  const results = await Promise.all(requests);
  
  // 5. Verify the results
  console.log('\n📊 Verifying results in database...');

  // Check the order status
  const updatedOrder = await prisma.paymentOrder.findUnique({
    where: { id: order.id }
  });
  console.log(`Order status: ${updatedOrder?.status}`);
  
  // Check the FoneLove Wallet balance
  const flWallet = await prisma.foneLoveWallet.findUnique({
    where: { userId: user.id }
  });
  console.log(`FoneLove Wallet Balance: ${flWallet?.balance}`);

  // Check the number of FoneLove transactions
  const flTransactions = await prisma.foneLoveTransaction.findMany({
    where: { walletId: flWallet?.id, type: 'recharge' }
  });
  console.log(`Number of recharge transactions: ${flTransactions.length}`);

  // 6. Assertions
  try {
      assert.strictEqual(updatedOrder?.status, 'success', 'Order should be marked as success');
      assert.strictEqual(flWallet?.balance, 1000, 'Wallet balance should be exactly 1000 (no double credit)');
      assert.strictEqual(flTransactions.length, 1, 'There should be exactly one recharge transaction');
      console.log('\n✅ ALL CONCURRENCY TESTS PASSED! The system is safe.');
  } catch (err: any) {
      console.error('\n❌ TEST FAILED:', err.message);
  } finally {
      // 7. Cleanup
      console.log('\n🧹 Cleaning up test data...');
      await prisma.foneLoveTransaction.deleteMany({ where: { walletId: flWallet?.id } });
      if (flWallet) await prisma.foneLoveWallet.delete({ where: { id: flWallet.id } });
      await prisma.paymentOrder.delete({ where: { id: order.id } });
      await prisma.user.delete({ where: { id: user.id } });
      console.log('✅ Cleanup complete.');
      await prisma.$disconnect();
  }
}

runConcurrentTest().catch(console.error);
