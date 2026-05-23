const { PrismaClient } = require('@prisma/client');

async function testConn(url, name) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  });

  try {
    console.log(`Testing Prisma connection to ${name}...`);
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log(`[SUCCESS] Connected! User count: ${count}`);
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const base = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com';
  
  // 1. Port 5432 with sslmode=require
  await testConn(`${base}:5432/postgres?sslmode=require`, 'Port 5432 sslmode=require');

  // 2. Port 5432 with sslmode=disable
  await testConn(`${base}:5432/postgres?sslmode=disable`, 'Port 5432 sslmode=disable');

  // 3. Port 5432 without sslmode
  await testConn(`${base}:5432/postgres`, 'Port 5432 no sslmode');

  // 4. Port 6543 (transaction pooler) - we know this works for queries
  await testConn(`${base}:6543/postgres?pgbouncer=true`, 'Port 6543 with pgbouncer=true');
}

main();
