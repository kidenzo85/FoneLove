process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testLocalApi() {
  const url = process.env.DIRECT_URL.replace('&sslcert=../supabase-ca.crt', '');
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT id FROM "public"."User" LIMIT 1');
    if (res.rows.length === 0) {
      console.log('No users found in DB. Please run /api/seed first.');
      return;
    }
    const userId = res.rows[0].id;
    console.log('Using userId:', userId);

    const apiRes = await fetch('http://localhost:3000/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        packType: 'decouverte'
      })
    });

    console.log('Status:', apiRes.status);
    const data = await apiRes.json();
    console.log('Response:', data);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

testLocalApi();
