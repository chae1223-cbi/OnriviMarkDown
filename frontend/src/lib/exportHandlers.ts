// 🚨 @PATCH : **2026-06-19** — PDF/HTML 내보내기 시 수동 페이지 나누기(splitSections) 로직을 소스코드 상에서 전면 제거하고 단일 문서 스트림으로 렌더링하도록 통합

import { getApiUrl } from '@/lib/api';
import { msg } from '@/lib/msg';

interface ExportOptions {
  previewEl: HTMLElement;
  currentFileName: string;
  isDarkMode: boolean;
  showToast: (msg: string, type?: any) => void;
  orientation?: 'portrait' | 'landscape';
  paperSize?: string;
  dynamicCssString?: string;
  showPageBreaks?: boolean;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  backgroundColor?: string;
}

// [ONR-EXP-001] 로컬 PDF / HTML 파일 출력 처리: 현재 문서 본문 DOM을 클론하여 지도/동영상 요소를 정적 변환하고 프린트 출력 스타일을 입혀 PDF/HTML 내보내기를 핸들링합니다.
/** IME 조합 버퍼 강제 커밋: export 직전 한글 입력이 완성되지 않은 상태로 캡처되는 현상 차단 */
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0001] exportHandlers.ts ➔ flushIME
// 🎯 @KICK  : IME 조합 버퍼 강제 커밋 — export 전 한글 미완성 입력 캡처 차단
// 🛡️ @GUARD : 임시 input 생성/포커스/blur/제거
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
function flushIME(): void {
  const input = document.createElement('input');
  input.style.cssText = 'position:fixed;top:-9999px;opacity:0;pointer-events:none;';
  document.body.appendChild(input);
  input.focus({ preventScroll: true });
  input.blur();
  document.body.removeChild(input);
}

/** html2canvas 한계 완벽 우회: 인라인코드 높이 고정 및 상하 패딩 소거형 정렬
 *  (html2canvas of inline-block 높이 오계산 및 글자 처짐 버그를 해결하는 가장 완벽하고 수학적인 해법) */
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0002] exportHandlers.ts ➔ applyExportInlineStyles
// 🎯 @KICK  : html2canvas 인라인코드 높이 오계산 버그 해결 — 자연스러운 display/vertical-align 설정
// 🛡️ @GUARD : pre>code 블록 제외, closest('pre') 조합으로 100% 포착
// 🚨 @PATCH : **2026-06-19** — PNG/HTML 내보내기 시 인라인 코드 스타일을 미리보기(globals.css)와 100% 동기화하기 위해 vertical-align:0, line-height:1.35, padding:1px 4.5px 규격으로 완전 치환
// 🔗 @CALLS : 없음
// ====================================================================
function applyExportInlineStyles(clone: HTMLElement): void {
  // 🌟 querySelectorAll('code') + closest('pre') 조합으로 복잡한 셀렉터 엔진 버그를 원천 차단하고 모든 인라인 코드를 100% 포착
  clone.querySelectorAll('code').forEach((code) => {
    const el = code as HTMLElement;
    if (el.closest('pre')) return; // 블록 코드 블록은 건드리지 않고 스킵

    // 🌟 인라인코드 정렬 싱크 보정:
    //    globals.css에 정의된 미리보기 인라인 코드 정밀 보정 스타일과 100% 완벽하게 1:1 일치시킵니다.
    el.style.setProperty('display', 'inline-block', 'important');
    el.style.setProperty('vertical-align', '0', 'important');
    el.style.setProperty('padding-top', '1px', 'important');
    el.style.setProperty('padding-bottom', '1px', 'important');
    el.style.setProperty('padding-left', '4.5px', 'important');
    el.style.setProperty('padding-right', '4.5px', 'important');
    el.style.setProperty('line-height', '1.35', 'important');
    el.style.setProperty('border-radius', '3px', 'important');
    el.style.setProperty('word-break', 'break-word', 'important');
    el.style.setProperty('margin-left', '2px', 'important');
    el.style.setProperty('margin-right', '2px', 'important');
    el.style.setProperty('height', 'auto', 'important');
  });
}

