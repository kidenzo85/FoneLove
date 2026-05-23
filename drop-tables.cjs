process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function dropTables() {
  const url = process.env.DIRECT_URL.replace('&sslcert=../supabase-ca.crt', '');
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Get all tables in public schema
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    for (const row of result.rows) {
      const dropQuery = `DROP TABLE IF EXISTS "public"."${row.tablename}" CASCADE;`;
      console.log('Running:', dropQuery);
      await client.query(dropQuery);
    }
    
    console.log('Successfully dropped all public tables.');
    
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    await client.end();
  }
}

dropTables();
