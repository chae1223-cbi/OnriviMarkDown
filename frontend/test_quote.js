const code = `
graph TD
  Page("(page.tsx) 메인 컨테이너 및 상태 관리")
  MenuBar("(MenuBar.tsx) 상단 메뉴 및 번역 관리")
  LeftSidebar("(LeftSidebar.tsx) 왼쪽 사이드바 (신설)")
  GlobalSearch("(GlobalSearch.tsx) 전체 검색 (내장)")
  Toolbar("(Toolbar.tsx) 우측 2열 툴바 (녹색 테마)")
  HeadingSpin("(HeadingSpinButton) 헤딩 스핀 제어")
  CopyPreview("(CopyPreviewButton) 📋 복사 단추")

  Page --> MenuBar
  Page --> LeftSidebar
  Page --> Toolbar
  LeftSidebar --> GlobalSearch
  Toolbar --> HeadingSpin
  Toolbar --> CopyPreview
`;

const cleanCode = code.replace(/"([^"]*)"/g, (match, p1) => {
  const sanitized = p1
    .replace(/\[/g, '［')
    .replace(/\]/g, '］')
    .replace(/\(/g, '（')
    .replace(/\)/g, '）');
  return `"${sanitized}"`;
});

console.log(cleanCode);
