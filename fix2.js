const fs = require('fs');
const path = 'frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replaceAll(
  "licenseStatus.planName?.includes('동시 접속 초과') ||",
  "licenseStatus.isRestricted ||"
);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
