const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/dashboard/page.tsx', 'utf8');

const regex = /if\s*\(\s*plan\.isFree\s*&&\s*historyList\.length\s*>\s*0\s*\)\s*\{/;

const replaceStr = `      const hasWebHistory = historyList.some(h => !h.plan_name.includes('데스크탑'));
      if (plan.isFree && hasWebHistory) {`;

content = content.replace(regex, replaceStr);

fs.writeFileSync('frontend/src/app/dashboard/page.tsx', content);
console.log('Patch applied for web history check.');
