// ====================================================================
// 📊 [OMD-IO-exportMediaHelper-0001] exportMediaHelper.ts
// 🎯 @KICK  : DOCX 및 HWPX 내보내기 시 미리보기 내 이미지(IMG) 및 다이어그램(Mermaid SVG) 추출·PNG 래스터라이즈 엔진
// 🛡️ @GUARD : 2x 고해상도 캔버스 래스터라이즈, Base64/Blob/SVG 완전 변환, 캡션([그림 N]) 지능형 추출 연동
// 🚨 @PATCH : **2026-10-01** — [DOCX/HWPX Mermaid 다이어그램 이미지 완벽 임베딩]: SVG Base64 DataURL 래스터라이즈 파이프라인으로 전환하여 브라우저 SVG 보안 차단 버그를 해소하고, Mermaid 래퍼 블록을 클론 DOM에서 정규 이미지 블록으로 즉시 치환하여 Word 및 한글에서 다이어그램이 100% 온전히 이미지로 임베딩되도록 조치
// 🚨 @PATCH : **2026-10-01** — MS Word(.docx) 및 한글(.hwpx) 이미지·다이어그램 임베딩용 미디어 추출기 신규 개발
// 🔗 @CALLS : HTMLCanvasElement, XMLSerializer
// ====================================================================

export interface ExtractedImage {
  id: number;
  buffer: ArrayBuffer;
  width: number;
  height: number;
  caption?: string;
  alt?: string;
  src?: string;
  filename?: string;
  isMermaid?: boolean;
}

/**
 * HTMLImageElement로부터 바이너리(ArrayBuffer)와 픽셀 치수를 추출
 */
export async function imgElementToPng(imgEl: HTMLImageElement): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> {
  const w = imgEl.naturalWidth || imgEl.width || 600;
  const h = imgEl.naturalHeight || imgEl.height || 400;

  // 1) Data URL (Base64)인 경우 직접 버퍼 변환 시도
  if (imgEl.src && imgEl.src.startsWith('data:image/')) {
    try {
      const parts = imgEl.src.split(',');
      if (parts.length === 2) {
        const raw = atob(parts[1]);
        const u8 = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
          u8[i] = raw.charCodeAt(i);
        }
        return { buffer: u8.buffer, width: w, height: h };
      }
    } catch (e) {
      console.warn('[exportMediaHelper] DataURL decode fallback to canvas:', e);
    }
  }

  // 2) Blob URL인 경우 fetch로 직접 버퍼 획득 시도
  if (imgEl.src && imgEl.src.startsWith('blob:')) {
    try {
      const resp = await fetch(imgEl.src);
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        if (buf && buf.byteLength > 0) {
          return { buffer: buf, width: w, height: h };
        }
      }
    } catch (e) {
      console.warn('[exportMediaHelper] Blob fetch fallback to canvas:', e);
    }
  }

  // 3) Canvas 래스터라이즈 (가장 안전하고 표준적인 PNG 변환)
  try {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(imgEl, 0, 0, w, h);
    return await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          blob.arrayBuffer().then((buf) => resolve({ buffer: buf, width: w, height: h }));
        } else {
          resolve(null);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.warn('[exportMediaHelper] Canvas drawImage failed:', err);
    return null;
  }
}

/**
 * SVGElement(Mermaid 다이어그램 등)를 2x 고해상도 PNG ArrayBuffer로 래스터라이즈
 */
