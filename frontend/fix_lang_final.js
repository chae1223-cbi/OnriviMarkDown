const fs = require('fs');
const path = require('path');

const srcDir = __dirname + '/src';

function walkDir(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) files.push(...walkDir(fp));
    else if (fp.endsWith('.tsx') || fp.endsWith('.ts')) files.push(fp);
  }
  return files;
}

const allFiles = walkDir(srcDir);
let totalFixed = 0;

for (const fp of allFiles) {
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  // 1. 함수 파라미터 destructuring에서 language 제거
  //    예: { ..., language, ... } => { ..., ... }
  //    예: { ..., language } => { ... }
  content = content.replace(/,\s*language\s*(?=[,}])/g, '');
  content = content.replace(/\blanguage\s*,\s*/g, (m, offset) => {
    // 객체 구조분해 패턴 { language, ... }
    const before = content.slice(Math.max(0, offset - 2), offset);
    if (before.trim().endsWith('{')) return '';
    return m;
  });

  // 2. Props interface / type에서 language 필드 제거
  content = content.replace(/[ \t]*language\s*\??\s*:\s*(?:'ko' \| 'en' \| 'ja' \| 'zh'|Language|string);\n?/g, '');

  // 3. localTranslations[language] -> localTranslations["ko"]
  content = content.replace(/localTranslations\[language\]/g, 'localTranslations["ko"]');

  // 4. Record<Language, -> Record<string,
  content = content.replace(/Record<Language,/g, 'Record<string,');

  // 5. t('key', language) -> t('key')
  content = content.replace(/t\((['"][^'"]+['"]),\s*language\)/g, 't($1)');

  // 6. language === 'ko' ? "..." : language === 'ja' ? "..." : language === 'zh' ? "..." : "..." 를 첫 번째 한글값으로
  content = content.replace(/language\s*===\s*'ko'\s*\?\s*("[^"]*"|`[^`]*`)\s*:[\s\S]*?:\s*("[^"]*"|`[^`]*`)\s*;/g, (m, koVal) => `${koVal};`);

  // 7. import Language type 제거
  content = content.replace(/import\s+type\s*\{\s*Language\s*\}\s*from\s*['"][^'"]+['"];\n?/g, '');
  content = content.replace(/,\s*Language\s*(?=\s*\})/g, '');
  content = content.replace(/Language\s*,\s*/g, '');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Fixed:', path.basename(fp));
    totalFixed++;
  }
}

console.log(`\nDone! Fixed ${totalFixed} files.`);
