// @ts-nocheck
// ====================================================================
// 📊 [OMD-CORE-syncEngine-0001] syncEngine ➔ syncPreviewInterpolated
// 🎯 @KICK  : 에디터 타깃 라인 기준으로 미리보기 스크롤을 구간 선형 보간하여 1:1 정렬
// 🛡️ @GUARD : prevEl/nextEl 앵커 탐색 후 보간, 앵커 없으면 폴백으로 첫 요소 사용
//             scrollTop 범위를 Math.max(0, Math.min(maxScroll, value))로 클램프
//             frontmatterLines: 미리보기에 렌더링되지 않는 메타정보 라인 수 보정
//             마지막 앵커 이후 구간은 최하단 스냅 대신 선형 연장으로 부드럽게 처리
// 🚨 @PATCH : 2026-08-30 - 핵심 버그 수정: frontmatterLines 파라미터 추가하여 에디터 라인과
//             미리보기 data-line 좌표계 불일치 해결. YAML 메타정보 구간에서의 스크롤 최상단 고정.
//             마지막 앵커 이후 선형 연장 처리로 문서 끝 불일치 해결.
//           : 2026-08-30 - 버그 수정: topOffset 기본값 0, 최상단/최하단 스냅 가드 추가
//           : 2026-08-30 - 신규 생성 — data-line 앵커 기반 구간 선형 보간(Piecewise Linear
//             Interpolation). 타이핑·방향키·스크롤·마우스클릭 4개 이벤트를 단일 파이프라인 통합.
// 🔗 @CALLS : previewContainer.querySelectorAll('[data-line]'), scrollTo
// ====================================================================

export interface SyncOptions {
  /** true: smooth 스크롤 (마우스 클릭), false: auto 즉각 (타이핑·방향키·스크롤) */
  smooth?: boolean;
  /** 상단 오프셋 여백 — 기본값 0 */
  topOffset?: number;
  /**
   * 에디터에서 YAML frontmatter가 차지하는 라인 수.
   * 미리보기는 frontmatter를 렌더링하지 않으므로 이 구간의 에디터 라인은
   * 최상단(scrollTop=0)으로 고정합니다.
   * preprocessMarkdownForPreview()의 frontmatterLines 값을 넘겨주세요.
   */
  frontmatterLines?: number;
  /**
   * 에디터 총 라인 수. 마지막 앵커 이후 구간의 진행률 계산에 사용됩니다.
   */
  totalEditorLines?: number;
}

/**
 * 에디터의 타깃 라인 번호를 기준으로 미리보기 컨테이너를 구간 선형 보간하여 스크롤합니다.
 *
 * 알고리즘:
 *  1. frontmatter 구간(1 ~ frontmatterLines)이면 최상단 고정
 *  2. [data-line] DOM 노드에서 targetLine의 직전(prevEl) / 직후(nextEl) 앵커 탐색
 *  3. 두 앵커 사이 진행률(progress) = (targetLine - prevLine) / (nextLine - prevLine)
 *  4. 마지막 앵커 이후 구간: totalEditorLines 기준 선형 연장으로 최하단까지 부드럽게 매핑
 *  5. [0, maxScroll] 클램프 후 scrollTo 실행
 */
export function syncPreviewInterpolated(
  previewContainer: HTMLElement | null,
  targetLine: number,
  options: SyncOptions = {}
): void {
  if (!previewContainer) return;

  const { smooth = false, topOffset = 0, frontmatterLines = 0, totalEditorLines = 0 } = options;

  const maxScroll = previewContainer.scrollHeight - previewContainer.clientHeight;
  const safeMax = maxScroll > 0 ? maxScroll : 0;

  // 🛡️ [최상단 스냅 가드] 라인 1 또는 frontmatter 구간이면 최상단 밀착
  if (targetLine <= 1 || (frontmatterLines > 0 && targetLine <= frontmatterLines)) {
    previewContainer.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }

  const elements = Array.from(
    previewContainer.querySelectorAll('[data-line]')
  ) as HTMLElement[];
  if (elements.length === 0) return;

  let prevEl: HTMLElement | null = null;
  let nextEl: HTMLElement | null = null;
  let prevLine = 1;
  let nextLine = 1;

  // 1. 직전(prevEl) 및 직후(nextEl) data-line 앵커 탐색
  for (const el of elements) {
    const line = parseInt(el.getAttribute('data-line') || '1', 10);
    if (line <= targetLine) {
      prevEl = el;
      prevLine = line;
    } else if (line > targetLine && !nextEl) {
      nextEl = el;
      nextLine = line;
      break;
    }
  }

  // 앵커가 전혀 없으면 첫 번째 요소를 폴백으로 사용
  if (!prevEl) prevEl = elements[0];

  const containerRect = previewContainer.getBoundingClientRect();
  const prevRect = prevEl.getBoundingClientRect();
  const prevTop = prevRect.top - containerRect.top + previewContainer.scrollTop;

  let finalScrollTop = prevTop;

  if (nextEl && nextLine > prevLine) {
    // 2a. 직후 앵커가 있으면 구간 선형 보간
    const nextRect = nextEl.getBoundingClientRect();
    const nextTop = nextRect.top - containerRect.top + previewContainer.scrollTop;
    const progress = (targetLine - prevLine) / (nextLine - prevLine);
    finalScrollTop = prevTop + (nextTop - prevTop) * progress;
  } else if (!nextEl && totalEditorLines > prevLine) {
    // 2b. 🛡️ [마지막 앵커 이후 선형 연장]
    // 마지막 data-line 앵커(prevEl) 이후부터 에디터 마지막 줄까지를
    // 미리보기 나머지 스크롤 공간(prevTop ~ safeMax)에 선형으로 매핑합니다.
    // 이렇게 하면 에디터 끝부분에서 미리보기도 자연스럽게 끝까지 도달합니다.
    const remainingEditorLines = totalEditorLines - prevLine;
    const remainingScrollSpace = safeMax - prevTop;
    if (remainingEditorLines > 0 && remainingScrollSpace > 0) {
      const editorProgress = (targetLine - prevLine) / remainingEditorLines;
      finalScrollTop = prevTop + remainingScrollSpace * editorProgress;
    } else {
      // 나머지 스크롤 공간이 없으면 최하단 밀착
      finalScrollTop = safeMax;
    }
  }
  // nextEl이 없고 totalEditorLines도 없으면 prevTop 그대로 사용

  // 3. 클램프 후 스크롤 실행
  previewContainer.scrollTo({
    top: Math.max(0, Math.min(safeMax, finalScrollTop - topOffset)),
    behavior: smooth ? 'smooth' : 'auto',
  });
}
