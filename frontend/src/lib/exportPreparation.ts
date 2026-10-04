export const EXPORT_RESOURCE_TIMEOUT_MS = 15_000;

export function exportContentFingerprint(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return `${value.length}:${hash >>> 0}`;
}

export async function waitForExportContent(root: HTMLElement, expected: string): Promise<void> {
  const deadline = Date.now() + EXPORT_RESOURCE_TIMEOUT_MS;
  while (root.querySelector('.markdown-viewer-root')?.getAttribute('data-export-content') !== exportContentFingerprint(expected)) {
    if (Date.now() >= deadline) throw new Error('최신 편집 내용의 미리보기를 준비하지 못했습니다. 미리보기를 확인하고 다시 내보내 주세요.');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export async function withExportTimeout<T>(operation: Promise<T>, label: string, timeoutMs = EXPORT_RESOURCE_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([operation, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} 준비 시간이 초과되었습니다. 잠시 후 다시 내보내 주세요.`)), timeoutMs);
    })]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function waitForExportResources(root: HTMLElement, timeoutMs = EXPORT_RESOURCE_TIMEOUT_MS): Promise<void> {
  const doc = root.ownerDocument;
  const work = async () => {
    if (doc.fonts) await doc.fonts.ready;
    if (doc.fonts && typeof doc.fonts[Symbol.iterator] === 'function' && doc.defaultView) {
      const failedFonts = Array.from(doc.fonts).filter(face => face.status === 'error');
      if (failedFonts.length) {
        const usedFamilies = [root, ...Array.from(root.querySelectorAll('*'))]
          .map(element => doc.defaultView!.getComputedStyle(element).fontFamily.replace(/["']/g, '').toLowerCase());
        const failed = failedFonts.find(face => usedFamilies.some(family => family.split(',').map(name => name.trim()).includes(face.family.replace(/["']/g, '').toLowerCase())));
        if (failed) throw new Error(`문서 글꼴 (${failed.family})을 불러오지 못했습니다. 연결 상태나 글꼴 설정을 확인해 주세요.`);
      }
    }
    const images = Array.from(root.querySelectorAll('img'));
    await Promise.all(images.map(async (image, index) => {
      image.loading = 'eager';
      try {
        if (typeof image.decode === 'function') await image.decode();
        else if (!image.complete) await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('image load failed'));
        });
        if (!image.naturalWidth || !image.naturalHeight) throw new Error('empty image');
      } catch {
        throw new Error(`${index + 1}번째 이미지${image.alt ? ` (${image.alt})` : ''}를 준비하지 못했습니다. 이미지가 표시되는지 확인해 주세요.`);
      }
    }));
  };
  await withExportTimeout(work(), '폰트 및 이미지', timeoutMs);
}

/** Allow React to commit the final input and wait for explicitly tracked diagrams. */
export async function prepareExportPreview(root: HTMLElement): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const deadline = Date.now() + EXPORT_RESOURCE_TIMEOUT_MS;
  while (root.querySelector('[data-export-state="loading"]')) {
    if (Date.now() >= deadline) throw new Error('이미지 또는 다이어그램 준비 시간이 초과되었습니다. 미리보기를 확인하고 다시 내보내 주세요.');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  if (root.querySelector('[data-export-state="error"]')) throw new Error('이미지 또는 다이어그램에 오류가 있습니다. 원문과 파일 경로를 확인한 뒤 내보내 주세요.');
  await waitForExportResources(root);
}

export async function fetchExportImage(url: string, timeoutMs = EXPORT_RESOURCE_TIMEOUT_MS): Promise<Blob> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`이미지 다운로드 실패 (${response.status})`);
    const blob = await response.blob();
    if (!blob.size || !blob.type.startsWith('image/')) throw new Error('이미지 대신 잘못된 데이터가 반환되었습니다.');
    return blob;
  } finally {
    clearTimeout(timer);
  }
}

export async function exportBlobToDataUrl(blob: Blob): Promise<string> {
  return withExportTimeout(new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('이미지 변환 실패'));
    reader.onerror = () => reject(new Error('이미지 데이터를 읽지 못했습니다.'));
    reader.onabort = () => reject(new Error('이미지 변환이 중단되었습니다.'));
    reader.readAsDataURL(blob);
  }), '이미지 변환');
}
