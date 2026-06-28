const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const renames = [
  { old: 'frontend/src/lib/helper.tsx', new: 'frontend/src/lib/indexedDbHelper.tsx', oldBase: 'helper', newBase: 'indexedDbHelper' },
  { old: 'frontend/src/lib/api.ts', new: 'frontend/src/lib/apiUrlBuilder.ts', oldBase: 'api', newBase: 'apiUrlBuilder' },
  { old: 'frontend/src/lib/msg.ts', new: 'frontend/src/lib/systemMessages.ts', oldBase: 'msg', newBase: 'systemMessages' },
  { old: 'frontend/src/lib/vfsHelper.ts', new: 'frontend/src/lib/virtualFileSystem.ts', oldBase: 'vfsHelper', newBase: 'virtualFileSystem' },
  { old: 'frontend/src/lib/utils.ts', new: 'frontend/src/lib/tailwindUtils.ts', oldBase: 'utils', newBase: 'tailwindUtils' }
];

const deleteFiles = [
  'frontend/src/lib/utils.tsx'
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const todayStr = '2026-06-28';

// 1. Rename files via Git
renames.forEach(r => {
  try {
    execSync(`git mv ${r.old} ${r.new}`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Failed to git mv ${r.old}. Trying fs.rename...`);
    try {
      fs.renameSync(r.old, r.new);
    } catch(e2) {
      console.log(`Failed to fs.rename ${r.old}`);
    }
  }
});

// 2. Delete utils.tsx via Git
deleteFiles.forEach(f => {
  try {
    execSync(`git rm ${f}`, { stdio: 'inherit' });
  } catch (e) {
    console.log(`Failed to git rm ${f}. Trying fs.unlink...`);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

// 3. Update file contents and imports
const allFiles = getAllFiles('frontend/src');

allFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Update imports for each renamed file
  renames.forEach(r => {
    // replace imports like: import { ... } from '@/lib/helper' or './helper' or '../lib/helper'
    // Regex matches from quotes up to the base name
    const importRegex = new RegExp(`(from\\s+['"](?:@/lib/|\\./|\\.\\./|\\.\\./\\.\\./|\\.\\./\\.\\./lib/))${r.oldBase}(['"])`, 'g');
    content = content.replace(importRegex, `$1${r.newBase}$2`);
    
    // Some imports might not have 'from' if they are dynamic imports or require
    const importRegex2 = new RegExp(`(import\\s*\\(\\s*['"](?:@/lib/|\\./|\\.\\./|\\.\\./\\.\\./|\\.\\./\\.\\./lib/))${r.oldBase}(['"])`, 'g');
    content = content.replace(importRegex2, `$1${r.newBase}$2`);
  });

  // Handle utils.tsx which was deleted (now points to utils -> tailwindUtils)
  // The utils regex above already handles `utils` to `tailwindUtils`, which covers utils.tsx imports as long as they omitted the extension.

  // Update OMD-CORE headers inside the renamed files themselves
  renames.forEach(r => {
    if (file.endsWith(path.basename(r.new))) {
      // e.g. [OMD-CORE-helper-0001] helper.tsx의 idb -> [OMD-CORE-indexedDbHelper-0001] indexedDbHelper.tsx의 idb
      const headerRegex = new RegExp(`\\[(OMD-[A-Z]+)-${r.oldBase}-(\\d{4})\\]\\s+${r.oldBase}\\.ts(x?)`, 'g');
      // Actually the header format is: [OMD-CORE-helper-0001] helper.tsx의 idb
      // I'll just do a simple replace for the filename and OMD tag
      content = content.replace(new RegExp(`\\[(OMD-[A-Z]+)-${r.oldBase}-(\\d{4})\\]`, 'g'), `[$1-${r.newBase}-$2]`);
      content = content.replace(new RegExp(`${r.oldBase}\\.ts(x?)`, 'g'), `${r.newBase}.ts$1`);
      
      // Add @PATCH date
      if (!content.includes(`@PATCH : **${todayStr}**`)) {
         content = content.replace(/(\/\/\s+🎯\s*@PATCH\s*:\s*)(.*)/, `$1**${todayStr}** — 파일명을 ${r.oldBase}에서 ${r.newBase}로 직관적으로 변경 및 관련 import 일괄 수정; $2`);
      }
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Done refactoring source files!');
