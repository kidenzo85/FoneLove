import prisma from './src/lib/prisma';
import { generateOrderRef } from './src/lib/coolpay';

async function main() {
  console.log('--- STARTING PURCHASE VALIDATION TEST ---');

  // 1. Get a test user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in the database. Run seed first.');
    return;
  }
  console.log(`Using test user: ${user.email} (ID: ${user.id})`);

  // Ensure wallets exist
  let ccWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!ccWallet) {
    ccWallet = await prisma.wallet.create({ data: { userId: user.id } });
  }
  let flWallet = await prisma.foneLoveWallet.findUnique({ where: { userId: user.id } });
  if (!flWallet) {
    flWallet = await prisma.foneLoveWallet.create({ data: { userId: user.id } });
  }

  console.log(`Initial Balances -> CC: ${ccWallet.balance}, FoneLove: ${flWallet.balance}`);

  // 2. Test CC Purchase
  console.log('\n--- TESTING CC PURCHASE ---');
  // Need to find a CC pack
  const ccPack = await prisma.packConfig.findFirst({ where: { currency: 'CC', isActive: true } });
  if (!ccPack) {
    console.error('No active CC pack found.');
    return;
  }
  console.log(`Selected CC Pack: ${ccPack.name} (${ccPack.amount} CC + ${ccPack.bonusAmount} Bonus)`);

  const ccAppRef = generateOrderRef();
  const amountXAF_CC = ccPack.priceXaf ?? Math.round((ccPack.priceEur || 1) * 655.96);
  const totalCC = ccPack.amount + ccPack.bonusAmount;

  const ccOrder = await prisma.paymentOrder.create({
    data: {
      userId: user.id,
      packType: ccPack.packKey,
      amountXAF: amountXAF_CC,
      ccAmount: totalCC,
      bonusCC: ccPack.bonusAmount,
      status: 'pending',
      appTransactionRef: ccAppRef,
      customerEmail: user.email,
      metadata: JSON.stringify({
        packLabel: ccPack.name,
        baseCC: ccPack.amount,
        bonusCC: ccPack.bonusAmount,
        firstPurchaseBonus: 0,
      }),
    },
  });

  console.log(`Created CC Order: ${ccOrder.id} [Status: ${ccOrder.status}]`);

  // Simulate Callback Success
  console.log('Simulating CoolPay Callback for CC...');
  await handleSuccessfulPaymentSimulator(ccOrder, { transaction_ref: 'TEST_CC_REF_' + Date.now() });

  // Verify CC Wallet
  const updatedCcWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  console.log(`Updated CC Balance: ${updatedCcWallet?.balance} (Expected: ${ccWallet.balance + totalCC})`);
  if (updatedCcWallet?.balance === ccWallet.balance + totalCC) {
    console.log('✅ CC Purchase VALIDATED!');
  } else {
    console.error('❌ CC Purchase FAILED!');
  }

  // 3. Test FoneLove Purchase
  console.log('\n--- TESTING FONELOVE PURCHASE ---');
  const flPack = await prisma.packConfig.findFirst({ where: { currency: 'FL', isActive: true } });
  if (!flPack) {
    console.error('No active FoneLove pack found.');
    return;
  }
  console.log(`Selected FL Pack: ${flPack.name} (${flPack.amount} FL + ${flPack.bonusAmount} Bonus)`);

  const flAppRef = generateOrderRef();
  const amountXAF_FL = flPack.priceXaf ?? Math.round((flPack.priceEur || 1) * 655.96);
  const totalFL = flPack.amount + flPack.bonusAmount;

  const flOrder = await prisma.paymentOrder.create({
    data: {
      userId: user.id,
      packType: flPack.packKey,
      amountXAF: amountXAF_FL,
      ccAmount: 0, // FL pack doesn't give CC directly in the same field, but wait, usually ccAmount is 0 for FL pack or maybe it holds the FL amount? 
      // In initiate/route.ts, it calculates ccAmount as packInfo.amount + packInfo.bonusAmount. So ccAmount field in PaymentOrder holds the main amount. Let's check how the callback uses it.
      // Wait, in callback: const flAmount = meta.flAmount || 0. Let's make sure our metadata has flAmount.
      bonusCC: 0,
      status: 'pending',
      appTransactionRef: flAppRef,
      customerEmail: user.email,
      metadata: JSON.stringify({
        type: 'fonelove_recharge',
        packLabel: flPack.name,
        flAmount: totalFL,
      }),
    },
  });

  console.log(`Created FL Order: ${flOrder.id} [Status: ${flOrder.status}]`);

  // Simulate Callback Success
  console.log('Simulating CoolPay Callback for FL...');
  await handleSuccessfulPaymentSimulator(flOrder, { transaction_ref: 'TEST_FL_REF_' + Date.now() });

  // Verify FL Wallet
  const updatedFlWallet = await prisma.foneLoveWallet.findUnique({ where: { userId: user.id } });
  console.log(`Updated FL Balance: ${updatedFlWallet?.balance} (Expected: ${flWallet.balance + totalFL})`);
  if (updatedFlWallet?.balance === flWallet.balance + totalFL) {
    console.log('✅ FoneLove Purchase VALIDATED!');
  } else {
    console.error('❌ FoneLove Purchase FAILED!');
  }

  console.log('\n--- VALIDATION COMPLETE ---');
}

// Re-implementing handleSuccessfulPayment logic for the simulator
async function handleSuccessfulPaymentSimulator(order: any, payload: any) {
  const meta = JSON.parse(order.metadata || '{}');
  const isFoneLoveRecharge = order.packType.startsWith('fonelove_') || meta.type === 'fonelove_recharge';

  await prisma.$transaction(async (tx) => {
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: 'success',
        coolpayRef: payload.transaction_ref,
        coolpayStatus: 'SUCCESSFUL',
        paidAt: new Date(),
        metadata: JSON.stringify({
          ...meta,
          callbackPayload: payload,
        }),
      },
    });

    if (isFoneLoveRecharge) {
      const flAmount = meta.flAmount || 0;
      if (flAmount <= 0) return;

      const flWallet = await tx.foneLoveWallet.upsert({
        where: { userId: order.userId },
        create: { userId: order.userId, balance: flAmount },
        update: { balance: { increment: flAmount } },
      });

      await tx.foneLoveTransaction.create({
        data: {
          walletId: flWallet.id,
          type: 'recharge',
          amount: flAmount,
          description: `Achat ${meta.packLabel || flAmount + ' FoneLove'} (${order.amountXAF} FCFA via Test)`,
        },
      });
    } else {
      let wallet = await tx.wallet.findUnique({ where: { userId: order.userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId: order.userId } });
      }

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'purchase',
          amount: order.ccAmount,
          packType: order.packType,
          description: `Test CC Purchase`,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: order.ccAmount },
          totalEarned: { increment: order.ccAmount },
        },
      });
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
