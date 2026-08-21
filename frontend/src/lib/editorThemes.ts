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
      { token: 'keyword', fontStyle: 'bold', foreground: '0f172a' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '0f172a' },
      { token: 'comment', fontStyle: '', foreground: '64748b' },
      { token: 'comment.markdown', fontStyle: '', foreground: '64748b' },
      { token: 'strong', fontStyle: 'bold', foreground: '0f172a' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: '0f172a' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '2563eb' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '2563eb' },
      { token: 'string.link', fontStyle: '', foreground: '2563eb' },
      { token: 'string.link.markdown', fontStyle: '', foreground: '2563eb' },
      { token: 'string', fontStyle: '', foreground: '2563eb' },
      { token: 'variable', fontStyle: '', foreground: '64748b' },
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
      { token: 'keyword', fontStyle: '', foreground: 'CB4B16' },
      { token: 'keyword.markdown', fontStyle: '', foreground: 'CB4B16' },
      { token: 'comment', fontStyle: '', foreground: '859900' },
      { token: 'comment.markdown', fontStyle: '', foreground: '859900' },
      { token: 'strong', fontStyle: '', foreground: 'ffffff' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'emphasis', fontStyle: '', foreground: 'ffffff' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'string.link', fontStyle: '', foreground: 'ffffff' },
      { token: 'string.link.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'string', fontStyle: '', foreground: 'D33682' },
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
      { token: 'keyword', fontStyle: '', foreground: '6F42C1' },
      { token: 'keyword.markdown', fontStyle: '', foreground: '6F42C1' },
      { token: 'comment', fontStyle: '', foreground: '22863A' },
      { token: 'comment.markdown', fontStyle: '', foreground: '22863A' },
      { token: 'strong', fontStyle: '', foreground: 'D73A49' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'D73A49' },
      { token: 'emphasis', fontStyle: '', foreground: '005CC5' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: '005CC5' },
      { token: 'string.link', fontStyle: '', foreground: '032F62' },
      { token: 'string.link.markdown', fontStyle: '', foreground: '032F62' },
      { token: 'string', fontStyle: '', foreground: 'CB4B16' },
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
      { token: '', foreground: 'ffffff' },
      { token: 'keyword', fontStyle: '', foreground: 'ffffff' },
      { token: 'keyword.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'comment', fontStyle: '', foreground: 'ffffff' },
      { token: 'comment.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'strong', fontStyle: '', foreground: 'ffffff' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'emphasis', fontStyle: '', foreground: 'ffffff' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'string.link', fontStyle: '', foreground: 'ffffff' },
      { token: 'string.link.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'string', fontStyle: '', foreground: 'ffffff' },
      { token: 'variable', fontStyle: '', foreground: 'ffffff' },
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
      { token: '', foreground: 'ffffff' },
      { token: 'keyword', fontStyle: '', foreground: 'ffffff' },
      { token: 'keyword.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'comment', fontStyle: '', foreground: 'ffffff' },
      { token: 'comment.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'strong', fontStyle: '', foreground: 'ffffff' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'emphasis', fontStyle: '', foreground: 'ffffff' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'string.link', fontStyle: '', foreground: 'ffffff' },
      { token: 'string.link.markdown', fontStyle: '', foreground: 'ffffff' },
      { token: 'string', fontStyle: '', foreground: 'ffffff' },
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
