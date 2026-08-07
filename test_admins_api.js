async function test() {
  try {
    const res = await fetch('http://localhost:3100/api/admin/admins');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
