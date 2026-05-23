const { Client } = require('pg');

async function testConnection(connStr, name) {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to ${name}`);
    await client.end();
  } catch (err) {
    console.error(`[ERROR] Connection failed for ${name}:`, err.message);
  }
}

async function main() {
  await testConnection('postgresql://postgres:ctWH3rCuOQJfDUWn@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&options=project%3Dldjfngzeikjmromaoqkl', 'Option style (6543)');
  await testConnection('postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@db.ldjfngzeikjmromaoqkl.supabase.co:5432/postgres', 'Direct with project ref username (5432)');
}

main();
