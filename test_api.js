const email = 'chae1223@naver.com'; // User's email from earlier logs
const deviceId = 'ECFA1E00-B0B1-11F0-B89B-6D88C0B84201'; // From user's logs

async function test() {
  const res = await fetch('https://onrivi.com/api/license/verify-desktop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_email: email, p_device_uuid: deviceId })
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}
test();
