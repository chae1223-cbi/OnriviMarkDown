const fs = require('fs');

let content = fs.readFileSync('frontend/src/lib/constants.tsx', 'utf8');

const regex = /,\s*\{\s*name:\s*"데스크탑 에디터"[\s\S]*?ctaVariant:\s*"secondary",\s*\}/g;

content = content.replace(regex, '');

fs.writeFileSync('frontend/src/lib/constants.tsx', content);
console.log('Removed desktop plan');
