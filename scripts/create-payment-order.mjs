import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create PaymentOrder table if it doesn't exist
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public."PaymentOrder" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "packType" TEXT NOT NULL,
      "amountXAF" INTEGER NOT NULL,
      "ccAmount" INTEGER NOT NULL,
      "bonusCC" INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      "coolpayRef" TEXT UNIQUE,
      "appTransactionRef" TEXT UNIQUE NOT NULL,
      "paymentUrl" TEXT,
      "coolpayStatus" TEXT,
      "customerPhone" TEXT,
      "customerEmail" TEXT,
      metadata TEXT,
      "paidAt" TIMESTAMPTZ,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE
    )
  `)
  console.log('✅ PaymentOrder table created')

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PaymentOrder_userId_idx" ON public."PaymentOrder"("userId")`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PaymentOrder_status_idx" ON public."PaymentOrder"(status)`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PaymentOrder_appTransactionRef_idx" ON public."PaymentOrder"("appTransactionRef")`)
  console.log('✅ Indexes created')

  // Quick test: check all models used by the failing APIs
  const connCount = await prisma.connection.count()
  console.log(`✅ Connection table OK (${connCount} rows)`)

  const giftCount = await prisma.foneLoveGift.count()
  console.log(`✅ FoneLoveGift table OK (${giftCount} rows)`)

  const msgCount = await prisma.message.count()
  console.log(`✅ Message table OK (${msgCount} rows)`)

  console.log('\n🎉 All done! Database is healthy.')
}

main()
  .catch(e => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