export async function svgElementToPng(svgEl: SVGElement): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> {
  return new Promise((resolve) => {
    try {
      let svgWidth = 800;
      let svgHeight = 600;
      const viewBox = svgEl.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[ ,]+/);
        if (parts.length === 4) {
          svgWidth = parseFloat(parts[2]);
          svgHeight = parseFloat(parts[3]);
        }
      } else {
        const attrWidth = svgEl.getAttribute('width');
        const attrHeight = svgEl.getAttribute('height');
        if (attrWidth && attrHeight) {
          svgWidth = parseFloat(attrWidth);
          svgHeight = parseFloat(attrHeight);
        } else {
          const rect = svgEl.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            svgWidth = rect.width;
            svgHeight = rect.height;
          }
        }
      }

      if (!svgWidth || isNaN(svgWidth) || svgWidth <= 0) svgWidth = 800;
      if (!svgHeight || isNaN(svgHeight) || svgHeight <= 0) svgHeight = 600;

      const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
      svgClone.removeAttribute('style');
      svgClone.style.maxWidth = 'none';
      svgClone.style.width = `${svgWidth}px`;
      svgClone.style.height = `${svgHeight}px`;
      svgClone.setAttribute('width', svgWidth.toString());
      svgClone.setAttribute('height', svgHeight.toString());

      // 2배율(Retina) 스케일링으로 선명한 고품질 인쇄/워드 화질 확보
      const scale = 2;
      const canvasW = Math.max(100, Math.round(svgWidth * scale));
      const canvasH = Math.max(100, Math.round(svgHeight * scale));

      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(svgClone);
      if (!svgStr.includes('xmlns=')) {
        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const img = new Image();
      const base64Data = btoa(unescape(encodeURIComponent(svgStr)));
      const dataUrl = `data:image/svg+xml;base64,${base64Data}`;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.drawImage(img, 0, 0, canvasW, canvasH);

            canvas.toBlob((blob) => {
              if (blob) {
                blob.arrayBuffer().then((buf) => {
                  resolve({ buffer: buf, width: Math.round(svgWidth), height: Math.round(svgHeight) });
                }).catch(() => resolve(null));
              } else {
                resolve(null);
              }
            }, 'image/png');
          } else {
            resolve(null);
          }
        } catch (e) {
          console.warn('[exportMediaHelper] Canvas drawImage/toBlob failed:', e);
          resolve(null);
        }
      };

      img.onerror = (err) => {
        console.warn('[exportMediaHelper] Image load failed for SVG data URL:', err);
        resolve(null);
      };

      img.src = dataUrl;
    } catch (err) {
      console.warn('[exportMediaHelper] svgElementToPng unexpected error:', err);
      resolve(null);
    }
  });
}

/**
 * 라이브 DOM과 클론 DOM을 대조 스캔하여 모든 이미지 및 다이어그램 바이너리를 추출하고 클론에 태그 주입
 */
