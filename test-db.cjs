const { Client } = require('pg');

async function testConnection() {
  const connectionString = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require';
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected successfully to port 5432!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('Connection error on port 5432:', err.message);
  }

  const connectionString6543 = 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';
  const client6543 = new Client({ 
    connectionString: connectionString6543,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client6543.connect();
    console.log('Connected successfully to port 6543!');
    const res = await client6543.query('SELECT NOW()');
    console.log('Time:', res.rows[0].now);
    await client6543.end();
  } catch (err) {
    console.error('Connection error on port 6543:', err.message);
  }
}

testConnection();
