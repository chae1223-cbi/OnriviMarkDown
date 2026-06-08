import { getApiUrl } from '@/lib/api';
import { msg } from '@/lib/msg';

interface ExportOptions {
  previewEl: HTMLElement;
  currentFileName: string;
  isDarkMode: boolean;
  showToast: (msg: string, type?: any) => void;
  orientation?: 'portrait' | 'landscape';
  dynamicCssString?: string;
  showPageBreaks?: boolean;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  backgroundColor?: string;
}

/** IME 조합 버퍼 강제 커밋: export 직전 한글 입력이 완성되지 않은 상태로 캡처되는 현상 차단 */
function flushIME(): void {
  const input = document.createElement('input');
  input.style.cssText = 'position:fixed;top:-9999px;opacity:0;pointer-events:none;';
  document.body.appendChild(input);
  input.focus({ preventScroll: true });
  input.blur();
  document.body.removeChild(input);
}

/** html2canvas 한계 완벽 우회: 인라인코드 높이 고정 및 상하 패딩 소거형 정렬
 *  (html2canvas의 inline-block 높이 오계산 및 글자 처짐 버그를 해결하는 가장 완벽하고 수학적인 해법) */
function applyExportInlineStyles(clone: HTMLElement): void {
  // 🌟 querySelectorAll('code') + closest('pre') 조합으로 복잡한 셀렉터 엔진 버그를 원천 차단하고 모든 인라인 코드를 100% 포착
  clone.querySelectorAll('code').forEach((code) => {
    const el = code as HTMLElement;
    if (el.closest('pre')) return; // 블록 코드 블록은 건드리지 않고 스킵

    // 🌟 핵심 원리: html2canvas가 내부 텍스트의 baseline을 잘못 그리는 현상을 방지하기 위해,
    //    display: inline-block과 height/line-height를 정확히 일치(1.35em)시키고 상하 패딩을 0으로 강제합니다.
    //    이러면 브라우저 및 html2canvas 엔진 레벨에서 텍스트가 박스 정중앙에 올 수밖에 없으며,
    //    vertical-align: middle을 통해 주변 본문 텍스트와 완벽하게 높이가 정렬됩니다.
    el.style.setProperty('display', 'inline-block', 'important');
    el.style.setProperty('height', '1.35em', 'important');
    el.style.setProperty('line-height', '1.35em', 'important');
    el.style.setProperty('vertical-align', 'middle', 'important');
    el.style.setProperty('padding-top', '0px', 'important');
    el.style.setProperty('padding-bottom', '0px', 'important');
    el.style.setProperty('padding-left', '4.5px', 'important');
    el.style.setProperty('padding-right', '4.5px', 'important');
  });
}

/** Yandex/Google 지도 복원 */
function restoreMapsInClone(clone: HTMLElement) {
  const mapContainers = clone.querySelectorAll('[data-map-original-src]');
  mapContainers.forEach((container) => {
    const originalSrc = container.getAttribute('data-map-original-src');
    if (originalSrc) {
      let finalSrc = originalSrc;
      let googleMapsLink = 'https://maps.google.com';

      try {
        const urlObj = new URL(originalSrc);
        const key = urlObj.searchParams.get('key');
        const center = urlObj.searchParams.get('center');
        const zoom = urlObj.searchParams.get('zoom') || '15';

        if (center) {
          const [lat, lng] = center.split(',');
          if (lat && lng) {
            googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat.trim()},${lng.trim()}`;

            if (!key || key === 'YOUR_API_KEY' || key.trim() === '') {
              finalSrc = `https://static-maps.yandex.ru/1.x/?ll=${lng.trim()},${lat.trim()}&z=${zoom}&size=600,360&l=map&lang=ko_KR`;
            }
          }
        }
      } catch (e) {
        msg.error("Map restoration URL parse error", e);
      }

      const img = document.createElement('img');
      img.setAttribute('src', finalSrc);
      img.setAttribute('class', 'rounded-2xl shadow-2xl my-8 border-4 border-white dark:border-gray-800 mx-auto block max-w-full hover:scale-[1.01] transition-transform duration-300');
      img.setAttribute('alt', 'Google Map');

      const lineAttr = container.getAttribute('data-line');
      if (lineAttr) {
        img.setAttribute('data-line', lineAttr);
      }

      const link = document.createElement('a');
      link.setAttribute('href', googleMapsLink);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('title', '구글 지도보기');
      link.appendChild(img);

      container.parentNode?.replaceChild(link, container);
    }
  });
}

