const fs = require('fs');
const path = require('path');

// 모든 컴포넌트 파일에서 language 관련 잔재 제거
const srcDir = 'd:/developer/OnriviMarkDown/frontend/src';

function walkDir(dir) {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      files.push(...walkDir(fp));
    } else if (fp.endsWith('.tsx') || fp.endsWith('.ts')) {
      files.push(fp);
    }
  }
  return files;
}

const allFiles = walkDir(srcDir);

for (const fp of allFiles) {
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  // 1. language: Language -> 타입에서 제거
  content = content.replace(/\n?\s*language\s*:\s*('ko' \| 'en' \| 'ja' \| 'zh'|Language);/g, '');
  
  // 2. language?: Language -> 타입에서 제거
  content = content.replace(/\n?\s*language\s*\?\s*:\s*('ko' \| 'en' \| 'ja' \| 'zh'|Language);/g, '');

  // 3. language: string -> 타입에서 제거 (props interface에서만)
  // 주의: 이 패턴은 너무 광범위할 수 있으므로 신중하게 처리
  // content = content.replace(/\n?\s*language\s*:\s*string;/g, '');

  // 4. , language 매개변수 제거
  content = content.replace(/,\s*language\s*\}/g, ' }');  // 마지막 매개변수인 경우
  content = content.replace(/\{\s*language\s*,\s*/g, '{ ');  // 첫 번째인 경우

  // 5. localTranslations[language] -> localTranslations["ko"]
  content = content.replace(/localTranslations\[language\]/g, 'localTranslations["ko"]');

  // 6. Record<Language, ...> -> Record<string, ...>
  content = content.replace(/Record<Language,/g, 'Record<string,');

  // 7. t('xxx', language) -> t('xxx')
  content = content.replace(/t\(('([^']+)'|"([^"]+)"),\s*language\)/g, "t('$2$3')");

  // 8. language === 'ko' ? ... : ... 형태의 삼항연산자들
  // 이것은 복잡하므로 개별적으로 처리

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Fixed:', fp);
  }
}

console.log('Done!');
