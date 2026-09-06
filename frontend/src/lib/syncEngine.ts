// @ts-nocheck
// ====================================================================
// 📊 [OMD-CORE-syncEngine-0001] syncEngine ➔ syncPreviewFromEditorScroll
// 🎯 @KICK  : 에디터 스크롤 이벤트 전담 1:1 미리보기 동기화 및 최상단/최하단 완벽 밀착
// 🛡️ @GUARD : 상위 1,000자 동적 Frontmatter 감지, 에디터 바닥 도달 시 미리보기 maxScrollTop 밀착,
//             SCROLL_EPSILON(1px) 미세 떨림 방어, 0~maxScroll 클램핑
// 🚨 @PATCH : 2026-09-06 - [문단 내 개별 행(.onrivi-line) Safe Zone 동기화 정밀 연동] blockSelectors 최우선에 .onrivi-line을 추가하여 다중 행 문단 내부 커서 이동 및 타이핑 시 문단 전체가 아닌 커서가 위치한 개별 행을 기준으로 Safe Zone 정밀 정렬
//             2026-09-05 - [단일 정렬 규칙 전면 도입] syncPreviewToTargetLine 및 syncPreviewFromEditorScroll Step5의 모든 블록 타입 분기(isAtLastBlock/isMedia/일반블록)를 단일 규칙(delta = elementBottom - BOTTOM_SAFE)으로 통합: 마우스 클릭이나 타이핑 시 커서 위치 요소의 끝(bottom)이 항상 BOTTOM_SAFE에 정렬되어 이미지·동영상·지도·표·문단 모두 무조건 끝 부분이 보이도록 보장
//             2026-09-05 - [타이핑 시 미리보기 흔들림 및 상하 진동(Oscillation) 결함 완전 박멸] 대형 블록 임계값을 safeZoneHeight(BOTTOM_SAFE - TOP_SAFE)로 재정의하여 상하단 조건 상충으로 인한 무한 왕복 스크롤 헌팅을 원천 제거; 텍스트/표 블록에 하단 우선 가시성 및 반동 억제 가드 탑재; JITTER_THRESHOLD를 6px로 조정하여 미세 폰트 리플로우 진동 완전 흡수
//             2026-09-05 - [하단 Safe Zone 140px 확장으로 커서/타이핑 라인 2~3줄 상향 가시성 확보] 미리보기 하단 여백(BOTTOM_SAFE)을 60px에서 140px로 대폭 확장(약 80px, 3줄 상향 확보)하여 커서 이동이나 타이핑 시 "결국" 등 마지막 문장이 윈도우 하단 경계나 상태바에 가려지지 않고 2~3줄의 넉넉한 여유 공간을 두고 쾌적하게 노출되도록 전면 개선; syncPreviewFromEditorScroll 커서 보정에도 extraLines * 26px 증분 연동 반영
//             2026-09-05 - [문서 최하단 및 빈 줄 입력 시 급격한 뷰포트 점프 결함 해결 및 부드러운 Safe Zone 추종] 마지막 줄 또는 앵커 이후 빈 줄 입력 시 강제로 previewMaxScroll로 밀어버려 상단 제목/이미지가 잘리고 200~500px 급격히 튀던 결함 해결: 일률적 previewMaxScroll 강제 점프 로직을 제거하고, extraLines * 26px 증분 및 Safe Zone(상단 40px, 하단 60px) 미세 델타 클램핑을 통해 엔터 입력 시 행 단위(26px)로 매끄럽게 하향 추종되도록 전면 개선
//             2026-09-05 - [마지막 줄 입력 및 빈 줄 생성 시 미리보기 최하단 스크롤 추종 완벽 해결] 문서 마지막 줄 또는 마지막 줄 직전 행, 혹은 마지막 앵커 이후 빈 줄에서 타이핑 시 에디터 isTyping 락과 관계없이 미리보기를 최하단(previewMaxScroll)으로 100% 밀착하여 새로 입력한 마지막 행이 미리보기 뷰포트 하단 밖으로 잘리거나 동기화가 멈추던 결함 완전 해결; targetLine > bestLine 빈 줄 오프셋 계산 시 Math.min(3, ...) 인위적 상한을 제거하여 실제 라인 간격(extraLines * 26px) 완전 반영
//             2026-09-05 - [표 행, 미디어 및 일반 블록 상향/하향 Safe Zone(상단 40px, 하단 60px) 완벽 동기화] targetLine/cursorLine <= 5 상향 스크롤 제한 조건을 전면 제거하여 문서 내 모든 줄 번호에서 위/아래 이동 및 타이핑 시 활성 행이 가시 Safe Zone 안으로 100% 즉시 추종되도록 완전 해결; blockSelectors에서 generic div를 배제하고 .table-wrapper-area, .codeblock-area, .map-embed-wrapper를 명속 지정하여 전체 루트 컨테이너 오매칭 방지; 부모-자식 중복 요소 감지 시 자식 행(tr 등) 우선 매핑 탑재
//             2026-09-05 - [이미지/동영상/지도 등 미디어 대형 요소 상단 정렬 및 Safe Zone 추종 고도화] 이미지, 동영상, 지도(iframe) 등 세로 높이가 거대한 미디어 블록에 대해 blockSelectors(iframe, video) 확장 및 isMedia 감지 탑재; 대형 미디어 편집 시 상단(TOP_SAFE) 우선 정렬로 캡션 및 미디어 상단 가려짐 방어
//             2026-09-05 - [표/대형 블록 타이핑 및 마지막 행 동기화 결함 완벽 해결] 에디터 라인 대비 미리보기 높이가 거대한 표 내부 타이핑 시 에디터 상단 라인(topVisibleLine) 고정으로 인해 하단 입력 행이 잘리던 결함을 해결: 활성 커서가 에디터 화면 내에 위치할 경우 커서 행의 미리보기 요소를 Safe Zone(상단 40px, 하단 60px) 내로 실시간 보정하는 Cursor Safe Zone 보정 연동, 문서 끝 도달 및 마지막 행 커서 시 100% 바닥 밀착 보장
//             2026-09-05 - [타이핑 시 미리보기 하단 가려짐 원천 해결] 단락 내 인라인 자식(strong, em, br 등)이 앵커로 잡혀 문단 하단(실제 타이핑 위치)이 계산에서 누락되던 결함을 상위 블록 컨테이너 및 일치 요소 영역 합산(minTop~maxBottom)으로 전면 교정하여 Safe Zone(하단 60px) 완벽 노출 보장
//             2026-09-02 - 하단 엔터 및 타이핑 중 미리보기가 위로 솟구치거나 출렁거리는 현상을 막기 위해 상단 보정 앵커를 최상단 5줄 이내로 제한 및 솟구침 가드 보강
//             2026-09-02 - 마지막 행 엔터 및 타이핑 시 미리보기 미세 진동(Jitter) 방어(JITTER_THRESHOLD 4px 클램핑) 적용
//             2026-09-02 - 마우스 휠 위/아래 스크롤 시 커서 위치 간섭 없이 에디터 스크롤 탑과 100% 실시간 연동되도록 휠 전담 구간 선형 보간 독립 분리
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

  const fmInfo = parseDynamicFrontmatter(content);
  const visibleRanges = editor.getVisibleRanges?.();
  if (!visibleRanges || visibleRanges.length === 0) return;

  const topVisibleLine = visibleRanges[0].startLineNumber;
  const lastVisibleLine = visibleRanges[visibleRanges.length - 1]?.endLineNumber ?? topVisibleLine;
  const totalLines = editor.getModel?.()?.getLineCount?.() ?? 0;
  const cursorPos = editor.getPosition?.();
  const cursorLine = cursorPos ? cursorPos.lineNumber : -1;

  // 2. 에디터 최하단(바닥) 도달 시 미리보기도 끝까지 100% 밀착
  if (editorMaxScroll > 0 && editorScrollTop >= editorMaxScroll - 8) {
    if (previewContainer.scrollTop !== previewMaxScroll) {
      previewContainer.scrollTop = previewMaxScroll;
    }
    return;
  }

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

  const lastElement = elements[elements.length - 1];
  const lastElementLine = lastElement ? parseInt(lastElement.getAttribute('data-line') || '1', 10) : 1;

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

  // 5. 💡 [표/대형 블록 비대칭 높이 및 활성 커서 Safe Zone 보정]
  // 에디터 화면에 현재 보이는 활성 커서 라인이 표의 거대한 셀 높이(padding, 줄바꿈)나 장문 문단으로 인해
  // 미리보기 뷰포트 하단(BOTTOM_SAFE) 밖으로 밀려나 잘리는 결함을 실시간 보정합니다.
  const isCursorVisibleInEditor = cursorLine >= Math.max(1, topVisibleLine - 1) && cursorLine <= lastVisibleLine + 1;
  if (isCursorVisibleInEditor) {
    let cursorEl: HTMLElement | null = null;
    for (let i = elements.length - 1; i >= 0; i--) {
      const l = parseInt(elements[i].getAttribute('data-line') || '1', 10);
      if (l <= cursorLine) {
        cursorEl = elements[i];
        break;
      }
    }

    if (cursorEl) {
      const blockSelectors = '.onrivi-line, p, li, blockquote, tr, h1, h2, h3, h4, h5, h6, pre, figure, iframe, video, .table-wrapper-area, .codeblock-area, .map-embed-wrapper';
      const blockEl = (cursorEl.closest(blockSelectors) as HTMLElement) || cursorEl;
      const blockRect = blockEl.getBoundingClientRect();
      const elRect = cursorEl.getBoundingClientRect();

      const minTop = Math.min(blockRect.top, elRect.top);
      let maxBottom = Math.max(blockRect.bottom, elRect.bottom);

      // 타깃 라인이 앵커 라인보다 큰 경우 (빈 줄 생성 또는 문단 내 추가 행 커서) 여유 공간 보정
      const elLine = parseInt(cursorEl.getAttribute('data-line') || '1', 10);
      if (cursorLine > elLine) {
        const extraLines = cursorLine - elLine;
        maxBottom += extraLines * 26;
      }

      const previewCursorBottom = maxBottom - containerRect.top + previewScrollTop;

      const containerHeight = previewContainer.clientHeight;
      const TOP_SAFE = 40;
      const BOTTOM_SAFE = Math.max(TOP_SAFE + 60, containerHeight - 140);

      // 미리보기에서 커서 요소의 상대적 위치 계산 (desiredScrollTop 적용 시)
      const relativeBottom = previewCursorBottom - desiredScrollTop;

      // 💡 [단일 정렬 규칙] syncPreviewToTargetLine과 동일:
      // 커서 요소의 끝(relativeBottom)을 항상 BOTTOM_SAFE에 정렬
      const scrollCorrection = relativeBottom - BOTTOM_SAFE;
      if (Math.abs(scrollCorrection) >= 1) {
        desiredScrollTop += scrollCorrection;
      }
    }
  }

  desiredScrollTop = Math.min(Math.max(0, desiredScrollTop), previewMaxScroll);

  if (Math.abs(previewContainer.scrollTop - desiredScrollTop) >= SCROLL_EPSILON) {
    previewContainer.scrollTop = desiredScrollTop;
  }
}

