const { Client } = require('pg');

const connectionString = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM public.push_subscriptions LIMIT 5;');
    console.log(res.rows);

    const userRes = await client.query('SELECT id, email, "firstName" FROM public."User" LIMIT 5;');
    console.log('\nUser table records:');
    console.log(userRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
