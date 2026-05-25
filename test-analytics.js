const fetch = require('node-fetch');

async function testAnalytics() {
  console.log('Sending test events...');
  
  const events = [
    { eventName: 'login', userId: 'user_test_1', metadata: { source: 'organic' } },
    { eventName: 'page_view', metadata: { page: '/home' } },
    { eventName: 'swipe_right', userId: 'user_test_1', metadata: { targetId: 'user_test_2' } },
    { eventName: 'purchase_pack', userId: 'user_test_2', metadata: { pack: 'premium_1_month', amount: 9.99 } }
  ];

  for (const evt of events) {
    try {
      const res = await fetch('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt)
      });
      const data = await res.json();
      console.log(`Event ${evt.eventName}:`, data);
    } catch (e) {
      console.error(`Failed ${evt.eventName}:`, e.message);
    }
  }
}

testAnalytics();
