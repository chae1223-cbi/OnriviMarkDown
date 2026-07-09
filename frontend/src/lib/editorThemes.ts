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
      { token: '', foreground: '24292E' },
      { token: 'keyword', fontStyle: '', foreground: '6A1B9A' },
      { token: 'keyword.markdown', fontStyle: '', foreground: '6A1B9A' },
      { token: 'comment', fontStyle: '', foreground: '2E7D32' },
      { token: 'comment.markdown', fontStyle: '', foreground: '2E7D32' },
      { token: 'strong', fontStyle: '', foreground: 'D32F2F' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'D32F2F' },
      { token: 'emphasis', fontStyle: '', foreground: '1565C0' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: '1565C0' },
      { token: 'string.link', fontStyle: '', foreground: '00695C' },
      { token: 'string.link.markdown', fontStyle: '', foreground: '00695C' },
      { token: 'string', fontStyle: '', foreground: 'E65100' },
      { token: 'variable', fontStyle: '', foreground: '558B2F' },
    ],
    colors: {
      'editor.background': '#FAFAFA',
      'editor.foreground': '#24292E',
      'editor.lineHighlightBackground': '#ffa7260c',
      'editorLineNumber.foreground': '#B0B0B0',
      'editorLineNumber.activeForeground': '#0055AA'
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
      { token: 'strong', fontStyle: '', foreground: 'DC322F' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'DC322F' },
      { token: 'emphasis', fontStyle: '', foreground: '268BD2' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: '268BD2' },
      { token: 'string.link', fontStyle: '', foreground: '2AA198' },
      { token: 'string.link.markdown', fontStyle: '', foreground: '2AA198' },
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
      { token: '', foreground: 'ADBAC7' },
      { token: 'keyword', fontStyle: '', foreground: 'F69D50' },
      { token: 'keyword.markdown', fontStyle: '', foreground: 'F69D50' },
      { token: 'comment', fontStyle: '', foreground: '768390' },
      { token: 'comment.markdown', fontStyle: '', foreground: '768390' },
      { token: 'strong', fontStyle: '', foreground: 'F47067' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'F47067' },
      { token: 'emphasis', fontStyle: '', foreground: '6CB6FF' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: '6CB6FF' },
      { token: 'string.link', fontStyle: '', foreground: '96D0FF' },
      { token: 'string.link.markdown', fontStyle: '', foreground: '96D0FF' },
      { token: 'string', fontStyle: '', foreground: '96D0FF' },
      { token: 'variable', fontStyle: '', foreground: 'DCBDFB' },
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
      { token: 'keyword', fontStyle: '', foreground: 'B58900' },
      { token: 'keyword.markdown', fontStyle: '', foreground: 'B58900' },
      { token: 'comment', fontStyle: '', foreground: '586E75' },
      { token: 'comment.markdown', fontStyle: '', foreground: '586E75' },
      { token: 'strong', fontStyle: '', foreground: 'DC322F' },
      { token: 'strong.markdown', fontStyle: '', foreground: 'DC322F' },
      { token: 'emphasis', fontStyle: '', foreground: '268BD2' },
      { token: 'emphasis.markdown', fontStyle: '', foreground: '268BD2' },
      { token: 'string.link', fontStyle: '', foreground: '2AA198' },
      { token: 'string.link.markdown', fontStyle: '', foreground: '2AA198' },
      { token: 'string', fontStyle: '', foreground: '6C71C4' },
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
