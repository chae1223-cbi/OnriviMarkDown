const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

// The wrapper for the preview is:
/*
<div
  className={isPreviewOnly
  ? "preview-page-sheet mx-auto my-8 border border-purple-500/5 shadow-[0_16px_48px_rgba(15,0,109,0.04)] bg-white dark:bg-zinc-900 rounded-2xl transition-all duration-300 transform-gpu origin-top overflow-hidden pb-56"
  : `preview-page-sheet mx-auto my-6 ${isLandscape ? 'max-w-6xl' : 'max-w-3xl'} w-full bg-white dark:bg-zinc-900 border border-purple-500/5 shadow-[0_12px_42px_rgba(15,0,109,0.03)] rounded-2xl transition-all duration-300 origin-top overflow-hidden pb-56`
  }
*/

const target = 'preview-page-sheet mx-auto';
const replace = 'preview-page-sheet group relative mx-auto'; // add relative and group

if (content.includes(target)) {
    content = content.replace(new RegExp(target, 'g'), replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched group!");
} else {
    console.log("Not found group!");
}