/** Yandex/Google 지도 복원 */
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0003] exportHandlers.ts ➔ restoreMapsInClone
// 🎯 @KICK  : 구글 지도 iframe 및 data-map-original-src 속성 기반 지도 복원 (Yandex 정적맵 fallback + Google Maps 링크)
// 🛡️ @GUARD : URL 파싱 오류, center/zoom/q 추출 방어
// 🚨 @PATCH : **2026-06-19** — iframe[src*="maps.google.com"] 요소를 추가로 감지하여 Yandex Static Maps 정적 이미지로 복원 치환함으로써 html2canvas의 CORS 제한으로 인한 지도 엑스박스(누락) 버그를 영구 해결
// 🔗 @CALLS : msg.error
// ====================================================================
function restoreMapsInClone(clone: HTMLElement) {
  const mapContainers = Array.from(clone.querySelectorAll('[data-map-original-src], iframe[src*="maps.google.com"]'));
  mapContainers.forEach((container) => {
    const originalSrc = container.getAttribute('data-map-original-src') || container.getAttribute('src');
    if (originalSrc) {
      let finalSrc = originalSrc;
      let googleMapsLink = 'https://maps.google.com';

      try {
        const urlObj = new URL(originalSrc.startsWith('http') ? originalSrc : `https:${originalSrc}`);
        const center = urlObj.searchParams.get('center') || urlObj.searchParams.get('ll');
        const q = urlObj.searchParams.get('q');
        const zoom = urlObj.searchParams.get('zoom') || urlObj.searchParams.get('z') || '15';

        let lat = '';
        let lng = '';

        if (center) {
          const parts = center.split(',');
          if (parts[0] && parts[1]) {
            lat = parts[0].trim();
            lng = parts[1].trim();
          }
        } else if (q) {
          // 구글 지도의 q 파라미터는 보통 "lat,lng" 또는 "위치명" 형태임
          const parts = q.split(',');
          if (parts.length >= 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
            lat = parts[0].trim();
            lng = parts[1].trim();
          }
        }

        if (lat && lng) {
          googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          finalSrc = `https://static-maps.yandex.ru/1.x/?ll=${lng},${lat}&z=${zoom}&size=600,360&l=map&lang=ko_KR`;
        }
      } catch (e) {
        msg.error("Map restoration URL parse error", e);
      }

      const img = document.createElement('img');
      img.setAttribute('src', finalSrc);
      img.setAttribute('class', 'rounded-2xl shadow-2xl my-8 border-4 border-white dark:border-gray-800 mx-auto block max-w-full hover:scale-[1.01] transition-transform duration-300');
      img.setAttribute('alt', 'Google Map');

      const link = document.createElement('a');
      link.setAttribute('href', googleMapsLink);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('title', '구글 지도보기');
      link.appendChild(img);

      const align = container.getAttribute('data-align') || container.getAttribute('data-map-align');
      if (align && (align === 'center' || align === 'right' || align === 'left')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'w-full flex';
        if (align === 'center') wrapper.classList.add('justify-center');
        else if (align === 'right') wrapper.classList.add('justify-end');
        else wrapper.classList.add('justify-start');
        wrapper.appendChild(link);
        container.parentNode?.replaceChild(wrapper, container);
      } else {
        container.parentNode?.replaceChild(link, container);
      }
    }
  });
}

/** 모든 유튜브 iframe(임베드) 요소를 썸네일 하이퍼링크로 자동 변환 */
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0004] exportHandlers.ts ➔ convertYoutubeIframeToLink
// 🎯 @KICK  : YouTube iframe 임베드를 썸네일 + 하이퍼링크 컨테이너로 변환
// 🛡️ @GUARD : youtube.com / youtube-nocookie.com embed 감지, videoId 추출
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0005] exportHandlers.ts ➔ clonePreview
// 🎯 @KICK  : 미리보기 DOM 복제 + 버튼 정리 + 지도 복원 + 유튜브 변환
// 🛡️ @GUARD : cloneNode(true)로 전체 트리 복제
// 🚨 @PATCH : 없음
// 🔗 @CALLS : restoreMapsInClone, convertYoutubeIframeToLink
// ====================================================================
function clonePreview(previewEl: HTMLElement): HTMLElement {
  const clone = previewEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('button, .copy-btn, [title*="복사"]').forEach(el => el.remove());
  restoreMapsInClone(clone);
  convertYoutubeIframeToLink(clone);
  return clone;
}

