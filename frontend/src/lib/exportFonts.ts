import { getLocalFontSources, rememberLocalFontSources } from './localFontSources';

// Successful downloads are shared across exports; failures remain retryable.
const fontDataCache = new Map<string, string>();
const cssCache = new Map<string, string>();
const localDataCache = new WeakMap<object, string>();

/** Carry fonts used by the document into detached print windows and exported files. */
export async function embedExportFonts(root: HTMLElement): Promise<string> {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return '';
  const normalizeFamily = (name: string) => name.trim().replace(/["']/g, '').toLowerCase();
  const loadedFamilies = doc.fonts && typeof doc.fonts[Symbol.iterator] === 'function'
    ? new Set(Array.from(doc.fonts).filter(face => face.status === 'loaded').map(face => normalizeFamily(face.family))) : null;
  const families = new Set([root, ...Array.from(root.querySelectorAll('*'))].flatMap(el => {
    const names = view.getComputedStyle(el).fontFamily.split(',').map(normalizeFamily);
    return names.filter((name, index) => index === 0 || !loadedFamilies || loadedFamilies.has(name));
  }));
  const visited = new Set<string>();
  const externalSheets = new Set<string>();
  const codepoints = Array.from(root.textContent || '').map(char => char.codePointAt(0)!);
  const faces = new Map<string, string>();
  const embeddedFamilies = new Set<string>();
  const request = async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.blob();
    } finally { clearTimeout(timer); }
  };
  const parse = async (css: string, base: string) => {
    for (const match of Array.from(css.matchAll(/@font-face\s*\{[^}]*\}/gi))) {
      const rule = match[0];
      const family = /font-family\s*:\s*([^;}]*)/i.exec(rule)?.[1].trim().replace(/["']/g, '').toLowerCase();
      if (!family || !families.has(family)) continue;
      const weight = /font-weight\s*:\s*([^;}]+)/i.exec(rule)?.[1].trim() || 'normal';
      const loadedFaces = doc.fonts && typeof doc.fonts[Symbol.iterator] === 'function'
        ? Array.from(doc.fonts).filter(face => face.status === 'loaded' && normalizeFamily(face.family) === family && face.weight) : [];
      if (loadedFaces.length && !loadedFaces.some(face => face.weight === weight)) continue;
      const unicodeRange = /unicode-range\s*:\s*([^;}]+)/i.exec(rule)?.[1];
      if (unicodeRange && !codepoints.some(point => unicodeRange.split(',').some(range => {
        const value = range.trim().replace(/^U\+/i, '');
        const parts = value.includes('?') ? [value.replace(/\?/g, '0'), value.replace(/\?/g, 'F')] : value.split('-');
        const start = parseInt(parts[0], 16);
        const end = parseInt(parts[1] || parts[0], 16);
        return point >= start && point <= end;
      }))) continue;
      let embedded = rule;
      for (const resource of Array.from(rule.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi))) {
        if (resource[1].startsWith('data:')) continue;
        const url = new URL(resource[1], base).href;
        let data = faces.get(url) || fontDataCache.get(url);
        if (!data) {
          try {
            const blob = await request(url);
            if (!blob.size || /text\/html|application\/json/i.test(blob.type)) throw new Error('Invalid font response');
            data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(blob);
            });
            faces.set(url, data);
            if (fontDataCache.size >= 64) fontDataCache.delete(fontDataCache.keys().next().value!);
            fontDataCache.set(url, data);
          } catch {
            throw new Error(`내보내기 글꼴 (${family}) 파일을 가져오지 못했습니다. 인터넷 연결과 글꼴 배포 경로를 확인해 주세요.`);
          }
        }
        embedded = embedded.replace(resource[0], `url("${data}")`);
      }
      output.add(embedded);
      embeddedFamilies.add(family);
    }
    for (const match of Array.from(css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/gi))) {
      externalSheets.add(new URL(match[1], base).href);
    }
  };
  const readUrl = async (url: string) => {
    if (visited.has(url)) return;
    visited.add(url);
    let css: string;
    try {
      css = cssCache.get(url) || await (await request(url)).text();
      if (cssCache.size >= 32) cssCache.delete(cssCache.keys().next().value!);
      cssCache.set(url, css);
    }
    catch { return; } // Cross-origin optional sheets may be blocked; local font failures above remain explicit.
    await parse(css, url);
  };
  const output = new Set<string>();
  for (const sheet of Array.from(doc.styleSheets)) {
    const base = sheet.href || doc.baseURI;
    let css: string;
    try { css = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); }
    catch { if (sheet.href) externalSheets.add(sheet.href); continue; }
    await parse(css, base);
  }
  for (let index = 0; index < externalSheets.size; index++) {
    const url = Array.from(externalSheets)[index];
    if (loadedFamilies && !Array.from(families).some(family => loadedFamilies.has(family) && !embeddedFamilies.has(family))) break;
    await readUrl(url);
  }
  // Reuse the user's already approved Local Font Access permission after reopening the app.
  if (!getLocalFontSources().length && 'queryLocalFonts' in view) {
    try {
      const permission = await navigator.permissions.query({ name: 'local-fonts' as PermissionName });
      if (permission.state === 'granted') rememberLocalFontSources(await (view as any).queryLocalFonts());
    } catch { /* Browsers without Local Font Access retain system-font rendering. */ }
  }
  for (const font of getLocalFontSources()) {
    const family = font.family.toLowerCase();
    if (!families.has(family) || embeddedFamilies.has(family)) continue;
    try {
      let data = localDataCache.get(font);
      if (!data) {
        const blob = await font.blob();
        if (!blob.size) throw new Error('Empty font');
        data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        localDataCache.set(font, data);
      }
      const style = `${font.style || ''} ${font.fullName || ''}`;
      const weight = /black|heavy/i.test(style) ? 900 : /extra.?bold/i.test(style) ? 800 : /semi.?bold|demi/i.test(style) ? 600 : /bold/i.test(style) ? 700 : /medium/i.test(style) ? 500 : /extra.?light/i.test(style) ? 200 : /light/i.test(style) ? 300 : /thin/i.test(style) ? 100 : 400;
      output.add(`@font-face { font-family:${JSON.stringify(font.family)}; src:url("${data}"); font-weight:${weight}; font-style:${/italic|oblique/i.test(style) ? 'italic' : 'normal'}; }`);
    } catch {
      throw new Error(`사용자 글꼴 (${font.family})을 내보내기에 포함하지 못했습니다. 글꼴 선택창에서 접근 권한을 확인해 주세요.`);
    }
  }
  return Array.from(output).join('\n');
}
