const fs = require('fs');

let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/components/Toolbar.tsx', 'utf8');

// Remove localTranslations object completely
content = content.replace(/const localTranslations[^=]*=\s*\{[\s\S]*?\n\s*\};\n/m, '');
// Since localTranslations might be large, I'll just use a simple regex replacing all of it.
// Actually, let's just replace `t(key)` inside Toolbar.tsx with the hardcoded korean strings.
// But first I need to remove `const t = ...`
content = content.replace(/const t = \(key: string\) => localTranslations\[language\]\?\.\[key\] \|\| key;\n?/g, '');
// And remove `language` from ToolbarProps if it's there
content = content.replace(/language\s*:\s*Language;/g, '');

// The easiest way is to rewrite Toolbar.tsx's localized parts to hardcoded, but wait! The Toolbar items come from `toolbarConfig.ts`!
fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/components/Toolbar.tsx', content, 'utf8');
