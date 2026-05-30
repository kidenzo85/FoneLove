const http = require('http');

function testEndpoint(type) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/requests?userId=cmpd5tirc0000l504g7gjdqsq&type=${type}`,
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`${type} - STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`${type} - BODY:`, data.substring(0, 100));
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
}

testEndpoint('sent');
testEndpoint('received');
