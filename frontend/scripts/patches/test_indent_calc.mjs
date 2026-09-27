function calculateIndent(lineText, baseIndentPx = 16) {
  let indentStr = '';
  const quoteMatch = lineText.match(/^[ \t]*(?:>+[ \t]?)+(.*)$/);
  if (quoteMatch) {
    const innerContent = quoteMatch[1];
    const m = innerContent.match(/^([ \t]*)/);
    indentStr = m ? m[1] : '';
  } else {
    const m = lineText.match(/^([ \t]*)/);
    indentStr = m ? m[1] : '';
  }

  let marginLeft = 0;
  for (const char of indentStr) {
    if (char === '\t') {
      marginLeft += baseIndentPx;
    } else if (char === ' ') {
      marginLeft += (baseIndentPx / 4);
    }
  }

  return marginLeft > 0 ? `${marginLeft}px` : '0px';
}

const lines = [
  "> - 사과",
  ">   - 바나나",
  "> - 파인애플",
  "> - 오렌지",
  "> 1. 첫 번째 순서",
  ">   2. 두 번째 순서",
  "> 3. 세 번째 순서",
  ">   - [X] 여자",
  "> - [ ] 남자",
  "- 일반 사과",
  "    - 일반 바나나",
  "  - 일반 2칸 바나나"
];

lines.forEach(l => {
  console.log(`[${calculateIndent(l).padStart(4)}] ${l}`);
});
