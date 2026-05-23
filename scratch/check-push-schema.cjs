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

    // Get columns of push_subscriptions
    console.log('\n--- push_subscriptions columns ---');
    const res1 = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'push_subscriptions';
    `);
    console.table(res1.rows);

    // Get columns of notification_preferences
    console.log('\n--- notification_preferences columns ---');
    const res2 = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'notification_preferences';
    `);
    console.table(res2.rows);

    // Check count of subscriptions
    const res3 = await client.query('SELECT count(*) FROM public.push_subscriptions;');
    console.log('\nTotal push subscriptions:', res3.rows[0].count);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
