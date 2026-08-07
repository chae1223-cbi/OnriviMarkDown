async function test() {
  try {
    const res = await fetch('http://localhost:3100/api/faqs/nonexistent-route', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: "test" })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text.substring(0, 100));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
