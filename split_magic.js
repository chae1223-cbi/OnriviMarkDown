const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'frontend', 'src', 'components', 'MainEditorApp.tsx');
const corePath = path.join(__dirname, 'frontend', 'src', 'components', 'editor', 'core', 'EditorCore.tsx');
const layoutPath = path.join(__dirname, 'frontend', 'src', 'components', 'editor', 'layout', 'EditorLayout.tsx');

let code = fs.readFileSync(mainPath, 'utf8');

// 1. Layout 시작점 찾기 (return 구문 직후)
const layoutStartIndex = code.indexOf('return (\n    <div className={`flex h-screen overflow-hidden');
if (layoutStartIndex === -1) {
    console.error("Layout 시작점을 찾을 수 없습니다.");
    process.exit(1);
}

// 2. Core 시작점 찾기
const coreStartStr = '<div className="flex flex-1 overflow-hidden">\n\n            <div\n              className={`flex-1 min-w-0 ${heightClass}';
let coreStartIndex = code.indexOf('<div className="flex flex-1 overflow-hidden">');
// 정확한 Core 블록을 찾기 위해 두 번째 매치를 찾거나, Layout 내부에 있는 것을 특정
let searchIdx = layoutStartIndex;
while (true) {
    const idx = code.indexOf('<div className="flex flex-1 overflow-hidden">', searchIdx);
    if (idx === -1) break;
    const substr = code.substring(idx, idx + 150);
    if (substr.includes('Editor')) { // 내부에 Editor가 있는 블록이 찐 Core 블록임
        coreStartIndex = idx;
        break;
    }
    searchIdx = idx + 10;
}

if (coreStartIndex === -1 || coreStartIndex < layoutStartIndex) {
    console.error("Core 시작점을 찾을 수 없습니다.");
    process.exit(1);
}

// 3. JSX 괄호 밸런스 추적 함수 (div 태그 매칭)
function findMatchingDivEnd(str, startIndex) {
    let tagCount = 0;
    let i = startIndex;
    const openTag = /<div\b[^>]*>/g;
    const closeTag = /<\/div>/g;
    
    // 단순 무식하지만 정확한 태그 카운팅 스캐너
    let inString = false;
    let inJSXExpr = 0;
    
    // 이보다 더 쉬운 방법:
    // indexOf를 순회하면서 <div 와 </div 의 개수를 센다.
    // 임시로 정규식을 써서 배열로 매칭해본다... 하지만 복잡하다.
    
    // 대신 가장 완벽한 야매 방법: 
    // MainEditorApp의 return 괄호 밸런스로 전체 Layout 블록을 찾는다.
    return -1;
}

// 괄호 밸런스 추적 알고리즘 (문자열 하나씩 스캔)
function findMatchingClosingBrace(text, startIdx) {
    let stack = 1;
    let i = startIdx;
    while (i < text.length && stack > 0) {
        if (text[i] === '{') stack++;
        if (text[i] === '}') stack--;
        i++;
    }
    return i;
}

// 아주 기발한 꼼수:
// 우리는 '오려내기'가 목적이므로 파일의 끝부분에서 return 구문이 끝나는 괄호를 찾으면 된다.
const layoutEndIndex = code.lastIndexOf(');\n}');

// Layout 블록 전체 텍스트
const layoutFullText = code.substring(layoutStartIndex + 9, layoutEndIndex);

// 이 안에서 Core 블록 분리
// Core 블록의 시작 인덱스 (layoutFullText 기준)
const coreLocalStart = layoutFullText.indexOf('<div className="flex flex-1 overflow-hidden">\n\n            <div\n              className={`flex-1 min-w-0 ${heightClass}');

if (coreLocalStart === -1) {
    console.error("Core Local 시작 실패");
    process.exit(1);
}

// Core 블록이 끝나는 지점 찾기 
// Core 블록 끝은 <Preview> 컴포넌트 </div> 닫힌 직후임. (layoutFullText 내에서)
// Preview 컴포넌트를 직접 찾아 </div>가 끝나는 부분을 특정한다.
let coreLocalEnd = layoutFullText.indexOf('<Preview\n');
coreLocalEnd = layoutFullText.indexOf('/>', coreLocalEnd);
coreLocalEnd = layoutFullText.indexOf('</div>', coreLocalEnd);
coreLocalEnd = layoutFullText.indexOf('</div>', coreLocalEnd + 6); // 2중 div 닫기

