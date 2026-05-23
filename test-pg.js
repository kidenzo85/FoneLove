const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-0-eu-north-1.pooler.supabase.com:5432/postgres'
});

client.connect()
  .then(() => {
    console.log('Connected to Session pooler (5432)');
    return client.end();
  })
  .catch(err => console.error('Connection error (5432):', err));

const client2 = new Client({
  connectionString: 'postgresql://postgres.ldjfngzeikjmromaoqkl:ctWH3rCuOQJfDUWn@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

client2.connect()
  .then(() => {
    console.log('Connected to Transaction pooler (6543)');
    return client2.end();
  })
  .catch(err => console.error('Connection error (6543):', err));
