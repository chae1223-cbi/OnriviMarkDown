async function test() {
  try {
    const res = await fetch('http://localhost:3100/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "test@example.com", role: "SUPPORT", adminId: "af274d27-ccce-4115-8836-b9c8c186dd50" }) // using a valid admin id
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
