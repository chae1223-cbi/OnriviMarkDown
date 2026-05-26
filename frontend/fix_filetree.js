const fs = require('fs');
let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/components/FileTreeItem.tsx', 'utf8');

// Remove language from props destructuring
content = content.replace(/,\s*language/g, '');

// Remove language={language} from recursive calls
content = content.replace(/\s*language=\{language\}/g, '');

// Replace t('xxx', language) with t('xxx')
content = content.replace(/t\('([^']+)',\s*language\)/g, "t('$1')");

// Replace the t function definition if it uses language
content = content.replace(/const t = \(key:\s*string\)\s*=>\s*localTranslations\[language\]\?\.\[key\]/g, 'const t = (key: string) => localTranslations["ko"]?.[key]');

fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/components/FileTreeItem.tsx', content, 'utf8');
