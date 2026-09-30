// ====================================================================
// 📊 [OMD-IO-exportMediaHelper-0001] exportMediaHelper.ts
// 🎯 @KICK  : DOCX 및 HWPX 내보내기 시 미리보기 내 이미지(IMG) 및 다이어그램(Mermaid SVG) 추출·PNG 래스터라이즈 엔진
// 🛡️ @GUARD : 2x 고해상도 캔버스 래스터라이즈, Base64/Blob/SVG 완전 변환, 캡션([그림 N]) 지능형 추출 연동
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
      const bbox = svgEl.getBoundingClientRect();
      const viewBox = (svgEl as any).viewBox?.baseVal;
      const origW = viewBox?.width || bbox.width || svgEl.clientWidth || 800;
      const origH = viewBox?.height || bbox.height || svgEl.clientHeight || 500;

      // 2배율(Retina) 스케일링으로 선명한 고품질 인쇄/워드 화질 확보
      const scale = 2;
      const canvasW = Math.max(100, Math.round(origW * scale));
      const canvasH = Math.max(100, Math.round(origH * scale));

      const serializer = new XMLSerializer();
      let svgStr = serializer.serializeToString(svgEl);
      if (!svgStr.includes('xmlns=')) {
        svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

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
              URL.revokeObjectURL(blobUrl);
              if (blob) {
                blob.arrayBuffer().then((buf) => {
                  resolve({ buffer: buf, width: Math.round(origW), height: Math.round(origH) });
                });
              } else {
                resolve(null);
              }
            }, 'image/png');
          } else {
            URL.revokeObjectURL(blobUrl);
            resolve(null);
          }
        } catch {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      };

      img.src = blobUrl;
    } catch {
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

  // 1. Mermaid 다이어그램 스캔 (.mermaid-svg-container 또는 svg.mermaid)
  const liveMermaids = Array.from(liveContainer.querySelectorAll('.mermaid-svg-container svg, .mermaid-block-container svg'));
  const cloneMermaids = Array.from(cloneContainer.querySelectorAll('.mermaid-svg-container, .mermaid-block-container'));

  for (let i = 0; i < liveMermaids.length; i++) {
    const liveSvg = liveMermaids[i] as SVGElement;
    const cloneWrapper = cloneMermaids[i] as HTMLElement;
    if (!liveSvg || !cloneWrapper) continue;

    const res = await svgElementToPng(liveSvg);
    if (res && res.buffer && res.buffer.byteLength > 0) {
      const id = nextId++;
      
      // 다이어그램 캡션 또는 이전 제목 탐색
      let caption = '';
      const prevEl = cloneWrapper.previousElementSibling;
      if (prevEl && /^\[.*\]$/.test((prevEl.textContent || '').trim())) {
        caption = (prevEl.textContent || '').trim();
        prevEl.setAttribute('data-export-caption-merged', 'true');
      }

      images.push({
        id,
        buffer: res.buffer,
        width: res.width,
        height: res.height,
        caption: caption || undefined,
        alt: '다이어그램',
      });

      // 클론 엘리먼트에 마킹
      cloneWrapper.setAttribute('data-export-img-id', String(id));
      cloneWrapper.setAttribute('data-export-img-w', String(res.width));
      cloneWrapper.setAttribute('data-export-img-h', String(res.height));
      if (caption) cloneWrapper.setAttribute('data-export-caption', caption);
    }
  }

  // 2. 표준 이미지 스캔 (img 태그 및 figure)
  const liveImgs = Array.from(liveContainer.querySelectorAll('img'));
  const cloneImgs = Array.from(cloneContainer.querySelectorAll('img'));

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

      images.push({
        id,
        buffer: res.buffer,
        width: res.width,
        height: res.height,
        caption: caption || undefined,
        alt: cloneImg.alt || '이미지',
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
