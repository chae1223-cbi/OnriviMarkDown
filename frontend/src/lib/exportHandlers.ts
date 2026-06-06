import { getApiUrl } from '@/lib/api';
import { msg } from '@/lib/msg';

interface ExportOptions {
  previewEl: HTMLElement;
  currentFileName: string;
  isDarkMode: boolean;
  showToast: (msg: string, type?: any) => void;
  orientation?: 'portrait' | 'landscape';
  dynamicCssString?: string;
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
export async function exportPDF({ previewEl, currentFileName, isDarkMode, showToast, orientation, dynamicCssString }: ExportOptions) {
  try {
    showToast('PDF 내보내기 준비 중...', 'info');
    const html2pdf = (await import('html2pdf.js')).default;

    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    const isLandscape = orientation === 'landscape';

    // 💡 다크모드에서 PDF 본문 및 글씨색이 뒤엉켜 깨지는 현상을 방어하기 위해 라이트모드 스타일 및 고정 너비 강제 주입
    clone.className = 'markdown-viewer-root prose prose-sm md:prose-base max-w-none bg-white text-slate-900 custom-preview-container';
    clone.style.width = isLandscape ? '1123px' : '794px'; // A4 가용 너비 기준 가이드
    clone.style.background = '#ffffff';
    clone.style.color = '#1e293b';

    // 💡 [PDF 내보내기 전용 스타일 인젝션] 화면용 가상 구분선 텍스트 및 점선을 가리고 실제 A4 강제 페이징만 유지
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* 전체 다크모드 색상 강제 오버라이드하여 다크모드 뷰 상태에서도 흰배경 보장 */
      .prose {
        background-color: #ffffff !important;
      }
      .prose table, .prose tr, .prose td, .prose th, .prose pre, .prose code {
        background-color: transparent !important;
      }
      
      /* 단락, 리스트 아이템, 제목 등이 페이지 경계선에서 반으로 잘리는 결함 방지 */
      .prose p, 
      .prose li, 
      .prose h1, 
      .prose h2, 
      .prose h3, 
      .prose h4, 
      .prose h5, 
      .prose h6, 
      .prose pre, 
      .prose code, 
      .prose blockquote, 
      .prose figure, 
      .prose img {
        page-break-inside: avoid !important;
        break-inside: avoid-page !important;
      }

      .page-break-indicator,
      .page-break-line-before::before,
      .page-break::before,
      tr.table-page-break-line-before > td:first-child::before {
        display: none !important;
      }
      .page-break-line-before,
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
        margin-top: 0 !important;
      }
      tr.table-page-break-line-before > td {
        border-top: none !important;
        padding-top: 12px !important;
      }
      table {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      thead {
        display: table-header-group !important;
      }
      tfoot {
        display: table-footer-group !important;
      }
    `;
    clone.appendChild(styleEl);

    // 💡 [사용자 지정 CSS 프로필 주입] 서식 정의에서 설정한 실시간 디자인 규격(글꼴, 인용문 배경색, 제목 관보선 등)을 PDF에 그대로 박아넣습니다.
    if (dynamicCssString) {
      const profileStyleEl = document.createElement('style');
      profileStyleEl.innerHTML = dynamicCssString;
      clone.appendChild(profileStyleEl);
    }

    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.pdf`;

    const opt = {
      margin: 0,
      filename,
      enableLinks: true,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: (orientation || 'portrait') as 'portrait' | 'landscape' },
      pagebreak: { 
        mode: ['css', 'legacy'], 
        before: ['.page-break', '.page-break-line-before', 'tr.table-page-break-line-before'] 
      }, // 💡 선택자를 명시하여 강제 페이지 분할 100% 보장
    };

    const pdfBlob: Blob = await html2pdf().from(clone).set(opt).output('blob');

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
export async function exportHTML({ previewEl, currentFileName, isDarkMode, showToast, dynamicCssString }: ExportOptions) {
  try {
    const targetEl = previewEl.querySelector('.markdown-viewer-root') as HTMLElement || previewEl;
    const clone = clonePreview(targetEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}.html`;

    const finalHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: ${isDarkMode ? '#0d1117' : '#ffffff'};
      color: ${isDarkMode ? '#c9d1d9' : '#1f2328'};
      padding: 2rem;
    }
    .prose { max-width: 48rem; margin: 0 auto; }
    
    /* HTML 내보내기 시 가로 분할선 가이드 감춤 */
    .page-break-indicator,
    .page-break-line-before::before,
    .page-break::before {
      display: none !important;
    }
    .page-break-line-before {
      margin-top: 1.5rem !important;
    }
    
    /* 🏛️ 사용자 지정 CSS 프로필 주입 */
    ${dynamicCssString || ''}
  </style>
</head>
<body>
  <div class="prose ${isDarkMode ? 'prose-invert' : ''}">
    ${clone.innerHTML}
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
export async function exportEPUB({ previewEl, currentFileName, showToast }: ExportOptions) {
  try {
    showToast('EPUB 내보내기 준비 중...', 'info');
    const { generateEpub, downloadBlob } = await import('@/lib/epubGenerator');

    const clone = clonePreview(previewEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    const epubTitle = currentFileName.replace(/\.[^/.]+$/, '') || 'document';
    const filename = `${epubTitle}.epub`;

    const blob = await generateEpub({ title: epubTitle, contentHtml: clone.innerHTML });

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
            showToast('EPUB 내보내기 실패: ' + err.message, 'error');
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
    showToast('EPUB 내보내기 실패: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// PNG 내보내기
// ─────────────────────────────────────────────
export async function exportPNG({ previewEl, currentFileName, isDarkMode, showToast }: ExportOptions) {
  try {
    showToast('이미지 내보내기 준비 중...', 'info');
    const htmlToImage = await import('html-to-image');
    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.png`;

    const clone = clonePreview(previewEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가
    
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
    const originalWidth = Math.max(previewEl.clientWidth || 800, 100);
    
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
    `;
    wrapper.style.backgroundColor = isDarkMode ? '#0d1117' : '#ffffff';
    wrapper.style.color = isDarkMode ? '#c9d1d9' : '#1f2328';
    wrapper.className = `p-10 prose ${isDarkMode ? 'prose-invert' : ''}`;
    
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
      backgroundColor: isDarkMode ? '#0d1117' : '#ffffff',
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
