const fs = require('fs');
const path = require('path');

const i18nContent = fs.readFileSync(__dirname + '/src/lib/i18n.ts', 'utf8');
const koMatch = i18nContent.match(/ko:\s*\{([\s\S]*?)\n\s*\}\n\};/);
let dict = {};

if (koMatch) {
  const lines = koMatch[1].split('\n');
  lines.forEach(l => {
    const m = l.match(/^\s*([a-zA-Z0-9_]+):\s*"(.*)",?\s*$/);
    if (m) dict[m[1]] = m[2];
  });
}

// Special parameterized strings
dict['searchResultSummary'] = '${count}개의 결과'; // simplifed
dict['deleteConfirmMsg'] = "'${name}'을(를) 정말 삭제하시겠습니까?";
dict['renamePrompt'] = "'${name}'의 새 이름을 입력하세요:";
dict['newFilePrompt'] = "[${name}]에 생성할 새 파일의 이름을 입력하세요:";
dict['newFolderPrompt'] = "[${name}]에 생성할 새 폴더의 이름을 입력하세요:";

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      processDir(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      if (p.includes('i18n.ts')) continue;
      
      let content = fs.readFileSync(p, 'utf8');
      let changed = false;

      // Remove i18n imports
      if (content.includes("import { getTranslation")) {
        content = content.replace(/import\s*\{\s*getTranslation[^}]*\}\s*from\s*['"]@\/lib\/i18n['"];?\n?/, '');
        changed = true;
      }
      
      if (content.includes("language, setLanguage")) {
         // Some components might receive language as prop, let's just let it be for now or remove carefully
      }
      
      // Replace t('key') or t("key")
      const regex = /t\(['"]([a-zA-Z0-9_]+)['"]\)/g;
      content = content.replace(regex, (match, key) => {
        if (dict[key]) {
          changed = true;
          return `"${dict[key]}"`;
        }
        return match;
      });

      // Replace t('key', {param: val})
      const regexParam = /t\(['"]([a-zA-Z0-9_]+)['"],\s*\{\s*([a-zA-Z0-9_]+)\s*:\s*([^}]+)\s*\}\)/g;
      content = content.replace(regexParam, (match, key, paramKey, paramVal) => {
        if (dict[key]) {
          changed = true;
          let str = dict[key].replace(`{${paramKey}}`, `\${${paramVal}}`);
          return `\`${str}\``;
        }
        return match;
      });
      
      // Replace {t('key')} inside JSX
      const regexJsx = /\{t\(['"]([a-zA-Z0-9_]+)['"]\)\}/g;
      content = content.replace(regexJsx, (match, key) => {
        if (dict[key]) {
          changed = true;
          return dict[key];
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(p, content, 'utf8');
        console.log('Processed', p);
      }
    }
  }
}

processDir(__dirname + '/src');
