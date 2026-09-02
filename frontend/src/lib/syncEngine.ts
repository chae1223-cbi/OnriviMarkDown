// @ts-nocheck
// ====================================================================
// 📊 [OMD-CORE-syncEngine-0001] syncEngine ➔ syncPreviewFromEditorScroll
// 🎯 @KICK  : 에디터 스크롤 이벤트 전담 1:1 미리보기 동기화 및 최상단/최하단 완벽 밀착
// 🛡️ @GUARD : 상위 1,000자 동적 Frontmatter 감지, 에디터 바닥 도달 시 미리보기 maxScrollTop 밀착,
//             SCROLL_EPSILON(1px) 미세 떨림 방어, 0~maxScroll 클램핑
// 🚨 @PATCH : 2026-09-02 - 마우스 휠 위/아래 스크롤 시 커서 위치 간섭 없이 에디터 스크롤 탑과 100% 실시간 연동되도록 휠 전담 구간 선형 보간 독립 분리
//             2026-09-02 - 마우스 휠 및 방향키 이동 시 인용문, 표, 코드블록, 이미지 등 대형 요소의 비선형 높이 격차를 해결하는 구간 선형 보간(Piecewise Linear Interpolation) 엔진 탑재
//             2026-09-02 - 에디터 내 대형 미디어 등으로 인해 활성 타이핑/커서 줄이 미리보기 하단 밖으로 가려질 때 Safe Zone으로 자동 보정 연동 및 타이핑 즉시 추종 완벽 밀착
// 🔗 @CALLS : previewContainer.querySelectorAll('[data-line]'), scrollTo
// ====================================================================

export interface SyncOptions {
  /** true: smooth 부드러운 스크롤, false: auto 즉각 (에디터 스크롤 연동) */
  smooth?: boolean;
}

export interface FrontmatterInfo {
  hasFrontmatter: boolean;
  endLine: number;
}

const SCROLL_EPSILON = 1;

/**
 * 상위 1,000자 이내에서 닫는 '---' 물리 줄 번호를 초고속 파싱
 */
export function parseDynamicFrontmatter(content: string): FrontmatterInfo {
  if (!content || !content.startsWith('---')) {
    return { hasFrontmatter: false, endLine: 0 };
  }

  const headSnippet = content.slice(0, 1000);
  const match = headSnippet.match(/^---\r?\n([\s\S]*?\r?\n)---(\r?\n|$)/);

  if (match) {
    const matchedBlock = match[0];
    const lines = matchedBlock.split('\n');
    const endLine = lines[lines.length - 1].trim() === '' ? lines.length - 1 : lines.length;
    return { hasFrontmatter: true, endLine };
  }

  return { hasFrontmatter: true, endLine: 1 };
}

/**
 * 에디터 스크롤(onDidScrollChange) 전담 1:1 미리보기 동기화 함수
 * [구간 선형 보간 (Piecewise Linear Interpolation) 탑재]
 * 인용문, 표, 코드블록, 이미지 등 에디터 라인 수 대비 미리보기 높이가 거대한 요소들의 비선형 왜곡을 실시간 비례 보간으로 완벽 보정
 */
export function syncPreviewFromEditorScroll(
  previewContainer: HTMLElement | null,
  editor: any,
  content: string = ''
): void {
  if (!previewContainer || !editor || previewContainer.clientHeight === 0) return;

  const editorScrollTop = editor.getScrollTop?.() ?? 0;
  const editorScrollHeight = editor.getScrollHeight?.() ?? 0;
  const editorLayout = editor.getLayoutInfo?.();
  const editorHeight = editorLayout ? editorLayout.height : 0;
  const editorMaxScroll = Math.max(0, editorScrollHeight - editorHeight);

  const previewMaxScroll = Math.max(0, previewContainer.scrollHeight - previewContainer.clientHeight);

  // 1. 에디터 최상단(0점) 도달 시 미리보기도 최상단 영점 밀착
  if (editorScrollTop <= 2) {
    if (previewContainer.scrollTop !== 0) {
      previewContainer.scrollTop = 0;
    }
    return;
  }

  // 2. 에디터 최하단(바닥) 도달 시 미리보기도 끝까지 100% 밀착
  if (editorMaxScroll > 0 && editorScrollTop >= editorMaxScroll - 4) {
    if (previewContainer.scrollTop !== previewMaxScroll) {
      previewContainer.scrollTop = previewMaxScroll;
    }
    return;
  }

  const fmInfo = parseDynamicFrontmatter(content);
  const visibleRanges = editor.getVisibleRanges?.();
  if (!visibleRanges || visibleRanges.length === 0) return;

  const topVisibleLine = visibleRanges[0].startLineNumber;

  // 3. 에디터 최상단 가시 영역이 프론트매터 내부일 경우 미리보기 상단(0px) 유지
  if (fmInfo.hasFrontmatter && topVisibleLine <= fmInfo.endLine) {
    if (previewContainer.scrollTop !== 0) {
      previewContainer.scrollTop = 0;
    }
    return;
  }

  const elements = Array.from(previewContainer.querySelectorAll('[data-line]')) as HTMLElement[];
  if (elements.length === 0) {
    // 앵커가 없으면 스크롤 비율로 폴백
    const ratio = editorMaxScroll > 0 ? editorScrollTop / editorMaxScroll : 0;
    previewContainer.scrollTop = Math.round(ratio * previewMaxScroll);
    return;
  }

  // 4. [구간 선형 보간] 현재 에디터 스크롤 탑에 해당하는 앵커 elA와 다음 앵커 elB 탐색
  let elA: HTMLElement | null = null;
  let elB: HTMLElement | null = null;
  let lineA = 1;
  let lineB = 1;

  for (let i = elements.length - 1; i >= 0; i--) {
    const l = parseInt(elements[i].getAttribute('data-line') || '1', 10);
    if (l <= topVisibleLine) {
      elA = elements[i];
      lineA = l;
      // 다음 앵커 찾기
      for (let j = i + 1; j < elements.length; j++) {
        const nextL = parseInt(elements[j].getAttribute('data-line') || '1', 10);
        if (nextL > lineA) {
          elB = elements[j];
          lineB = nextL;
          break;
        }
      }
      break;
    }
  }

  if (!elA) {
    elA = elements[0];
    lineA = parseInt(elA.getAttribute('data-line') || '1', 10);
  }

  const containerRect = previewContainer.getBoundingClientRect();
  const previewScrollTop = previewContainer.scrollTop;
  const previewTopA = elA.getBoundingClientRect().top - containerRect.top + previewScrollTop;

  let desiredScrollTop = previewTopA - 20;

  // 인용문/표/코드블록/이미지 등 대형 블록의 내부 진행률 비례 보간
  if (typeof editor.getTopForLineNumber === 'function') {
    const topA = lineA === 1 ? 0 : editor.getTopForLineNumber(lineA);
    const topB = elB ? editor.getTopForLineNumber(lineB) : (topA + 24 * (lineB - lineA + 1));
    const editorRange = topB - topA;

    if (editorRange > 0 && elB) {
      const previewTopB = elB.getBoundingClientRect().top - containerRect.top + previewScrollTop;
      const previewRange = previewTopB - previewTopA;
      if (previewRange > 0) {
        const progress = Math.max(0, Math.min(1, (editorScrollTop - topA) / editorRange));
        desiredScrollTop = previewTopA + progress * previewRange - 20;
      }
    }
  }

  desiredScrollTop = Math.min(Math.max(0, desiredScrollTop), previewMaxScroll);

  if (Math.abs(previewContainer.scrollTop - desiredScrollTop) >= SCROLL_EPSILON) {
    previewContainer.scrollTop = desiredScrollTop;
  }
}