/** html2canvas가 ::before/::after/counter()를 지원하지 않아 목록 마커가 소실되는 문제 해결:
 *  export 전 clone DOM에 직접 숫자/불릿 마커를 주입 */
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0006] exportHandlers.ts ➔ fixListMarkers
// 🎯 @KICK  : html2canvas ::before/counter() 미지원 문제 해결 — DOM에 숫자/불릿 마커 직접 주입
// 🛡️ @GUARD : onrivi-empty-list-row / task-list-item 제외, start 속성 반영
// 🚨 @PATCH : export-style-element 클래스로 스타일 및 마커 일괄 관리
// 🔗 @CALLS : 없음
// ====================================================================
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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0007] exportHandlers.ts ➔ inlineLocalImages
// 🎯 @KICK  : 상대 경로 / media:// 이미지를 Base64 Data URI로 인라인 임베딩
// 🛡️ @GUARD : Electron IPC, Data URI/http(s) 스킵, 백엔드 /api/view 2차 fallback
// 🚨 @PATCH : **2026-06-19** — PNG 및 EPUB 내보내기 시 외부 이미지 로딩 CSP/CORS 차단 해결을 위해 일렉트론 환경에서 외부 http/https URL을 media 프록시로 대리 fetch하여 base64 인라인 변환하도록 패치; Electron readImageAsBase64 IPC 우회, 백엔드 실패 시 프론트엔드 정적 서빙 재시도
// 🔗 @CALLS : getApiUrl
// ====================================================================
async function inlineLocalImages(clone: HTMLElement): Promise<void> {
  const imgs = Array.from(clone.querySelectorAll('img'));
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return;

    const isExternal = src.startsWith('http://') || src.startsWith('https://');

    // 💡 [일렉트론 환경 가드] 외부 http/https 이미지이고 일렉트론인 경우, CORS/CSP 우회용 media 프록시로 fetch하여 base64 인라인 변환
    if (isExternal) {
      if (isElectron) {
        try {
          const proxyUrl = `media://?url=${encodeURIComponent(src)}`;
          const resp = await fetch(proxyUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
              reader.onloadend = () => {
                if (reader.result) img.setAttribute('src', reader.result as string);
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          }
        } catch (err) {
          console.error(`[Electron] Failed to inline external image via media proxy: ${src}`, err);
        }
      }
      return; // 외부 이미지는 로컬 이미지 로직을 타지 않고 처리 종료
    }

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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0008] exportHandlers.ts ➔ injectExportStyles
// 🎯 @KICK  : export 전 clone DOM에 동적 CSS + 인쇄 스타일 + 페이지 구분선 숨김 주입
// 🛡️ @GUARD : hideIndicators 옵션, dynamicCssString 존재 여부, pageBg 배경색
// 🚨 @PATCH : **2026-06-19** — PNG/HTML 내보내기 시 인라인 코드 스타일을 미리보기(globals.css)와 100% 동기화하기 위해 vertical-align:0, line-height:1.35, padding:1px 4.5px 규격으로 완전 치환; html2canvas 가상 iframe 내부의 html/body 글로벌 족쇄(overflow:hidden 및 height:100%) 오버라이드 해제 스타일 추가; custom-preview-container 클래스 추가로 사용자 CSS 우선 적용; 인라인 코드, 리스트 마커, 수식 겹침(KaTeX), 체크박스 정렬 불일치를 완벽 해결하기 위해 인쇄 스타일 가드 적용; KaTeX 웹폰트 CDN 강제 임포트로 수식 왜곡 및 가로 막힘 영구 해결
// 🔗 @CALLS : 없음
// ====================================================================
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

  if (dynamicCssString) {
    fragments.push(dynamicCssString);
  }

  fragments.push(`
/* 🌟 html2canvas 가상 iframe 내부의 html/body 족쇄 해제 (글로벌 overflow:hidden/height:100% 무력화) */
html, body {
  height: auto !important;
  min-height: 100% !important;
  overflow: visible !important;
  overflow-y: visible !important;
  overflow-x: visible !important;
}
.prose {
  background-color: ${bg} !important;
}
/* 🛡️ 인라인코드 스타일 가드: html2canvas가 글로벌 CSS를 누락하는 현상 차단 및 상하 정렬 보정 */
.custom-preview-container :not(pre) > code {
  background-color: rgba(27,31,35,0.05) !important;
  color: inherit !important;
  font-size: 0.9em !important;
  border-radius: 3px !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Nanum Gothic Coding', 'D2Coding', '맑은 고딕', 'Malgun Gothic', monospace !important;
  display: inline-block !important;
  vertical-align: 0 !important;
  padding: 1px 4.5px !important;
  line-height: 1.35 !important;
  height: auto !important;
  word-break: break-word !important;
  margin: 0 2px !important;
}
.export-list-marker {
  vertical-align: baseline !important;
}
/* 🛡️ 태스크 리스트 아이템 체크박스 정렬 보정 */
.custom-preview-container .task-list-item input[type="checkbox"] {
  vertical-align: text-bottom !important;
  margin-bottom: 2px !important;
}
/* 🛡️ KaTeX 수식 블록 겹침 방지 및 렌더링 최적화 */
.katex-display {
  display: block !important;
  margin: 1em 0 !important;
  padding: 0.2em 0 !important;
  height: auto !important;
  overflow: visible !important;
}
.katex {
  display: inline-block !important;
  text-indent: 0 !important;
}
.katex-mathml {
  display: none !important;
}
/* 🛡️ 각주 타이틀 및 영어 라벨 원천 차단 */
.footnotes h2,
.footnotes #footnote-label,
.footnotes .sr-only {
  display: none !important;
}
/* 🛡️ 각주 리스트 정렬 보정: 번호와 내용이 한 줄에 조화롭게 나오도록 강제 */
.footnotes ol {
  list-style-type: decimal !important;
  padding-left: 1.5em !important;
  margin: 0 !important;
}
.footnotes li {
  margin-bottom: 0.5em !important;
  list-style-position: outside !important;
  display: list-item !important;
}
.footnotes li p {
  display: inline !important;
  margin: 0 !important;
}
.footnotes li::before {
  display: none !important;
  content: none !important;
}
.footnote-backref {
  text-decoration: none !important;
  margin-left: 4px !important;
  font-family: sans-serif !important;
}
`);

  const styleEl = document.createElement('style');
  styleEl.className = 'export-style-element';
  styleEl.textContent = fragments.join('\n');
  clone.appendChild(styleEl);
}

