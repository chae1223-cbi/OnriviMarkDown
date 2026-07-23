import fetch from 'node-fetch';

async function testInsert() {
  // Let's use a known subscription id from the earlier query
  const subId = 'f77fa38d-cc39-4448-86de-4cc05bd32999'; // APPRENTICE ACTIVE
  const deviceUuid = 'test-device-uuid-' + Date.now();
  
  console.log('Calling /api/rpc/license/insert...');
  
  // Note: We are simulating the POST body sent by the frontend
  const body = {
    p_license_id: subId,
    p_device_uuid: deviceUuid,
    p_device_name: 'Test Node Script'
  };
  
  try {
    const res = await fetch('http://localhost:3000/api/rpc/license/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch(e) {
    console.error('Fetch error:', e);
  }
}

testInsert();
