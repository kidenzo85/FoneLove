const { Client } = require('pg');

const connectionString = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB!');

    // 1. Drop existing FK constraints
    console.log('Dropping old foreign keys...');
    await client.query('ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;');
    await client.query('ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;');
    console.log('Old FKs dropped.');

    // 2. Change column type to VARCHAR(255)
    console.log('Altering user_id column types to VARCHAR(255)...');
    await client.query('ALTER TABLE public.push_subscriptions ALTER COLUMN user_id TYPE VARCHAR(255);');
    await client.query('ALTER TABLE public.notification_preferences ALTER COLUMN user_id TYPE VARCHAR(255);');
    console.log('Column types altered.');

    // 3. Clean up records that don't match public."User"
    console.log('Cleaning up invalid subscriptions/preferences...');
    await client.query('DELETE FROM public.push_subscriptions WHERE user_id NOT IN (SELECT id FROM public."User");');
    await client.query('DELETE FROM public.notification_preferences WHERE user_id NOT IN (SELECT id FROM public."User");');
    console.log('Clean up complete.');

    // 4. Add new FK constraints to public."User"
    console.log('Adding new FK constraints to public."User"(id)...');
    await client.query(`
      ALTER TABLE public.push_subscriptions 
      ADD CONSTRAINT push_subscriptions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;
    `);
    await client.query(`
      ALTER TABLE public.notification_preferences 
      ADD CONSTRAINT notification_preferences_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;
    `);
    console.log('New FK constraints created successfully!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
