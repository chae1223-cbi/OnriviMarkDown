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
      { token: 'keyword.md', fontStyle: 'bold', foreground: '0055CC' },
      { token: 'strong.md', fontStyle: 'bold', foreground: '18181B' },
      { token: 'emphasis.md', fontStyle: 'italic', foreground: '18181B' },
      { token: 'string.link.md', fontStyle: 'bold', foreground: '0066CC' },
    ],
    colors: {
      'editor.background': '#F7F9FF',
      'editor.lineHighlightBackground': 'rgba(59,130,246,0.08)',
    }
  },
  {
    id: 'onrivi-dark',
    name: 'Onrivi Dark',
    icon: '🌙',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: 'keyword.md', fontStyle: 'bold', foreground: '569CD6' },
      { token: 'strong.md', fontStyle: 'bold', foreground: 'E4E4E7' },
      { token: 'emphasis.md', fontStyle: 'italic', foreground: 'E4E4E7' },
      { token: 'string.link.md', fontStyle: 'bold', foreground: '4FC1FF' },
    ],
    colors: {
      'editor.background': '#131313',
      'editor.lineHighlightBackground': 'rgba(96,165,250,0.12)',
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    icon: '🧛',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: 'keyword.md', fontStyle: 'bold', foreground: 'FF79C6' },
      { token: 'strong.md', fontStyle: 'bold', foreground: 'F8F8F2' },
      { token: 'emphasis.md', fontStyle: 'italic', foreground: 'F8F8F2' },
      { token: 'string.link.md', fontStyle: 'bold', foreground: '50FA7B' },
    ],
    colors: {
      'editor.background': '#282A36',
      'editor.foreground': '#F8F8F2',
      'editor.lineHighlightBackground': '#44475A',
      'editor.selectionBackground': '#44475A',
      'editorCursor.foreground': '#F8F8F2',
      'editorLineNumber.foreground': '#6272A4',
      'editorLineNumber.activeForeground': '#F8F8F2',
      'editorBracketMatch.background': '#424450',
      'editorBracketMatch.border': '#F8F8F2',
    }
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    icon: '🌃',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: 'keyword.md', fontStyle: 'bold', foreground: 'C678DD' },
      { token: 'strong.md', fontStyle: 'bold', foreground: 'ABB2BF' },
      { token: 'emphasis.md', fontStyle: 'italic', foreground: 'ABB2BF' },
      { token: 'string.link.md', fontStyle: 'bold', foreground: '98C379' },
    ],
    colors: {
      'editor.background': '#282C34',
      'editor.foreground': '#ABB2BF',
      'editor.lineHighlightBackground': '#2C313A',
      'editor.selectionBackground': '#3E4451',
      'editorCursor.foreground': '#528BFF',
      'editorLineNumber.foreground': '#495162',
      'editorLineNumber.activeForeground': '#ABB2BF',
      'editorBracketMatch.background': '#3E4451',
      'editorBracketMatch.border': '#ABB2BF',
    }
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    icon: '🌅',
    isDark: false,
    base: 'vs',
    rules: [
      { token: 'keyword.md', fontStyle: 'bold', foreground: '859900' },
      { token: 'strong.md', fontStyle: 'bold', foreground: '073642' },
      { token: 'emphasis.md', fontStyle: 'italic', foreground: '073642' },
      { token: 'string.link.md', fontStyle: 'bold', foreground: '268BD2' },
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
      { token: 'keyword.md', fontStyle: 'bold', foreground: 'D73A49' },
      { token: 'strong.md', fontStyle: 'bold', foreground: '24292E' },
      { token: 'emphasis.md', fontStyle: 'italic', foreground: '24292E' },
      { token: 'string.link.md', fontStyle: 'bold', foreground: '032F62' },
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
  }
];

export const THEME_MAP = Object.fromEntries(
  EDITOR_THEMES.map(t => [t.id, t])
) as Record<string, ThemeDefinition>;
