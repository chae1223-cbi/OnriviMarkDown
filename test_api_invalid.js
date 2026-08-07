async function test() {
  try {
    const res = await fetch('http://localhost:3100/api/faqs/invalid-uuid-1234', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "test", answer: "test", sort_order: 10, is_active: true
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
