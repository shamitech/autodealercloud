const https = require('https');

const data = JSON.stringify({
  slug: 'testsite3',
  password: 'TempPass123!A0'
});

const options = {
  hostname: 'api.autodealercloud.com',
  port: 443,
  path: '/api/v1/tenant-login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
