import { getApiUrl } from '@/lib/api';
import { msg } from '@/lib/msg';

interface ExportOptions {
  previewEl: HTMLElement;
  currentFileName: string;
  isDarkMode: boolean;
  showToast: (msg: string, type?: any) => void;
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

/** 상대 경로(/~) 이미지를 Base64 Data URI로 인라인 임베딩 (내보내기 시 이미지 깨짐 방지) */
async function inlineLocalImages(clone: HTMLElement): Promise<void> {
  const imgs = Array.from(clone.querySelectorAll('img'));
  await Promise.all(imgs.map(async (img) => {
    const src = img.getAttribute('src') || '';
    // 이미 Data URI이거나 외부 http(s) URL이면 스킵
    if (!src || src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) return;

    // 1차 시도: 백엔드의 워크스페이스 정적 서빙 경로 (/api/view/...)
    const absoluteUrl = src.startsWith('/')
      ? getApiUrl(`/api/view${src}`)
      : getApiUrl(`/api/view/${src}`);

    try {
      let resp = await fetch(absoluteUrl);
      
      // 만약 백엔드에서 못 찾으면(404), 프론트엔드의 static 자원 경로로 2차 시도
      if (!resp.ok && src.startsWith('/')) {
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
      msg.error(`Failed to inline image: ${src}`, err);
    }
  }));
}

/** 다운로드 폴더에 파일 백업 */
async function saveToDownloads(filename: string, content: string, type: 'base64' | 'text') {
  const res = await fetch(getApiUrl('/api/save-export'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content, type }),
  });
  return res.ok;
}

// ─────────────────────────────────────────────
// PDF 내보내기
// ─────────────────────────────────────────────
export async function exportPDF({ previewEl, currentFileName, isDarkMode, showToast }: ExportOptions) {
  try {
    showToast('PDF 내보내기 준비 중...', 'info');
    const html2pdf = (await import('html2pdf.js')).default;

    const clone = clonePreview(previewEl);
    await inlineLocalImages(clone); // 이미지 Base64 인라인 변환 추가

    const filename = `${currentFileName.replace(/\.[^/.]+$/, '')}.pdf`;

    const opt = {
      margin: 10,
      filename,
      enableLinks: true,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    const pdfBlob: Blob = await html2pdf().from(clone).set(opt).output('blob');

    // 브라우저 다운로드
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);

    // 다운로드 폴더 저장
    const reader = new FileReader();
    reader.onloadend = async () => {
      const ok = await saveToDownloads(filename, reader.result as string, 'base64');
      showToast(ok ? '다운로드 폴더에 PDF가 생성되었습니다.' : 'PDF 내보내기가 완료되었습니다.', 'success');
    };
    reader.readAsDataURL(pdfBlob);
  } catch (err: any) {
    msg.error('PDF export error', err);
    showToast('PDF 내보내기 실패: ' + err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// HTML 내보내기
// ─────────────────────────────────────────────
export async function exportHTML({ previewEl, currentFileName, isDarkMode, showToast }: ExportOptions) {
  try {
    const clone = clonePreview(previewEl);
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
  </style>
</head>
<body>
  <div class="prose ${isDarkMode ? 'prose-invert' : ''}">
    ${clone.innerHTML}
  </div>
</body>
</html>`;

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
    downloadBlob(blob, filename);

    // 다운로드 폴더 저장
    const reader = new FileReader();
    reader.onloadend = async () => {
      const ok = await saveToDownloads(filename, reader.result as string, 'base64');
      showToast(ok ? '다운로드 폴더에 EPUB이 생성되었습니다.' : 'EPUB 내보내기가 완료되었습니다.', 'success');
    };
    reader.readAsDataURL(blob);
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

    // 브라우저 다운로드
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    // 다운로드 폴더 저장
    const ok = await saveToDownloads(filename, dataUrl, 'base64');
    showToast(ok ? '다운로드 폴더에 PNG가 생성되었습니다.' : '이미지 내보내기가 완료되었습니다.', 'success');
  } catch (err: any) {
    msg.error('PNG export error', err);
    showToast('PNG 내보내기 실패: ' + err.message, 'error');
  }
}
