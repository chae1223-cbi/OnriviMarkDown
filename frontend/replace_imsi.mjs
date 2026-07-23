import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // 정규식을 사용해 imsi_ 뒤에 오는 주요 테이블명들의 imsi_ 접두사를 제거합니다.
  const regex = /imsi_(users|subscriptions|license_activations|password_resets)/g;
  
  if (regex.test(newContent)) {
    newContent = newContent.replace(regex, '$1');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ Updated:', filePath);
  }
}

function walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walkSync(fullPath);
      }
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
        replaceInFile(fullPath);
      }
    }
  }
}

console.log('소스 코드 변환 시작...');
walkSync('d:\\\\Developer\\\\OnriviMarkDown\\\\OnriviMarkDown\\\\frontend\\\\src');
console.log('소스 코드 변환 완료!');