/** 모든 유튜브 iframe(임베드) 요소를 썸네일 하이퍼링크로 자동 변환 */
function convertYoutubeIframeToLink(clone: HTMLElement) {
  const iframes = clone.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const src = iframe.getAttribute('src') || '';
    if (src.includes('youtube.com/embed/') || src.includes('youtube-nocookie.com/embed/')) {
      const match = src.match(/\/embed\/([^/?#]+)/);
      if (match && match[1]) {
        const videoId = match[1];
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

        // 썸네일 및 텍스트 링크 구조 생성
        const container = document.createElement('div');
        container.setAttribute('class', 'my-6 flex flex-col items-center gap-2');

        const link = document.createElement('a');
        link.setAttribute('href', videoUrl);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('class', 'relative block w-full max-w-[480px] rounded-2xl overflow-hidden shadow-lg border border-black/5 hover:scale-[1.01] transition-transform duration-300 mx-auto');

        const img = document.createElement('img');
        img.setAttribute('src', thumbnailUrl);
        img.setAttribute('alt', 'YouTube Video Thumbnail');
        img.setAttribute('class', 'w-full h-auto object-cover aspect-video block');

        const overlay = document.createElement('div');
        overlay.setAttribute('class', 'absolute inset-0 bg-black/10 hover:bg-black/30 flex items-center justify-center transition-colors duration-300');

        const playBtn = document.createElement('div');
        playBtn.setAttribute('class', 'w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg text-lg font-bold');
        playBtn.innerHTML = '▶';

        overlay.appendChild(playBtn);
        link.appendChild(img);
        link.appendChild(overlay);

        const infoText = document.createElement('span');
        infoText.setAttribute('class', 'text-xs text-gray-500 font-semibold block text-center mt-1.5');
        infoText.innerHTML = '🎥 YouTube에서 동영상 보기 (클릭)';

        container.appendChild(link);
        container.appendChild(infoText);

        iframe.parentNode?.replaceChild(container, iframe);
      }
    }
  });
}

/** 미리보기 DOM 복제 + 버튼 요소 정리 + 지도 복원 */
function clonePreview(previewEl: HTMLElement): HTMLElement {
  const clone = previewEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('button, .copy-btn, [title*="복사"]').forEach(el => el.remove());
  restoreMapsInClone(clone);
  convertYoutubeIframeToLink(clone);
  return clone;
}

/** html2canvas가 ::before/::after/counter()를 지원하지 않아 목록 마커가 소실되는 문제 해결:
 *  export 전 clone DOM에 직접 숫자/불릿 마커를 주입 */
function fixListMarkers(clone: HTMLElement): void {
  const style = document.createElement('style');
  style.className = 'export-style-element';
  style.textContent = `
.export-list-marker { display: inline !important; white-space: pre !important; }
.prose ol > li::before, .prose ul > li::before,
.custom-preview-container ol > li::before, .custom-preview-container ul > li::before {
  display: none !important; content: none !important; width: 0 !important; height: 0 !important;
}`;
  clone.appendChild(style);

  clone.querySelectorAll('ol').forEach((ol) => {
    const start = parseInt(ol.getAttribute('start') || '1', 10);
    let idx = 0;
    ol.querySelectorAll(':scope > li').forEach((li) => {
      const el = li as HTMLElement;
      if (el.classList.contains('onrivi-empty-list-row') || el.classList.contains('task-list-item')) return;
      const num = start + idx; idx++;
      el.style.listStyleType = 'none';
      if (el.querySelector('.export-list-marker')) return;
      const marker = document.createElement('span');
      marker.className = 'export-list-marker';
      marker.textContent = num + '. ';
      marker.style.cssText = 'display:inline;font-weight:400;margin-right:4px;user-select:none;-webkit-user-select:none;';
      el.insertBefore(marker, el.firstChild);
    });
  });

  clone.querySelectorAll('ul').forEach((ul) => {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const el = li as HTMLElement;
      if (el.classList.contains('onrivi-empty-list-row') || el.classList.contains('task-list-item')) return;
      el.style.listStyleType = 'none';
      if (el.querySelector('.export-list-marker')) return;
      const marker = document.createElement('span');
      marker.className = 'export-list-marker';
      marker.textContent = '• ';
      marker.style.cssText = 'display:inline;font-weight:400;margin-right:4px;user-select:none;-webkit-user-select:none;';
      el.insertBefore(marker, el.firstChild);
    });
  });
}

