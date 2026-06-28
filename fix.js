const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');
content = content.replace(
  /userId: savedUserId, licenseKey: data\.license_key \|\| '', paymentNo: '',/g,
  "userId: savedUserId, licenseKey: data.license_key || '', paymentNo: data.payment_no || '',"
);
fs.writeFileSync('frontend/src/components/MainEditorApp.tsx', content, 'utf8');
