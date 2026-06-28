const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');

content = content.replace(/\.in\('plan_status',\s*\[\'ACTIVE\',\s*\'FREE\'\]\)/g, 
  ".in('plan_status', ['ACTIVE', 'FREE'])\n              .not('plan_name', 'like', '%데스크탑%')");

fs.writeFileSync('frontend/src/components/MainEditorApp.tsx', content);
console.log('Patch applied.');
