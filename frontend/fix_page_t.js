const fs = require('fs');

const target = __dirname + '/src/app/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// The `remove_i18n.js` might have missed `createFile` because it wasn't in the `dict` dictionary if it was added later, or because it wasn't matched properly. Let's just blindly replace `t('createFile')` with `'???Œì¼ ?ì„±'` and any other stray `t(` calls.

content = content.replace(/t\(['"]createFile['"]\)/g, "'???Œì¼ ?ì„±'");
content = content.replace(/t\(['"]createFolder['"]\)/g, "'???´ë” ?ì„±'");
content = content.replace(/t\(['"]renameFile['"]\)/g, "'?´ë¦„ ë³€ê²?");

// Just in case, scan for any other `t(`
const tMatches = content.match(/t\(['"][^'"]+['"]\)/g);
if (tMatches) {
  tMatches.forEach(m => {
    console.log("Still found:", m);
  });
}

fs.writeFileSync(target, content, 'utf8');