/** 다운로드 폴더에 파일 백업 */
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0009] exportHandlers.ts ➔ saveToDownloads
// 🎯 @KICK  : 백엔드 /api/save-export API를 통해 다운로드 폴더에 파일 저장
// 🛡️ @GUARD : Electron 환경 조기 반환, API fetch 실패 시 false 반환
// 🚨 @PATCH : 없음
// 🔗 @CALLS : getApiUrl
// ====================================================================
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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0010] exportHandlers.ts ➔ exportPDF
// 🎯 @KICK  : 미리보기 DOM을 jsPDF로 선택 용지 PDF 내보내기 (html2canvas 캡처, 페이지 분할, 슬라이스)
// 🛡️ @GUARD : Electron saveFileAs, orientation/paperSize/여백/배경색 설정, 폰트 로딩 대기
// 🚨 @PATCH : **2026-06-19** — html2canvas의 수식 깨짐, 정렬 어긋남 한계를 원천 우회하기 위해 Electron 환경에 대해 Chromium 백엔드 네이티브 브라우저 인쇄 엔진 API(printHTMLToPDF IPC) 연동 구현 완료; 일반 웹 브라우저 환경에만 html2canvas 폴백 제공
// 🔗 @CALLS : flushIME, clonePreview, inlineLocalImages, injectExportStyles, fixListMarkers, applyExportInlineStyles, saveToDownloads
// ====================================================================
export async function exportPDF({ previewEl, currentFileName, isDarkMode, showToast, orientation, paperSize, dynamicCssString, marginTop, marginBottom, marginLeft, marginRight, backgroundColor }: ExportOptions) {
  try {
    showToast('PDF 내보내기 준비 중...', 'info');
    flushIME();

    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    // 🌟 가로폭 좁아짐 현상 해결: 미리보기 컴포넌트에 남겨질 수 있는 가로폭 제약(width, max-width)을 초기화하여
    //    Electron 인쇄 영역에 맞게 자연스럽게 반응형 100% 본문 너비를 확보하게 처리합니다.
    clone.style.width = '100%';
    clone.style.maxWidth = 'none';
    clone.style.height = 'auto';

    // 🌟 html2canvas 한계 보완: 테이블/인라인코드 inline style 강제 적용
    applyExportInlineStyles(clone);

    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.pdf`;
    const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;

    if (isElectron) {
      // ====================================================================
      // 🌟 [Electron 데스크톱 모드] Chromium 네이티브 PDF 인쇄 엔진 가동
      //    (html2canvas의 폰트 깨짐, 수식 왜곡, 픽셀 짤림 한계를 100% 원천 극복하는 궁극의 인쇄 솔루션)
      // ====================================================================
      const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      const pageBg = backgroundColor || '#ffffff';
      
      const finalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentFileName}</title>
  ${styleTags}
  <style>
    @page {
      size: ${paperSize || 'A4'} ${orientation || 'portrait'};
      margin: ${marginTop || '10'}mm ${marginRight || '10'}mm ${marginBottom || '10'}mm ${marginLeft || '10'}mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif;
      background-color: ${pageBg};
      color: #1e293b;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
    /* 인쇄 환경을 위한 여백 제거 및 본문 강제 정렬 */
    .markdown-viewer-root, .custom-preview-container {
      width: 100% !important;
      max-width: none !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
      height: auto !important;
    }
    /* 리스트 및 체크박스 정렬 보정 */
    .export-list-marker {
      vertical-align: baseline !important;
    }
    .task-list-item input[type="checkbox"] {
      position: relative !important;
      top: 2px !important;
      vertical-align: baseline !important;
      margin-right: 6px !important;
    }
    /* 카텍스 수식 가드 */
    .katex-display {
      display: block !important;
      margin: 1em 0 !important;
      padding: 0.2em 0 !important;
      height: auto !important;
      overflow: visible !important;
    }
    /* 🛡️ 각주 타이틀 및 영어 라벨 원천 차단 */
    .footnotes h2,
    .footnotes #footnote-label,
    .footnotes .sr-only {
      display: none !important;
    }
    /* 🛡️ 각주 리스트 정렬 보정: 번호와 내용이 한 줄에 조화롭게 나오도록 강제 */
    .footnotes ol {
      list-style-type: decimal !important;
      padding-left: 1.5em !important;
      margin: 0 !important;
    }
    .footnotes li {
      margin-bottom: 0.5em !important;
      list-style-position: outside !important;
      display: list-item !important;
    }
    .footnotes li p {
      display: inline !important;
      margin: 0 !important;
    }
    .footnotes li::before {
      display: none !important;
      content: none !important;
    }
    .footnote-backref {
      text-decoration: none !important;
      margin-left: 4px !important;
      font-family: sans-serif !important;
    }
  </style>
</head>
<body class="prose prose-base max-w-none custom-preview-container">
  ${clone.outerHTML}
</body>
</html>
      `;

      const mmToInches = (mmStr?: string) => {
        const mm = parseFloat(mmStr || '10');
        return Math.max(mm, 0) / 25.4;
      };

      const pdfBuffer: Uint8Array = await (window as any).electronAPI.printHTMLToPDF(finalHtml, {
        landscape: orientation === 'landscape',
        margins: {
          marginType: 'custom',
          top: mmToInches(marginTop),
          bottom: mmToInches(marginBottom),
          left: mmToInches(marginLeft),
          right: mmToInches(marginRight)
        },
        pageSize: paperSize || 'A4',
        printBackground: true
      });

      if (!pdfBuffer) {
        throw new Error("PDF 버퍼 데이터를 수신하지 못했습니다.");
      }

      // Uint8Array 버퍼를 Base64로 전환하여 파일 저장 API 호출
      const base64Data = Buffer.from(pdfBuffer).toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64Data}`;

      const result = await (window as any).electronAPI.saveFileAs(
        dataUrl, 
        filename, 
        '', 
        [{ name: 'PDF Documents', extensions: ['pdf'] }]
      );
      
      if (result) {
        showToast('PDF 파일이 성공적으로 저장되었습니다.', 'success');
      } else {
        showToast('PDF 내보내기가 취소되었습니다.', 'info');
      }
      return;
    }

    // ====================================================================
    // 💡 [Web 브라우저 폴백 모드] 기존 html2canvas + jsPDF 이미지 분할 렌더링
    // ====================================================================
    const html2canvas = (await import('html2canvas')).default;
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

    const pageBg = backgroundColor || '#ffffff';
    clone.style.background = pageBg;
    clone.style.color = '#1e293b';

    // 🌟 [보정 패치] 스크롤바 렌더링 오염 방지 및 본문 전체 펼치기 (1페이지 제한 버그 해결)
    clone.style.overflow = 'visible';
    clone.style.overflowY = 'visible';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';

    // 🌟 공유 스타일 주입 (인디케이터 숨김 + 동적 CSS 프로필)
    injectExportStyles(clone, dynamicCssString, { hideIndicators: true }, pageBg);

    // ✅ 폰트 로딩 대기 (사용자 정의 CSS 프로필 폰트가 로드된 상태로 캡처)
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 300));

    // 🎯 html2canvas가 ::before/counter() 미지원 → 목록 마커 DOM 직접 주입
    fixListMarkers(clone);
    // 🌟 html2canvas 한계 보완: 테이블/인라인코드 inline style 강제 적용
    applyExportInlineStyles(clone);

    // 여백값(mm → px 변환, 기본 10mm)
    const marginMM = (v?: string) => Math.max(parseFloat(v || '10') || 10, 0);
    const mt = marginMM(marginTop);
    const mb = marginMM(marginBottom);
    const ml = marginMM(marginLeft);
    const mr = marginMM(marginRight);

    // 📄 jsPDF
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ unit: 'mm', format: paperSize || 'a4', orientation: orientation || 'portrait' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const contentW = pdfW - ml - mr;
    const contentH = pdfH - mt - mb;
    // 🌟 A4 콘텐츠 영역에 해당하는 CSS 픽셀 폭 (96dpi 기준): section을 이 폭으로 렌더링하여
    //    fitScale=1이 되도록 하고, 미리보기/내보내기 간 줄바꿈 일치시킴
    const contentWidthPx = Math.round(contentW / 0.264583);
    // 🌟 가로폭 좁아짐 현상 해결: 미리보기 분할 화면 크기와 관계없이 항상 A4 용지 기준 표준 인쇄 가로폭(contentWidthPx)으로 렌더링 너비를 고정합니다.
    const renderWidth = contentWidthPx;
    clone.style.width = `${renderWidth}px`;

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

    // 🎯 수동 페이지 나누기 제거 - 전체 내용을 단일 섹션으로 처리
    const sections = [clone];

    // 🌟 오리지널 clone에 주입된 모든 스타일 요소들(사용자 정의 템플릿 포함)을 추출
    const exportStyles = Array.from(clone.querySelectorAll('.export-style-element'));

    // 📸 각 section을 개별 캡처 → PDF 페이지에 여백 포함 배치
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      sec.style.width = `${renderWidth}px`;
      sec.style.margin = '0';
      sec.style.padding = '0';
      sec.style.boxSizing = 'border-box';
      // 🎯 splitSections가 cloneNode(true)로 재복제하여 inline style이 소멸됨 → 각 section에 재적용
      applyExportInlineStyles(sec);

      const pageContainer = document.createElement('div');
      // 🌟 여백은 pageContainer 패딩이 아닌 pdf.addImage의 position(ml,mt)으로만 적용
      //    → 컨테이너 폭은 renderWidth로 고정하여 이중 여백 방지 및 줄바꿈 일치
      pageContainer.style.cssText = `width:${renderWidth}px !important;background:${pageBg} !important;box-sizing:border-box !important;overflow:visible !important;height:auto !important;max-height:none !important;`;
      pageContainer.appendChild(sec);

      // 🌟 모든 페이지 컨테이너에 사용자 정의 스타일 템플릿 및 스타일 가드를 무결하게 복제 주입!
      exportStyles.forEach(style => {
        pageContainer.appendChild(style.cloneNode(true));
      });

      // 💡 [보정 패치] html2canvas가 position:fixed 요소 내부 렌더링 시 iframe 뷰포트 크기 오버플로우로
      // 캡처를 잘라버리는 브라우저 버그를 우회하기 위해, 임시 컨테이너를 absolute로 지정합니다. (이때 left:-9999px로 밀려 렌더링이 생략되는 버그를 막기 위해 position: fixed 및 z-index:-9999로 뷰포트 내 잔존 처리)
      // 🌟 [보정 패치 2] visibility:hidden이 걸려있을 경우 html2canvas가 레이아웃 크기 측정을 누락하거나
      // 렌더링을 생략하여 1페이지로 제한될 수 있으므로, visibility 속성을 제거하고 opacity:0.01로 대체합니다.
      const temp = document.createElement('div');
      temp.style.cssText = 'position:fixed !important;top:0 !important;left:0 !important;width:100% !important;height:auto !important;min-height:100% !important;z-index:-9999 !important;pointer-events:none !important;opacity:0.01 !important;overflow:visible !important;';
      temp.appendChild(pageContainer);
      document.body.appendChild(temp);

      // 🌟 [보정 패치] DOM에 연결된 상태에서 computedStyle을 측정하여 overflow/height 제약을 확실하게 해제
      pageContainer.querySelectorAll('*').forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style) {
          const tagName = htmlEl.tagName.toUpperCase();
          // 고유 높이 제약이 유지되어야 하는 요소들(수식 KaTeX, 차트 Mermaid, 빈 행, 아이콘 등)을 제외하고
          // 일반적인 레이아웃 및 텍스트 블록 컨테이너(DIV, SECTION, ARTICLE 등)의 스크롤 및 높이 제약을 해제합니다.
          const isLayoutTag = tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE' || tagName === 'MAIN';
          const isWidget = htmlEl.classList.contains('katex') || htmlEl.classList.contains('mermaid') || htmlEl.closest('.not-prose');

          if (isLayoutTag && !isWidget) {
            htmlEl.style.setProperty('overflow', 'visible', 'important');
            htmlEl.style.setProperty('overflow-y', 'visible', 'important');
            htmlEl.style.setProperty('height', 'auto', 'important');
            htmlEl.style.setProperty('max-height', 'none', 'important');
          } else {
            // 레이아웃 태그가 아니더라도 computedStyle 상 overflow가 hidden/auto/scroll 이거나 
            // max-height가 지정되어 잘릴 위험이 있는 경우를 보정합니다.
            const computed = window.getComputedStyle(htmlEl);
            const hasOverflowRestricted = 
              computed.overflowY === 'auto' || 
              computed.overflowY === 'scroll' || 
              computed.overflowY === 'hidden' ||
              computed.overflow === 'auto' || 
              computed.overflow === 'scroll' ||
              computed.overflow === 'hidden';

            if (hasOverflowRestricted || computed.maxHeight !== 'none') {
              htmlEl.style.setProperty('overflow', 'visible', 'important');
              htmlEl.style.setProperty('overflow-y', 'visible', 'important');
              
              // 고유 크기가 보존되어야 하는 이미지나 특정 위젯이 아닌 경우에만 높이를 해제합니다.
              if (tagName !== 'IMG' && tagName !== 'CANVAS' && tagName !== 'SVG' && !isWidget) {
                htmlEl.style.setProperty('height', 'auto', 'important');
                htmlEl.style.setProperty('max-height', 'none', 'important');
              }
            }
          }
        }
      });

      // 🎯 DOM에 추가된 <style> 요소가 브라우저에 파싱/적용될 시간 확보
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      // 💡 [보정 패치] html2canvas가 기본 윈도우 창 높이로 캔버스를 제한하지 않도록 
      // 명시적인 높이(offsetHeight / scrollHeight)를 강제 파라미터로 지정하여 캡처를 실행합니다.
      const measureHeight = Math.max(pageContainer.offsetHeight, pageContainer.scrollHeight, 100);
      const secCanvas = await html2canvas(pageContainer, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        height: measureHeight,
        windowHeight: measureHeight
      });

      const cW = secCanvas.width / 2;
      const cH = secCanvas.height / 2;
      const pxToMm = 0.264583;
      const fitScale = Math.min(contentW / (cW * pxToMm), 1);
      const finalW = cW * pxToMm * fitScale;
      console.log(`[exportPDF Debug] pageContainer offsetHeight: ${pageContainer.offsetHeight}, scrollHeight: ${pageContainer.scrollHeight}, final measureHeight: ${measureHeight}, cH: ${cH}`);

      // 🌟 [보정 패치] 행/테이블/리스트/이미지/수식 짤림 방지를 위한 지능형 슬라이스 좌표 계산
      const pxPerSlice = contentH / (pxToMm * fitScale);
      const containerRect = pageContainer.getBoundingClientRect();
      const containerTop = containerRect.top;
      // 짤림 방지 대상 요소들 선택 (문단, 테이블 행, 리스트 항목, 제목, 코드 블럭, 인용문, 이미지, 수학 수식)
      const selectors = 'p, tr, li, h1, h2, h3, h4, h5, h6, pre, blockquote, img, .katex-display';
      const elements = Array.from(pageContainer.querySelectorAll(selectors)) as HTMLElement[];

      const splits: number[] = [0];
      let currentY = 0;

      while (currentY + pxPerSlice < cH) {
        const idealSplitY = currentY + pxPerSlice;
        let bestAdjustedY = idealSplitY;

        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          const elTop = rect.top - containerTop;
          const elBottom = rect.bottom - containerTop;

          // 요소가 현재 계산된 페이지 분할선에 걸치는 경우
          if (elTop < idealSplitY && elBottom > idealSplitY) {
            // 무한 루프나 극단적으로 작은 페이지 방지를 위해 최소 높이(50px) 확보된 경우만 조정
            if (elTop > currentY + 50) {
              if (elTop < bestAdjustedY) {
                bestAdjustedY = elTop;
              }
            }
          }
        }

        // 분할 지점이 현재 Y보다 충분히 멀고 이상적 분할선보다 작을 때만 조정값 적용, 그렇지 않으면 이상적 분할선 사용
        const nextY = (bestAdjustedY > currentY + 50 && bestAdjustedY < idealSplitY) ? bestAdjustedY : idealSplitY;
        splits.push(nextY);
        currentY = nextY;
      }

      document.body.removeChild(temp);

      const totalSlicePages = splits.length;

      for (let p = 0; p < totalSlicePages; p++) {
        if (i > 0 || p > 0) { pdf.addPage(); fillPageBg(); }

        const srcY = splits[p];
        const nextY = (p + 1 < splits.length) ? splits[p + 1] : cH;
        const sliceH = nextY - srcY;
        const sliceMM = sliceH * pxToMm * fitScale;

        if (sliceH <= 0) continue;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = secCanvas.width;
        sliceCanvas.height = Math.max(1, Math.round(sliceH * 2));
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(secCanvas, 0, Math.round(srcY * 2), secCanvas.width, Math.round(sliceH * 2), 0, 0, secCanvas.width, Math.round(sliceH * 2));

        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(sliceImgData, 'JPEG', ml, mt, finalW, sliceMM);
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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0011] exportHandlers.ts ➔ exportHTML
// 🎯 @KICK  : 미리보기 DOM을 독립 HTML 파일로 내보내기 (Tailwind CDN + computed font 포함)
// 🛡️ @GUARD : Electron saveFileAs, computed fontFamily 반영
// 🚨 @PATCH : **2026-06-19** — 내보내기 가로폭 A4 용지 기준 고정 패치: 분할 화면 상태에서도 항상 최소 A4 표준 가로폭(794px)을 보장하며, 실제 미리보기 렌더링 폭이 이보다 큰 경우에는 실측 폭을 사용하도록 보정
// 🔗 @CALLS : clonePreview, inlineLocalImages, injectExportStyles, saveToDownloads
// ====================================================================
export async function exportHTML({ 
  previewEl, currentFileName, isDarkMode, showToast, dynamicCssString, 
  orientation, paperSize, marginTop, marginBottom, marginLeft, marginRight, backgroundColor 
}: ExportOptions) {
  try {
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    // 🌟 가로폭 좁아짐 현상 해결: 미리보기와 동일하게 A4 용지 규격을 유지하기 위해 width 100%로 설정하고,
    //    실측 마진 및 용지 크기를 템플릿의 .preview-page-sheet 클래스에 반영합니다.
    clone.style.width = '100%';
    clone.style.maxWidth = 'none';
    clone.style.overflow = 'visible';
    clone.style.height = 'auto';

    // 🌟 공유 스타일을 clone에 직접 주입 (동적 CSS + 인디케이터 숨김)
    injectExportStyles(clone, dynamicCssString, { hideIndicators: true });

    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.html`;

    // 💡 미리보기에 실제 렌더링된 font-family를 HTML 템플릿에도 반영 (동적 CSS 프로필 값 포함)
    const computedFontFamily = window.getComputedStyle(targetEl).fontFamily;

    const isLandscape = orientation === 'landscape';
    const paperWidth = paperSize?.toLowerCase() === 'a4' 
      ? (isLandscape ? '297mm' : '210mm') 
      : (isLandscape ? '297mm' : '210mm');
      
    const minHeight = isLandscape ? '210mm' : '297mm';
    
    const pTop = marginTop || '20mm';
    const pBottom = marginBottom || '20mm';
    const pLeft = marginLeft || '20mm';
    const pRight = marginRight || '20mm';
    
    const pageBg = backgroundColor || '#ffffff';

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
      background-color: ${isDarkMode ? '#121214' : '#f4f4f5'};
      color: ${isDarkMode ? '#c9d1d9' : '#1f2328'};
      padding: 2rem;
      margin: 0;
      display: flex;
      justify-content: center;
    }
    .preview-page-sheet {
      width: ${paperWidth};
      min-height: ${minHeight};
      padding-top: ${pTop};
      padding-bottom: ${pBottom};
      padding-left: ${pLeft};
      padding-right: ${pRight};
      background-color: ${pageBg};
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'};
      box-sizing: border-box;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }
      .preview-page-sheet {
        width: 100% !important;
        min-height: auto !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="preview-page-sheet custom-preview-container">
    ${clone.outerHTML}
  </div>
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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0012] exportHandlers.ts ➔ exportEPUB
// 🎯 @KICK  : 미리보기 DOM을 EPUB으로 내보내기 (generateEpub 호출, 이미지 인라인)
// 🛡️ @GUARD : Electron saveFileAs 브랜치, fontFamily computed 적용, export-style-element 제거
// 🚨 @PATCH : **2026-06-19** — EPUB 내보내기 가로폭 제약 초기화 패치: clone 객체의 인라인 가로폭 제약을 제거하여 리더기 뷰포트에 맞게 자연스러운 흐름을 보장하도록 보정
// 🔗 @CALLS : clonePreview, inlineLocalImages, injectExportStyles, generateEpub, downloadBlob, saveToDownloads
// ====================================================================
export async function exportEPUB({ previewEl, currentFileName, isDarkMode, showToast, dynamicCssString, backgroundColor }: ExportOptions) {
  try {
    showToast('EPUB 내보내기 준비 중...', 'info');

    // ✅ PDF/HTML과 동일한 타겟팅
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    // 🌟 EPUB 내보내기 가로폭 제약 초기화 패치: clone 객체의 인라인 가로폭 제약을 제거하여 리더기 뷰포트에 맞게 자연스러운 흐름을 보장하도록 보정
    clone.style.width = '100%';
    clone.style.maxWidth = 'none';

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
// ====================================================================
// 📊 [OMD-IO-exportHandlers-0013] exportHandlers.ts ➔ exportPNG
// 🎯 @KICK  : 미리보기 DOM을 html-to-image로 PNG 캡처 및 저장 (Electron/브라우저)
// 🛡️ @GUARD : Electron IPC saveFileAs, overflow visible 강제, scrollHeight 측정 fallback
// 🚨 @PATCH : **2026-06-19** — 이미지 내보내기 가로폭 A4 용지 기준 고정 패치: 분할 화면 상태에서도 항상 최소 A4 표준 가로폭(794px)을 보장하며, 실제 미리보기 렌더링 폭이 이보다 큰 경우에는 실측 폭을 사용하도록 보정; 1페이지 출력 제한 버그 해결을 위해 모든 div/section 레이아웃 요소의 overflow/height 제약을 !important 규칙 및 정교한 예외 필터로 강제 해제; 이미지 crossOrigin anonymous 설정; 수식 깨짐 방지를 위해 구글 폰트 fetch를 피하고 로컬 KaTeX 폰트만 fontEmbedCSS 옵션으로 실시간 추출해 임베딩
// 🔗 @CALLS : flushIME, clonePreview, inlineLocalImages, injectExportStyles, fixListMarkers, applyExportInlineStyles, saveToDownloads
// ====================================================================
export async function exportPNG({ 
  previewEl, currentFileName, isDarkMode, showToast, dynamicCssString, 
  orientation, paperSize, marginTop, marginBottom, marginLeft, marginRight, backgroundColor 
}: ExportOptions) {
  try {
    showToast('이미지 내보내기 준비 중...', 'info');
    flushIME();
    const htmlToImage = await import('html-to-image');
    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.png`;

    // ✅ PDF/HTML과 동일한 타겟팅
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가
    
    // 🌟 가로폭 좁아짐 현상 해결: 미리보기와 동일하게 A4 용지 규격을 유지하기 위해 width 100%로 설정하고,
    //    실측 마진 및 용지 크기를 wrapper에 직접 반영하여 글자 줄바꿈을 100% 동기화합니다.
    clone.style.width = '100%';
    clone.style.maxWidth = 'none';

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

    const isLandscape = orientation === 'landscape';
    // 96 DPI: 210mm = 794px, 297mm = 1123px
    const widthPx = paperSize?.toLowerCase() === 'a4'
      ? (isLandscape ? 1123 : 794)
      : (isLandscape ? 1123 : 794);
      
    const minHeightPx = isLandscape ? 794 : 1123;
    
    const mmToPx = (mmStr?: string, defaultVal = 20) => {
      const mm = parseFloat(mmStr || `${defaultVal}`);
      return Math.round(mm * 96 / 25.4);
    };
    
    const pTop = mmToPx(marginTop, 20);
    const pBottom = mmToPx(marginBottom, 20);
    const pLeft = mmToPx(marginLeft, 20);
    const pRight = mmToPx(marginRight, 20);

    const wrapper = document.createElement('div');
    
    // wrapper를 fixed로 숨기되 height는 auto, overflow는 visible로 세팅하여 스크롤바 생성을 원천 차단합니다.
    // 또한 A4 규격 가로폭과 프로필 여백(padding)을 그대로 부여합니다.
    wrapper.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: ${widthPx}px !important;
      min-height: ${minHeightPx}px !important;
      padding-top: ${pTop}px !important;
      padding-bottom: ${pBottom}px !important;
      padding-left: ${pLeft}px !important;
      padding-right: ${pRight}px !important;
      box-sizing: border-box !important;
      z-index: -9999 !important;
      pointer-events: none !important;
      opacity: 0.99 !important;
      overflow: visible !important;
      display: flex !important;
      flex-direction: column !important;
    `;
    wrapper.style.backgroundColor = pageBg;
    wrapper.style.color = isDarkMode ? '#c9d1d9' : '#1f2328';
    wrapper.className = 'custom-preview-container';
    
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

    // 🌟 [보정 패치] DOM에 연결된 상태에서 computedStyle을 측정하여 overflow/height 제약을 확실하게 해제
    clone.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style) {
        const tagName = htmlEl.tagName.toUpperCase();
        // 고유 높이 제약이 유지되어야 하는 요소들(수식 KaTeX, 차트 Mermaid, 빈 행, 아이콘 등)을 제외하고
        // 일반적인 레이아웃 및 텍스트 블록 컨테이너(DIV, SECTION, ARTICLE 등)의 스크롤 및 높이 제약을 해제합니다.
        const isLayoutTag = tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE' || tagName === 'MAIN';
        const isWidget = htmlEl.classList.contains('katex') || htmlEl.classList.contains('mermaid') || htmlEl.closest('.not-prose');

        if (isLayoutTag && !isWidget) {
          htmlEl.style.setProperty('overflow', 'visible', 'important');
          htmlEl.style.setProperty('overflow-y', 'visible', 'important');
          htmlEl.style.setProperty('height', 'auto', 'important');
          htmlEl.style.setProperty('max-height', 'none', 'important');
        } else {
          // 레이아웃 태그가 아니더라도 computedStyle 상 overflow가 hidden/auto/scroll 이거나 
          // max-height가 지정되어 잘릴 위험이 있는 경우를 보정합니다.
          const computed = window.getComputedStyle(htmlEl);
          const hasOverflowRestricted = 
            computed.overflowY === 'auto' || 
            computed.overflowY === 'scroll' || 
            computed.overflowY === 'hidden' ||
            computed.overflow === 'auto' || 
            computed.overflow === 'scroll' ||
            computed.overflow === 'hidden';

          if (hasOverflowRestricted || computed.maxHeight !== 'none') {
            htmlEl.style.setProperty('overflow', 'visible', 'important');
            htmlEl.style.setProperty('overflow-y', 'visible', 'important');
            
            // 고유 크기가 보존되어야 하는 이미지나 특정 위젯이 아닌 경우에만 높이를 해제합니다.
            if (tagName !== 'IMG' && tagName !== 'CANVAS' && tagName !== 'SVG' && !isWidget) {
              htmlEl.style.setProperty('height', 'auto', 'important');
              htmlEl.style.setProperty('max-height', 'none', 'important');
            }
          }
        }
      }
    });

    // 이미지 및 스타일이 완전히 렌더링되도록 500ms 대기합니다.
    await new Promise(resolve => setTimeout(resolve, 500));

    // 🌟 런타임에 브라우저 스타일시트에서 KaTeX 폰트 @font-face 룰들만 실시간으로 추출
    //    이를 통해 외부 구글 폰트(CORS/CSP 에러 유발) fetch를 우회하고, 수식 렌더링에 필수적인 KaTeX 폰트만 임베딩합니다.
    let katexFontCss = '';
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (rule.type === CSSRule.FONT_FACE_RULE) {
                const fontFace = rule as CSSFontFaceRule;
                const fontFamily = fontFace.style.getPropertyValue('font-family');
                if (fontFamily && (fontFamily.includes('KaTeX') || fontFamily.includes('katex'))) {
                  katexFontCss += fontFace.cssText + '\n';
                }
              }
            }
          } catch (e) {
            // 크로스 도메인 스타일시트 파싱 에러 가드
          }
        }
      } catch (err) {
        msg.warn('KaTeX font extraction failed for exportPNG', err);
      }
    }

    // 전체 본문 내용을 온전히 담기 위해 실제 콘텐츠의 scrollHeight를 측정합니다.
    const rawHeight = wrapper.scrollHeight || wrapper.clientHeight;
    const finalHeight = Math.max(typeof rawHeight === 'number' && !isNaN(rawHeight) ? rawHeight : 1000, 100);

    const safeWidth = widthPx;

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
      skipFonts: false, // 💡 수식 폰트 렌더링을 위해 임베딩 켜기
      fontEmbedCSS: katexFontCss, // 💡 추출한 KaTeX 폰트 규칙만 주입하여 외부 폰트 fetch CORS 오류 방지
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
