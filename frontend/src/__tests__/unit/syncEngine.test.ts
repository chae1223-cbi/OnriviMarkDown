import { describe, it, expect, vi } from 'vitest';
import { parseDynamicFrontmatter, syncPreviewFromEditorScroll, syncPreviewToTargetLine } from '../../lib/syncEngine';

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

  describe('syncPreviewToTargetLine', () => {
    it('문단 내 인라인 자식(strong 등)이 존재하더라도 전체 문단 하단을 기준으로 Safe Zone(하단 60px) 클램핑 스크롤', () => {
      // 문단 p(data-line="27") 내부의 자식 strong(data-line="27")이 상단에만 걸쳐있고, 문단 하단은 620px에 위치하는 상황
      const mockP = {
        tagName: 'P',
        getAttribute: (attr: string) => (attr === 'data-line' ? '27' : null),
        closest: (sel: string) => mockP,
        getBoundingClientRect: () => ({
          top: 480,
          bottom: 620, // containerHeight(600)을 초과하여 잘려있는 상태
          height: 140,
        }),
      };

      const mockStrong = {
        tagName: 'STRONG',
        getAttribute: (attr: string) => (attr === 'data-line' ? '27' : null),
        closest: (sel: string) => mockP, // 상위 블록은 mockP
        getBoundingClientRect: () => ({
          top: 480,
          bottom: 504, // 자식 strong은 상단 한 줄만 차지 (과거 버그 원인: 504 < 540이라 스크롤 생략됨)
          height: 24,
        }),
      };

      const mockContainer = {
        clientHeight: 600,
        scrollHeight: 2000,
        scrollTop: 100,
        getBoundingClientRect: () => ({
          top: 0,
          bottom: 600,
          height: 600,
        }),
        querySelectorAll: (sel: string) => [mockP, mockStrong],
      } as unknown as HTMLElement;

      // targetLine = 27 (타이핑 중인 줄)
      syncPreviewToTargetLine(mockContainer, 27, '');

      // BOTTOM_SAFE = 600 - 140 = 460
      // elementBottom = 620 (mockP의 bottom 기준)
      // delta = 620 - 460 = 160
      // targetScrollTop = 100 + 160 = 260
      expect(mockContainer.scrollTop).toBe(260);
    });

    it('타깃 요소가 이미 Safe Zone 안에 완전히 위치할 경우 불필요한 스크롤 스킵 (Jitter 방어)', () => {
      const mockP = {
        tagName: 'P',
        getAttribute: (attr: string) => (attr === 'data-line' ? '10' : null),
        closest: (sel: string) => mockP,
        getBoundingClientRect: () => ({
          top: 150,
          bottom: 250, // Safe Zone(40 ~ 460) 안에 완전히 들어와 있음
          height: 100,
        }),
      };

      const mockContainer = {
        clientHeight: 600,
        scrollHeight: 2000,
        scrollTop: 200,
        getBoundingClientRect: () => ({
          top: 0,
          bottom: 600,
          height: 600,
        }),
        querySelectorAll: (sel: string) => [mockP],
      } as unknown as HTMLElement;

      syncPreviewToTargetLine(mockContainer, 10, '');
      expect(mockContainer.scrollTop).toBe(200); // 변화 없이 200 유지
    });

    it('타깃 요소(라인 > 5)가 상단 밖으로 벗어났을 때 TOP_SAFE(40px)로 정상 상향 스크롤 복귀', () => {
      const mockH3 = {
        tagName: 'H3',
        getAttribute: (attr: string) => (attr === 'data-line' ? '55' : null),
        closest: (sel: string) => mockH3,
        getBoundingClientRect: () => ({
          top: -100, // 뷰포트 상단 밖으로 100px 벗어난 상태
          bottom: -60,
          height: 40,
        }),
      };

      const mockContainer = {
        clientHeight: 600,
        scrollHeight: 2000,
        scrollTop: 300,
        getBoundingClientRect: () => ({
          top: 0,
          bottom: 600,
          height: 600,
        }),
        querySelectorAll: (sel: string) => [mockH3],
      } as unknown as HTMLElement;

      // targetLine = 55 (과거 targetLine <= 5 제한으로 상향 스크롤이 차단되던 라인)
      syncPreviewToTargetLine(mockContainer, 55, '');

      // TOP_SAFE = 40
      // elementTop = -100
      // delta = -100 - 40 = -140
      // targetScrollTop = 300 - 140 = 160
      expect(mockContainer.scrollTop).toBe(160);
    });

    it('표의 마지막 행(tr) 타깃팅 시 Safe Zone 하단(BOTTOM_SAFE)으로 완벽 클램핑 스크롤', () => {
      const mockTr = {
        tagName: 'TR',
        getAttribute: (attr: string) => (attr === 'data-line' ? '63' : null),
        closest: (sel: string) => mockTr,
        getBoundingClientRect: () => ({
          top: 500,
          bottom: 530, // 뷰포트 Safe Zone 하단(460)을 초과한 상태
          height: 30,
        }),
      };

      const mockContainer = {
        clientHeight: 600,
        scrollHeight: 2000,
        scrollTop: 100,
        getBoundingClientRect: () => ({
          top: 0,
          bottom: 600,
          height: 600,
        }),
        querySelectorAll: (sel: string) => [mockTr],
      } as unknown as HTMLElement;

      // targetLine = 63 (표의 마지막 행)
      syncPreviewToTargetLine(mockContainer, 63, '');

      // BOTTOM_SAFE = 600 - 140 = 460
      // elementBottom = 530
      // delta = 530 - 460 = 70
      // targetScrollTop = 100 + 70 = 170
      expect(mockContainer.scrollTop).toBe(170);
    });

    it('문서 마지막 앵커 이후 빈 줄(엔터) 입력 시 extraLines * 26px 증분으로 Safe Zone 초과 시 부드럽게 하향 동기화', () => {
      const mockP99 = {
        tagName: 'P',
        getAttribute: (attr: string) => (attr === 'data-line' ? '99' : null),
        closest: (sel: string) => mockP99,
        getBoundingClientRect: () => ({
          top: 400,
          bottom: 440,
          height: 40,
        }),
      };

      const mockContainer = {
        clientHeight: 600,
        scrollHeight: 2000,
        scrollTop: 100,
        getBoundingClientRect: () => ({ top: 0, bottom: 600, height: 600 }),
        querySelectorAll: (sel: string) => [mockP99],
      } as unknown as HTMLElement;

      // targetLine = 100 (extraLines = 1, maxBottom = 440 + 26 = 466)
      // BOTTOM_SAFE = 460 => delta = 466 - 460 = 6 => scrollTop = 100 + 6 = 106
      syncPreviewToTargetLine(mockContainer, 100, '');
      expect(mockContainer.scrollTop).toBe(106);
    });

    it('마지막 앵커 라인 요소가 이미 Safe Zone 내부에 있을 때는 스크롤이 불필요하게 튀지 않고 안정 유지', () => {
      const mockP99 = {
        tagName: 'P',
        getAttribute: (attr: string) => (attr === 'data-line' ? '99' : null),
        closest: (sel: string) => mockP99,
        getBoundingClientRect: () => ({
          top: 200,
          bottom: 280,
          height: 80,
        }),
      };

      const mockContainer = {
        clientHeight: 600,
        scrollHeight: 2000,
        scrollTop: 800,
        getBoundingClientRect: () => ({ top: 0, bottom: 600, height: 600 }),
        querySelectorAll: (sel: string) => [mockP99],
      } as unknown as HTMLElement;

      // targetLine = 99 (already in safe zone: 200 >= 40, 280 <= 460)
      syncPreviewToTargetLine(mockContainer, 99, '');
      expect(mockContainer.scrollTop).toBe(800);
    });

    it('마지막 행/문단에서 타이핑 시 문단 시작 부분이 아닌 커서가 위치한 문단 끝(elementBottom)을 BOTTOM_SAFE로 확실하게 밀착', () => {
      // 마지막 문단 P105(data-line="105")가 120px 높이이고 bottom이 580px에 위치하는 상황 (뷰포트 530px, BOTTOM_SAFE 390px)
      const mockP105 = {
        tagName: 'P',
        getAttribute: (attr: string) => (attr === 'data-line' ? '105' : null),
        closest: (sel: string) => mockP105,
        getBoundingClientRect: () => ({
          top: 460,
          bottom: 580,
          height: 120,
        }),
      };

      const mockContainer = {
        clientHeight: 530,
        scrollHeight: 2500,
        scrollTop: 1500,
        getBoundingClientRect: () => ({ top: 0, bottom: 530, height: 530 }),
        querySelectorAll: (sel: string) => [mockP105],
      } as unknown as HTMLElement;

      // targetLine = 105 (마지막 앵커 라인에서 타이핑)
      syncPreviewToTargetLine(mockContainer, 105, '');

      // BOTTOM_SAFE = 530 - 140 = 390
      // elementBottom = 580
      // delta = 580 - 390 = 190
      // targetScrollTop = 1500 + 190 = 1690
      expect(mockContainer.scrollTop).toBe(1690);
    });

    it('긴 문단 내부 가로 줄바꿈(column > 50) 타이핑 시 options.column 높이 예측을 통한 즉시 Safe Zone 추종', () => {
      // 1줄로 아직 리플로우되지 않은 초기 상태 P105(height 24px, bottom 380px)
      const mockP105 = {
        tagName: 'P',
        getAttribute: (attr: string) => (attr === 'data-line' ? '105' : null),
        closest: (sel: string) => mockP105,
        getBoundingClientRect: () => ({
          top: 356,
          bottom: 380,
          height: 24,
        }),
      };

      const mockContainer = {
        clientHeight: 530,
        scrollHeight: 2500,
        scrollTop: 1500,
        getBoundingClientRect: () => ({ top: 0, bottom: 530, height: 530 }),
        querySelectorAll: (sel: string) => [mockP105],
      } as unknown as HTMLElement;

      // column = 131 (wrappedRows = Math.floor(130 / 45) = 2, expectedHeight = 3 * 24 = 72px)
      // minTop = 356, maxBottom = 356 + 72 = 428
      // BOTTOM_SAFE = 390
      // delta = 428 - 390 = 38
      // targetScrollTop = 1500 + 38 = 1538
      syncPreviewToTargetLine(mockContainer, 105, '', { column: 131 });
      expect(mockContainer.scrollTop).toBe(1538);
    });

    it('표(Table) 전후 라인 매핑 정밀 진단', async () => {
      const { preprocessMarkdownForPreview } = await import('../../lib/editorUtils');
      const { unified } = await import('unified');
      const remarkParse = (await import('remark-parse')).default;
      const remarkGfm = (await import('remark-gfm')).default;
      const remarkExtendedTable = (await import('remark-extended-table')).default;
      const { extendedTableHandlers } = await import('remark-extended-table');
      const remarkRehype = (await import('remark-rehype')).default;

      const md = [
        '문단 1',
        '',
        '### 표 제목',
        '| 항목 | 내용 | 비고 |',
        '| :--- | :--- | :--- |',
        '| 첫번째 | 내용 1 | 비고 1 |',
        '| 두번째 | 내용 2 | 비고 2 |',
        '| 세번째 | 내용 3 | 비고 3 |',
        '',
        '표 바로 뒤 문단입니다.',
        '',
        '## 다음 제목',
        '다음 문단입니다.',
      ].join('\n');

      const lines = md.split('\n');
      console.log('--- ORIGINAL LINES ---');
      lines.forEach((l, idx) => console.log(`Orig L${idx + 1}: ${l}`));

      const processed = preprocessMarkdownForPreview(md);
      console.log('--- PROCESSED LINES & LINEMAP ---');
      const pLines = processed.text.split('\n');
      pLines.forEach((l, idx) => console.log(`Proc P${idx + 1} (orig->${processed.lineMap[idx]}): ${l}`));

      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkExtendedTable)
        .use(remarkRehype, { handlers: extendedTableHandlers });

      const hast: any = processor.runSync(processor.parse(processed.text));

      console.log('--- HAST DATA-LINE MAPPING ---');
      function walk(node: any, depth = 0) {
        if (node.type === 'element') {
          const astLine = node.position?.start?.line;
          const mapped = astLine ? (processed.lineMap[astLine - 1] || astLine) : undefined;
          const text = (node.children?.map((c: any) => c.value || '').join('') || '').slice(0, 15);
          console.log(`${'  '.repeat(depth)}<${node.tagName}> astLine=${astLine} mappedLine=${mapped} text="${text}"`);
        }
        if (node.children) node.children.forEach((c: any) => walk(c, depth + 1));
      }
      walk(hast);
      expect(true).toBe(true);
    });
  });
});