/**
 * 방향키(↑, ↓) 및 명시적 라인 이동 시 미리보기를 가시 뷰포트(Safe Zone) 내부로 부드럽게 추종
 * 인용문, 표, 코드블록, 이미지 등 대형 블록의 높이에 맞추어 지능형 뷰포트 정렬 수행
 */
export function syncPreviewToTargetLine(
  previewContainer: HTMLElement | null,
  targetLine: number,
  content: string = ''
): void {
  if (!previewContainer || previewContainer.clientHeight === 0) return;

  const fmInfo = parseDynamicFrontmatter(content);

  // 1. 프론트매터 내부일 경우 최상단(0px) 유지
  if (fmInfo.hasFrontmatter && targetLine <= fmInfo.endLine) {
    if (previewContainer.scrollTop !== 0) {
      previewContainer.scrollTop = 0;
    }
    return;
  }

  const elements = Array.from(previewContainer.querySelectorAll('[data-line]')) as HTMLElement[];
  if (elements.length === 0) return;

  // 2. 타깃 라인 이하 중 가장 가까운 앵커 탐색
  let targetEl: HTMLElement | null = null;
  for (let i = elements.length - 1; i >= 0; i--) {
    const line = parseInt(elements[i].getAttribute('data-line') || '1', 10);
    if (line <= targetLine) {
      targetEl = elements[i];
      break;
    }
  }

  if (!targetEl) targetEl = elements[0];

  const containerRect = previewContainer.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const elementTop = targetRect.top - containerRect.top;
  const elementBottom = targetRect.bottom - containerRect.top;
  const elementHeight = targetRect.height;
  const containerHeight = previewContainer.clientHeight;

  const TOP_SAFE = 40;
  const BOTTOM_SAFE = containerHeight - 60;

  let delta = 0;

  // 대형 블록(표, 코드블록, 이미지, 긴 인용문)이 화면보다 큰 경우 상단 정렬 우선
  if (elementHeight > containerHeight - 100) {
    if (elementTop < TOP_SAFE || elementTop > TOP_SAFE + 100) {
      delta = elementTop - TOP_SAFE;
    }
  } else {
    // 일반 블록은 Safe Zone 범위 안으로 클램핑
    if (elementBottom > BOTTOM_SAFE) {
      delta = elementBottom - BOTTOM_SAFE;
    } else if (elementTop < TOP_SAFE) {
      delta = elementTop - TOP_SAFE;
    } else {
      return; // 이미 가시 영역 안에 있으므로 스크롤 스킵
    }
  }

  const previewMaxScroll = Math.max(0, previewContainer.scrollHeight - previewContainer.clientHeight);
  const targetScrollTop = Math.min(Math.max(0, previewContainer.scrollTop + delta), previewMaxScroll);

  if (Math.abs(previewContainer.scrollTop - targetScrollTop) >= SCROLL_EPSILON) {
    previewContainer.scrollTop = targetScrollTop;
  }
}

/**
 * 하위 호환용 헬퍼
 */
export function syncPreviewInterpolated(
  previewContainer: HTMLElement | null,
  targetLine: number,
  content: string = '',
  options: SyncOptions = {}
): void {
  syncPreviewToTargetLine(previewContainer, targetLine, content);
}

