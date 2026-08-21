const fs = require('fs');

const f1 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace('Google Gemma API Key', 'Google Gemini API Key');
fs.writeFileSync(f1, c1, 'utf8');

const f2 = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/SettingsModal.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace('Google Gemma API Key', 'Google Gemini API Key');
c2 = c2.replace('Gemini/Gemma API', 'Gemini API');
fs.writeFileSync(f2, c2, 'utf8');

console.log('Fixed Google Gemma to Gemini');
