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

    // 1. Disable RLS
    console.log('Disabling RLS on tables...');
    await client.query('ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;');
    await client.query('ALTER TABLE public.notification_preferences DISABLE ROW LEVEL SECURITY;');

    // 2. Drop all policies on push_subscriptions
    console.log('Dropping push_subscriptions policies...');
    const pushPolicies = [
      'push_subs_user_read',
      'push_subs_user_insert',
      'push_subs_user_update',
      'push_subs_user_delete',
      'push_subs_service_role',
      'Users can view own subscriptions',
      'Users can insert own subscriptions',
      'Users can update own subscriptions',
      'Users can delete own subscriptions'
    ];
    for (const pol of pushPolicies) {
      await client.query(`DROP POLICY IF EXISTS "${pol}" ON public.push_subscriptions;`);
    }

    // Drop all policies on notification_preferences
    console.log('Dropping notification_preferences policies...');
    const prefPolicies = [
      'notif_prefs_user_read',
      'notif_prefs_user_upsert',
      'notif_prefs_service_role',
      'Users can view own preferences',
      'Users can upsert own preferences',
      'Users can update own preferences'
    ];
    for (const pol of prefPolicies) {
      await client.query(`DROP POLICY IF EXISTS "${pol}" ON public.notification_preferences;`);
    }

    // 3. Alter columns to VARCHAR(255)
    console.log('Altering user_id column types to VARCHAR(255)...');
    await client.query('ALTER TABLE public.push_subscriptions ALTER COLUMN user_id TYPE VARCHAR(255);');
    await client.query('ALTER TABLE public.notification_preferences ALTER COLUMN user_id TYPE VARCHAR(255);');

    // 4. Clean up invalid data
    console.log('Cleaning up invalid subscriptions/preferences...');
    await client.query('DELETE FROM public.push_subscriptions WHERE user_id NOT IN (SELECT id FROM public."User");');
    await client.query('DELETE FROM public.notification_preferences WHERE user_id NOT IN (SELECT id FROM public."User");');

    // 5. Re-create new FK constraints to public."User"(id)
    console.log('Adding new FK constraints to public."User"(id)...');
    await client.query('ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_fkey;');
    await client.query('ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;');
    
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

    console.log('Migration complete successfully!');

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
