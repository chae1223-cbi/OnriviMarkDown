const fs = require('fs');
const newText = fs.readFileSync('temp_new.md', 'utf8');
const escapedText = newText.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const file = fs.readFileSync('frontend/src/constants/welcomeContent.ts', 'utf8');
const updated = file.replace(/const WELCOME_MD = `[\s\S]*?`;/, 'const WELCOME_MD = `' + escapedText + '`;');
fs.writeFileSync('frontend/src/constants/welcomeContent.ts', updated);
