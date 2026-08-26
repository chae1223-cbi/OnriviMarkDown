export interface ThemeDefinition {
  id: string;
  name: string;
  icon: string;
  isDark: boolean;
  base: 'vs' | 'vs-dark';
  rules: { token: string; fontStyle?: string; foreground?: string }[];
  colors: Record<string, string>;
}

export const EDITOR_THEMES: ThemeDefinition[] = [
  {
    id: 'onrivi-light',
    name: 'Onrivi Light',
    icon: '☀️',
    isDark: false,
    base: 'vs',
    rules: [
      { token: '', foreground: '1e293b' },
      { token: 'keyword', fontStyle: 'bold', foreground: '4f46e5' }, // 헤더/키워드 (강렬한 로열 블루)
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '4f46e5' },
      { token: 'comment', fontStyle: 'italic', foreground: '78716c' }, // 인용구 (돌빛 회색)
      { token: 'comment.markdown', fontStyle: 'italic', foreground: '78716c' },
      { token: 'strong', fontStyle: 'bold', foreground: 'db2777' }, // Bold (진한 핑크)
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'db2777' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '059669' }, // Italic (청록색)
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '059669' },
      { token: 'string.link', fontStyle: 'underline', foreground: '2563eb' }, // 링크 주소 (블루)
      { token: 'string.link.markdown', fontStyle: 'underline', foreground: '2563eb' },
      { token: 'string', foreground: '1e293b' }, // 일반 텍스트
      { token: 'variable', foreground: '7c3aed' }, // 코드 블록 / 인라인 코드 (자수정 보라)
      { token: 'variable.source', foreground: '7c3aed' },
      { token: 'type', foreground: 'ea580c', fontStyle: 'bold' }, // 리스트 기호 (오렌지)
      { token: 'type.markdown', foreground: 'ea580c', fontStyle: 'bold' },
      { token: 'tag', foreground: '0ea5e9' }, // HTML 태그 (하늘색)
      { token: 'tag.markdown', foreground: '0ea5e9' },
      { token: 'meta', foreground: '0891b2' }, // 메타데이터
      { token: 'meta.content', foreground: '0891b2' },
      { token: 'meta.separator', foreground: '0891b2', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1e293b',
      'editor.lineHighlightBackground': '#f1f5f980',
      'editorLineNumber.foreground': '#94a3b880',
      'editorLineNumber.activeForeground': '#0f172a',
      'editorCursor.foreground': '#0f172a',
      'editor.selectionBackground': '#cbd5e180'
    }
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    icon: '🌅',
    isDark: false,
    base: 'vs',
    rules: [
      { token: '', foreground: '657B83' },
      { token: 'keyword', fontStyle: 'bold', foreground: 'CB4B16' }, // 헤더/키워드 (황토 오렌지)
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: 'CB4B16' },
      { token: 'comment', fontStyle: 'italic', foreground: '859900' }, // 인용구/의견 (올리브 그린)
      { token: 'comment.markdown', fontStyle: 'italic', foreground: '859900' },
      { token: 'strong', fontStyle: 'bold', foreground: 'b58900' }, // Bold (황금 옐로우)
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'b58900' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '2aa198' }, // Italic (청록 민트)
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '2aa198' },
      { token: 'string.link', fontStyle: 'underline', foreground: '268bd2' }, // 링크 (솔라 블루)
      { token: 'string.link.markdown', fontStyle: 'underline', foreground: '268bd2' },
      { token: 'string', foreground: '657B83' },
      { token: 'variable', foreground: 'd33682' }, // 코드 블록 (매젠타 핑크)
      { token: 'variable.source', foreground: 'd33682' },
      { token: 'type', foreground: 'cb4b16', fontStyle: 'bold' }, // 리스트 (레드 오렌지)
      { token: 'type.markdown', foreground: 'cb4b16', fontStyle: 'bold' },
      { token: 'tag', foreground: '2aa198' }, // HTML 태그
      { token: 'tag.markdown', foreground: '2aa198' },
    ],
    colors: {
      'editor.background': '#FDF6E3',
      'editor.foreground': '#657B83',
      'editor.lineHighlightBackground': '#EEE8D5',
      'editor.selectionBackground': '#D1D1C0',
      'editorCursor.foreground': '#657B83',
      'editorLineNumber.foreground': '#93A1A1',
      'editorLineNumber.activeForeground': '#657B83',
      'editorBracketMatch.background': '#E4DDD0',
      'editorBracketMatch.border': '#657B83',
    }
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    icon: '🐙',
    isDark: false,
    base: 'vs',
    rules: [
      { token: '', foreground: '24292E' },
      { token: 'keyword', fontStyle: 'bold', foreground: '6f42c1' }, // 헤더/키워드 (짙은 보라)
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '6f42c1' },
      { token: 'comment', fontStyle: 'italic', foreground: '28a745' }, // 인용구 (그린)
      { token: 'comment.markdown', fontStyle: 'italic', foreground: '28a745' },
      { token: 'strong', fontStyle: 'bold', foreground: 'd73a49' }, // Bold (레드)
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'd73a49' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '005cc5' }, // Italic (딥 블루)
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '005cc5' },
      { token: 'string.link', fontStyle: 'underline', foreground: '032f62' }, // 링크
      { token: 'string.link.markdown', fontStyle: 'underline', foreground: '032f62' },
      { token: 'string', foreground: '24292E' },
      { token: 'variable', foreground: 'e36209' }, // 코드 블록 (오렌지 브라운)
      { token: 'variable.source', foreground: 'e36209' },
      { token: 'type', foreground: 'd73a49', fontStyle: 'bold' }, // 리스트 기호
      { token: 'type.markdown', foreground: 'd73a49', fontStyle: 'bold' },
      { token: 'tag', foreground: '22863a' }, // HTML 태그
      { token: 'tag.markdown', foreground: '22863a' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#24292E',
      'editor.lineHighlightBackground': '#F6F8FA',
      'editor.selectionBackground': '#C8E1FF',
      'editorCursor.foreground': '#24292E',
      'editorLineNumber.foreground': '#959DA5',
      'editorLineNumber.activeForeground': '#24292E',
      'editorBracketMatch.background': '#E8F0FE',
      'editorBracketMatch.border': '#24292E',
    }
  },
  {
    id: 'github-dark-dimmed',
    name: 'GitHub Dark Dimmed',
    icon: '🐨',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: '', foreground: 'e2e8f0' },
      { token: 'keyword', fontStyle: 'bold', foreground: 'f69d50' }, // 헤더/키워드 (선명한 살구 오렌지)
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: 'f69d50' },
      { token: 'comment', fontStyle: 'italic', foreground: '768390' }, // 인용구 (차분한 그레이)
      { token: 'comment.markdown', fontStyle: 'italic', foreground: '768390' },
      { token: 'strong', fontStyle: 'bold', foreground: 'ec4899' }, // Bold (화려한 매젠타)
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'ec4899' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '34d399' }, // Italic (민트 그린)
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '34d399' },
      { token: 'string.link', fontStyle: 'underline', foreground: '58a6ff' }, // 링크
      { token: 'string.link.markdown', fontStyle: 'underline', foreground: '58a6ff' },
      { token: 'string', foreground: 'adbac7' },
      { token: 'variable', foreground: 'd3b887' }, // 코드 블록 (브론즈 골드)
      { token: 'variable.source', foreground: 'd3b887' },
      { token: 'type', foreground: 'ff7b72', fontStyle: 'bold' }, // 리스트 기호 (체리 레드)
      { token: 'type.markdown', foreground: 'ff7b72', fontStyle: 'bold' },
      { token: 'tag', foreground: '56b6c2' }, // HTML 태그 (아쿠아)
      { token: 'tag.markdown', foreground: '56b6c2' },
      { token: 'meta', foreground: 'a5d6ff' }, // 메타데이터
      { token: 'meta.content', foreground: 'a5d6ff' },
      { token: 'meta.separator', foreground: 'a5d6ff', fontStyle: 'bold' },
    ],
    colors: {
      'editor.background': '#22272E',
      'editor.foreground': '#ADBAC7',
      'editor.lineHighlightBackground': '#2D333B',
      'editorLineNumber.foreground': '#545D68',
      'editorLineNumber.activeForeground': '#ADBAC7',
      'editor.selectionBackground': '#3D4551',
      'editorCursor.foreground': '#ADBAC7',
      'editorBracketMatch.background': '#2D333B',
      'editorBracketMatch.border': '#ADBAC7',
    }
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    icon: '🌁',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: '', foreground: '839496' },
      { token: 'keyword', fontStyle: 'bold', foreground: 'cb4b16' }, // 헤더/키워드 (오렌지)
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: 'cb4b16' },
      { token: 'comment', fontStyle: 'italic', foreground: '586e75' }, // 인용구
      { token: 'comment.markdown', fontStyle: 'italic', foreground: '586e75' },
      { token: 'strong', fontStyle: 'bold', foreground: '268bd2' }, // Bold (블루)
      { token: 'strong.markdown', fontStyle: 'bold', foreground: '268bd2' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '859900' }, // Italic (그린)
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '859900' },
      { token: 'string.link', fontStyle: 'underline', foreground: '2aa198' }, // 링크
      { token: 'string.link.markdown', fontStyle: 'underline', foreground: '2aa198' },
      { token: 'string', foreground: '839496' },
      { token: 'variable', foreground: 'd33682' }, // 코드 블록 (매젠타)
      { token: 'variable.source', foreground: 'd33682' },
      { token: 'type', foreground: 'b58900', fontStyle: 'bold' }, // 리스트 (옐로우)
      { token: 'type.markdown', foreground: 'b58900', fontStyle: 'bold' },
      { token: 'tag', foreground: '2aa198' }, // HTML 태그
      { token: 'tag.markdown', foreground: '2aa198' },
    ],
    colors: {
      'editor.background': '#002B36',
      'editor.foreground': '#839496',
      'editor.lineHighlightBackground': '#073642',
      'editorLineNumber.foreground': '#586E75',
      'editorLineNumber.activeForeground': '#839496',
      'editor.selectionBackground': '#073642',
      'editorCursor.foreground': '#D30102',
      'editorBracketMatch.background': '#073642',
      'editorBracketMatch.border': '#839496',
    }
  }
];

export const THEME_MAP = Object.fromEntries(
  EDITOR_THEMES.map(t => [t.id, t])
) as Record<string, ThemeDefinition>;