/** 상대 경로(/~) 및 media:// 프로토콜 이미지를 Base64 Data URI로 인라인 임베딩 (내보내기 시 이미지 깨짐 방지) */
async function inlineLocalImages(clone: HTMLElement): Promise<void> {
  const imgs = Array.from(clone.querySelectorAll('img'));
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute('src') || '';
    // 이미 Data URI이거나 외부 http(s) URL이면 스킵
    if (!src || src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return;

    // 💡 [일렉트론 환경 가드] 일렉트론 런타임 환경에서는 IPC를 사용하여 로컬 파일 경로에서 base64 데이터를 다이렉트로 안전하게 로드합니다.
    if (isElectron) {
      try {
        let filePath = src;
        if (src.startsWith('media://')) {
          try {
            const urlObj = new URL(src);
            filePath = urlObj.searchParams.get('url') || src;
          } catch (e) {
            filePath = src;
          }
        }
        
        const base64Data = await (window as any).electronAPI.readImageAsBase64(filePath);
        if (base64Data) {
          img.setAttribute('src', base64Data);
        }
        return;
      } catch (err) {
        console.error(`[Electron] Failed to inline local image via IPC: ${src}`, err);
        // 실패 시 일반 fetch 브라우저 폴백
      }
    }

    let absoluteUrl = src;
    const isElectronMedia = src.startsWith('media://');

    if (!isElectronMedia) {
      let realSrc = src;
      // 일반 상대경로인 경우
      const isAbsoluteWin = /^[a-zA-Z]:[\\/]/.test(realSrc);
      const isAbsoluteUnix = realSrc.startsWith('/');
      const isAbsolute = isAbsoluteWin || isAbsoluteUnix;

      if (isAbsolute) {
        // 절대경로 파일은 백엔드 view API에 url 인자로 전달하여 서빙받음
        absoluteUrl = getApiUrl(`/api/view?url=${encodeURIComponent(realSrc)}`);
      } else {
        // 1차 시도: 백엔드의 워크스페이스 정적 서빙 경로 (/api/view/...)
        absoluteUrl = realSrc.startsWith('/')
          ? getApiUrl(`/api/view${realSrc}`)
          : getApiUrl(`/api/view/${realSrc}`);
      }
    }

    try {
      let resp = await fetch(absoluteUrl);

      // 만약 백엔드에서 못 찾았고, media 프로토콜이 아닌 일반 상대경로였다면 프론트엔드 정적 서빙 경로로 2차 시도
      if (!resp.ok && !isElectronMedia && src.startsWith('/')) {
        const fallbackUrl = `${window.location.protocol}//${window.location.host}${src}`;
        resp = await fetch(fallbackUrl);
      }

      if (!resp.ok) return;

      const blob = await resp.blob();
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          if (reader.result) img.setAttribute('src', reader.result as string);
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error(`Failed to inline image: ${src}`, err);
    }
  }));
}

/**
 * 모든 export 포맷 공통: 복제된 DOM에 동적 CSS + 인쇄 스타일을 주입합니다.
 * hideIndicators: true 면 화면용 가상 페이지 구분선(빨간 점선/이모지)을 제거
 */
function injectExportStyles(
  clone: HTMLElement,
  dynamicCssString?: string,
  options?: { hideIndicators?: boolean },
  pageBg?: string
): void {
  if (dynamicCssString && !clone.classList.contains('custom-preview-container')) {
    clone.classList.add('custom-preview-container');
  }

  const bg = pageBg || '#ffffff';
  const fragments: string[] = [];

  if (options?.hideIndicators !== false) {
    fragments.push(`
.page-break-indicator,
.page-break-line-before::before,
.page-break::before,
tr.table-page-break-line-before > td:first-child::before {
  display: none !important;
}
.page-break-line-before {
  margin-top: 1.5rem !important;
}`);
  }

  if (dynamicCssString) {
    fragments.push(dynamicCssString);
  }

  fragments.push(`
.prose {
  background-color: ${bg} !important;
}
/* 🛡️ 인라인코드 스타일 가드: html2canvas가 글로벌 CSS를 누락하는 현상 차단 (사용자 템플릿 우선) */
.custom-preview-container :not(pre) > code {
  background-color: rgba(175,184,193,0.2);
  color: #1f2328;
  font-size: 85%;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace;
  display: inline-block;
  height: 1.35em;
  line-height: 1.35em;
  vertical-align: middle;
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 4.5px;
  padding-right: 4.5px;
}
.export-list-marker {
  vertical-align: middle !important;
}`);

  const styleEl = document.createElement('style');
  styleEl.className = 'export-style-element';
  styleEl.textContent = fragments.join('\n');
  clone.appendChild(styleEl);
}

