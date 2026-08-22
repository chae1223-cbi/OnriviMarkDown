const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/lib/editorThemes.ts';
let content = fs.readFileSync(file, 'utf8');

// Rules for Onrivi Light
const lightRules = `      rules: [
        { token: '', foreground: '1e293b' },
        { token: 'keyword', fontStyle: 'bold', foreground: '6366f1' }, // Headings & Keywords
        { token: 'keyword.markdown', fontStyle: 'bold', foreground: '6366f1' },
        { token: 'comment', fontStyle: 'italic', foreground: '64748b' }, // Quotes
        { token: 'comment.markdown', fontStyle: 'italic', foreground: '64748b' },
        { token: 'strong', fontStyle: 'bold', foreground: '0f172a' }, // Bold
        { token: 'strong.markdown', fontStyle: 'bold', foreground: '0f172a' },
        { token: 'emphasis', fontStyle: 'italic', foreground: '059669' }, // Italic
        { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '059669' },
        { token: 'string.link', fontStyle: 'underline', foreground: '2563eb' }, // Links
        { token: 'string.link.markdown', fontStyle: 'underline', foreground: '2563eb' },
        { token: 'string', foreground: '2563eb' },
        { token: 'variable', foreground: 'd946ef' }, // Code blocks
        { token: 'variable.source', foreground: 'd946ef' },
        { token: 'type', foreground: 'ea580c' }, // List markers / html tags
        { token: 'type.markdown', foreground: 'ea580c' },
      ],`;

// Rules for GitHub Dark Dimmed
const darkRules = `      rules: [
        { token: '', foreground: 'e2e8f0' },
        { token: 'keyword', fontStyle: 'bold', foreground: '818cf8' }, // Headings
        { token: 'keyword.markdown', fontStyle: 'bold', foreground: '818cf8' },
        { token: 'comment', fontStyle: 'italic', foreground: '94a3b8' }, // Quotes
        { token: 'comment.markdown', fontStyle: 'italic', foreground: '94a3b8' },
        { token: 'strong', fontStyle: 'bold', foreground: 'f8fafc' }, // Bold
        { token: 'strong.markdown', fontStyle: 'bold', foreground: 'f8fafc' },
        { token: 'emphasis', fontStyle: 'italic', foreground: '34d399' }, // Italic
        { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '34d399' },
        { token: 'string.link', fontStyle: 'underline', foreground: '60a5fa' }, // Links
        { token: 'string.link.markdown', fontStyle: 'underline', foreground: '60a5fa' },
        { token: 'string', foreground: '60a5fa' },
        { token: 'variable', foreground: 'e879f9' }, // Code blocks
        { token: 'variable.source', foreground: 'e879f9' },
        { token: 'type', foreground: 'fb923c' }, // List markers
        { token: 'type.markdown', foreground: 'fb923c' },
      ],`;

const lightRegex = /rules:\s*\[[\s\S]*?variable[\s\S]*?\]\,/;
content = content.replace(lightRegex, lightRules);

const darkRegex = /name:\s*'GitHub Dark Dimmed'[\s\S]*?rules:\s*\[[\s\S]*?variable[\s\S]*?\]\,/;
content = content.replace(darkRegex, match => match.replace(/rules:\s*\[[\s\S]*?variable[\s\S]*?\]\,/, darkRules));

fs.writeFileSync(file, content, 'utf8');
console.log("Patched editorThemes.ts!");
