const url = 'https://niyvcgvayofdqbebmche.supabase.co/rest/v1/users?select=*&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXZjZ3ZheW9mZHFiZWJtY2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDEzMjksImV4cCI6MjA5NjcxNzMyOX0.RERZT5U6SunxqGcun0ay3-SOojh6dpUD_DSFqKzPR5o';
fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
}).then(res => res.text().then(text => console.log(res.status, text)));
