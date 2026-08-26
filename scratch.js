const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');

// replace 1
content = content.replace(
  "if (!isPreviewHovered.current || previewModeRef.current !== 'both' || !editorRef.current) return;",
  "if (previewModeRef.current !== 'both' || !editorRef.current) return;"
);

// replace 2
content = content.replace(
  "if (target.scrollTop === 0 && editorRef.current && isPreviewHovered.current && isScrollingRef.current !== 'editor') {",
  "if (target.scrollTop === 0 && editorRef.current && isScrollingRef.current !== 'editor') {"
);

// patch
content = content.replace(
  "*   * 🚨 @PATCH : **2026-08-26** 🎯 StatusBar.tsx의 setLocalCursor 무한 루프 에러 픽스로 인한 최신화 완료 (OMD-EDIT-StatusBar-0003)",
  "*   * 🚨 @PATCH : **2026-08-26** 🎯 StatusBar.tsx의 setLocalCursor 무한 루프 에러 픽스로 인한 최신화 완료 (OMD-EDIT-StatusBar-0003)\n *   * 🚨 @PATCH : **2026-08-26** 🎯 모달창 닫은 후 미리보기 마우스 휠 스크롤 동기화 안되는 버그 수정 (OMD-EDIT-SYNC-MODAL-001)"
);

fs.writeFileSync('frontend/src/components/MainEditorApp.tsx', content, 'utf8');
