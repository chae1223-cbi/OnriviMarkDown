async function run() {
  try {
    const res = await fetch('https://onriviauthor.pages.dev/api/license/verify-desktop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_email: 'onrivi@naver.com', p_device_uuid: 'ECFA1E00-B0B1-11F0-B89B-6D88C0B84201' })
    });
    const text = await res.text();
    console.log('Status Pages.dev:', res.status);
    console.log('Response Pages.dev:', text);
  } catch (e) {
    console.error(e);
  }
}
run();
