const { Client } = require('pg');

const connStr = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

async function main() {
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase. Creating "PaymentOrder" table...');

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS "PaymentOrder" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "packType" TEXT NOT NULL,
        "amountXAF" INTEGER NOT NULL,
        "ccAmount" INTEGER NOT NULL,
        "bonusCC" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "coolpayRef" TEXT,
        "appTransactionRef" TEXT NOT NULL,
        "paymentUrl" TEXT,
        "coolpayStatus" TEXT,
        "customerPhone" TEXT,
        "customerEmail" TEXT,
        "metadata" TEXT,
        "paidAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "PaymentOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    await client.query(createTableSql);
    console.log('Table "PaymentOrder" created successfully (or already exists).');

    // Create Indexes
    console.log('Creating indexes...');
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "PaymentOrder_coolpayRef_key" ON "PaymentOrder"("coolpayRef")');
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "PaymentOrder_appTransactionRef_key" ON "PaymentOrder"("appTransactionRef")');
    await client.query('CREATE INDEX IF NOT EXISTS "PaymentOrder_userId_idx" ON "PaymentOrder"("userId")');
    await client.query('CREATE INDEX IF NOT EXISTS "PaymentOrder_status_idx" ON "PaymentOrder"("status")');
    await client.query('CREATE INDEX IF NOT EXISTS "PaymentOrder_appTransactionRef_idx" ON "PaymentOrder"("appTransactionRef")');
    console.log('Indexes created successfully.');

    // Verify it exists
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='PaymentOrder'"
    );
    if (res.rows.length > 0) {
      console.log('Verification: "PaymentOrder" table successfully detected in the database.');
    } else {
      console.error('Verification failed: "PaymentOrder" table not found in database.');
    }

  } catch (error) {
    console.error('Error executing DDL:', error);
  } finally {
    await client.end();
  }
}

main();
