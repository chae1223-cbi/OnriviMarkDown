const fs = require('fs');
const path = 'd:/developer/OnriviMarkDown/frontend/src/components/SettingsModal.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the second "use client";
let firstIndex = -1;
let secondIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"use client"')) {
    if (firstIndex === -1) firstIndex = i;
    else { secondIndex = i; break; }
  }
}

if (secondIndex !== -1) {
  // Remove from first index to secondIndex - 1
  lines.splice(firstIndex, secondIndex - firstIndex);
  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log('Fixed duplicated header');
} else {
  console.log('No duplication found');
}
