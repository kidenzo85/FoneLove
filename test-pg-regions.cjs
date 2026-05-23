const { Client } = require('pg');

const regions = [
  'aws-0-eu-north-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-west-3.pooler.supabase.com'
];

async function testAll() {
  for (const region of regions) {
    const connStr = `postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@${region}:6543/postgres?sslmode=require`;
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      console.log(`[SUCCESS] Connected to ${region}`);
      await client.end();
      return; // Stop on first success
    } catch (err) {
      console.log(`[FAIL] ${region} - ${err.message}`);
    }
  }
}

testAll();
