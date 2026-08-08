require('dotenv').config({ path: './frontend/.env.local' });
const http = require('http');

const data = JSON.stringify({ user_id: '2ef98d8b-bd62-4a19-a0ad-564c83cb80e0' });
const options = {
  hostname: 'localhost',
  port: 3100,
  path: '/api/subscription/get',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});
req.on('error', e => console.error(e));
req.write(data);
req.end();
