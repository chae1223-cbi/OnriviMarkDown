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
  { id: 'divider', icon: 'ㅡ', name: '구분선', group: '문단', tagFormat: '---', defaultHotkey: 'Ctrl+Alt+-', defaultCommand: 'hr', insertText: '\n---\n', kind: 15 },
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
  
  // 5. 고급 (Advanced)
  { id: 'map', icon: '🗺', name: '지도', group: '고급', tagFormat: '지도 삽입', defaultHotkey: '', defaultCommand: 'map', insertText: '지도 삽입', kind: 15 },
  { id: 'chart', icon: '📊', name: '차트', group: '고급', tagFormat: '```mermaid', defaultHotkey: '', defaultCommand: 'chart', insertText: '```mermaid\n\n```', kind: 15 },
  { id: 'codeblock', icon: '💻', name: '코드 블록', group: '고급', tagFormat: '```코드```', defaultHotkey: 'Ctrl+Shift+E', defaultCommand: 'code', insertText: '```javascript\n\n```', kind: 15 },
  { id: 'math', icon: 'Σ', name: '수식', group: '고급', tagFormat: '$$수식$$', defaultHotkey: 'Ctrl+M', defaultCommand: 'math', insertText: '$$수식$$', kind: 15 },
  { id: 'table', icon: '표', name: '표', group: '고급', tagFormat: '| 표 |', defaultHotkey: 'Ctrl+T', defaultCommand: 'table', insertText: '| 열 1 | 열 2 |\n| --- | --- |\n| 내용 | 내용 |', kind: 15 },
  { id: 'quickTable', icon: '📋', name: '빠른 표 삽입', group: '고급', tagFormat: '| 빠른 표 |', defaultHotkey: 'Ctrl+Alt+T', defaultCommand: '표', insertText: '| 구분 | 데이터 1 | 데이터 2 |\n| --- | --- | --- |\n| 항목A | 100 | 200 |\n| 항목B | 300 | 400 |', kind: 15 },

  // 푸터 및 기타 액션
  { id: 'toggleFloatingToolbar', icon: '🪟', name: '플로팅 툴바 토글', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+F', defaultCommand: 'floating_toolbar', insertText: '', kind: 17 },
  { id: 'toggleToolbar', icon: '♻️', name: '툴바 토글', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+T', defaultCommand: 'toggle_toolbar', insertText: '', kind: 17 },
  { id: 'toggleSidebar', icon: '🗃️', name: '사이드바 토글', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+B', defaultCommand: 'toggle_sidebar', insertText: '', kind: 17 },
  { id: 'toggleMode', icon: '📜', name: '모드 전환', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+P', defaultCommand: 'toggle_mode', insertText: '', kind: 17 },
  { id: 'toggleTheme', icon: '🌙', name: '테마 전환', group: '푸터', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+D', defaultCommand: 'toggle_theme', insertText: '', kind: 17 },

  // ★ 퀵 래핑 (Quick Transform) — 선택 영역/전체 문단을 한 번에 변환
  { id: 'wrap-h1', icon: 'H1#', name: '퀵 H1', group: '퀵래핑', tagFormat: '# 선택', defaultHotkey: 'Ctrl+Shift+1', defaultCommand: 'wrap-h1', insertText: '', kind: 17 },
  { id: 'wrap-h2', icon: 'H2#', name: '퀵 H2', group: '퀵래핑', tagFormat: '## 선택', defaultHotkey: 'Ctrl+Shift+2', defaultCommand: 'wrap-h2', insertText: '', kind: 17 },
  { id: 'wrap-h3', icon: 'H3#', name: '퀵 H3', group: '퀵래핑', tagFormat: '### 선택', defaultHotkey: 'Ctrl+Shift+3', defaultCommand: 'wrap-h3', insertText: '', kind: 17 },
  { id: 'wrap-quote', icon: '>"', name: '퀵 인용', group: '퀵래핑', tagFormat: '> 선택', defaultHotkey: 'Ctrl+Shift+Q', defaultCommand: 'wrap-quote', insertText: '', kind: 17 },
  { id: 'wrap-code', icon: '{}', name: '퀵 코드', group: '퀵래핑', tagFormat: '```선택```', defaultHotkey: 'Ctrl+Shift+9', defaultCommand: 'wrap-code', insertText: '', kind: 17 },

  // ★ 서식 정의 (Style Profile)
  { id: 'css-style', icon: '🏛️', name: '서식 정의', group: '푸터', tagFormat: '관보 서식', defaultHotkey: 'Ctrl+Shift+S', defaultCommand: 'css-style', insertText: '', kind: 17 }
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
  // 슬래시 자동완성에서 제외할 항목 (UI 토글/래핑 류는 에디터에서 쓸 일 없음)
  const EXCLUDED_FROM_SLASH = new Set([
    'toggleFloatingToolbar', 'toggleToolbar', 'toggleSidebar',
    'toggleMode', 'toggleTheme',
    'wrap-h1', 'wrap-h2', 'wrap-h3', 'wrap-quote', 'wrap-code',
    'css-style'
  ]);

  return TOOLBAR_ITEMS
    .filter(item => !EXCLUDED_FROM_SLASH.has(item.id))
    .map(item => {
      const cmdStr = customCommands[item.id] || item.defaultCommand;
      if (!cmdStr) return null;

      let insertText = item.insertText;
      let insertTextRules = undefined;

      // 스니펫 변환: 커서 위치 자동 설정
      if (item.kind === 15 || item.kind === 17) {
        if (insertText.includes('텍스트')) {
          insertText = insertText.replace('텍스트', '${1:텍스트}');
          insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        } else if (insertText.includes('이미지_URL')) {
          insertText = insertText.replace('이미지_URL', '${1:이미지_URL}');
          insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        } else if (insertText.includes('URL')) {
          insertText = insertText.replace('URL', '${1:URL}');
          insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        } else if (insertText === '```javascript\n\n```') {
          insertText = '```javascript\n${1:코드}\n```';
          insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        } else if (insertText === '```mermaid\n\n```') {
          insertText = '```mermaid\n${1:내용}\n```';
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
        } else if (insertText.startsWith('| 구분 |')) {
          insertText = '| 구분 | ${1:데이터 1} | ${2:데이터 2} |\n| --- | --- | --- |\n| 항목A | 100 | 200 |\n| 항목B | 300 | 400 |';
          insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
        }
      }

      let command: any = undefined;

      // 모달이 필요한 항목: 삽입 후 모달도 열기
      const modalKeys = ['image', 'video', 'map', 'table', 'math'];
      // 텍스트 없이 액션만 실행하는 항목
      const actionOnlyKeys = ['cleanDoc', 'clear', 'calendar'];

      if (modalKeys.includes(item.id)) {
        command = {
          id: 'trigger-custom-action',
          title: item.name,
          arguments: [item.id]
        };
      }
      if (actionOnlyKeys.includes(item.id)) {
        insertText = '';
        insertTextRules = undefined;
        command = {
          id: 'trigger-custom-action',
          title: item.name,
          arguments: [item.id]
        };
      }

      // 레이블: 이모지 아이콘 + 명령어 + 한국어 이름
      const iconStr = item.icon && item.icon.length <= 4 ? `${item.icon} ` : '';
      const label = `${iconStr}/${cmdStr}   ${item.name}`;
      // filterText: 영어 커맨드 + 한국어 이름 조합 → 어느 쪽으로 타이핑해도 검색됨
      const filterText = `/${cmdStr} ${item.name} ${item.group}`;

      return {
        id: item.id,
        label,
        kind: item.kind === 17 ? monaco.languages.CompletionItemKind.Keyword : monaco.languages.CompletionItemKind.Snippet,
        insertText: insertText,
        insertTextRules: insertTextRules,
        detail: `${item.group}  ·  ${item.tagFormat}`,
        filterText,
        sortText: cmdStr,  // 알파벳 순 정렬
        command: command
      };
    }).filter((item) => item !== null) as any[];
};
