const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');

// Patch block
const patchTarget = " *   * 🚨 @PATCH : **2026-08-26** 🎯 StatusBar.tsx의 setLocalCursor 무한 루프 에러 픽스로 인한 최신화 완료 (OMD-EDIT-StatusBar-0003)";
const patchNew = patchTarget + "\n *   * 🚨 @PATCH : **2026-08-26** 🎯 모달창 닫은 후 미리보기 마우스 휠 스크롤 동기화 안되는 버그 수정 및 에디터-미리보기 1:1 동기화 루프 가드 보완 (OMD-EDIT-SYNC-MODAL-001)";
content = content.replace(patchTarget, patchNew);

// Scroll target 1: Top bounce check
const scrollTarget1 = "if (target.scrollTop === 0 && editorRef.current && isPreviewHovered.current && isScrollingRef.current !== 'editor') {";
const scrollNew1 = "if (target.scrollTop === 0 && editorRef.current && isPreviewHovered.current && isScrollingRef.current !== 'editor') {";
// wait, I don't need to change this one. I will just keep it with isPreviewHovered.current, it's safer for iOS bounce.

// Scroll target 2: 
const scrollTarget2 = "                          if (!isPreviewHovered.current || previewModeRef.current !== 'both' || !editorRef.current) return;";
const scrollNew2 = "                          if (previewModeRef.current !== 'both' || !editorRef.current) return;";
content = content.replace(scrollTarget2, scrollNew2);

// Scroll target 3: onWheel, onMouseMove
const scrollTarget3 = "                        onMouseEnter={() => { isPreviewHovered.current = true; }}\n                        onMouseLeave={() => { isPreviewHovered.current = false; }}";
const scrollNew3 = "                        onMouseEnter={() => { isPreviewHovered.current = true; }}\n                        onMouseLeave={() => { isPreviewHovered.current = false; }}\n                        onWheel={() => { isPreviewHovered.current = true; }}\n                        onMouseMove={() => { isPreviewHovered.current = true; }}";
content = content.replace(scrollTarget3, scrollNew3);

fs.writeFileSync('frontend/src/components/MainEditorApp.tsx', content, 'utf8');
