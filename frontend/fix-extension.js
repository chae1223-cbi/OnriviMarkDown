const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');

// 재귀적으로 파일을 탐색하여 텍스트를 치환하는 함수
function replaceInFiles(dir, seek, replace) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInFiles(filePath, seek, replace);
    } else if (stat.isFile() && (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.json'))) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(seek)) {
        content = content.split(seek).join(replace);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

// Monaco Editor vs 소스 폴더 복사 (외부 CDN 차단 해결)
function copyMonacoEditor() {
  const monacoSrc = path.join(__dirname, 'node_modules', 'monaco-editor', 'min', 'vs');
  const monacoDest = path.join(outDir, 'monaco-editor', 'min', 'vs');

  if (!fs.existsSync(monacoSrc)) {
    console.error(`Monaco sources not found in ${monacoSrc}. Ensure monaco-editor package is installed.`);
    return;
  }
  
  // 목적지 상위 폴더 생성
  fs.mkdirSync(path.join(outDir, 'monaco-editor', 'min'), { recursive: true });
  
  if (fs.existsSync(monacoDest)) {
    try {
      fs.rmSync(monacoDest, { recursive: true, force: true });
    } catch (e) {
      console.warn(`Warning: Could not remove existing monaco-editor destination: ${e.message}`);
    }
  }
  
  try {
    fs.cpSync(monacoSrc, monacoDest, { recursive: true });
    console.log('Successfully copied monaco-editor resources to build folder.');
  } catch (err) {
    console.error('Failed to copy monaco-editor resources:', err);
  }
}

// HTML 파일들에서 인라인 스크립트를 추출해 외부 JS 파일로 변경하는 함수 (크롬 CSP inline 차단 방어)
function extractInlineScripts(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      extractInlineScripts(filePath);
    } else if (stat.isFile() && filePath.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let inlineScriptCount = 0;
      
      // <script> 태그를 매칭하되, src 속성이 없는 인라인 스크립트만 추출합니다.
      const scriptRegex = /<script(?![^>]*src\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      let newContent = content;
      
      // regex.exec의 무한 루프 위험을 막기 위해, 매칭되는 목록을 미리 수집합니다.
      const matches = [];
      while ((match = scriptRegex.exec(content)) !== null) {
        matches.push({
          fullTag: match[0],
          scriptCode: match[1]
        });
      }
      
      // 수집한 인라인 스크립트 처리
      for (const item of matches) {
        const scriptCode = item.scriptCode;
        if (scriptCode.trim()) {
          inlineScriptCount++;
          const baseName = path.basename(filePath, '.html');
          const inlineJsName = `${baseName}-inline-${inlineScriptCount}.js`;
          const inlineJsPath = path.join(path.dirname(filePath), inlineJsName);
          
          // 외부 JS 파일 작성
          fs.writeFileSync(inlineJsPath, scriptCode, 'utf8');
          console.log(`Extracted inline script from ${file} to ${inlineJsName}`);
          
          // HTML 내의 인라인 태그를 외부 참조 태그로 교체
          newContent = newContent.replace(item.fullTag, `<script src="${inlineJsName}"></script>`);
        }
      }
      
      if (inlineScriptCount > 0) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${file} with ${inlineScriptCount} externalized script links.`);
      }
    }
  }
}

// 리네임 재시도 및 폴더 복사 대체 로직 (Windows EPERM 방어)
function renameDirectory(oldPath, newPath) {
  if (!fs.existsSync(oldPath)) {
    console.log(`Source directory ${oldPath} does not exist. (Might have already been processed)`);
    return;
  }

  // 1단계: 새 경로가 이미 있으면 삭제 시도
  if (fs.existsSync(newPath)) {
    try {
      fs.rmSync(newPath, { recursive: true, force: true });
    } catch (e) {
      console.warn(`Warning: Could not remove existing directory ${newPath}. Attempting overwrite.`);
    }
  }

  // 2단계: 리네임 시도 (파일 잠금에 대비한 재시도 루프)
  let attempts = 5;
  while (attempts > 0) {
    try {
      fs.renameSync(oldPath, newPath);
      console.log('Renamed _next directory to next successfully via renameSync.');
      return;
    } catch (err) {
      attempts--;
      if (attempts === 0) {
        console.warn(`renameSync failed with EPERM. Attempting fallback copy-and-delete...`);
        // 3단계: 복사 후 원본 삭제 (Fallback)
        try {
          fs.cpSync(oldPath, newPath, { recursive: true });
          console.log('Copied _next directory to next successfully.');
          try {
            fs.rmSync(oldPath, { recursive: true, force: true });
            console.log('Cleaned up original _next directory.');
          } catch (rmErr) {
            console.warn(`Warning: Could not clean up original _next directory (files locked by Chrome). The build will still work.`);
          }
        } catch (cpErr) {
          console.error(`EPERM Error: Failed to copy directory. Chrome may be locking the directory. Please remove the extension in Chrome (chrome://extensions) and try again.`);
          throw cpErr;
        }
      } else {
        // 150ms 대기 후 재시도
        const waitTill = new Date(new Date().getTime() + 150);
        while (waitTill > new Date()) {}
      }
    }
  }
}

const oldPath = path.join(outDir, '_next');
const newPath = path.join(outDir, 'next');

// 실행
renameDirectory(oldPath, newPath);

// 경로 치환
replaceInFiles(outDir, '/_next/', '/next/');
replaceInFiles(outDir, '_next/', 'next/');
console.log('Replaced path references from _next to next.');

// KaTeX 폰트 URL 수정: CSS 파일에서 next/static/media/ -> ../media/ (CSS는 next/static/css/에 있음)
replaceInFiles(outDir, 'url(next/static/media/', 'url(../media/');
replaceInFiles(outDir, "url('next/static/media/", "url('../media/");
replaceInFiles(outDir, 'url("next/static/media/', 'url("../media/');
replaceInFiles(outDir, "url('/next/static/media/", "url('../media/");
replaceInFiles(outDir, 'url("/next/static/media/', 'url("../media/');
console.log('Fixed relative font paths in CSS files.');

// 모나코 리소스 복사 추가 (CSP 우회용 로컬화)
copyMonacoEditor();

// KaTeX 폰트 파일을 출력 루트로 복사 (동적 폰트 로딩 대비)
function copyKatexFonts() {
  const katexFontsSrc = path.join(__dirname, 'node_modules', 'katex', 'dist', 'fonts');
  const katexFontsDest = path.join(outDir, 'fonts');

  if (!fs.existsSync(katexFontsSrc)) {
    console.warn(`KaTeX fonts not found in ${katexFontsSrc}. Skipping.`);
    return;
  }

  fs.mkdirSync(katexFontsDest, { recursive: true });
  try {
    const files = fs.readdirSync(katexFontsSrc);
    for (const file of files) {
      const srcPath = path.join(katexFontsSrc, file);
      const destPath = path.join(katexFontsDest, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
    console.log(`Copied ${fs.readdirSync(katexFontsSrc).length} KaTeX font files to output fonts/ directory.`);
  } catch (err) {
    console.error('Failed to copy KaTeX fonts:', err);
  }
}

copyKatexFonts();

// 인라인 스크립트 외부화 실행 (CSP 우회)
extractInlineScripts(outDir);
console.log('Successfully externalized inline scripts for Chrome Extension compatibility.');
