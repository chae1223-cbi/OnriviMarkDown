import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import MarkdownViewer from './MarkdownViewer';

interface MarkdownPageViewerProps {
  content: string;
  originalContent?: string;
  lineMap?: number[];
  onCheckboxToggle?: (lineNumber: number, checked: boolean) => void;
  currentFilePath?: string;
  rootFolderPath?: string;
  onFileOpen?: (resolvedPath: string) => void;
  orientation?: 'portrait' | 'landscape';
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  listIndent?: string;
  onPreviewClick?: (e: React.MouseEvent) => void; // 💡 일반 엘리먼트 클릭 연동을 위한 콜백 추가
}

// 상대 경로 분석용 헬퍼 함수 복사
const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";

  // 앞뒤 꺾쇠 괄호 <> 제거 (경로 내 공백 처리를 위해 감싸진 경우 방어)
  let cleanSrcPath = srcPath.trim();
  if (cleanSrcPath.startsWith('<') && cleanSrcPath.endsWith('>')) {
    cleanSrcPath = cleanSrcPath.slice(1, -1);
  }

  if (cleanSrcPath.startsWith('http://') || cleanSrcPath.startsWith('https://') || cleanSrcPath.startsWith('data:') || cleanSrcPath.startsWith('blob:')) {
    return cleanSrcPath;
  }
  let decoded = cleanSrcPath;
  try { decoded = decodeURIComponent(cleanSrcPath); } catch { decoded = cleanSrcPath; }

  // 윈도우 절대경로 (예: D:/, C:\ 등) 판별 시 그대로 반환
  const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(decoded.replace(/\\/g, '/'));
  if (isAbsoluteWin) {
    return decoded.replace(/\\/g, '/');
  }

  let baseFolder = "";
  if (currentFileNodePath) {
    const normalizedFile = currentFileNodePath.replace(/\\/g, '/');
    const lastSlash = normalizedFile.lastIndexOf('/');
    if (lastSlash !== -1) {
      baseFolder = normalizedFile.substring(0, lastSlash);
    }
  }
  let cleanSrc = decoded.replace(/\\/g, '/');
  if (cleanSrc.startsWith('/')) cleanSrc = cleanSrc.substring(1);
  if (cleanSrc.startsWith('./')) cleanSrc = cleanSrc.substring(2);

  let finalPath = baseFolder ? baseFolder + '/' + cleanSrc : cleanSrc;
  const segments = finalPath.split('/');
  const stack: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') continue;
    if (seg === '..') {
      stack.pop();
    } else {
      stack.push(seg);
    }
  }
  return stack.join('/');
};

// mm 단위를 픽셀(px)로 변환하는 변환율 (1mm ≈ 3.78px)
const mmToPx = (mm: string | undefined, defaultValue: number): number => {
  if (!mm) return defaultValue;
  const parsed = parseFloat(mm);
  if (isNaN(parsed)) return defaultValue;
  return Math.round(parsed * 3.7795);
};

