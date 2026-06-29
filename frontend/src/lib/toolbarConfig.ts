export const TOOLBAR_ITEMS = [
  // 1. 제목 (Title)
  { id: 'h1', icon: 'H1', name: '제목 1', group: '제목', tagFormat: '# 제목', defaultHotkey: 'Ctrl+1', defaultCommand: 'h1', insertText: '# ', kind: 17 },
  { id: 'h2', icon: 'H2', name: '제목 2', group: '제목', tagFormat: '## 제목', defaultHotkey: 'Ctrl+2', defaultCommand: 'h2', insertText: '## ', kind: 17 },
  { id: 'h3', icon: 'H3', name: '제목 3', group: '제목', tagFormat: '### 제목', defaultHotkey: 'Ctrl+3', defaultCommand: 'h3', insertText: '### ', kind: 17 },
  { id: 'h4', icon: 'H4', name: '제목 4', group: '제목', tagFormat: '#### 제목', defaultHotkey: 'Ctrl+4', defaultCommand: 'h4', insertText: '#### ', kind: 17 },
  { id: 'h5', icon: 'H5', name: '제목 5', group: '제목', tagFormat: '##### 제목', defaultHotkey: 'Ctrl+5', defaultCommand: 'h5', insertText: '##### ', kind: 17 },
  { id: 'h6', icon: 'H6', name: '제목 6', group: '제목', tagFormat: '###### 제목', defaultHotkey: 'Ctrl+6', defaultCommand: 'h6', insertText: '###### ', kind: 17 },
  
  // 2. 서식 (Formatting)
  { id: 'bold', icon: 'B', name: '굵게', group: '서식', tagFormat: '**텍스트**', defaultHotkey: 'Ctrl+B', defaultCommand: 'bold', insertText: '**텍스트**', kind: 15 },
  { id: 'italic', icon: 'I', name: '기울임', group: '서식', tagFormat: '*텍스트*', defaultHotkey: 'Ctrl+I', defaultCommand: 'italic', insertText: '*텍스트*', kind: 15 },
  { id: 'strikethrough', icon: 'S', name: '취소선', group: '서식', tagFormat: '~~텍스트~~', defaultHotkey: 'Ctrl+Shift+X', defaultCommand: 'strike', insertText: '~~텍스트~~', kind: 15 },
  { id: 'inlineCode', icon: '</>', name: '인라인 코드', group: '서식', tagFormat: '`텍스트`', defaultHotkey: 'Ctrl+E', defaultCommand: 'inlinecode', insertText: '`텍스트`', kind: 15 },
  { id: 'footnote', icon: 'fn', name: '각주', group: '서식', tagFormat: '[^1]', defaultHotkey: 'Ctrl+Alt+F', defaultCommand: 'footnote', insertText: '', kind: 15 },

  // 3. 목록 (목록)
  { id: 'list', icon: '☰', name: '글머리 기호', group: '목록', tagFormat: '- ', defaultHotkey: 'Ctrl+Shift+8', defaultCommand: 'ul', insertText: '- ', kind: 17 },
  { id: 'orderedList', icon: '1.', name: '숫자 목록', group: '목록', tagFormat: '1. ', defaultHotkey: 'Ctrl+Shift+7', defaultCommand: 'ol', insertText: '1. ', kind: 17 },
  { id: 'quote', icon: '❝', name: '인용구', group: '목록', tagFormat: '> ', defaultHotkey: 'Ctrl+Q', defaultCommand: 'quote', insertText: '> ', kind: 17 },
  { id: 'checklist', icon: '☑️', name: '체크리스트', group: '목록', tagFormat: '- [ ] ', defaultHotkey: 'Ctrl+Shift+C', defaultCommand: 'check', insertText: '- [ ] ', kind: 17 },
  
  // 4. 미디어 (Media)
  { id: 'link', icon: '🔗', name: '링크', group: '미디어', tagFormat: '[텍스트](URL)', defaultHotkey: 'Ctrl+K', defaultCommand: 'link', insertText: '[텍스트](URL)', kind: 15 },
  { id: 'taglink', icon: '🔖', name: '문서 연결', group: '미디어', tagFormat: '[[상대경로/파일명]]', defaultHotkey: '', defaultCommand: 'doclink', insertText: '', kind: 15 },
  { id: 'image', icon: '🖼️', name: '이미지', group: '미디어', tagFormat: '![대체 텍스트](URL)', defaultHotkey: '', defaultCommand: 'image', insertText: '![대체 텍스트](이미지_URL)', kind: 15 },
  { id: 'youtube', icon: '🎥', name: '유튜브 동영상 삽입', group: '미디어', tagFormat: '동영상 삽입', defaultHotkey: '', defaultCommand: 'youtube', insertText: '유튜브 동영상 삽입', kind: 15 },
  { id: 'map', icon: '🗺️', name: '지도', group: '미디어', tagFormat: '지도 삽입', defaultHotkey: '', defaultCommand: 'map', insertText: '지도 삽입', kind: 15 },
  
  // 5. 코드 (Code)
  { id: 'codeblock', icon: '💻', name: '코드 블록', group: '코드', tagFormat: '```코드```', defaultHotkey: 'Ctrl+Shift+E', defaultCommand: 'code', insertText: '```javascript\n\n```', kind: 15 },
  { id: 'table', icon: '📊', name: '표', group: '코드', tagFormat: '| 표 |', defaultHotkey: 'Ctrl+T', defaultCommand: 'table', insertText: '| 열 1 | 열 2 |\n| --- | --- |\n| 내용 | 내용 |', kind: 15 },
  { id: 'math', icon: 'Σ', name: '수식', group: '코드', tagFormat: '$$수식$$', defaultHotkey: 'Ctrl+M', defaultCommand: 'math', insertText: '$$수식$$', kind: 15 },
  
  // 6. 문서 (Document)
  { id: 'divider', icon: '—', name: '구분선', group: '문서', tagFormat: '---', defaultHotkey: 'Ctrl+Alt+-', defaultCommand: 'hr', insertText: '\n---\n', kind: 15 },
  { id: 'now', icon: '📅', name: '현재 날짜/시간', group: '문서', tagFormat: '날짜/시간', defaultHotkey: '', defaultCommand: 'now', insertText: '', kind: 15 },
  { id: 'cleanDoc', icon: '✨', name: '문서 서식 일괄 정리', group: '문서', tagFormat: '없음', defaultHotkey: 'Ctrl+Shift+L', defaultCommand: 'cleandoc', insertText: '', kind: 17 },
  
  // 7. 부가기능 (Extra)
  { id: 'newFile', icon: '📝', name: '새 파일', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+N', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'save', icon: '💾', name: '저장', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+S', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'saveAs', icon: '💿', name: '다른 이름으로 저장', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Shift+S', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'undo', icon: '↩️', name: '실행 취소', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Z', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'redo', icon: '↪️', name: '다시 실행', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Y', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'find', icon: '🔍', name: '찾기', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+F', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'replace', icon: '🔄', name: '바꾸기', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+H', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'globalSearch', icon: '🔎', name: '전체 검색', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Shift+F', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'toggleToolbar', icon: '♻️', name: '툴바 토글', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Shift+L', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'toggleSidebar', icon: '🗃️', name: '사이드바 토글', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Shift+B', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'toggleMode', icon: '📜', name: '모드 전환', group: '부가기능', tagFormat: '', defaultHotkey: 'Ctrl+Shift+M', defaultCommand: '', insertText: '', kind: 17 },
  { id: 'underline', icon: 'U', name: '밑줄', group: '서식', tagFormat: '<u>텍스트</u>', defaultHotkey: 'Ctrl+U', defaultCommand: 'underline', insertText: '<u>텍스트</u>', kind: 15 }
];

