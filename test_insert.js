require('dotenv').config({ path: './frontend/.env.local' });
const fetch = require('node-fetch');

async function testInsert() {
  const payload = {
    p_license_id: '9c20c900-da60-4af0-9be5-f51623909c40', // chae1223's license id
    p_device_uuid: 'test-device-uuid',
    p_device_name: 'Web SaaS',
    p_user_id: '825a8feb-d34e-4d24-a66c-c04c28dcdf5f', // chae1223's user id
    p_is_expired: true
  };

  try {
    const res = await fetch('http://localhost:3000/api/rpc/license/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}

testInsert();
