const tls = require('tls');

const options = {
  host: 'aws-1-eu-north-1.pooler.supabase.com',
  port: 6543,
  rejectUnauthorized: false
};

const socket = tls.connect(options, () => {
  const cert = socket.getPeerCertificate(true);
  console.log("Issuer:", cert.issuer);
  console.log("Subject:", cert.subject);
  
  let currentCert = cert;
  let chainLength = 1;
  while (currentCert.issuerCertificate && currentCert.issuerCertificate !== currentCert) {
    currentCert = currentCert.issuerCertificate;
    chainLength++;
    console.log(`\nCert ${chainLength} Issuer:`, currentCert.issuer);
    console.log(`Cert ${chainLength} Subject:`, currentCert.subject);
  }
  
  socket.end();
});

socket.on('error', (err) => {
  console.error('TLS Error:', err);
});
