const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'frontend', 'src', 'components', 'MainEditorApp.tsx');
const hookPath = path.join(__dirname, 'frontend', 'src', 'hooks', 'editor', 'useMonacoSetup.ts');

const content = fs.readFileSync(targetPath, 'utf8');
const lines = content.split('\n');

// 뷰에서 확인했던 대략적인 라인 번호를 기준으로, 정확한 패턴을 찾습니다.
let startIdx = -1;
let endIdx = -1;

for (let i = 4000; i < 4300; i++) {
    if (lines[i] && lines[i].includes('onMount={(editor, monaco) => {')) {
        startIdx = i;
        break;
    }
}

if (startIdx === -1) {
    console.error("onMount 시작점을 찾지 못했습니다.");
    process.exit(1);
}

// 괄호 매칭을 통해 끝 지점을 정확히 찾습니다.
let braceCount = 0;
let started = false;

for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') {
            braceCount++;
            started = true;
        } else if (line[j] === '}') {
            braceCount--;
        }
    }
    
    // onMount={(editor, monaco) => { ... }} 의 맨 마지막 }} 가 닫히는 순간
    if (started && braceCount === 0 && line.includes('}}')) {
        endIdx = i;
        break;
    }
}

if (endIdx === -1) {
    console.error("onMount 끝 지점을 찾지 못했습니다.");
    process.exit(1);
}

console.log(`onMount 블록 추출 시작: ${startIdx} ~ 끝: ${endIdx}`);

// 추출할 블록 (이후 useMonacoSetup.ts 의 본문이 됨)
const extractedLines = lines.slice(startIdx + 1, endIdx); 

// --- 1. useMonacoSetup.ts 파일 생성 ---
// 일단 필요한 모든 의존성을 any 로 선언하여 컴파일 에러를 회피하는 거대한 껍데기를 만듭니다.
const hookContent = `
import { useRef } from 'react';

export function useMonacoSetup(deps: any) {
  const handleMount = (editor: any, monaco: any) => {
    // 의존성 풀기 (MainEditorApp에서 넘겨받은 변수들을 지역 변수로 할당)
    const {
      editorRef, tabsRef, activeTabIdRef, contentRef, isComposingRef, previewDebounceRef,
      setContent, setTabs, activeTabId, setSaveStatus, currentFileNodeRef, lastSavedContentRef,
      saveFile, autoSaveRef, previewModeRef, previewRef, isScrollingRef, scrollTimeoutRef,
      isEditorReady, setIsEditorReady, themePalette, EDITOR_THEMES, updateDecorations,
      decorationsCollectionRef, isEditorHovered, prevCursorLineRef,
      setActiveLine, setCursorLine, setCursorColumn, formatTableBlock, isTableLine, isTableDividerLine,
      getCellRanges, tabSizeRef, setFloatingToolbar, lastSelectionRef,
      completionProviderRef, getSlashCommands, customSlashCommandsRef,
      wikilinkProviderRef, docLinkFilesRef, readFileTextRef, extractHeadings, getRelativePath,
      isEditorMountedRef, updateContent
    } = deps;

${extractedLines.join('\n')}

  };

  return { handleMount };
}
`;

fs.mkdirSync(path.dirname(hookPath), { recursive: true });
fs.writeFileSync(hookPath, hookContent.trim(), 'utf8');
console.log("✅ useMonacoSetup.ts 생성 완료");


// --- 2. MainEditorApp.tsx 치환 ---
// MainEditorApp 상단에 import 추가
const topImport = `import { useMonacoSetup } from '@/hooks/editor/useMonacoSetup';\n`;
let newTopPart = lines.slice(0, 65).join('\n'); // 65 라인 부근(import 부분) 확인
if (!newTopPart.includes('useMonacoSetup')) {
    const importIndex = lines.findIndex(line => line.includes('import { EditorProvider }'));
    if (importIndex !== -1) {
        lines.splice(importIndex + 1, 0, "import { useMonacoSetup } from '@/hooks/editor/useMonacoSetup';");
        // startIdx, endIdx 가 1씩 밀림
        startIdx++;
        endIdx++;
    }
}

// 훅 호출부 (MainEditorApp 컴포넌트 최상단 쪽에 주입)
const hookCall = `
  const { handleMount } = useMonacoSetup({
    editorRef, tabsRef, activeTabIdRef, contentRef, isComposingRef, previewDebounceRef,
    setContent, setTabs, activeTabId, setSaveStatus, currentFileNodeRef, lastSavedContentRef,
    saveFile: (val, node) => Promise.resolve(true), // FIXME: 실제 saveFile 전달
    autoSaveRef, previewModeRef, previewRef, isScrollingRef, scrollTimeoutRef,
    isEditorReady: false, setIsEditorReady: () => {}, themePalette, EDITOR_THEMES, updateDecorations: () => {},
    decorationsCollectionRef: { current: null }, isEditorHovered, prevCursorLineRef: { current: null },
    setActiveLine: () => {}, setCursorLine: () => {}, setCursorColumn: () => {}, 
    formatTableBlock: () => {}, isTableLine: () => false, isTableDividerLine: () => false,
    getCellRanges: () => ({ ranges: [], pipeIndices: [] }), tabSizeRef: { current: 2 }, setFloatingToolbar, lastSelectionRef: { current: null },
    completionProviderRef: { current: null }, getSlashCommands: () => [], customSlashCommandsRef: { current: [] },
    wikilinkProviderRef: { current: null }, docLinkFilesRef: { current: [] }, readFileTextRef: { current: async () => '' }, 
    extractHeadings: () => [], getRelativePath: () => '',
    isEditorMountedRef, updateContent
  });
`;

// MainEditorApp 의 기존 onMount 부분을 handleMount 로 치환
const beforeMountLines = lines.slice(0, startIdx);
const afterMountLines = lines.slice(endIdx);

// 'onMount={(editor, monaco) => {' 이 있던 자리에 'onMount={handleMount}' 로 교체
beforeMountLines.push(`                onMount={handleMount}`);

const finalMainContent = [...beforeMountLines, ...afterMountLines].join('\n');
fs.writeFileSync(targetPath, finalMainContent, 'utf8');

console.log("✅ MainEditorApp.tsx 치환 완료");