export interface SyncTargetOptions {
  column?: number;
  isTyping?: boolean;
}

/**
 * 방향키(↑, ↓), 마우스 클릭, 실시간 타이핑 시 미리보기를 가시 뷰포트(Safe Zone: 상단 40px, 하단 140px) 내부로 부드럽게 추종
 * [블록 컨테이너 및 인라인 자식(strong, em, br 등) 영역 완전 합산 연산 탑재]
 * 문단 내부의 특정 인라인 자식이 앵커로 잡혀 문단 하단(타이핑 중인 실제 행)이 미리보기 하단 밖으로 잘리거나 가려지는 결함을 원천 방어
 * 마지막 행/문단 타이핑 시 문단 시작 부분이 아닌 커서가 위치한 '문단 끝(하단)'을 Safe Zone에 최우선 밀착 노출
 */
export function syncPreviewToTargetLine(
  previewContainer: HTMLElement | null,
  targetLine: number,
  content: string = '',
  options?: SyncTargetOptions
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

  const previewMaxScroll = Math.max(0, previewContainer.scrollHeight - previewContainer.clientHeight);

  const elements = Array.from(previewContainer.querySelectorAll('[data-line]')) as HTMLElement[];
  if (elements.length === 0) return;

  const lastElement = elements[elements.length - 1];
  const lastElementLine = lastElement ? parseInt(lastElement.getAttribute('data-line') || '1', 10) : 1;

  // 2. 타깃 라인 이하 중 가장 가까운 앵커 라인(bestLine) 탐색
  let bestLine = -1;
  for (let i = elements.length - 1; i >= 0; i--) {
    const line = parseInt(elements[i].getAttribute('data-line') || '1', 10);
    if (line <= targetLine) {
      bestLine = line;
      break;
    }
  }

  if (bestLine === -1) {
    bestLine = parseInt(elements[0].getAttribute('data-line') || '1', 10);
  }

  // 3. 💡 [인라인 자식 누락 방어 및 블록 전체 영역 합산]
  // <p data-line="27"> 내부에 <strong data-line="27">, <em>, <br> 등 인라인 자식 요소가 존재할 경우,
  // querySelectorAll 탐색 시 문단 상단의 자식 요소만 선택되어 문단 하단(타이핑 중인 실제 위치)이 잘리는 결함을 원천 방어합니다.
  const blockSelectors = '.onrivi-line, p, li, blockquote, tr, h1, h2, h3, h4, h5, h6, pre, figure, iframe, video, .table-wrapper-area, .codeblock-area, .map-embed-wrapper';
  const matchingEls = elements.filter(
    (el) => parseInt(el.getAttribute('data-line') || '-1', 10) === bestLine
  );

  const containerRect = previewContainer.getBoundingClientRect();
  const containerHeight = previewContainer.clientHeight;

  let minTop = Infinity;
  let maxBottom = -Infinity;

  // 부모-자식 간 중복 매칭 방지 (예: table-wrapper-area와 tr이 동일 라인을 가질 경우 자식 요소 우선)
  const candidateEls = matchingEls.length > 1
    ? matchingEls.filter(el => !matchingEls.some(other => other !== el && typeof other.contains === 'function' && other.contains(el)))
    : (matchingEls.length > 0 ? matchingEls : [elements[0]]);

  for (const el of candidateEls) {
    // 인라인 요소인 경우 상위 블록 컨테이너의 영역까지 포괄
    const blockEl = (el.closest(blockSelectors) as HTMLElement) || el;
    const blockRect = blockEl.getBoundingClientRect();
    if (blockRect.top < minTop) minTop = blockRect.top;
    if (blockRect.bottom > maxBottom) maxBottom = blockRect.bottom;

    const elRect = el.getBoundingClientRect();
    if (elRect.top < minTop) minTop = elRect.top;
    if (elRect.bottom > maxBottom) maxBottom = elRect.bottom;
  }

  if (minTop === Infinity || maxBottom === -Infinity) {
    const fallbackRect = candidateEls[0].getBoundingClientRect();
    minTop = fallbackRect.top;
    maxBottom = fallbackRect.bottom;
  }

  // 타깃 라인이 앵커 라인보다 큰 경우 (빈 줄 생성 또는 문단 내 추가 행 커서) 여유 공간 보정
  if (targetLine > bestLine) {
    const extraLines = targetLine - bestLine;
    maxBottom += extraLines * 26;
  }

  // 💡 [실시간 타이핑 및 긴 문단 가로 줄바꿈 사전 높이 예측]
  // React preview DOM이 100ms 디바운스로 아직 갱신되지 않았더라도,
  // 에디터 실제 라인 텍스트 길이 및 컬럼을 기반으로 예상 높이를 즉각 반영하여
  // 타이핑 중에도 미리보기가 멈추지 않고 즉시 상향 추종하도록 보장
  if (content && targetLine > 0) {
    const lines = content.split('\n');
    const targetLineText = lines[targetLine - 1] || '';
    const charLen = targetLineText.length;
    if (charLen > 0) {
      const estimatedRows = Math.max(1, Math.ceil(charLen / 36));
      const estimatedHeight = estimatedRows * 26 + 16;
      const currentHeight = maxBottom - minTop;
      if (estimatedHeight > currentHeight) {
        maxBottom = minTop + estimatedHeight;
      }
    }
  }

  if (options?.column && options.column > 1) {
    const colRows = Math.max(1, Math.ceil(options.column / 36));
    const colHeight = colRows * 26 + 16;
    const currentHeight = maxBottom - minTop;
    if (colHeight > currentHeight) {
      maxBottom = minTop + colHeight;
    }
  }

  const elementTop = minTop - containerRect.top;
  const elementBottom = maxBottom - containerRect.top;
  const elementHeight = maxBottom - minTop;

  const TOP_SAFE = 40;
  const BOTTOM_SAFE = Math.max(TOP_SAFE + 60, containerHeight - 140);

  // ============================================================
  // 💡 [단일 정렬 규칙] 모든 블록 타입에 동일하게 적용:
  // 커서가 위치한 요소의 끝(elementBottom)을 항상 BOTTOM_SAFE에 정렬한다.
  //
  // - elementBottom > BOTTOM_SAFE  : 요소 끝이 뷰포트 아래 → 위로 스크롤 (끌어올림)
  // - elementBottom < BOTTOM_SAFE  : 요소 끝이 뷰포트 위에 → 아래로 스크롤 (BOTTOM_SAFE에 끌어붙임)
  //
  // 이 규칙은 마지막 문단·중간 문단·이미지·동영상·지도(iframe)·표 등
  // 모든 요소 타입에 예외 없이 적용되어, 마우스 클릭이나 타이핑 후 항상
  // 현재 커서 위치의 요소 끝이 미리보기 하단(BOTTOM_SAFE) 영역에 노출된다.
  // ============================================================
  const delta = elementBottom - BOTTOM_SAFE;

  const JITTER_THRESHOLD = options?.isTyping ? 2 : 4;
  if (Math.abs(delta) < JITTER_THRESHOLD) {
    return; // 미세 진동 무시 (덜컹거림 방어)
  }

  const targetScrollTop = Math.min(Math.max(0, previewContainer.scrollTop + delta), previewMaxScroll);

  if (Math.abs(previewContainer.scrollTop - targetScrollTop) >= 1) {
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

