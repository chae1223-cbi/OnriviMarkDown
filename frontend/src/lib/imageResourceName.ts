/** Preserve chosen file names; clipboard placeholders identify no real file. */
export async function imageResourceName(image: Blob, clipboard = false): Promise<string> {
  const name = image instanceof File ? image.name : '';
  const generic = /^(?:image|blob|clipboard(?:-image)?)(?:\.[a-z0-9]+)?$/i.test(name);
  if (!clipboard && name && !generic && /\.[a-z0-9]+$/i.test(name)) return name;
  const extension = ({'image/jpeg':'jpg','image/webp':'webp','image/gif':'gif','image/svg+xml':'svg','image/avif':'avif','image/bmp':'bmp'} as Record<string,string>)[image.type] || 'png';
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', await image.arrayBuffer()));
  const hash = Array.from(bytes).map(byte=>byte.toString(16).padStart(2,'0')).join('').slice(0,12);
  return `img_${hash}.${extension}`;
}

/** ImageModal supplies path/alt, while the raw scene editor inserts Markdown. */
export function picturebookImageReference(path: string, alt = '사진'): string {
  const text=(alt || '사진').replace(/\\/g,'\\\\').replace(/\[/g,'\\[').replace(/\]/g,'\\]').replace(/[\r\n]/g,' ');
  const target=path.replace(/</g,'%3C').replace(/>/g,'%3E').replace(/[\r\n]/g,'');
  return `![${text}](<${target}>)`;
}