/** 다운로드 폴더에 파일 백업 */
async function saveToDownloads(filename: string, content: string, type: 'base64' | 'text') {
  // 💡 [일렉트론 환경 가드] 일렉트론 순수 데스크톱 모드에서는 Express 백엔드 포트 서빙이 실행되지 않으므로,
  // 불필요한 로컬 API fetch 시도를 즉시 스킵하여 콘솔의 ERR_CONNECTION_REFUSED 빨간색 에러 노출을 방지합니다.
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return true;
  }

  try {
    const res = await fetch(getApiUrl('/api/save-export'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content, type }),
    });
    return res.ok;
  } catch (err) {
    console.error("[온리비 어서] saveToDownloads API 호출 실패 (서버 미구동 상태일 수 있음):", err);
    return false;
  }
}

// ─────────────────────────────────────────────
// PDF 내보내기
// ─────────────────────────────────────────────
export async function exportPDF({ previewEl, currentFileName, isDarkMode, showToast, orientation, dynamicCssString, marginTop, marginBottom, marginLeft, marginRight, backgroundColor }: ExportOptions) {
  try {
    showToast('PDF 내보내기 준비 중...', 'info');
    flushIME();
    const html2canvas = (await import('html2canvas')).default;

    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    const isLandscape = orientation === 'landscape';

    // 미리보기 원본 클래스 유지 + export에 필요한 prose 클래스만 추가 (원본 서식 보존)
    clone.classList.add('prose', 'prose-base', 'max-w-none', 'custom-preview-container');
    // 🌟 미리보기의 실제 렌더링 스타일(글자크기, 행간, 폰트)을 clone에 동일하게 적용
    const previewStyle = window.getComputedStyle(targetEl);
    clone.style.fontSize = previewStyle.fontSize;
    clone.style.lineHeight = previewStyle.lineHeight;
    // 🌟 한글 안전 폴백 추가: html2canvas 캔버스에서 한글 폰트가 없으면 글자가 깨짐
    clone.style.fontFamily = previewStyle.fontFamily + ", 'Nanum Gothic', 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif";
    clone.style.letterSpacing = previewStyle.letterSpacing;
    // 🌟 미리보기와 동일한 폭으로 렌더링 (줄바꿈 일치)
    const previewWidth = targetEl.getBoundingClientRect().width;
    clone.style.width = `${previewWidth}px`;
    const pageBg = backgroundColor || '#ffffff';
    clone.style.background = pageBg;
    clone.style.color = '#1e293b';

    // 🌟 공유 스타일 주입 (인디케이터 숨김 + 동적 CSS 프로필)
    
    injectExportStyles(clone, dynamicCssString, { hideIndicators: true }, pageBg);

    // ✅ 폰트 로딩 대기 (사용자 정의 CSS 프로필 폰트가 로드된 상태로 캡처)
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 300));

    // 🎯 html2canvas가 ::before/counter() 미지원 → 목록 마커 DOM 직접 주입
    fixListMarkers(clone);
    // 🌟 html2canvas 한계 보완: 테이블/인라인코드 inline style 강제 적용
    applyExportInlineStyles(clone);

    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.pdf`;

    // 여백값(mm → px 변환, 기본 10mm)
    const marginMM = (v?: string) => Math.max(parseFloat(v || '10') || 10, 0);
    const mt = marginMM(marginTop);
    const mb = marginMM(marginBottom);
    const ml = marginMM(marginLeft);
    const mr = marginMM(marginRight);

    // 📄 jsPDF
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: orientation || 'portrait' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const contentW = pdfW - ml - mr;
    const contentH = pdfH - mt - mb;
    // 🌟 A4 콘텐츠 영역에 해당하는 CSS 픽셀 폭 (96dpi 기준): section을 이 폭으로 렌더링하여
    //    fitScale=1이 되도록 하고, 미리보기/내보내기 간 줄바꿈 일치시킴
    const contentWidthPx = Math.round(contentW / 0.264583);

    // 🌟 PDF 페이지 배경을 문서 배경색으로 채우는 헬퍼 (여백까지 배경색 일치)
    const fillPageBg = () => {
      if (pageBg && pageBg !== '#ffffff') {
        const hex = pageBg.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          pdf.setFillColor(r, g, b);
          pdf.rect(0, 0, pdfW, pdfH, 'F');
        }
      }
    };
    fillPageBg();

    // 🎯 clone을 page-break 기준으로 section 분할
    const splitSections = (root: HTMLElement): HTMLElement[] => {
      // 🌟 style 요소를 분할 대상에서 제외하여 스타일이 페이지별로 고루 복제 주입되도록 필터링
      const children = Array.from(root.childNodes).filter(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          return !el.classList.contains('export-style-element');
        }
        return true;
      });
      const result: HTMLElement[] = [];
      let currentNodes: Node[] = [];
      for (const node of children) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.classList.contains('page-break') || el.classList.contains('page-break-line-before')) {
            if (currentNodes.length > 0) {
              const sec = document.createElement('div');
              sec.className = root.className;
              sec.style.cssText = root.style.cssText;
              currentNodes.forEach(n => sec.appendChild(n.cloneNode(true)));
              result.push(sec);
              currentNodes = [];
            }
            continue;
          }
        }
        currentNodes.push(node);
      }
      if (currentNodes.length > 0) {
        const sec = document.createElement('div');
        sec.className = root.className;
        sec.style.cssText = root.style.cssText;
        currentNodes.forEach(n => sec.appendChild(n.cloneNode(true)));
        result.push(sec);
      }
      return result.length > 0 ? result : [root];
    };

    const sections = splitSections(clone);

    // 🌟 오리지널 clone에 주입된 모든 스타일 요소들(사용자 정의 템플릿 포함)을 추출
    const exportStyles = Array.from(clone.querySelectorAll('.export-style-element'));

    // 📸 각 section을 개별 캡처 → PDF 페이지에 여백 포함 배치
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      sec.style.width = `${previewWidth}px`;
      sec.style.margin = '0';
      sec.style.padding = '0';
      sec.style.boxSizing = 'border-box';
      // 🎯 splitSections가 cloneNode(true)로 재복제하여 inline style이 소멸됨 → 각 section에 재적용
      applyExportInlineStyles(sec);

      const pageContainer = document.createElement('div');
      // 🌟 여백은 pageContainer 패딩이 아닌 pdf.addImage의 position(ml,mt)으로만 적용
      //    → 컨테이너 폭은 previewWidth로 고정하여 이중 여백 방지 및 줄바꿈 일치
      pageContainer.style.cssText = `width:${previewWidth}px;background:${pageBg};box-sizing:border-box;`;
      pageContainer.appendChild(sec);

      // 🌟 모든 페이지 컨테이너에 사용자 정의 스타일 템플릿 및 스타일 가드를 무결하게 복제 주입!
      exportStyles.forEach(style => {
        pageContainer.appendChild(style.cloneNode(true));
      });

      const temp = document.createElement('div');
      temp.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;pointer-events:none;z-index:-9999';
      temp.appendChild(pageContainer);
      document.body.appendChild(temp);
      // 🎯 DOM에 추가된 <style> 요소가 브라우저에 파싱/적용될 시간 확보
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const secCanvas = await html2canvas(pageContainer, { scale: 2, useCORS: true, logging: false });
      document.body.removeChild(temp);

      const cW = secCanvas.width / 2;
      const cH = secCanvas.height / 2;
      const pxToMm = 0.264583;
      const fitScale = Math.min(contentW / (cW * pxToMm), 1);
      const finalW = cW * pxToMm * fitScale;
      const finalH = cH * pxToMm * fitScale;

      // 🔁 contentH(A4 콘텐츠 영역 높이)를 초과하면 canvas를 세로로 분할하여 여러 PDF 페이지 생성
      const totalSlicePages = Math.max(1, Math.ceil(finalH / contentH));

      for (let p = 0; p < totalSlicePages; p++) {
        if (i > 0 || p > 0) { pdf.addPage(); fillPageBg(); }

        if (totalSlicePages === 1) {
          const imgData = secCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(imgData, 'JPEG', ml, mt, finalW, finalH);
        } else {
          // 캔버스에서 해당 슬라이스 추출
          const pxPerSlice = contentH / (pxToMm * fitScale);
          const srcY = p * pxPerSlice;
          const sliceH = Math.min(cH - srcY, pxPerSlice);
          const sliceMM = sliceH * pxToMm * fitScale;

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = secCanvas.width;
          sliceCanvas.height = Math.max(1, Math.round(sliceH * 2));
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(secCanvas, 0, Math.round(srcY * 2), secCanvas.width, Math.round(sliceH * 2), 0, 0, secCanvas.width, Math.round(sliceH * 2));

          const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(sliceImgData, 'JPEG', ml, mt, finalW, sliceMM);
        }
      }
    }

    const pdfBlob: Blob = pdf.output('blob');

    // 💡 [일렉트론 환경 처리] 사용자가 파일명과 경로를 직접 선택해 다른 이름으로 저장을 확정 지은 뒤에 알림을 노출합니다.
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const reader = new FileReader();
      const savePromise = new Promise<boolean>((resolve) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result as string;
            // PDF 파일 필터를 명시해 일렉트론 전용 대화상자 호출
            const result = await (window as any).electronAPI.saveFileAs(
              base64Data, 
              filename, 
              '', 
              [{ name: 'PDF Documents', extensions: ['pdf'] }]
            );
            
            if (result) {
              showToast('PDF 파일이 성공적으로 저장되었습니다.', 'success');
              resolve(true);
            } else {
              showToast('PDF 내보내기가 취소되었습니다.', 'info');
              resolve(false);
            }
          } catch (err: any) {
            showToast('PDF 내보내기 실패: ' + err.message, 'error');
            resolve(false);
          }
        };
      });
      reader.readAsDataURL(pdfBlob);
      await savePromise;
    } else {
      // 💡 일반 웹 브라우저 환경인 경우
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);

      // 다운로드 폴더 저장 백업 API 호출
      const reader = new FileReader();
      reader.onloadend = async () => {
        const ok = await saveToDownloads(filename, reader.result as string, 'base64');
        showToast(ok ? '다운로드 폴더에 PDF가 생성되었습니다.' : 'PDF 내보내기가 완료되었습니다.', 'success');
      };
      reader.readAsDataURL(pdfBlob);
    }
  } catch (err: any) {
    msg.error('PDF export error', err);
    showToast('PDF 내보내기 실패: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// HTML 내보내기
// ─────────────────────────────────────────────
export async function exportHTML({ previewEl, currentFileName, isDarkMode, showToast, dynamicCssString, showPageBreaks, backgroundColor }: ExportOptions) {
  try {
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    // 🌟 줄바꿈 일치를 위해 preview 폭 유지, export된 HTML에서 폭 제약 제거
    clone.style.width = '100%';
    clone.style.maxWidth = `${targetEl.getBoundingClientRect().width}px`;
    clone.style.margin = '0 auto';
    clone.style.overflow = 'visible';
    clone.style.height = 'auto';

    // 🌟 공유 스타일을 clone에 직접 주입 (동적 CSS + 인디케이터 숨김)
    injectExportStyles(clone, dynamicCssString, { hideIndicators: true });

    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.html`;

    // 💡 미리보기에 실제 렌더링된 font-family를 HTML 템플릿에도 반영 (동적 CSS 프로필 값 포함)
    const computedFontFamily = window.getComputedStyle(targetEl).fontFamily;

    const finalHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <style>
    body {
      font-family: ${computedFontFamily};
      background-color: ${isDarkMode ? '#0d1117' : '#ffffff'};
      color: ${isDarkMode ? '#c9d1d9' : '#1f2328'};
      padding: 2rem;
    }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.saveFileAs(
        finalHtml, 
        filename, 
        '', 
        [{ name: 'HTML Documents', extensions: ['html'] }]
      );
      if (result) {
        showToast('HTML 파일이 성공적으로 저장되었습니다.', 'success');
      } else {
        showToast('HTML 내보내기가 취소되었습니다.', 'info');
      }
    } else {
      // 브라우저 다운로드
      const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);

      // 다운로드 폴더 저장
      const ok = await saveToDownloads(filename, finalHtml, 'text');
      showToast(ok ? '다운로드 폴더에 HTML이 생성되었습니다.' : 'HTML 내보내기가 완료되었습니다.', 'success');
    }
  } catch (err: any) {
    msg.error('HTML export error', err);
    showToast('HTML 내보내기 실패: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// EPUB 내보내기
// ─────────────────────────────────────────────
export async function exportEPUB({ previewEl, currentFileName, isDarkMode, showToast, dynamicCssString, backgroundColor }: ExportOptions) {
  try {
    showToast('EPUB 내보내기 준비 중...', 'info');

    // ✅ PDF/HTML과 동일한 타겟팅
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    // 🌟 공유 스타일 주입 (인디케이터 숨김 + 동적 CSS 프로필)
    const pageBg = backgroundColor || '#ffffff';
    injectExportStyles(clone, dynamicCssString, { hideIndicators: true }, pageBg);

    // 💡 미리보기에 실제 렌더링된 font-family를 EPUB style.css body에도 반영
    const computedFontFamily = window.getComputedStyle(targetEl).fontFamily;

    const epubTitle = currentFileName.replace(/\.[^/.]+$/, '') || 'document';
    const filename = `${epubTitle}.epub`;

    showToast('EPUB 파일 생성 중... (내용 분할 및 이미지 처리)', 'info');
    const { generateEpub, downloadBlob } = await import('@/lib/epubGenerator');

    // EPUB 본문에 html2canvas용 인라인 스타일이 포함되지 않도록 제거 (외부 style.css에서만 처리)
    clone.querySelector('style.export-style-element')?.remove();

    const blob = await generateEpub({ title: epubTitle, contentHtml: clone.innerHTML, dynamicCssString, fontFamily: computedFontFamily });

    showToast('EPUB 저장 중...', 'info');
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const reader = new FileReader();
      const savePromise = new Promise<boolean>((resolve) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result as string;
            const result = await (window as any).electronAPI.saveFileAs(
              base64Data, 
              filename, 
              '', 
              [{ name: 'EPUB Documents', extensions: ['epub'] }]
            );
            
            if (result) {
              showToast('EPUB 파일이 성공적으로 저장되었습니다.', 'success');
              resolve(true);
            } else {
              showToast('EPUB 내보내기가 취소되었습니다.', 'info');
              resolve(false);
            }
          } catch (err: any) {
            showToast('EPUB 저장 실패: ' + err.message, 'error');
            resolve(false);
          }
        };
      });
      reader.readAsDataURL(blob);
      await savePromise;
    } else {
      downloadBlob(blob, filename);

      // 다운로드 폴더 저장
      const reader = new FileReader();
      reader.onloadend = async () => {
        const ok = await saveToDownloads(filename, reader.result as string, 'base64');
        showToast(ok ? '다운로드 폴더에 EPUB이 생성되었습니다.' : 'EPUB 내보내기가 완료되었습니다.', 'success');
      };
      reader.readAsDataURL(blob);
    }
  } catch (err: any) {
    msg.error('EPUB export error', err);
    const errMsg = err?.message || err?.toString() || '알 수 없는 오류';
    showToast('EPUB 내보내기 실패: ' + errMsg, 'error');
  }
}

