export const TOOLBAR_ITEMS = [
  // 1. 서식 (Formatting)
  { id: 'bold', icon: 'B', name: '굵게', group: '서식', tagFormat: '**텍스트**', defaultHotkey: 'Ctrl+B', defaultCommand: 'bold', insertText: '**텍스트**', kind: 15 },
  { id: 'italic', icon: 'I', name: '기울임', group: '서식', tagFormat: '*텍스트*', defaultHotkey: 'Ctrl+I', defaultCommand: 'italic', insertText: '*텍스트*', kind: 15 },
  { id: 'inlineCode', icon: '</>', name: '인라인 코드', group: '서식', tagFormat: '`텍스트`', defaultHotkey: 'Ctrl+E', defaultCommand: 'inlinecode', insertText: '`텍스트`', kind: 15 },
  { id: 'strikethrough', icon: 'S', name: '취소선', group: '서식', tagFormat: '~~텍스트~~', defaultHotkey: 'Ctrl+Shift+X', defaultCommand: 'strike', insertText: '~~텍스트~~', kind: 15 },
  
  // 2. 제목 (Title)
  { id: 'h1', icon: 'H1', name: '제목 1', group: '제목', tagFormat: '# 제목', defaultHotkey: 'Ctrl+1', defaultCommand: 'h1', insertText: '# ', kind: 17 },
  { id: 'h2', icon: 'H2', name: '제목 2', group: '제목', tagFormat: '## 제목', defaultHotkey: 'Ctrl+2', defaultCommand: 'h2', insertText: '## ', kind: 17 },
  { id: 'h3', icon: 'H3', name: '제목 3', group: '제목', tagFormat: '### 제목', defaultHotkey: 'Ctrl+3', defaultCommand: 'h3', insertText: '### ', kind: 17 },
  { id: 'h4', icon: 'H4', name: '제목 4', group: '제목', tagFormat: '#### 제목', defaultHotkey: 'Ctrl+4', defaultCommand: 'h4', insertText: '#### ', kind: 17 },
  { id: 'h5', icon: 'H5', name: '제목 5', group: '제목', tagFormat: '##### 제목', defaultHotkey: 'Ctrl+5', defaultCommand: 'h5', insertText: '##### ', kind: 17 },
  { id: 'h6', icon: 'H6', name: '제목 6', group: '제목', tagFormat: '###### 제목', defaultHotkey: 'Ctrl+6', defaultCommand: 'h6', insertText: '###### ', kind: 17 },
  
  // 3. 문단 (Paragraph)
  { id: 'divider', icon: 'ㅡ', name: '구분선', group: '문단', tagFormat: '---', defaultHotkey: 'Ctrl+-', defaultCommand: 'hr', insertText: '\\n---\\n', kind: 15 },
  { id: 'orderedList', icon: '1.', name: '숫자 목록', group: '문단', tagFormat: '1. ', defaultHotkey: 'Ctrl+Shift+7', defaultCommand: 'ol', insertText: '1. ', kind: 17 },
  { id: 'list', icon: '≡', name: '글머리 기호', group: '문단', tagFormat: '- ', defaultHotkey: 'Ctrl+Shift+8', defaultCommand: 'ul', insertText: '- ', kind: 17 },
  { id: 'quote', icon: '“', name: '인용구', group: '문단', tagFormat: '> ', defaultHotkey: 'Ctrl+Q', defaultCommand: 'quote', insertText: '> ', kind: 17 },
  { id: 'checklist', icon: '☑', name: '체크리스트', group: '문단', tagFormat: '- [ ] ', defaultHotkey: 'Ctrl+Shift+C', defaultCommand: 'check', insertText: '- [ ] ', kind: 17 },
  { id: 'clear', icon: '🧹', name: '서식 지우기', group: '문단', tagFormat: '없음', defaultHotkey: 'Ctrl+\\', defaultCommand: 'clear', insertText: '', kind: 17 },
  { id: 'cleanDoc', icon: '✨', name: '문서 서식 일괄 정리', group: '문단', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+L', defaultCommand: 'cleanDoc', insertText: '', kind: 17 },
  
  // 4. 삽입 (Insert)
  { id: 'link', icon: '🔗', name: '링크', group: '삽입', tagFormat: '[텍스트](URL)', defaultHotkey: 'Ctrl+K', defaultCommand: 'link', insertText: '[텍스트](URL)', kind: 15 },
  { id: 'image', icon: '🖼', name: '이미지', group: '삽입', tagFormat: '![대체 텍스트](URL)', defaultHotkey: 'Ctrl+Shift+I', defaultCommand: 'image', insertText: '![대체 텍스트](이미지_URL)', kind: 15 },
  { id: 'video', icon: '🎥', name: '비디오', group: '삽입', tagFormat: '비디오 삽입', defaultHotkey: '', defaultCommand: 'video', insertText: '비디오 삽입', kind: 15 },
  { id: 'calendar', icon: '📅', name: '달력', group: '삽입', tagFormat: '날짜', defaultHotkey: '', defaultCommand: 'date', insertText: '2026-05-26', kind: 15 },
  { id: 'emoji', icon: '😊', name: '이모지', group: '삽입', tagFormat: '이모지', defaultHotkey: 'Win+.', defaultCommand: 'emoji', insertText: '😊', kind: 15 },
  
  // 5. 고급 (Advanced)
  { id: 'map', icon: '🗺', name: '지도', group: '고급', tagFormat: '지도 삽입', defaultHotkey: '', defaultCommand: 'map', insertText: '지도 삽입', kind: 15 },
  { id: 'chart', icon: '📊', name: '차트', group: '고급', tagFormat: '```mermaid', defaultHotkey: '', defaultCommand: 'chart', insertText: '```mermaid\\n\\n```', kind: 15 },
  { id: 'codeblock', icon: '💻', name: '코드 블록', group: '고급', tagFormat: '```코드```', defaultHotkey: 'Ctrl+Shift+E', defaultCommand: 'code', insertText: '```javascript\\n\\n```', kind: 15 },
  { id: 'math', icon: 'Σ', name: '수식', group: '고급', tagFormat: '$$수식$$', defaultHotkey: 'Ctrl+M', defaultCommand: 'math', insertText: '$$수식$$', kind: 15 },
  { id: 'table', icon: '표', name: '표', group: '고급', tagFormat: '| 표 |', defaultHotkey: 'Ctrl+T', defaultCommand: 'table', insertText: '| 열 1 | 열 2 |\\n| --- | --- |\\n| 내용 | 내용 |', kind: 15 },

  // 푸터 및 기타 액션
  { id: 'toggleFloatingToolbar', icon: '🪟', name: '플로팅 툴바 토글', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+F', defaultCommand: 'floating_toolbar', insertText: '', kind: 17 },
  { id: 'toggleToolbar', icon: '♻️', name: '툴바 토글', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+T', defaultCommand: 'toggle_toolbar', insertText: '', kind: 17 },
  { id: 'toggleSidebar', icon: '🗃️', name: '사이드바 토글', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+B', defaultCommand: 'toggle_sidebar', insertText: '', kind: 17 },
  { id: 'toggleMode', icon: '📜', name: '모드 전환', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+P', defaultCommand: 'toggle_mode', insertText: '', kind: 17 },
  { id: 'toggleTheme', icon: '🌙', name: '테마 전환', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+D', defaultCommand: 'toggle_theme', insertText: '', kind: 17 }
];

export const getDefaultHotkeys = () => {
  const hotkeys: Record<string, string> = {};
  TOOLBAR_ITEMS.forEach(item => {
    if (item.defaultHotkey) hotkeys[item.id] = item.defaultHotkey;
  });
  return hotkeys;
};

export const getDefaultCommands = () => {
  const commands: Record<string, string> = {};
  TOOLBAR_ITEMS.forEach(item => {
    if (item.defaultCommand) commands[item.id] = item.defaultCommand;
  });
  return commands;
};

export const getSlashCommands = (monaco: any, customCommands: Record<string, string> = {}) => {
  return TOOLBAR_ITEMS.map(item => {
    const cmdStr = customCommands[item.id] || item.defaultCommand;
    if (!cmdStr) return null;

    let insertText = item.insertText;
    let insertTextRules = undefined;

    // Convert plain text insertions to Monaco Snippets for proper cursor placement
    if (item.kind === 15 || item.kind === 17) {
      if (insertText.includes('텍스트')) {
        insertText = insertText.replace('텍스트', '${1:텍스트}');
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText.includes('URL')) {
        insertText = insertText.replace('URL', '${1:URL}');
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText.includes('이미지_URL')) {
        insertText = insertText.replace('이미지_URL', '${1:이미지_URL}');
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '```javascript\\n\\n```') {
        insertText = '```javascript\\n${1:코드}\\n```';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '```mermaid\\n\\n```') {
        insertText = '```mermaid\\n${1:그래프}\\n```';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '$$수식$$') {
        insertText = '$$${1:수식}$$';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '# ') {
        insertText = '# ${1:제목}';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '## ') {
        insertText = '## ${1:제목}';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '### ') {
        insertText = '### ${1:제목}';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '#### ') {
        insertText = '#### ${1:제목}';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '##### ') {
        insertText = '##### ${1:제목}';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      } else if (insertText === '###### ') {
        insertText = '###### ${1:제목}';
        insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      }
    }

    let command: any = undefined;

    const modalKeys = ['image', 'video', 'map', 'table', 'emoji', 'math'];
    const otherActionKeys = ['toggleFloatingToolbar', 'toggleToolbar', 'toggleSidebar', 'toggleMode', 'toggleTheme', 'cleanDoc'];

    if (modalKeys.includes(item.id) || otherActionKeys.includes(item.id)) {
      // For actions and modals, don't insert text. Just run the action.
      insertText = '';
      insertTextRules = undefined;
      command = {
        id: `custom-action-${item.id}`,
        title: item.name
      };
    }

    return {
      id: item.id,
      label: `/${cmdStr} - ${item.name}`,
      kind: item.kind === 17 ? monaco.languages.CompletionItemKind.Keyword : monaco.languages.CompletionItemKind.Snippet,
      insertText: insertText,
      insertTextRules: insertTextRules,
      detail: item.tagFormat,
      filterText: `/${cmdStr}`,
      command: command
    };
  }).filter((item) => item !== null) as any[];
};
