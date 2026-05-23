const { Client } = require('pg');

const connectionString = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected successfully!');

    // 1. Check if user exists
    console.log('\nChecking if user cmpd5tirc0000l504g7gjdqsq exists...');
    const userRes = await client.query('SELECT * FROM public."User" WHERE id = $1', ['cmpd5tirc0000l504g7gjdqsq']);
    if (userRes.rows.length === 0) {
      console.log('User NOT found in "User" table.');
    } else {
      console.log('User found:', userRes.rows[0]);
    }

    // 2. List tables in public schema
    console.log('\nListing tables in public schema...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables found:', tablesRes.rows.map(r => r.table_name).join(', '));

    // 3. Check wallet or other related tables for the user
    console.log('\nChecking Wallet table for user...');
    const walletRes = await client.query('SELECT * FROM public."Wallet" WHERE "userId" = $1', ['cmpd5tirc0000l504g7gjdqsq']);
    console.log('Wallet records found:', walletRes.rows);

    console.log('\nChecking DailyStreak table for user...');
    const streakRes = await client.query('SELECT * FROM public."DailyStreak" WHERE "userId" = $1', ['cmpd5tirc0000l504g7gjdqsq']);
    console.log('DailyStreak records found:', streakRes.rows);

    console.log('\nChecking FoneLoveWallet table for user...');
    const flwRes = await client.query('SELECT * FROM public."FoneLoveWallet" WHERE "userId" = $1', ['cmpd5tirc0000l504g7gjdqsq']);
    console.log('FoneLoveWallet records found:', flwRes.rows);

  } catch (err) {
    console.error('Error during database check:', err);
  } finally {
    await client.end();
  }
}

run();
