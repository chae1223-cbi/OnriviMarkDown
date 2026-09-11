import { describe, it, expect } from 'vitest';
import {
  cleanMarkdownDocument,
  formatPrettyMarkdownTable,
  getStringDisplayWidth,
  padStringToDisplayWidth,
} from '@/utils/markdownCleaner';

describe('markdownCleaner - Unit Tests', () => {
  describe('Display Width & String Padding', () => {
    it('calculates ASCII characters as width 1 and East Asian characters as width 2', () => {
      expect(getStringDisplayWidth('Hello')).toBe(5);
      expect(getStringDisplayWidth('안녕')).toBe(4);
      expect(getStringDisplayWidth('Hello, 안녕!')).toBe(12); // 7 + 4 + 1
    });

    it('pads string correctly according to display width and alignment', () => {
      expect(padStringToDisplayWidth('안녕', 6, 'left')).toBe('안녕  ');
      expect(padStringToDisplayWidth('안녕', 6, 'right')).toBe('  안녕');
      expect(padStringToDisplayWidth('안녕', 6, 'center')).toBe(' 안녕 ');
    });
  });

  describe('Pretty Table Alignment', () => {
    it('formats unaligned markdown table into vertically aligned columns', () => {
      const unaligned = [
        '| 이름 | 직업 | 비고 |',
        '| :--- | :---: | ---: |',
        '| 홍길동 | 의적 | 조선시대 |',
        '| Lee | Developer | Fullstack |',
      ];

      const { formatted, isModified } = formatPrettyMarkdownTable(unaligned);
      expect(isModified).toBe(true);

      const lines = formatted.split('\n');
      expect(lines.length).toBe(4);
      // All lines should have consistent vertical pipes
      expect(lines[0].startsWith('|')).toBe(true);
      expect(lines[0].endsWith('|')).toBe(true);
      expect(lines[1].includes(':---')).toBe(true);
    });
  });

  describe('Safety & Code Masking', () => {
    it('completely preserves code blocks, inline code, and math expressions', () => {
      const content = [
        '#제목',
        '```javascript',
        'const a = 1; // #이것은제목이아님',
        '<b>태그그대로유지</b>',
        '| 코드내표 | 코드내표 |',
        '```',
        '인라인코드 `<div>#유지</div>` 테스트',
        '$$',
        '\\frac{a}{b} = c',
        '$$',
      ].join('\n');

      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText).toContain('# 제목'); // Outside code block fixed
      expect(res.cleanedText).toContain('const a = 1; // #이것은제목이아님'); // Inside preserved
      expect(res.cleanedText).toContain('<b>태그그대로유지</b>'); // Inside preserved
      expect(res.cleanedText).toContain('| 코드내표 | 코드내표 |'); // Inside preserved
      expect(res.cleanedText).toContain('`<div>#유지</div>`'); // Inline code preserved
      expect(res.cleanedText).toContain('\\frac{a}{b} = c'); // Math block preserved
    });

    it('preserves YAML frontmatter intact', () => {
      const content = [
        '---',
        'title: My Document',
        'date: 2026-09-11',
        '---',
        '#본문제목',
      ].join('\n');

      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText.startsWith('---\ntitle: My Document\ndate: 2026-09-11\n---')).toBe(true);
      expect(res.cleanedText).toContain('# 본문제목');
    });
  });

  describe('Markdown Syntax Fixes', () => {
    it('fixes missing space after headings (#)', () => {
      const content = '#제목 1\n##소제목 2\n###세부제목 3';
      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText).toBe('# 제목 1\n## 소제목 2\n### 세부제목 3');
      expect(res.stats.headingsFixed).toBe(3);
    });

    it('fixes missing space after blockquotes (>)', () => {
      const content = '>인용구 내용입니다.\n>>중첩 인용구입니다.';
      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText).toBe('> 인용구 내용입니다.\n>> 중첩 인용구입니다.');
      expect(res.stats.quotesFixed).toBe(2);
    });

    it('collapses <br> blank line <br> into <br><br>', () => {
      const content = '| 항목 | 설명 <br>\n\n<br> 다음줄 |';
      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText).toContain('<br><br>');
      expect(res.cleanedText).not.toContain('<br>\n\n<br>');
      expect(res.stats.brCollapsed).toBeGreaterThanOrEqual(1);
    });

    it('converts inline HTML formatting tags to markdown equivalents', () => {
      const content = '이것은 <b>굵은 글씨</b>와 <strong>강조</strong>, 그리고 <i>기울임</i>, <del>취소선</del>입니다.';
      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText).toBe('이것은 **굵은 글씨**와 **강조**, 그리고 *기울임*, ~~취소선~~입니다.');
      expect(res.stats.htmlConverted).toBe(4);
    });

    it('collapses excessive empty lines (3+ to 2)', () => {
      const content = '문단 1\n\n\n\n\n문단 2';
      const res = cleanMarkdownDocument(content);
      expect(res.cleanedText).toBe('문단 1\n\n문단 2');
      expect(res.stats.linesReduced).toBeGreaterThan(0);
    });
  });
});
