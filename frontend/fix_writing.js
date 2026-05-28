const fs = require('fs');
const target = __dirname + '/src/components/WritingAssistant.tsx';
let content = fs.readFileSync(target, 'utf8');

// t 함수 정의가 2개 파라미터를 받는 경우 수정: (key: string, lang: string) => ... -> (key: string) => ...
content = content.replace(/const t = \(key:\s*string,\s*lang[^)]*\)\s*=>/g, 'const t = (key: string) =>');

// t('xxx', language) 호출 -> t('xxx')
content = content.replace(/t\((['"][^'"]+['"]),\s*(?:language|lang)\)/g, 't($1)');

// localTranslations[language] -> localTranslations["ko"]
content = content.replace(/localTranslations\[(?:language|lang)\]/g, 'localTranslations["ko"]');

fs.writeFileSync(target, content, 'utf8');
console.log('Done');
