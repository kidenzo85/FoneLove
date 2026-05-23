const net = require('net');
const tls = require('tls');
const fs = require('fs');

const host = 'aws-1-eu-north-1.pooler.supabase.com';
const port = 6543;

const socket = net.createConnection(port, host, () => {
  // SSLRequest packet: length 8 (Int32), code 80877103 (Int32)
  const sslRequest = Buffer.alloc(8);
  sslRequest.writeInt32BE(8, 0);
  sslRequest.writeInt32BE(80877103, 4);
  socket.write(sslRequest);
});

socket.once('data', (data) => {
  if (data[0] === 0x53) { // 'S' meaning server supports SSL
    const tlsSocket = tls.connect({
      socket: socket,
      host: host,
      rejectUnauthorized: false
    }, () => {
      const cert = tlsSocket.getPeerCertificate(true);
      console.log('--- Certificate Chain ---');
      let currentCert = cert;
      let i = 1;
      while (currentCert) {
        console.log(`\nCert ${i}:`);
        console.log(`Subject: ${currentCert.subject ? currentCert.subject.CN : 'unknown'}`);
        console.log(`Issuer: ${currentCert.issuer ? currentCert.issuer.CN : 'unknown'}`);
        console.log(`Valid From: ${currentCert.valid_from}`);
        console.log(`Valid To: ${currentCert.valid_to}`);
        
        if (currentCert.issuerCertificate && currentCert.issuerCertificate !== currentCert) {
          currentCert = currentCert.issuerCertificate;
          i++;
        } else {
          // It's the root cert. Save it.
          const pem = `-----BEGIN CERTIFICATE-----\n${currentCert.raw.toString('base64').match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`;
          fs.writeFileSync('supabase-ca.crt', pem);
          console.log('Saved root certificate to supabase-ca.crt');
          break;
        }
      }
      tlsSocket.end();
    });
  } else {
    console.log('Server does not support SSL.');
    socket.end();
  }
});

socket.on('error', (err) => {
  console.error('Socket error:', err.message);
});
