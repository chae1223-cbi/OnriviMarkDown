const fs = require('fs');

let content = fs.readFileSync('d:/developer/OnriviMarkDown/frontend/src/components/AIGeneratorPanel.tsx', 'utf8');

// The `t` function in AIGeneratorPanel takes just `key`. Wait, if it takes `key` then why was `language` passed?
// Let's look at how `t` is defined in AIGeneratorPanel.tsx.
// It's probably `const t = (key: string, lang?: string) => ...`
// Let's just remove the second argument everywhere.
content = content.replace(/t\(([^,]+),\s*language\)/g, '$1'); // actually, just remove `t(key, language)` and replace with hardcoded strings?
// Since it's easier, let's just do:
content = content.replace(/t\('([^']+)',\s*language\)/g, "t('$1')");
content = content.replace(/,\s*language/g, ''); // maybe? No, that could break things.

fs.writeFileSync('d:/developer/OnriviMarkDown/frontend/src/components/AIGeneratorPanel.tsx', content, 'utf8');
