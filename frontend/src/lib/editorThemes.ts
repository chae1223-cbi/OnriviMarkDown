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
