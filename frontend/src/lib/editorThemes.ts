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
      { token: 'keyword', fontStyle: 'bold', foreground: 'A3A3A3' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: 'A3A3A3' },
      { token: 'strong', fontStyle: 'bold', foreground: '0055AA' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: '0055AA' },
      { token: 'emphasis', fontStyle: 'italic', foreground: 'D73A49' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: 'D73A49' },
      { token: 'string.link', fontStyle: 'bold', foreground: '0055AA' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '0055AA' },
      { token: 'heading', fontStyle: 'bold', foreground: '003366' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: '003366' },
      { token: 'quote', foreground: 'D73A49' },
      { token: 'quote.markdown', foreground: 'D73A49' },
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
    id: 'onrivi-dark',
    name: 'Onrivi Dark',
    icon: '🌙',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: '', foreground: 'D4D4D4' },
      { token: 'keyword', fontStyle: 'bold', foreground: '6A737D' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '6A737D' },
      { token: 'strong', fontStyle: 'bold', foreground: 'A6E22E' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'A6E22E' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '66D9EF' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '66D9EF' },
      { token: 'string.link', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'heading', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'quote', foreground: 'E6DB74' },
      { token: 'quote.markdown', foreground: 'E6DB74' },
      { token: 'punctuation.definition.bold.markdown', foreground: '6A737D' },
      { token: 'punctuation.definition.italic.markdown', foreground: '6A737D' }
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#ff980018',
      'editorLineNumber.foreground': '#5A5A5A',
      'editorLineNumber.activeForeground': '#A6E22E'
    }
  },
  {
    id: 'onrivi-midnight-neon',
    name: 'Midnight Neon',
    icon: '⚡',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: '', foreground: 'E2E8F0' },
      { token: 'keyword', fontStyle: 'bold', foreground: '4B5263' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '4B5263' },
      { token: 'strong', fontStyle: 'bold', foreground: 'FF3366' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'FF3366' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '00E5FF' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '00E5FF' },
      { token: 'string.link', fontStyle: 'bold', foreground: '00E5FF' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '00E5FF' },
      { token: 'heading', fontStyle: 'bold', foreground: '00E5FF' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: '00E5FF' },
      { token: 'quote', foreground: 'FFB300' },
      { token: 'quote.markdown', foreground: 'FFB300' },
      { token: 'punctuation.definition.bold.markdown', foreground: '4B5263' },
      { token: 'punctuation.definition.italic.markdown', foreground: '4B5263' }
    ],
    colors: {
      'editor.background': '#0F141C',
      'editor.foreground': '#E2E8F0',
      'editor.lineHighlightBackground': '#ffffff08',
      'editorLineNumber.foreground': '#4B5263',
      'editorLineNumber.activeForeground': '#FF3366'
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    icon: '🧛',
    isDark: true,
    base: 'vs-dark',
    rules: [
      { token: 'keyword', fontStyle: 'bold', foreground: '9CA3AF' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '9CA3AF' },
      { token: 'strong', fontStyle: 'bold', foreground: 'A6E22E' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'A6E22E' },
      { token: 'emphasis', fontStyle: 'italic', foreground: 'A6E22E' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: 'A6E22E' },
      { token: 'string.link', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'heading', fontStyle: 'bold', foreground: '34D399' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: '34D399' },
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
      { token: 'keyword', fontStyle: 'bold', foreground: '9CA3AF' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '9CA3AF' },
      { token: 'strong', fontStyle: 'bold', foreground: 'A6E22E' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: 'A6E22E' },
      { token: 'emphasis', fontStyle: 'italic', foreground: 'A6E22E' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: 'A6E22E' },
      { token: 'string.link', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '66D9EF' },
      { token: 'heading', fontStyle: 'bold', foreground: '34D399' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: '34D399' },
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
      { token: 'keyword', fontStyle: 'bold', foreground: '859900' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: '859900' },
      { token: 'strong', fontStyle: 'bold', foreground: '268BD2' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: '268BD2' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '073642' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '073642' },
      { token: 'string.link', fontStyle: 'bold', foreground: '268BD2' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '268BD2' },
      { token: 'heading', fontStyle: 'bold', foreground: '859900' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: '859900' },
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
      { token: 'keyword', fontStyle: 'bold', foreground: 'D73A49' },
      { token: 'keyword.markdown', fontStyle: 'bold', foreground: 'D73A49' },
      { token: 'strong', fontStyle: 'bold', foreground: '1D4ED8' },
      { token: 'strong.markdown', fontStyle: 'bold', foreground: '1D4ED8' },
      { token: 'emphasis', fontStyle: 'italic', foreground: '24292E' },
      { token: 'emphasis.markdown', fontStyle: 'italic', foreground: '24292E' },
      { token: 'string.link', fontStyle: 'bold', foreground: '032F62' },
      { token: 'string.link.markdown', fontStyle: 'bold', foreground: '032F62' },
      { token: 'heading', fontStyle: 'bold', foreground: 'D73A49' },
      { token: 'heading.markdown', fontStyle: 'bold', foreground: 'D73A49' },
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
