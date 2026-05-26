const fs = require('fs');
const path = require('path');

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

      // Remove import { Language, getTranslation } etc
      if (content.match(/import\s*\{[^}]*(Language|getTranslation)[^}]*\}\s*from\s*['"]@\/lib\/i18n['"];?\n?/)) {
        content = content.replace(/import\s*\{[^}]*(Language|getTranslation)[^}]*\}\s*from\s*['"]@\/lib\/i18n['"];?\n?/g, '');
        changed = true;
      }
      
      // Remove `const t = ... getTranslation...`
      if (content.match(/const\s+t\s*=\s*\([^)]*\)\s*=>\s*getTranslation[^;]+;\n?/)) {
        content = content.replace(/const\s+t\s*=\s*\([^)]*\)\s*=>\s*getTranslation[^;]+;\n?/g, '');
        changed = true;
      }

      // Remove `language: Language;` or `setLanguage: (v: Language) => void;` from interfaces
      if (content.match(/\s*language\??:\s*Language;?\n?/g)) {
        content = content.replace(/\s*language\??:\s*Language;?\n?/g, '\n');
        changed = true;
      }
      if (content.match(/\s*setLanguage\??:\s*\([^)]*\)\s*=>\s*void;?\n?/g)) {
        content = content.replace(/\s*setLanguage\??:\s*\([^)]*\)\s*=>\s*void;?\n?/g, '\n');
        changed = true;
      }
      
      // Remove `language, setLanguage,` from component props destructuring
      if (content.match(/language,\s*setLanguage,?\s*/g)) {
        content = content.replace(/language,\s*setLanguage,?\s*/g, '');
        changed = true;
      }
      // Or if they are on separate lines
      if (content.match(/language,?\n/g) && content.match(/setLanguage,?\n/g)) {
        content = content.replace(/\s*language,?\n/g, '\n');
        content = content.replace(/\s*setLanguage,?\n/g, '\n');
        changed = true;
      }
      
      // Remove `language={language}` or `setLanguage={setLanguage}` from JSX
      if (content.match(/\slanguage=\{language\}/g)) {
        content = content.replace(/\slanguage=\{language\}/g, '');
        changed = true;
      }
      if (content.match(/\ssetLanguage=\{setLanguage\}/g)) {
        content = content.replace(/\ssetLanguage=\{setLanguage\}/g, '');
        changed = true;
      }

      // SettingsModal specific: `language: 'ko'` in dropdown
      // Actually SettingsModal still has the Language tab. I should remove the Language select UI from SettingsModal.tsx
      
      // Use cases where `language` is used directly in conditions:
      // MergeModal: `language === 'ko' ? ... : ...`
      content = content.replace(/language === 'ko' \? '([^']+)' : '[^']+'/g, "'$1'");
      content = content.replace(/language === "ko" \? "([^"]+)" : "[^"]+"/g, '"$1"');

      if (changed) {
        fs.writeFileSync(p, content, 'utf8');
        console.log('Cleaned up', p);
      }
    }
  }
}

processDir('d:/developer/OnriviMarkDown/frontend/src');
