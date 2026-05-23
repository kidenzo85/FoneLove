const { Client } = require('pg');

const connectionString = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected!');

    const res = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'push_subscriptions'
    `);
    console.log('Columns of push_subscriptions:');
    console.log(res.rows);

    const res2 = await client.query('SELECT COUNT(*), COUNT(DISTINCT user_id) FROM push_subscriptions');
    console.log('Push subscriptions count:', res2.rows[0]);

    const res3 = await client.query('SELECT * FROM push_subscriptions LIMIT 3');
    console.log('Sample rows:', res3.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
