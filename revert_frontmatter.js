const fs = require('fs');

// 1. globals.css - 프론트매터 CSS 제거
const cssFile = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/app/globals.css';
let css = fs.readFileSync(cssFile, 'utf8');
const cssRegex = /\/\* Frontmatter \(YAML\)[\s\S]*?\.monaco-frontmatter-line \{[\s\S]*?\}\n*/;
if (cssRegex.test(css)) {
    css = css.replace(cssRegex, '');
    fs.writeFileSync(cssFile, css, 'utf8');
    console.log("1. globals.css 프론트매터 CSS 제거 완료");
} else {
    console.log("1. globals.css - 타겟 없음");
}

// 2. MainEditorApp.tsx - 프론트매터 데코레이션 로직 제거
const mainFile = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let main = fs.readFileSync(mainFile, 'utf8');
const mainRegex = /\s*\/\/ Frontmatter \(YAML\)[\s\S]*?\.monaco-frontmatter-line[\s\S]*?\}\s*\}\s*\}\s*\n/;
if (mainRegex.test(main)) {
    main = main.replace(mainRegex, '\n');
    fs.writeFileSync(mainFile, main, 'utf8');
    console.log("2. MainEditorApp.tsx 프론트매터 데코레이션 로직 제거 완료");
} else {
    // 더 넓은 범위로 시도
    const lines = main.split('\n');
    const newLines = [];
    let skip = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('// Frontmatter (YAML) block:')) {
            skip = true;
        }
        if (skip && lines[i].includes('if (decorationsCollectionRef.current)')) {
            skip = false;
        }
        if (!skip) newLines.push(lines[i]);
    }
    if (newLines.length !== lines.length) {
        fs.writeFileSync(mainFile, newLines.join('\n'), 'utf8');
        console.log("2. MainEditorApp.tsx 라인 순회로 제거 완료");
    } else {
        console.log("2. MainEditorApp.tsx - 타겟 없음");
    }
}

// 3. useMonacoSetup.ts - onDidChangeModel 핸들러 제거
const setupFile = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/hooks/editor/useMonacoSetup.ts';
let setup = fs.readFileSync(setupFile, 'utf8');
const setupRegex = /\s*\/\/ 탭 전환\(setModel\)[\s\S]*?editor\.onDidChangeModel\([\s\S]*?\}\);/;
if (setupRegex.test(setup)) {
    setup = setup.replace(setupRegex, '');
    fs.writeFileSync(setupFile, setup, 'utf8');
    console.log("3. useMonacoSetup.ts onDidChangeModel 핸들러 제거 완료");
} else {
    console.log("3. useMonacoSetup.ts - 타겟 없음");
}
