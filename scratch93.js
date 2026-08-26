const fs = require("fs");
let content = fs.readFileSync("frontend/src/components/MainEditorApp.tsx", "utf8");

const oldStr = `  useEffect(() => {
    if (!isA4GuardEnabled) {
      setPreviewZoomScale(1);
      return;
    }

    const container = previewRef.current;
    if (!container) return;`;

const newStr = `  // 💡 [Desktop 이미지 비동기 로딩 대응] 미리보기 내용 높이 변경 감지 및 자동 하단 스크롤
  useEffect(() => {
    const container = previewRef.current;
    if (!container) return;
    const contentWrapper = container.firstElementChild as HTMLElement;
    if (!contentWrapper) return;

    const resizeObserver = new ResizeObserver(() => {
      const editor = editorRef.current;
      if (editor) {
        const scrollTop = editor.getScrollTop();
        const layoutInfo = editor.getLayoutInfo();
        const viewportHeight = layoutInfo.height || 800;
        const scrollHeight = editor.getScrollHeight();
        const editorMaxScroll = scrollHeight - viewportHeight;
        
        // 에디터가 맨 아래에 위치해 있다면, 미리보기 높이가 늘어나도(이미지 로딩 완료 등) 강제로 맨 아래로 유지
        if (editorMaxScroll > 0 && scrollTop >= editorMaxScroll - 5) {
          const previewMaxScroll = container.scrollHeight - container.clientHeight;
          if (previewMaxScroll > 0) {
            container.scrollTop = previewMaxScroll;
          }
        }
      }
    });
    
    resizeObserver.observe(contentWrapper);
    return () => resizeObserver.disconnect();
  }, [previewRef, contentText]);

  useEffect(() => {
    if (!isA4GuardEnabled) {
      setPreviewZoomScale(1);
      return;
    }

    const container = previewRef.current;
    if (!container) return;`;

content = content.replace(oldStr, newStr);
fs.writeFileSync("frontend/src/components/MainEditorApp.tsx", content, "utf8");
console.log("Added ResizeObserver for content height");
