const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/MainEditorApp.tsx', 'utf8');

// Restore the guard
content = content.replace(
  "if (previewModeRef.current !== 'both' || !editorRef.current) return;\n                            if (isScrollingRef.current === 'editor') return;",
  "if (!isPreviewHovered.current || previewModeRef.current !== 'both' || !editorRef.current) return;\n                            if (isScrollingRef.current === 'editor') return;"
);

// We already have onWheel and onMouseMove, they ensure isPreviewHovered works correctly.

fs.writeFileSync('frontend/src/components/MainEditorApp.tsx', content, 'utf8');