// ====================================================================
// 📊 [OMD-EDIT-toolbarConfig-0001] toolbarConfig.ts ➔ getDefaultHotkeys
// 🎯 @KICK  : TOOLBAR_ITEMS에서 defaultHotkey 맵 생성
// 🛡️ @GUARD : item.defaultHotkey 존재 여부 필터
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const getDefaultHotkeys = () => {
  const hotkeys: Record<string, string> = {};
  TOOLBAR_ITEMS.forEach(item => {
    if (item.defaultHotkey) hotkeys[item.id] = item.defaultHotkey;
  });
  return hotkeys;
};

// ====================================================================
// 📊 [OMD-EDIT-toolbarConfig-0002] toolbarConfig.ts ➔ getDefaultCommands
// 🎯 @KICK  : TOOLBAR_ITEMS에서 defaultCommand 맵 생성
// 🛡️ @GUARD : item.defaultCommand 존재 여부 필터
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
export const getDefaultCommands = () => {
  const commands: Record<string, string> = {};
  TOOLBAR_ITEMS.forEach(item => {
    if (item.defaultCommand) commands[item.id] = item.defaultCommand;
  });
  return commands;
};

// ====================================================================
// 📊 [OMD-EDIT-toolbarConfig-0003] toolbarConfig.ts ➔ getSlashCommands
// 🎯 @KICK  : TOOLBAR_ITEMS를 Monaco 슬래시 자동완성 항목으로 변환 (모달/액션/플레이스홀더 처리)
// 🛡️ @GUARD : EXCLUDED_FROM_SLASH 필터, modalKeys/actionOnlyKeys 분기, 플레이스홀더 우선순위 매칭
// 🚨 @PATCH : InsertAsSnippet 하이라이트 방지, filterText 한글/영문 검색 지원
// 🔗 @CALLS : 없음
// ====================================================================
export const getSlashCommands = (monaco: any, customCommands: Record<string, string> = {}) => {
  // 슬래시 자동완성에서 제외할 항목 (UI 토글/래핑 류는 에디터에서 쓸 일 없음)
  const EXCLUDED_FROM_SLASH = new Set([
    'toggleFloatingToolbar', 'toggleToolbar', 'toggleSidebar',
    'toggleMode', 'toggleTheme',
    'wrap-h1', 'wrap-h2', 'wrap-h3', 'wrap-quote', 'wrap-code'
  ]);

  return TOOLBAR_ITEMS
    .filter(item => !EXCLUDED_FROM_SLASH.has(item.id))
    .map(item => {
      const cmdStr = customCommands[item.id] || item.defaultCommand;
      if (!cmdStr) return null;

      let insertText = item.insertText;
      let insertTextRules = undefined;

      // 💡 [하이라이트 방지] InsertAsSnippet 사용 시 Monaco가 삽입된 텍스트를 자동 선택(하이라이트)하므로,
      //    스니펫 규칙을 제거하고 일반 텍스트로 삽입합니다.
      //    (툴바/단축키와 동일한 방식: 삽입 후 커서가 텍스트 끝에 위치)

      let command: any = undefined;

      // 💡 [한글 주석] 모달이 필요한 항목 (youtube 추가)
      const modalKeys = ['image', 'video', 'youtube', 'map', 'table', 'math'];
      // 💡 [한글 주석] 텍스트 선 삽입 없이 액션만 실행하는 항목 (모달 수반 고급 기능 및 동적 시간 삽입 'now', 표 행 편집 이관)
      const actionOnlyKeys = ['cleanDoc', 'clear', 'calendar', 'image', 'video', 'youtube', 'map', 'table', 'math', 'now', 'insertTableRow', 'deleteTableRow', 'taglink', 'footnote'];

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

      // 💡 [툴바/단축키 동일 UX] 텍스트 삽입 후 플레이스홀더를 자동 선택하는 커맨드 설정
      //    Monaco completion item의 command 필드는 삽입 완료 후 자동 실행됩니다.
      //    actionOnlyKeys는 이미 trigger-custom-action이 설정되므로 제외합니다.
      if (!command && insertText) {
        // 플레이스홀더 후보 목록: 순서대로 검색 (우선순위 적용)
        const PLACEHOLDER_CANDIDATES = ['이미지_URL', '텍스트', 'URL', '제목', '코드', '내용', '수식'];
        let placeholder: string | null = null;
        let placeholderOffset = 0;

        // 단일 라인 insertText에서만 플레이스홀더 감지 (멀티라인은 플레이스홀더 없음)
        if (insertText && !insertText.includes('\n')) {
          for (const pw of PLACEHOLDER_CANDIDATES) {
            const idx = insertText.indexOf(pw);
            if (idx !== -1) {
              placeholder = pw;
              placeholderOffset = idx;
              break;
            }
          }
        }

        if (placeholder) {
          command = {
            id: 'select-slash-placeholder',
            title: '플레이스홀더 선택',
            // insertText 전체 길이, 플레이스홀더 오프셋, 플레이스홀더 길이 전달
            arguments: [insertText.length, placeholderOffset, placeholder.length]
          };
        }
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

