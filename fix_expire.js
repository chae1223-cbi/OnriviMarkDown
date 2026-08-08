const fs = require('fs');
const filePath = 'D:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                  fetch(getApiUrl('/api/subscription/expire'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ p_subscription_id: sub.id })
                  })`;

const newStr = `                  fetch(getApiUrl('/api/subscription/expire'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ p_subscription_id: sub.id, p_user_id: savedUserId })
                  })`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed expire api call');
