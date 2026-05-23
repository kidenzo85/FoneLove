const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  });
  
  try {
    await c.connect();
    console.log('Connected OK');
    
    const res = await c.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    
    console.log('Tables found:', res.rows.length);
    res.rows.forEach(row => console.log(' -', row.table_name));
    
    // Check if User table exists (Prisma uses PascalCase by default)
    const res2 = await c.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name='User' OR table_name='user' OR table_name='users' OR table_name='_prisma_migrations')"
    );
    console.log('\nKey tables:', res2.rows.map(r => r.table_name));
    
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await c.end();
  }
}

main();
