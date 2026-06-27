const fs = require('fs');
const target = __dirname + '/src/components/FileTreeItem.tsx';
let content = fs.readFileSync(target, 'utf8');

// Remove language from props destructuring
content = content.replace(/,\s*language/g, '');

// Remove language={language} from recursive calls
content = content.replace(/\s*language=\{language\}/g, '');

// Replace t('xxx', language) with t('xxx')
content = content.replace(/t\('([^']+)',\s*language\)/g, "t('$1')");

// Replace the t function definition if it uses language
content = content.replace(/const t = \(key:\s*string\)\s*=>\s*localTranslations\[language\]\?\.\[key\]/g, 'const t = (key: string) => localTranslations["ko"]?.[key]');

fs.writeFileSync(target, content, 'utf8');
