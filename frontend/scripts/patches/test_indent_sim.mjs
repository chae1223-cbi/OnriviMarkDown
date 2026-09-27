// getIndentStyle 개선안 테스트
function getIndentStyleSim(lineText, listIndent = '16px') {
  let indentStr = '';
  // 인용구 접두사(예: '> ', '> > ', ' > ' 등) 제거 후 내부 들여쓰기 공백 추출
  const quoteMatch = lineText.match(/^[ \t]*(?:>+[ \t]?)+(.*)$/);
  if (quoteMatch) {
    const innerContent = quoteMatch[1];
    const m = innerContent.match(/^([ \t]*)/);
    indentStr = m ? m[1] : '';
  } else {
    const m = lineText.match(/^([ \t]*)/);
    indentStr = m ? m[1] : '';
  }

  let baseIndentPx = 16;
  if (listIndent) {
    const parsed = parseInt(listIndent, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      baseIndentPx = parsed;
    }
  }

  let marginLeft = 0;
  for (const char of indentStr) {
    if (char === '\t') {
      marginLeft += baseIndentPx;
    } else if (char === ' ') {
      marginLeft += (baseIndentPx / 4);
    }
  }

  if (marginLeft > 0) {
    return { marginLeft: `${marginLeft}px` };
  }
  return {};
}

const testLines = [
  '> **[글머리 리스트]**',
  '> - 사과',
  '>   - 바나나',
  '> - 파인애플',
  '> - 오렌지',
  '> ---',
  '> **[숫자 리스트]**',
  '> 1. 첫 번째 순서',
  '>   2. 두 번째 순서',
  '> 3. 세 번째 순서',
  '> ---',
  '> **[체크 리스트]**',
  '> **당신은 성별이 어떠해 됩니까?**',
  '>   - [X] 여자',
  '> - [ ] 남자'
];

console.log('--- INDENT CALCULATION TEST ---');
testLines.forEach((l, idx) => {
  const style = getIndentStyleSim(l);
  console.log(`Line ${idx + 1}: ${JSON.stringify(l)} -> ${JSON.stringify(style)}`);
});