export async function extractMediaFromElements(
  liveContainer: HTMLElement,
  cloneContainer: HTMLElement
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = [];
  let nextId = 1;

  // 1. Mermaid 다이어그램 스캔 (.mermaid-svg-container 또는 .mermaid-block-container)
  const liveBoxes = Array.from(liveContainer.querySelectorAll('.mermaid-svg-container, .mermaid-block-container'));
  const cloneBoxes = Array.from(cloneContainer.querySelectorAll('.mermaid-svg-container, .mermaid-block-container'));

  for (let i = 0; i < liveBoxes.length; i++) {
    const liveBox = liveBoxes[i] as HTMLElement;
    const cloneBox = cloneBoxes[i] as HTMLElement;
    if (!liveBox || !cloneBox) continue;

    const liveSvg = liveBox.querySelector('svg');
    if (!liveSvg) continue;

    const res = await svgElementToPng(liveSvg);
    if (res && res.buffer && res.buffer.byteLength > 0) {
      const id = nextId++;
      
      // 다이어그램 캡션 또는 이전/이후 제목 탐색
      let caption = '';
      const parentBlock = cloneBox.closest('.group') || cloneBox.closest('.relative') || cloneBox.parentElement || cloneBox;
      const prevEl = parentBlock.previousElementSibling;
      if (prevEl && /^\[.*\]$/.test((prevEl.textContent || '').trim())) {
        caption = (prevEl.textContent || '').trim();
        prevEl.setAttribute('data-export-caption-merged', 'true');
      } else {
        const nextEl = parentBlock.nextElementSibling;
        if (nextEl && /^(\[|\()?(그림|Figure)\s*\d+/i.test((nextEl.textContent || '').trim())) {
          caption = (nextEl.textContent || '').trim();
          nextEl.setAttribute('data-export-caption-merged', 'true');
        }
      }

      images.push({
        id,
        buffer: res.buffer,
        width: res.width,
        height: res.height,
        caption: caption || undefined,
        alt: caption || '다이어그램',
        src: 'mermaid',
        filename: 'mermaid',
        isMermaid: true,
      });

      // 클론 DOM에서 부모 블록 전체를 깨끗한 figure 엘리먼트로 치환하여 툴바/버튼 텍스트 제거 및 이미지 블록화
      try {
        const figureEl = cloneBox.ownerDocument.createElement('figure');
        figureEl.setAttribute('data-export-img-id', String(id));
        figureEl.setAttribute('data-export-img-w', String(res.width));
        figureEl.setAttribute('data-export-img-h', String(res.height));
        if (caption) figureEl.setAttribute('data-export-caption', caption);

        const imgEl = cloneBox.ownerDocument.createElement('img');
        imgEl.setAttribute('data-export-img-id', String(id));
        imgEl.setAttribute('alt', caption || '다이어그램');
        figureEl.appendChild(imgEl);

        parentBlock.replaceWith(figureEl);
      } catch {
        cloneBox.setAttribute('data-export-img-id', String(id));
        cloneBox.setAttribute('data-export-img-w', String(res.width));
        cloneBox.setAttribute('data-export-img-h', String(res.height));
        if (caption) cloneBox.setAttribute('data-export-caption', caption);
      }
    }
  }

  // 2. 표준 이미지 스캔 (img 태그 및 figure - 위에서 치환된 export 이미지는 제외)
  const liveImgs = Array.from(liveContainer.querySelectorAll('img:not([data-export-img-id])'));
  const cloneImgs = Array.from(cloneContainer.querySelectorAll('img:not([data-export-img-id])'));

  for (let i = 0; i < liveImgs.length; i++) {
    const liveImg = liveImgs[i] as HTMLImageElement;
    const cloneImg = cloneImgs[i] as HTMLImageElement;
    if (!liveImg || !cloneImg) continue;

    // 아이콘, 로고 등 24px 이하 극소 에셋은 제외
    const w = liveImg.naturalWidth || liveImg.width || 0;
    const h = liveImg.naturalHeight || liveImg.height || 0;
    if (w > 0 && w < 24 && h > 0 && h < 24) continue;

    const res = await imgElementToPng(liveImg);
    if (res && res.buffer && res.buffer.byteLength > 0) {
      const id = nextId++;

      // 캡션 감지: figcaption 또는 alt 또는 직후 p ([그림 N] ...)
      let caption = '';
      const parentFigure = cloneImg.closest('figure');
      const figcaption = parentFigure ? parentFigure.querySelector('figcaption') : null;
      if (figcaption && figcaption.textContent) {
        caption = figcaption.textContent.trim();
      } else {
        // 직후 형제 요소가 [그림 N] 형식인지 검사
        const nextElem = parentFigure ? parentFigure.nextElementSibling : cloneImg.nextElementSibling;
        if (nextElem && /^(\[|\()?(그림|Figure)\s*\d+/i.test((nextElem.textContent || '').trim())) {
          caption = (nextElem.textContent || '').trim();
          nextElem.setAttribute('data-export-caption-merged', 'true');
        } else if (cloneImg.alt && !cloneImg.alt.startsWith('image') && cloneImg.alt.length > 2) {
          caption = cloneImg.alt.trim();
        }
      }

      const rawSrc = liveImg.getAttribute('src') || liveImg.src || '';
      const fname = decodeURIComponent(rawSrc.split(/[/\\]/).pop()?.split('?')[0] || '');

      images.push({
        id,
        buffer: res.buffer,
        width: res.width,
        height: res.height,
        caption: caption || undefined,
        alt: cloneImg.alt || '이미지',
        src: rawSrc,
        filename: fname,
        isMermaid: false,
      });

      const targetEl = parentFigure || cloneImg;
      targetEl.setAttribute('data-export-img-id', String(id));
      targetEl.setAttribute('data-export-img-w', String(res.width));
      targetEl.setAttribute('data-export-img-h', String(res.height));
      if (caption) targetEl.setAttribute('data-export-caption', caption);
    }
  }

  return images;
}
