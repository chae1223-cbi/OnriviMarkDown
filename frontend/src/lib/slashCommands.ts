export const DEFAULT_HOTKEYS: Record<string, string> = {
  bold: 'Ctrl+B',
  italic: 'Ctrl+I',
  strikethrough: 'Ctrl+Shift+X',
  h1: 'Ctrl+1',
  h2: 'Ctrl+2',
  h3: 'Ctrl+3',
  quote: 'Ctrl+Q',
  inlineCode: 'Ctrl+E'
};

export const DEFAULT_SLASH_COMMANDS = [
  { id: 'h1', label: 'H1 (제목 1)', kind: 17, insertText: '# ', detail: '가장 큰 제목' },
  { id: 'h2', label: 'H2 (제목 2)', kind: 17, insertText: '## ', detail: '두 번째 제목' },
  { id: 'h3', label: 'H3 (제목 3)', kind: 17, insertText: '### ', detail: '세 번째 제목' },
  { id: 'table', label: 'Table (표)', kind: 15, insertText: '| 열 1 | 열 2 |\n| --- | --- |\n| 내용 | 내용 |', detail: '기본 표 삽입' },
  { id: 'quote', label: 'Quote (인용구)', kind: 17, insertText: '> ', detail: '인용문 블록' },
  { id: 'codeblock', label: 'Code Block (코드)', kind: 15, insertText: '```javascript\n\n```', detail: '코드 블록 삽입' },
  { id: 'orderedlist', label: 'Ordered List (숫자 목록)', kind: 17, insertText: '1. ', detail: '숫자 목록' },
  { id: 'list', label: 'List (글머리 기호)', kind: 17, insertText: '- ', detail: '기호 목록' },
  { id: 'checklist', label: 'Checklist (체크리스트)', kind: 17, insertText: '- [ ] ', detail: '할 일 목록' },
  { id: 'image', label: 'Image (이미지)', kind: 15, insertText: '![대체 텍스트](이미지_URL)', detail: '이미지 삽입' },
  { id: 'link', label: 'Link (링크)', kind: 15, insertText: '[링크 텍스트](URL)', detail: '링크 삽입' },
  { id: 'divider', label: 'Divider (구분선)', kind: 15, insertText: '\n---\n', detail: '가로 구분선' }
];

// Monaco가 없어도 사용할 수 있도록 초기화 함수 작성
// ====================================================================
// 📊 [OMD-EDIT-slashCommands-0001] slashCommands.ts ➔ getSlashCommands
// 🎯 @KICK  : 기본 슬래시 명령어 배열을 Monaco CompletionItem 형식으로 변환
// 🛡️ @GUARD : 없음
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const getSlashCommands = (monaco: any, customCommands = DEFAULT_SLASH_COMMANDS) => {
  return customCommands.map(cmd => ({
    ...cmd,
    kind: cmd.kind === 17 ? monaco.languages.CompletionItemKind.Keyword : monaco.languages.CompletionItemKind.Snippet
  }));
};
