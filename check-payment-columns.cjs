const { Client } = require('pg');

async function main() {
  const c = new Client({
    connectionString: 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  });
  
  try {
    await c.connect();
    console.log('Connected OK');
    
    const res = await c.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='PaymentOrder' AND table_schema='public'"
    );
    
    console.log('Columns of PaymentOrder:');
    res.rows.forEach(row => console.log(` - ${row.column_name}: ${row.data_type}`));
    
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await c.end();
  }
}

main();