if (coreLocalEnd === -1) {
    console.error("Core Local 끝 실패");
    process.exit(1);
}

const coreBlockText = layoutFullText.substring(coreLocalStart, coreLocalEnd + 6);

// Layout 에서 Core 블록을 제거하고 {children} 삽입
const layoutReplacedText = layoutFullText.replace(coreBlockText, '\n          {children}\n          ');

// 4. 모든 deps 변수들 추출 (정규식으로 영문자 식별자만 대충 뽑음)
const depsList = [
    'mounted', 'isDarkMode', 'setIsDarkMode', 'isSidebarOpen', 'setIsSidebarOpen', 'isToolbarOpen', 'setIsToolbarOpen', 
    'previewMode', 'setPreviewMode', 'dispatchCommand', 'setContent', 'isSearchOpen', 'setIsSearchOpen', 'isAddonEnv', 
    'themePalette', 'handleThemeChange', 'sidebarWidth', 'setSidebarWidth', 'sidebarTab', 'setSidebarTab', 'content', 
    'currentFileName', 'setCurrentFileName', 'setCurrentFileNode', 'lastSavedContentRef', 'editorRef', 'previewRef', 
    'toc', 'scrollToLine', 'showToast', 'fileList', 'rootFolder', 'workspaceType', 'handleFileClick', 'currentFileNode', 
    'refreshFileList', 'openTabPaths', 'tabs', 'setConfirmConfig', 'isMergeMode', 'licenseStatus', 'selectedMergeNodes', 
    'toggleMergeNodeSelect', 'handleOpenMergeModal', 'setIsMergeMode', 'setSelectedMergeNodes', 'selectRootFolder', 
    'restoreFolderPermission', 'graceRemainingSeconds', 'activeTabId', 'switchTab', 'closeTab', 'createNewTab',
    'updateContent', 'isEditorMountedRef', 'previewModeRef', 'previewDebounceRef', 'isComposingRef', 'tabsRef',
    'activeTabIdRef', 'contentRef', 'updateDecorations', 'activeTab', 'heightClass'
];

// 5. 파일 생성
const editorLayoutContent = `import React from 'react';
import MenuBar from '@/components/MenuBar';
import LeftSidebar from '@/components/LeftSidebar';
import FormattingToolbar from '@/components/FormattingToolbar';
import UnifiedTabBar from '@/components/UnifiedTabBar';

export default function EditorLayout({ deps, children }: { deps: any, children: React.ReactNode }) {
  const {
    ${depsList.join(', ')}
  } = deps;

  return (
    ${layoutReplacedText}
  );
}
`;

const editorCoreContent = `import React from 'react';
import Editor from '@monaco-editor/react';
import { THEME_MAP, EDITOR_THEMES } from '@/utils/themes';
import Preview from '@/components/Preview';

export default function EditorCore({ deps }: { deps: any }) {
  const {
    ${depsList.join(', ')}
  } = deps;

  // 상수 재선언
  const heightClass = 'h-[calc(100vh-128px)]';
  const activeTab = tabs.find((t: any) => t.id === activeTabId);

  return (
    ${coreBlockText}
  );
}
`;

// 6. MainEditorApp 업데이트
const newMainReturn = `return (
    <EditorLayout deps={deps}>
      <EditorCore deps={deps} />
      <ModalManager 
        modals={deps}
        deps={deps}
      />
    </EditorLayout>
  );
}
`;

const depsObjStr = `const deps = {
    ${depsList.filter(d => !['activeTab', 'heightClass'].includes(d)).join(',\n    ')}
  };

  `;

// MainEditorApp 텍스트 교체 (return 블록 삭제하고 새로운 코드 삽입)
let newMainCode = code.substring(0, layoutStartIndex) + depsObjStr + newMainReturn;

// 7. 결과 저장
fs.writeFileSync(layoutPath, editorLayoutContent);
console.log('EditorLayout.tsx 생성 완료!');

fs.writeFileSync(corePath, editorCoreContent);
console.log('EditorCore.tsx 생성 완료!');

fs.writeFileSync(mainPath, newMainCode);
console.log('MainEditorApp.tsx 업데이트 완료!');