// [ONR-MD-002] 페이지 경계 및 강제 나누기 렌더링: 프린트 레이아웃 분할 기능과 페이지 높이 경계를 추적하여 강제 페이지 바인딩(Page Breaks) 처리를 수행하는 특수 뷰어 컴포넌트입니다.
export default function MarkdownPageViewer({
  content,
  originalContent,
  lineMap = [],
  onCheckboxToggle,
  currentFilePath,
  rootFolderPath,
  onFileOpen,
  orientation = 'portrait',
  marginTop = '10',
  marginBottom = '10',
  marginLeft = '10',
  marginRight = '10',
  listIndent,
  onPreviewClick // 💡 클릭 콜백 프롭 추가
}: MarkdownPageViewerProps) {
  const [pages, setPages] = useState<{ id: number; elements: HTMLElement[] }[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [calcKey, setCalcKey] = useState(0); // 강제 재측정 트리거 키

  const offscreenContainerRef = useRef<HTMLDivElement>(null);
  const pageContainerRefs = useRef<HTMLDivElement[]>([]);
  const paginationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 용지 방향 및 픽셀 규격 정의 (A4 기준: 210mm x 297mm)
  const isLandscape = orientation === 'landscape';
  const paperWidthPx = isLandscape ? 1123 : 794;
  const paperHeightPx = isLandscape ? 794 : 1123;

  // 여백 픽셀 변환
  const marginTopPx = mmToPx(marginTop, 76);
  const marginBottomPx = mmToPx(marginBottom, 76);
  const marginLeftPx = mmToPx(marginLeft, 76);
  const marginRightPx = mmToPx(marginRight, 76);

  // 실제 콘텐츠가 담길 가용 내부 높이 및 너비
  const usableHeight = paperHeightPx - (marginTopPx + marginBottomPx);
  const usableWidth = paperWidthPx - (marginLeftPx + marginRightPx);

  // content, orientation, 여백 등이 바뀔 때마다 페이지 재계산 (200ms 디바운스 적용)
  useEffect(() => {
    setIsCalculated(false);
    if (paginationDebounceRef.current) {
      clearTimeout(paginationDebounceRef.current);
    }

    paginationDebounceRef.current = setTimeout(() => {
      calculatePagination();
    }, 200);

    return () => {
      if (paginationDebounceRef.current) {
        clearTimeout(paginationDebounceRef.current);
      }
    };
  }, [content, orientation, marginTop, marginBottom, marginLeft, marginRight]);

  // 💡 [ResizeObserver 동적 추적] offscreenContainer 내부의 이미지 로딩 등으로 인한 높이 변화 상시 감지
  useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const offscreen = offscreenContainerRef.current;
    if (!offscreen) return;

    const contentRoot = offscreen.querySelector('.print\\:\\!block') as HTMLElement;
    if (!contentRoot) return;

    const observer = new ResizeObserver(() => {
      if (paginationDebounceRef.current) {
        clearTimeout(paginationDebounceRef.current);
      }
      paginationDebounceRef.current = setTimeout(() => {
        calculatePagination();
      }, 100);
    });

    observer.observe(contentRoot);
    const childNodes = contentRoot.children;
    for (let i = 0; i < childNodes.length; i++) {
      observer.observe(childNodes[i]);
    }

    return () => {
      observer.disconnect();
      if (paginationDebounceRef.current) {
        clearTimeout(paginationDebounceRef.current);
      }
    };
  }, [content, calcKey]);

  const calculatePagination = () => {
    const offscreen = offscreenContainerRef.current;
    if (!offscreen) return;

    // ReactMarkdown의 렌더링 결과물이 담긴 실제 prose 본문 영역 찾기
    let contentRoot = offscreen.querySelector('.print\\:\\!block') as HTMLElement;
    if (!contentRoot) return;

    // 💡 ReactMarkdown이 내부적으로 단일 div 래퍼를 씌웠다면 해당 div를 사용하고, 
    // 그렇지 않고 본문 요소(p, h1 등)가 직계 자식으로 바로 나열된다면 print:!block 자체를 본문 루트로 사용합니다.
    const hasSingleDivChild = contentRoot.children.length === 1 && contentRoot.children[0].tagName === 'DIV';
    if (hasSingleDivChild) {
      contentRoot = contentRoot.children[0] as HTMLElement;
    }

    const childNodes = Array.from(contentRoot.children) as HTMLElement[];
    if (childNodes.length === 0) {
      setPages([{ id: 1, elements: [] }]);
      setIsCalculated(true);
      return;
    }

    const calculatedPages: { id: number; elements: HTMLElement[] }[] = [];
    let currentPageElements: HTMLElement[] = [];
    let currentHeightSum = 0;
    let pageId = 1;

    // 수동 페이지 나눔: 현재 장을 마감하고 새 장을 즉시 개설
    const closeCurrentPageAndOpenNew = () => {
      if (currentPageElements.length > 0) {
        calculatedPages.push({ id: pageId++, elements: [...currentPageElements] });
      }
      currentPageElements = [];
      currentHeightSum = 0;
    };

    // 테이블 조각 생성 보조 함수
    const createTablePiece = (originalTable: HTMLTableElement, thead: any, trs: HTMLTableRowElement[]): HTMLTableElement => {
      const newTable = document.createElement('table');
      newTable.className = originalTable.className;
      newTable.setAttribute('style', originalTable.getAttribute('style') || '');
      if (thead) {
        newTable.appendChild(thead.cloneNode(true));
      }
      const tbody = document.createElement('tbody');
      trs.forEach(tr => tbody.appendChild(tr.cloneNode(true)));
      newTable.appendChild(tbody);
      return newTable;
    };

    // 목록 조각 생성 보조 함수
    const createListPiece = (
      originalList: HTMLUListElement | HTMLOListElement,
      lis: HTMLLIElement[],
      isOrdered: boolean,
      startNumber: number
    ): HTMLUListElement | HTMLOListElement => {
      const newList = document.createElement(isOrdered ? 'ol' : 'ul') as HTMLUListElement | HTMLOListElement;
      newList.className = originalList.className;
      newList.setAttribute('style', originalList.getAttribute('style') || '');
      if (isOrdered) {
        newList.setAttribute('start', startNumber.toString());
      }
      lis.forEach(li => newList.appendChild(li.cloneNode(true)));
      return newList;
    };

    childNodes.forEach((child) => {
      // 💡 수동 페이지 나눔: [page-break]로 생성된 div.page-break 노드만 분할 실행
      const isUserForcedPageBreak = (child.tagName === 'DIV' && child.className === 'page-break') ||
                                    child.getAttribute('data-page-break') === 'true';
      if (isUserForcedPageBreak) {
        currentPageElements.push(child);
        closeCurrentPageAndOpenNew();
        return;
      }

      // 렌더링 높이 및 마진 측정
      const rect = child.getBoundingClientRect();
      const elementHeight = child.offsetHeight || rect.height || 0;
      
      const style = window.getComputedStyle(child);
      const marginTopVal = parseFloat(style.marginTop) || 0;
      const marginBottomVal = parseFloat(style.marginBottom) || 0;
      const totalHeight = elementHeight + marginTopVal + marginBottomVal;

      // 💡 [테이블 / 리스트 심층 분할 체크]
      const isTable = child.tagName === 'TABLE';
      const isList = child.tagName === 'UL' || child.tagName === 'OL';
      const isSplitable = isTable || isList;

      // 누적 높이가 A4 가용 범위를 초과하고 쪼갤 수 있는 테이블/목록인 경우
      if (currentHeightSum + totalHeight > usableHeight && isSplitable) {
        if (isTable) {
          const table = child as HTMLTableElement;
          const thead = table.querySelector('thead');
          const theadHeight = thead ? (thead as HTMLElement).offsetHeight : 0;
          const trs = Array.from(table.querySelectorAll('tbody > tr')) as HTMLTableRowElement[];
          
          let availableHeight = usableHeight - currentHeightSum - marginTopVal - marginBottomVal;
          let currentTrs: HTMLTableRowElement[] = [];
          let currentHeight = theadHeight + 15; // 테이블 자체 여백 패딩 감안

          for (let i = 0; i < trs.length; i++) {
            const tr = trs[i];
            const trHeight = tr.offsetHeight || tr.getBoundingClientRect().height || 25;

            // 남은 공간 초과 시 현재 페이지를 마감하고 새 페이지를 구성
            if (currentHeight + trHeight > availableHeight && currentTrs.length > 0) {
              const newTable = createTablePiece(table, thead, currentTrs);
              currentPageElements.push(newTable);
              calculatedPages.push({ id: pageId++, elements: currentPageElements });

              // 새 용지 카드 상태 초기화
              currentPageElements = [];
              currentTrs = [tr];
              currentHeight = theadHeight + 15 + trHeight;
              availableHeight = usableHeight - marginTopVal - marginBottomVal;
            } else {
              currentTrs.push(tr);
              currentHeight += trHeight;
            }
          }

          if (currentTrs.length > 0) {
            const newTable = createTablePiece(table, thead, currentTrs);
            currentPageElements.push(newTable);
            currentHeightSum = currentHeight;
          }
        } 
        else if (isList) {
          const list = child as (HTMLOListElement | HTMLUListElement);
          const isOrdered = list.tagName === 'OL';
          const lis = Array.from(list.children) as HTMLLIElement[];
          
          let availableHeight = usableHeight - currentHeightSum - marginTopVal - marginBottomVal;
          let currentLis: HTMLLIElement[] = [];
          let currentHeight = 10; // 목록 자체 여백 감안
          let listStartNumber = isOrdered ? (parseInt(list.getAttribute('start') || '1', 10)) : 1;

          for (let i = 0; i < lis.length; i++) {
            const li = lis[i];
            const liHeight = li.offsetHeight || li.getBoundingClientRect().height || 20;

            // 남은 공간 초과 시 현재 리스트 조각을 새 카드로 푸시하고 분할 마감
            if (currentHeight + liHeight > availableHeight && currentLis.length > 0) {
              const newList = createListPiece(list, currentLis, isOrdered, listStartNumber);
              currentPageElements.push(newList);
              calculatedPages.push({ id: pageId++, elements: currentPageElements });

              if (isOrdered) {
                listStartNumber += currentLis.length;
              }

              // 새 용지 카드 상태 초기화
              currentPageElements = [];
              currentLis = [li];
              currentHeight = 10 + liHeight;
              availableHeight = usableHeight - marginTopVal - marginBottomVal;
            } else {
              currentLis.push(li);
              currentHeight += liHeight;
            }
          }

          if (currentLis.length > 0) {
            const newList = createListPiece(list, currentLis, isOrdered, listStartNumber);
            currentPageElements.push(newList);
            currentHeightSum = currentHeight;
          }
        }
      }
      // 1페이지 가용 한계를 통째로 초과하는 대형 단일 요소 (쪼갤 수 없는 pre, blockquote 등)
      else if (totalHeight >= usableHeight) {
        if (currentPageElements.length > 0) {
          calculatedPages.push({ id: pageId++, elements: currentPageElements });
          currentPageElements = [];
          currentHeightSum = 0;
        }
        calculatedPages.push({ id: pageId++, elements: [child] });
      }
      // 누적 높이가 1페이지 가용 높이를 넘어설 때 새로운 페이지 생성
      else if (currentHeightSum + totalHeight > usableHeight && currentPageElements.length > 0) {
        calculatedPages.push({ id: pageId++, elements: currentPageElements });
        currentPageElements = [child];
        currentHeightSum = totalHeight;
      } else {
        currentPageElements.push(child);
        currentHeightSum += totalHeight;
      }
    });

    if (currentPageElements.length > 0) {
      calculatedPages.push({ id: pageId++, elements: currentPageElements });
    }

    setPages(calculatedPages);
    setIsCalculated(true);
    setCalcKey(prev => prev + 1); // 렌더링용 키 리플래시
  };

  // 페이지 레이아웃이 렌더링된 직후, 각 가상 용지 카드의 본문 영역으로 DOM 노드를 복제하여 이식
  useLayoutEffect(() => {
    if (!isCalculated || pages.length === 0) return;

    pages.forEach((page, index) => {
      const container = pageContainerRefs.current[index];
      if (!container) return;

      // 기존 찌꺼기 노드 청소
      container.innerHTML = '';

      // 💡 [중요] 원본 노드를 appendChild로 직접 떼어가면 React Virtual DOM 정합성이 파괴되어 
      // 렌더링 트리가 붕괴하고 에디터 상태 데이터가 증발하는 치명적인 버그가 발생합니다.
      // 이를 해결하기 위해 원본 노드를 복제(cloneNode(true))하여 안전하게 이식합니다.
      page.elements.forEach((el) => {
        const cloned = el.cloneNode(true) as HTMLElement;
        container.appendChild(cloned);
      });
    });
  }, [isCalculated, pages, calcKey]);

  // 💡 [이벤트 위임 가드] 복제된(cloned) DOM 노드는 React의 직접적인 이벤트 바인딩이 유실되므로,
  // 컨테이너 레벨에서 클릭 이벤트를 감지하여 위임 처리합니다.
  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 1. 태스크 리스트 체크박스 토글 연동
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const checkbox = target as HTMLInputElement;
      const li = checkbox.closest('[data-line]');
      const line = li ? parseInt(li.getAttribute('data-line') || '0', 10) : 0;
      if (line > 0 && onCheckboxToggle) {
        // 부모의 원래 체크박스 상태 변경을 방해하지 않고 React 상태 변경 트리거
        onCheckboxToggle(line, checkbox.checked);
      }
      return;
    }

    // 2. 마크다운 내부 링크 클릭 연동 (목차 이동 및 파일 열기 지원)
    const anchor = target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        const isWebLink = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
        const isAnchor = href.startsWith('#') || href.startsWith('.#');

        if (isAnchor) {
          e.preventDefault();
          const targetId = decodeURIComponent(href.startsWith('.#') ? href.slice(2) : href.slice(1));
          let targetEl = document.getElementById(targetId);
          if (!targetEl) {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const cleanTarget = targetId.toLowerCase().replace(/\s+/g, '').normalize('NFC');
            for (const h of Array.from(headings)) {
              const headingText = h.textContent?.trim() || '';
              const cleanHeading = headingText.toLowerCase().replace(/\s+/g, '').normalize('NFC');
              if (cleanHeading === cleanTarget || h.id === targetId || (cleanTarget.length > 2 && cleanHeading.includes(cleanTarget))) {
                targetEl = h as HTMLElement;
                break;
              }
            }
          }
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (!isWebLink && (href.endsWith('.md') || href.endsWith('.markdown') || href.includes('.md#') || href.includes('.markdown#'))) {
          e.preventDefault();
          if (onFileOpen) {
            const cleanHref = href.split('#')[0];
            const resolved = resolveRelativeImagePath(cleanHref, currentFilePath);
            onFileOpen(resolved);
          }
        }
      }
      return; // 💡 링크 클릭 후 후속 일반 클릭 이벤트가 발생하지 않도록 조기 리턴 처리
    }

    // 3. 일반 엘리먼트 클릭 연동 (에디터 포커싱 및 스크롤 동기화)
    if (onPreviewClick) {
      onPreviewClick(e);
    }
  };

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* 🛡️ Off-Screen 임시 렌더러 (실제 측정용, 보이지 않음) */}
      <div 
        ref={offscreenContainerRef} 
        style={{
          position: 'absolute',
          top: -99999,
          left: -99999,
          width: `${usableWidth}px`,
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
        className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
      >
        <MarkdownViewer
          content={content}
          originalContent={originalContent}
          lineMap={lineMap}
          onCheckboxToggle={onCheckboxToggle}
          currentFilePath={currentFilePath}
          rootFolderPath={rootFolderPath}
          onFileOpen={onFileOpen}
          orientation={orientation}
          listIndent={listIndent}
        />
      </div>

      {/* 📄 실제 가상 A4 용지 페이지들 렌더링 */}
      <div className="w-full py-4 flex flex-col items-center select-text print:py-0 print:gap-0">
        {!isCalculated ? (
          <div className="text-zinc-500 dark:text-zinc-400 text-sm py-20 flex items-center gap-2">
            <span>🔄 용지 크기에 맞춰 페이지를 자동으로 분할하는 중...</span>
          </div>
        ) : (
          pages.map((page, index) => (
            <div
              key={page.id}
              className="page-view-paper print:break-after-page print:page-break-after"
              style={{
                width: `${paperWidthPx}px`,
                height: `${paperHeightPx}px`,
                paddingTop: `${marginTopPx}px`,
                paddingBottom: `${marginBottomPx}px`,
                paddingLeft: `${marginLeftPx}px`,
                paddingRight: `${marginRightPx}px`,
              }}
              onClick={handlePageClick} // 이벤트 위임 등록
            >
              {/* 용지 바깥 우측에 떠있는 페이지 배지 */}
              <div className="page-view-badge no-print">
                {page.id} / {pages.length} Page
              </div>

              {/* 실제 콘텐츠 이식용 타겟 컨테이너 */}
              <div
                ref={(el) => {
                  if (el) pageContainerRefs.current[index] = el;
                }}
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none w-full h-full overflow-hidden print:overflow-visible"
                style={{
                  width: `${usableWidth}px`,
                  height: `${usableHeight}px`
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
