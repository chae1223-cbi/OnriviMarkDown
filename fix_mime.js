const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/fileImporter.ts';
let c = fs.readFileSync(file, 'utf8');

const target = `const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';`;
const replacement = `let mimeType = 'image/png';
          if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'bmp') mimeType = 'image/bmp';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'svg') mimeType = 'image/svg+xml';`;

c = c.replace(target, replacement);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed mimeType mapping');
