require('dotenv').config({ path: './frontend/.env.local' });
const fetch = require('node-fetch');

async function testDeactivate() {
  const pNo = 'PAY-20260722-51EC413B'; // chae1223's payment no
  const sId = 'test-uuid-123';

  try {
    const res = await fetch('http://localhost:3000/api/device/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_payment_no: pNo, p_device_uuid: sId })
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
testDeactivate();
