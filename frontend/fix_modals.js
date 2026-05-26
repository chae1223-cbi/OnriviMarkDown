const fs = require('fs');
const path = require('path');

const componentsDir = 'd:/developer/OnriviMarkDown/frontend/src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const p = path.join(componentsDir, file);
  let content = fs.readFileSync(p, 'utf8');

  let changed = false;

  // Remove `Language` type from localTranslations definition
  if (content.match(/Record<Language,\s*Record<string,\s*string>>/)) {
    content = content.replace(/Record<Language,\s*Record<string,\s*string>>/g, 'Record<string, Record<string, string>>');
    changed = true;
  }
  
  // Also remove `language` from Modal props if it's there
  if (content.match(/language\s*:\s*Language/)) {
    content = content.replace(/language\s*:\s*Language;/g, '');
    changed = true;
  }
  
  // If `t(key, language)` is defined, change it to hardcode to `ko`
  if (content.match(/const t = \(key:\s*string\)\s*=>\s*localTranslations\[language\]\?\.\[key\]/)) {
    content = content.replace(/const t = \(key:\s*string\)\s*=>\s*localTranslations\[language\]\?\.\[key\]/g, 'const t = (key: string) => localTranslations["ko"]?.[key]');
    changed = true;
  }
  
  // also check if language is defined in props and used in t
  if (content.match(/const t = \(key:\s*string\)\s*=>\s*localTranslations\[[^\]]+\]\?\.\[key\]/)) {
    content = content.replace(/const t = \(key:\s*string\)\s*=>\s*localTranslations\[[^\]]+\]\?\.\[key\]/g, 'const t = (key: string) => localTranslations["ko"]?.[key]');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, content, 'utf8');
  }
}
