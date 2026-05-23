require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

async function test() {
  const publicKey = process.env.COOLPAY_PUBLIC_KEY;
  console.log('Using Public Key:', publicKey);
  
  const url = `https://my-coolpay.com/api/${publicKey}/paylink`;
  
  const body = {
    transaction_amount: 1500,
    transaction_currency: 'XAF',
    transaction_reason: 'FoneLove - 5 FoneLove',
    app_transaction_ref: 'TEST-' + Date.now(),
    customer_name: 'Test User',
    customer_lang: 'fr',
  };

  console.log('Sending request to:', url);
  console.log('Body:', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
