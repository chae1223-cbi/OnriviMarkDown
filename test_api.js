async function test() {
  try {
    const res = await fetch('http://localhost:3100/api/faqs/0b082f22-26c2-4ef2-b8f7-75e51e97b870', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "오프라인 환경에서도 사용이 가능한가요?",
        answer: "데스크탑 앱의 경우 인터넷 연결이 완전히 차단된 폐쇄형 환경에서도...",
        sort_order: 10,
        is_active: true
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
