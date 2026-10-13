export type MediaKind = 'video' | 'map';
const decode = (text: string) => text.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
export function mediaDetails(source: string) {
  const tag = source.trim().match(/^<(video|iframe)\b([^>]*)>[\s\S]*<\/\1>\s*$/i);
  if (!tag) return null;
  const attrs: Record<string,string> = {};
  tag[2].replace(/([\w-]+)\s*=\s*(["'])(.*?)\2/g, (_all,key,_quote,value) => { attrs[key.toLowerCase()] = decode(value); return ''; });
  if (!attrs.src) return null;
  const style = attrs.style || '';
  const width = style.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i)?.[1]?.trim() || attrs.width || '';
  const height = style.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i)?.[1]?.trim() || attrs.height || '';
  const kind: MediaKind = /https?:\/\/(?:maps\.google\.[^/]+|(?:www\.)?google\.[^/]+\/maps|(?:www\.)?openstreetmap\.org\/export)/i.test(attrs.src) ? 'map' : 'video';
  return { kind, element:tag[1].toLowerCase(), path:attrs.src, title:attrs.title || '', width, height, align:attrs['data-align'] || 'center' };
}
const escape = (text: string) => text.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function videoMarkup(path: string, width: string, height: string, align: string, title: string) {
  const id = path.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?v=))([\w-]{11})/)?.[1];
  const style = `width:${width}; height:${height}; border:0;`;
  return id
    ? `<iframe src="https://www.youtube.com/embed/${id}" title="${escape(title)}" style="${style}" allowfullscreen loading="lazy" data-align="${align}"></iframe>`
    : `<video src="${escape(path)}" title="${escape(title)}" controls style="${style}" data-align="${align}"></video>`;
}
export async function copyMediaSource(source: string) {
  const api = (window as any).electronAPI;
  if (api?.copyTextToClipboard) await api.copyTextToClipboard(source.trim());
  else await navigator.clipboard.writeText(source.trim());
}
