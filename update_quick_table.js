const fs = require('fs');

const renames = [
  { old: 'helper.tsx', new: 'indexedDbHelper.tsx', oldBase: 'helper', newBase: 'indexedDbHelper' },
  { old: 'api.ts', new: 'apiUrlBuilder.ts', oldBase: 'api', newBase: 'apiUrlBuilder' },
  { old: 'msg.ts', new: 'systemMessages.ts', oldBase: 'msg', newBase: 'systemMessages' },
  { old: 'vfsHelper.ts', new: 'virtualFileSystem.ts', oldBase: 'vfsHelper', newBase: 'virtualFileSystem' },
  { old: 'utils.ts', new: 'tailwindUtils.ts', oldBase: 'utils', newBase: 'tailwindUtils' }
];

let content = fs.readFileSync('OMD_QUICK_TABLE.md', 'utf8');
const todayStr = '2026-06-28';

renames.forEach(r => {
  // Replace old filename with new filename in the table
  content = content.replace(new RegExp(`\\|\\s*([OMD-[A-Z]+)-${r.oldBase}-(\\d{4})(.*?)\\|\\s*${r.old}\\s*\\|`, 'g'), `| $1-${r.newBase}-$2$3| ${r.new} |`);
  content = content.replace(new RegExp(`\\|\\s*([OMD-[A-Z]+)-${r.oldBase}-(\\d{4})(.*?)\\|\\s*${r.oldBase}\\.ts(x?)\\s*\\|`, 'g'), `| $1-${r.newBase}-$2$3| ${r.newBase}.ts$4 |`);

  // Add updated patch date
  content = content.replace(new RegExp(`(\\|\\s*[OMD-[A-Z]+-${r.newBase}-\\d{4}\\s*(?:✅ FIXED)?\\s*\\|.*?\\|.*?\\|.*?\\|)(.*?\\|)`, 'g'), 
    (match, p1, p2) => {
      if (!p2.includes(`**${todayStr}**`)) {
        return `${p1} **${todayStr}** — 파일명을 ${r.oldBase}에서 ${r.newBase}로 직관적으로 변경; ${p2.trim().replace(/^\|\s*/, '')}`;
      }
      return match;
    });
});

// Remove utils.tsx from the table entirely
content = content.replace(/^\|.*OMD-CORE-utils-0001.*?utils\.tsx.*?$\n/gm, '');

fs.writeFileSync('OMD_QUICK_TABLE.md', content, 'utf8');
console.log('Updated OMD_QUICK_TABLE.md');