// ─────────────────────────────────────────────
// PNG 내보내기
// ─────────────────────────────────────────────
export async function exportPNG({ previewEl, currentFileName, isDarkMode, showToast, dynamicCssString, showPageBreaks, backgroundColor }: ExportOptions) {
  try {
    showToast('이미지 내보내기 준비 중...', 'info');
    flushIME();
    const htmlToImage = await import('html-to-image');
    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.png`;

    // ✅ PDF/HTML과 동일한 타겟팅
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가
    
    // 🌟 실제 미리보기 렌더링 폭 사용 (최소 A4 폭 = 794px 보장)
    const actualWidth = Math.max(targetEl.getBoundingClientRect().width, 794);
    clone.style.width = `${actualWidth}px`;

    // 🌟 공유 스타일 주입 (인디케이터 숨김 + 동적 CSS 프로필)
    const pageBg = backgroundColor || '#ffffff';
    injectExportStyles(clone, dynamicCssString, { hideIndicators: true }, pageBg);

    // ✅ 폰트 로딩 대기 (html-to-image는 폰트 미적용 상태로 캡처 시 텍스트 누락)
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 300));

    // 🎯 html2canvas가 ::before/counter() 미지원 → 목록 마커 DOM 직접 주입
    fixListMarkers(clone);
    // 🌟 html2canvas 한계 보완: 테이블/인라인코드 inline style 강제 적용
    applyExportInlineStyles(clone);

    clone.querySelectorAll('img').forEach(img => img.setAttribute('crossOrigin', 'anonymous'));

    // 스크롤바 렌더링 오염 방지: 복제본 및 내부 요소의 overflow를 강제 해제하여 본문이 아래로 자연스럽게 펼쳐지도록 합니다.
    clone.style.overflow = 'visible';
    clone.style.overflowY = 'visible';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';

    clone.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        const computed = window.getComputedStyle(htmlEl);
        if (
          computed.overflowY === 'auto' || 
          computed.overflowY === 'scroll' || 
          computed.overflow === 'auto' || 
          computed.overflow === 'scroll'
        ) {
          htmlEl.style.overflow = 'visible';
          htmlEl.style.overflowY = 'visible';
          htmlEl.style.height = 'auto';
          htmlEl.style.maxHeight = 'none';
        }
      }
    });

    const wrapper = document.createElement('div');
    // ✅ clone의 실제 폭 사용 (previewEl.clientWidth는 외부 컨테이너 폭이라 부정확)
    const widthStr = clone.style.width;
    const parsedWidth = widthStr && widthStr !== '100%' ? parseInt(widthStr) : 0;
    const originalWidth = Math.max(parsedWidth || previewEl.clientWidth || 800, 100);
    
    // wrapper를 fixed로 숨기되 height는 auto, overflow는 visible로 세팅하여 스크롤바 생성을 원천 차단합니다.
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${originalWidth}px;
      height: auto;
      min-height: 100px;
      z-index: -9999;
      pointer-events: none;
      opacity: 0.99;
      overflow: visible;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;
    wrapper.style.backgroundColor = pageBg;
    wrapper.style.color = isDarkMode ? '#c9d1d9' : '#1f2328';
    
    // 이미지 내보내기 시 페이지 구분선 텍스트 및 점선을 보이지 않게 처리
    const hidePageBreaksStyle = document.createElement('style');
    hidePageBreaksStyle.innerHTML = `
      .page-break-indicator,
      .page-break-line-before::before,
      .page-break::before {
        display: none !important;
      }
      .page-break-line-before {
        margin-top: 1.5rem !important;
      }
    `;
    wrapper.appendChild(hidePageBreaksStyle);
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // 이미지 및 스타일이 완전히 렌더링되도록 500ms 대기합니다.
    await new Promise(resolve => setTimeout(resolve, 500));

    // 전체 본문 내용을 온전히 담기 위해 실제 콘텐츠의 scrollHeight를 측정합니다.
    const rawHeight = wrapper.scrollHeight || wrapper.clientHeight;
    const finalHeight = Math.max(typeof rawHeight === 'number' && !isNaN(rawHeight) ? rawHeight : 1000, 100);

    const safeWidth = Math.max(typeof originalWidth === 'number' && !isNaN(originalWidth) ? originalWidth : 800, 100);

    const dataUrl = await htmlToImage.toPng(wrapper, {
      backgroundColor: pageBg,
      width: safeWidth,
      height: finalHeight,
      style: {
        transform: 'none',
        left: '0',
        top: '0',
        position: 'relative',
        overflow: 'visible'
      },
      cacheBust: true,
      pixelRatio: 2,
    });

    document.body.removeChild(wrapper);

    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // 💡 [일렉트론 환경 처리] 이미지 다른 이름으로 저장 다이얼로그 연동
      const result = await (window as any).electronAPI.saveFileAs(
        dataUrl, 
        filename, 
        '', 
        [{ name: 'PNG Images', extensions: ['png'] }]
      );
      if (result) {
        showToast('이미지 파일이 성공적으로 저장되었습니다.', 'success');
      } else {
        showToast('이미지 내보내기가 취소되었습니다.', 'info');
      }
    } else {
      // 브라우저 다운로드
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      // 다운로드 폴더 저장
      const ok = await saveToDownloads(filename, dataUrl, 'base64');
      showToast(ok ? '다운로드 폴더에 PNG가 생성되었습니다.' : '이미지 내보내기가 완료되었습니다.', 'success');
    }
  } catch (err: any) {
    msg.error('PNG export error', err);
    showToast('PNG 내보내기 실패: ' + err.message, 'error');
  }
}
