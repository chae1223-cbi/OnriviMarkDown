require('dotenv').config({ path: './frontend/.env.local' });

async function testGet() {
  const res = await fetch('http://localhost:3000/api/subscription/get', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: 'chae1223@naver.com' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
testGet();
