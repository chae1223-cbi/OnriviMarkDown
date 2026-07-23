async function run() {
  const res = await fetch('https://onrivi.com');
  const html = await res.text();
  const match = html.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
  console.log("Supabase URL on onrivi.com:", match ? match[0] : "Not found");
}
run();
