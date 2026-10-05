const HH = 'http://www.hancom.co.kr/hwpml/2011/head';

/** Extend the bundled header without creating dangling character references. */
export function buildHwpxHeader(template: string, defaultFont?: string): string {
  const doc = new DOMParser().parseFromString(template, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('한글 문서 서식 정보를 읽지 못했습니다.');
  const chars = doc.getElementsByTagNameNS(HH, 'charProperties')[0];
  const base = chars.children[0];
  const font = defaultFont?.split(',')[0].trim().replace(/["']/g, '') || '함초롬돋움';
  for (const el of Array.from(doc.getElementsByTagNameNS(HH, 'font'))) el.setAttribute('face', font);
  const definitions: [number, number, string?][] = [[10,1100,'bold'],[11,1100,'italic'],[12,1000],[13,1100],[14,2200,'bold'],[15,1800,'bold'],[16,1500,'bold'],[17,1200,'bold']];
  for (const [id, size, emphasis] of definitions) {
    const existing = Array.from(chars.children).find(el=>el.getAttribute('id')===String(id));
    existing?.remove();
    const style = base.cloneNode(true) as Element;
    style.setAttribute('id', String(id));
    style.setAttribute('height', String(size));
    style.setAttribute('textColor', id >= 14 || id === 13 ? '#0055AA' : '#000000');
    for (const el of Array.from(style.getElementsByTagNameNS(HH,'fontRef'))) for (const attr of Array.from(el.attributes)) el.setAttribute(attr.name,'0');
    if (emphasis && !style.getElementsByTagNameNS(HH,emphasis).length) style.append(doc.createElementNS(HH,`hh:${emphasis}`));
    chars.append(style);
  }
  chars.setAttribute('itemCnt',String(chars.children.length));
  const paras = doc.getElementsByTagNameNS(HH,'paraProperties')[0];
  for (const [id,alignment,keepNext] of [[20,'LEFT',false],[21,'CENTER',false],[22,'LEFT',false],[23,'LEFT',true],[24,'LEFT',true]] as const) {
    const style = paras.children[0].cloneNode(true) as Element;
    style.setAttribute('id',String(id));
    for (const align of Array.from(style.getElementsByTagNameNS(HH,'align'))) align.setAttribute('horizontal',alignment);
    for (const setting of Array.from(style.getElementsByTagNameNS(HH,'breakSetting'))) {
      setting.setAttribute('keepWithNext', keepNext ? '1' : '0');
      setting.setAttribute('keepLines','1');
    }
    paras.append(style);
  }
  paras.setAttribute('itemCnt',String(paras.children.length));
  return new XMLSerializer().serializeToString(doc);
}
