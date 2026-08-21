const fs = require('fs');
const f = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/hooks/editor/useMonacoSetup.ts';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /if \(completionProviderRef\.current\) \{\s*completionProviderRef\.current\.dispose\(\);\s*\}\s*completionProviderRef\.current = monaco\.languages\.registerCompletionItemProvider/g,
  `if ((monaco.languages as any)._customSlashProvider) {
                      (monaco.languages as any)._customSlashProvider.dispose();
                    }
                    (monaco.languages as any)._customSlashProvider = monaco.languages.registerCompletionItemProvider`
);

c = c.replace(
  /if \(wikilinkProviderRef\.current\) \{\s*wikilinkProviderRef\.current\.dispose\(\);\s*\}\s*wikilinkProviderRef\.current = monaco\.languages\.registerCompletionItemProvider/g,
  `if ((monaco.languages as any)._customWikilinkProvider) {
                      (monaco.languages as any)._customWikilinkProvider.dispose();
                    }
                    (monaco.languages as any)._customWikilinkProvider = monaco.languages.registerCompletionItemProvider`
);

fs.writeFileSync(f, c, 'utf8');
console.log('Fixed slash commands duplication');
