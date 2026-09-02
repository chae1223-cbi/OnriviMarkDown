import { describe, it, expect, vi } from 'vitest';
import { parseDynamicFrontmatter, syncPreviewFromEditorScroll } from '../../lib/syncEngine';

describe('syncEngine Scroll Dedicated Tests', () => {
  describe('parseDynamicFrontmatter', () => {
    it('프론트매터 4줄 정상 파싱', () => {
      const content = `---\ntitle: test\nauthor: me\n---\n# Content`;
      const res = parseDynamicFrontmatter(content);
      expect(res.hasFrontmatter).toBe(true);
      expect(res.endLine).toBe(4);
    });

    it('프론트매터 없는 일반 마크다운', () => {
      const content = `# Title\n\nBody text`;
      const res = parseDynamicFrontmatter(content);
      expect(res.hasFrontmatter).toBe(false);
      expect(res.endLine).toBe(0);
    });
  });

  describe('syncPreviewFromEditorScroll', () => {
    it('에디터 scrollTop <= 2 시 미리보기도 scrollTop = 0 밀착', () => {
      const mockContainer = {
        clientHeight: 800,
        scrollHeight: 2000,
        scrollTop: 150,
      } as HTMLElement;

      const mockEditor = {
        getScrollTop: () => 0,
        getScrollHeight: () => 2000,
        getLayoutInfo: () => ({ height: 800 }),
        getVisibleRanges: () => [{ startLineNumber: 1 }],
      };

      syncPreviewFromEditorScroll(mockContainer, mockEditor, '');
      expect(mockContainer.scrollTop).toBe(0);
    });

    it('에디터 최하단(바닥) 도달 시 미리보기도 maxScrollTop(1200)으로 100% 밀착', () => {
      const mockContainer = {
        clientHeight: 800,
        scrollHeight: 2000,
        scrollTop: 800,
      } as HTMLElement;

      const mockEditor = {
        getScrollTop: () => 1200, // maxScroll = 2000 - 800 = 1200
        getScrollHeight: () => 2000,
        getLayoutInfo: () => ({ height: 800 }),
        getVisibleRanges: () => [{ startLineNumber: 100 }],
      };

      syncPreviewFromEditorScroll(mockContainer, mockEditor, '');
      expect(mockContainer.scrollTop).toBe(1200); // previewMaxScroll = 2000 - 800 = 1200
    });
  });
});
