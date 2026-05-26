const fs = require('fs');

let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/app/page.tsx', 'utf8');

// The `remove_i18n.js` might have missed `createFile` because it wasn't in the `dict` dictionary if it was added later, or because it wasn't matched properly. Let's just blindly replace `t('createFile')` with `'새 파일 생성'` and any other stray `t(` calls.

content = content.replace(/t\(['"]createFile['"]\)/g, "'새 파일 생성'");
content = content.replace(/t\(['"]createFolder['"]\)/g, "'새 폴더 생성'");
content = content.replace(/t\(['"]renameFile['"]\)/g, "'이름 변경'");

// Just in case, scan for any other `t(`
const tMatches = content.match(/t\(['"][^'"]+['"]\)/g);
if (tMatches) {
  tMatches.forEach(m => {
    console.log("Still found:", m);
  });
}

fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/app/page.tsx', content, 'utf8');
