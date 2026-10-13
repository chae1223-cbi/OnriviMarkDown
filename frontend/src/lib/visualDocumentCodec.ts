/**
 * 프로그램명 : OnriviAuthor 
 * 버전 정보 : 1.0.1
 * 프로그램 ID : oaar-visual-codec
 * 🚨 @PATCH : **2026-10-14** — [수식 블록($$...$$) 및 직후 본문 문단 독립 분할 청킹 개선]:
 *             1) $$ 블록의 시작 줄과 블록 닫힘 직후 본문 시작 줄을 starts 분할 인덱스에 명시 등록하여, $$ 수식 블록 뒤에 빈 줄 없이 본문 텍스트가 바로 이어져도 visual_math와 본문 paragraph가 각각 독립 노드로 온전히 분할 파싱되도록 개선
 *             2) 수식 블록 아래에 곧바로 일반 본문 글을 작성하거나 읽을 수 있도록 블록 경계 완벽 보장
 * 🚨 @PATCH : **2026-10-14** — [인라인 수식(visual_inline_math) 네이티브 인라인 노드 등록 및 양방향 직렬화 지원]:
 *             1) visualSchema.nodes에 visual_inline_math(group: inline, inline: true, atom: true) 등록
 *             2) visualTokenizer에서 $latex$ 구문을 감지하여 math_inline 토큰으로 파싱 및 visualParser 연동
 *             3) visualSerializer에서 visual_inline_math를 $latex$ 인라인 수식으로 무손실 직렬화
 *             4) unsupported 검사에서 인라인 달러($...$) 정규식을 제거하여 인라인 수식 문단이 source_block으로 오분기되는 결함 완전 해소
 * 🚨 @PATCH : **2026-10-14** — [수식(visual_math) 네이티브 블록 노드 등록 및 일반 태그 렌더링 지원]:
 *             1) visualSchema.nodes에 visual_math 노드를 등록하여 수식을 코드블록이 아닌 네이티브 수식 요소로 취급
 *             2) 마크다운 직렬화 시 표준 문법($$\n수식\n$$)으로 직렬화 및 파싱 연동
 *             3) unsupported 검사에서 수식 기호($$)를 제외하여 source_block 오분기 차단
 * 🚨 @PATCH : **2026-10-13** — [마크다운 표(Table) 셀 내 달러($), 각주([^]), 링크, 부등호 기호 등 포함 시 source_block(편집창) 오분기 결함 완전 해소]:
 *             1) nativeTable 판별 조건에서 과도하게 걸려있던 특수기호 차단 정규식(!/!\[|<|\[\^|\$/)을 제거
 *             2) 수식 기호($), 각주 문법([^1]), 링크, 부등호 등이 셀에 포함된 모든 정상 마크다운 표가 네이티브 table 노드로 렌더링되도록 보장
 * 🚨 @PATCH : **2026-10-13** — [하이퍼링크(<a>) 새 창 열기 속성(target="_blank", rel="noopener noreferrer") 및 친절 툴팁 연동]:
 *             1) visualSchema.marks.link의 toDOM에 target="_blank", rel="noopener noreferrer" 속성 명시
 *             2) title 속성이 없을 때도 `${href} (클릭하여 새 창으로 열기)` 안내 툴팁 기본 제공
 * 🚨 @PATCH : **2026-10-13** — [밑줄(<u>) 네이티브 인라인 마크(underline) 지원 및 source_block 오분기 방지]:
 *             1) visualSchema.marks에 underline(tag: 'u') 마크를 정식 등록하여 에디터 본문에서 직접 밑줄 렌더링 및 편집 보장
 *             2) visualTokenizer/visualParser에서 <u>...</u> 태그를 파싱하여 underline 마크로 직접 매핑
 *             3) visualSerializer에서 underline 마크를 <u>...</u>로 무손실 양방향 직렬화
 *             4) unsupported 태그 검사에서 <u>를 제외하여 밑줄 문단이 별도 편집창(source_block)으로 격리되지 않고 본문에서 직접 편집되도록 개선
 */
import { mediaDetails } from './mediaMarkup';
import { Node as DocumentNode, Schema } from 'prosemirror-model';
import { defaultMarkdownParser, defaultMarkdownSerializer, MarkdownParser, MarkdownSerializer, schema as markdownSchema } from 'prosemirror-markdown';

// Unsupported syntax remains an immutable source block. Never round-trip a whole
// existing document through a generic Markdown serializer.
export const visualSchema = new Schema({
  nodes: markdownSchema.spec.nodes.update('list_item',{...markdownSchema.spec.nodes.get('list_item'),attrs:{checked:{default:null}},toDOM:node=>['li',{'data-task-checked':node.attrs.checked===null?undefined:String(node.attrs.checked)},0]}).update('doc', { ...markdownSchema.spec.nodes.get('doc'), attrs: { frontmatter: { default: '' } } }).update('blockquote', { ...markdownSchema.spec.nodes.get('blockquote'), attrs:{alertType:{default:null}}, toDOM:node=>{
    const tag=String(node.attrs.alertType || '').trim().toUpperCase();
    const aliases:Record<string,string>={'참고':'NOTE','참조':'NOTE','메모':'NOTE','알림':'NOTE','팁':'TIP','도움말':'TIP','중요':'IMPORTANT','필독':'IMPORTANT','주의':'WARNING','경고':'CAUTION','위험':'CAUTION'};
    const palette:Record<string,[string,string]>={NOTE:['#eff6ff','#3b82f6'],TIP:['#ecfdf5','#10b981'],IMPORTANT:['#faf5ff','#a855f7'],WARNING:['#fffbeb','#f59e0b'],CAUTION:['#fff1f2','#f43f5e']};
    const colors=palette[aliases[tag] || tag];
    return ['blockquote',{'data-alert-type':node.attrs.alertType || undefined,style:colors?`background-color:${colors[0]}!important;border-left:4px solid ${colors[1]}!important;color:inherit!important;font-style:normal!important;padding:12px!important`:undefined},0];
  } }).addToEnd('source_block', {
    group: 'block', atom: true, selectable: true,
    attrs: { source: { default: '' } },
    toDOM: node => ['div', { class: 'visual-source-block', contenteditable: 'false' },
      ['strong', {}, 'Markdown에서 편집하는 블록'], ['pre', {}, node.attrs.source]],
    parseDOM: [],
  }).addToEnd('visual_image', {
    group: 'block', atom: true, selectable: true, draggable: true,
    attrs: { source: { default: '' } },
    toDOM: node => ['figure', { class: 'visual-image-block', contenteditable: 'false' }, ['img', { src: node.attrs.source.match(/\]\((.*)\)/)?.[1] || '', alt: '' }]],
    parseDOM: [],
  }).addToEnd('visual_media', {
    group:'block', atom:true, selectable:true, draggable:true,
    attrs:{source:{default:''},kind:{default:'video'}},
    toDOM: node => ['div', {class:'visual-media-block',contenteditable:'false'}, ['pre',{},node.attrs.source]],
    parseDOM:[],
  }).addToEnd('visual_math', {
    group: 'block', atom: true, selectable: true, draggable: true,
    attrs: { latex: { default: '' } },
    toDOM: node => ['div', { class: 'visual-math-node', 'data-latex': node.attrs.latex, contenteditable: 'false' }, node.attrs.latex],
    parseDOM: [{ tag: 'div[data-latex]', getAttrs: dom => ({ latex: (dom as HTMLElement).getAttribute('data-latex') || '' }) }],
  }).addToEnd('visual_inline_math', {
    group: 'inline', inline: true, atom: true, selectable: true,
    attrs: { latex: { default: '' } },
    toDOM: node => ['span', { class: 'visual-inline-math', 'data-latex': node.attrs.latex, contenteditable: 'false' }, `$${node.attrs.latex}$`],
    parseDOM: [{ tag: 'span[data-latex]', getAttrs: dom => ({ latex: (dom as HTMLElement).getAttribute('data-latex') || '' }) }],
  }).addToEnd('table', {group:'block',content:'table_row+',isolating:true,toDOM:()=>['table',{class:'visual-editable-table'},['tbody',0]],parseDOM:[{tag:'table'}]})
    .addToEnd('table_row',{content:'(table_header | table_cell)+',toDOM:()=>['tr',0],parseDOM:[{tag:'tr'}]})
    .addToEnd('table_header',{content:'paragraph',isolating:true,attrs:{align:{default:'left'}},toDOM:()=>['th',{style:'text-align:center!important'},0],parseDOM:[{tag:'th'}]})
    .addToEnd('table_cell',{content:'paragraph',isolating:true,attrs:{align:{default:'left'}},toDOM:node=>['td',{style:`text-align:${node.attrs.align}`},0],parseDOM:[{tag:'td',getAttrs:dom=>({align:(dom as HTMLElement).style.textAlign || 'left'})}]}),
  marks: markdownSchema.spec.marks.addToEnd('strike', {
    inclusive:false, parseDOM:[{tag:'s'},{tag:'del'},{style:'text-decoration=line-through'}], toDOM:()=>['s',0],
  }).addToEnd('underline', {
    inclusive:false, parseDOM:[{tag:'u'},{style:'text-decoration=underline'}], toDOM:()=>['u',0],
  })
    .update('strong', { ...markdownSchema.spec.marks.get('strong'), inclusive: false })
    .update('em', { ...markdownSchema.spec.marks.get('em'), inclusive: false })
    .update('code', { ...markdownSchema.spec.marks.get('code'), inclusive: false })
    .update('link', {
    ...markdownSchema.spec.marks.get('link'),
    inclusive: false,
    parseDOM: [{ tag: 'a[href]', getAttrs: dom => {
      const element = dom as HTMLElement;
      const href = element.getAttribute('href') || '';
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) && !/^(https?:|mailto:|tel:)/i.test(href)) return false;
      return { href, title: element.getAttribute('title') };
    } }],
    toDOM(node) {
      const { href, title } = node.attrs;
      return ['a', {
        href,
        title: title || (href ? `${href} (클릭하여 새 창으로 열기)` : undefined),
        target: '_blank',
        rel: 'noopener noreferrer'
      }, 0];
    },
  }),
});

const tokenizer = defaultMarkdownParser.tokenizer.enable(['table','strikethrough']);
const visualTokenizer = Object.create(tokenizer) as typeof tokenizer;
visualTokenizer.parse = (source,environment) => {
  const result = [];
  let tailMarker='ONRIVITAILWHITESPACEPLACEHOLDER';
  while(source.includes(tailMarker))tailMarker+='X';
  // A parser normally drops whitespace/breaks at EOF. Keep them as inline
  // content while parsing, then remove only the temporary marker.
  const trailingNewlines=environment?.preserveTrailingNewlines ? (source.match(/\n+$/)?.[0].length || 0) : 0;
  const parseSource=trailingNewlines ? source.slice(0,-trailingNewlines) : source;
  const prepared=parseSource.replace(/(\\\r?\n)(\s*)$/, '$1'+tailMarker+'$2').replace(/([^\n]*\S[ \t]+)(\r?\n*)$/, '$1'+tailMarker+'$2');
  for(const token of tokenizer.parse(prepared,environment)) {
    if(token.type==='inline' && token.children)for(const child of token.children)if(child.type==='text')child.content=child.content.replaceAll(tailMarker,'');
    const constructor = token.constructor as any;
    if(token.type==='th_close'||token.type==='td_close')result.push(new constructor('paragraph_close','p',-1));
    if (token.type === 'inline' && token.children) {
      token.children = token.children.flatMap(child => {
        if (child.type !== 'text' || !/(<br\s*\/?\s*>|<\/?u[^>]*>|\$(?!\$)[^\n$]+(?<!\$)\$)/i.test(child.content)) return [child];
        const parts = child.content.split(/(<br\s*\/?\s*>|<\/?u[^>]*>|\$(?!\$)[^\n$]+(?<!\$)\$)/i);
        const tokens = [];
        for (const part of parts) {
          if (!part) continue;
          if (/^<br/i.test(part)) tokens.push(new constructor('hardbreak', '', 0));
          else if (/^<u\b/i.test(part)) tokens.push(new constructor('u_open', 'u', 1));
          else if (/^<\/u>/i.test(part)) tokens.push(new constructor('u_close', 'u', -1));
          else if (/^\$(?!\$)[^\n$]+(?<!\$)\$/.test(part)) {
            const mathTok = new constructor('math_inline', '', 0);
            mathTok.content = part.slice(1, -1);
            tokens.push(mathTok);
          } else {
            const next = new constructor('text', '', 0);
            next.content = part;
            tokens.push(next);
          }
        }
        return tokens;
      });
    }
    result.push(token);
    if(token.type==='th_open'||token.type==='td_open')result.push(new constructor('paragraph_open','p',1));
  }
  if(trailingNewlines){
    const inline=[...result].reverse().find(token=>token.type==='inline' && token.level===1);
    const index=inline?result.indexOf(inline):-1;
    if(inline?.children && result[index-1]?.type==='paragraph_open')for(let i=0;i<trailingNewlines;i++)inline.children.push(new (inline.constructor as any)('hardbreak','br',0));
  }
  return result;
};
const visualParser = new MarkdownParser(visualSchema,visualTokenizer,{
  ...defaultMarkdownParser.tokens,softbreak:{node:'hard_break'},s:{mark:'strike'},u:{mark:'underline'},
  math_inline:{node:'visual_inline_math',getAttrs:(token: any)=>({latex: token.content})},
  table:{block:'table'},tr:{block:'table_row'},
  th:{block:'table_header',getAttrs:token=>({align:token.attrGet('style')?.match(/text-align:\s*(\w+)/)?.[1] || 'left'})},
  td:{block:'table_cell',getAttrs:token=>({align:token.attrGet('style')?.match(/text-align:\s*(\w+)/)?.[1] || 'left'})},
  thead:{ignore:true},tbody:{ignore:true},
});
export const visualSerializer = new MarkdownSerializer({
  ...defaultMarkdownSerializer.nodes,
  hard_break(state) { state.write('\n'); },
  bullet_list(state,node) { state.renderList(node.type.create({...node.attrs,tight:true},node.content),'  ',()=>'- '); },
  ordered_list(state,node) { const start=node.attrs.order || 1;const width=String(start+node.childCount-1).length;state.renderList(node.type.create({...node.attrs,tight:true},node.content),' '.repeat(width+2),index=>String(start+index).padStart(width,' ')+'. '); },
  list_item(state,node) { if(node.attrs.checked!==null)state.write(node.attrs.checked?'[x] ':'[ ] ');state.renderContent(node); },
  blockquote(state,node) {
    state.wrapBlock('> ',null,node,()=>{
      if(node.attrs.alertType){state.write(`[!${node.attrs.alertType}]`);state.ensureNewLine();}
      state.renderContent(node);
    });
  },
  table(state,node) {
    const rows: string[][] = [];
    node.forEach(row=>{
      const cells: string[]=[];
      row.forEach(cell=>{
        const cellSerializer = new MarkdownSerializer({...visualSerializer.nodes, hard_break(state) { state.write('<br>'); }}, visualSerializer.marks);
        const text = cellSerializer.serialize(visualSchema.nodes.doc.create(null,cell.content)).trim();
        cells.push(text.replace(/(?<!\\)\|/g,'\\|').replace(/\n/g,' '));
      }); rows.push(cells);
    });
    const header = node.firstChild!;
    const dividers:string[]=[];header.forEach(cell=>dividers.push(cell.attrs.align==='right'?'---:':cell.attrs.align==='center'?':---:':':---'));
    state.write('| '+rows[0].join(' | ')+' |\n');
    state.write('| '+dividers.join(' | ')+' |\n');
    rows.slice(1).forEach(row=>state.write('| '+row.join(' | ')+' |\n'));
    state.closeBlock(node);
  },
  source_block(state,node){state.write(node.attrs.source);state.closeBlock(node);},
  visual_image(state,node){state.write(node.attrs.source);state.closeBlock(node);},
  visual_media(state,node){state.write(node.attrs.source);state.closeBlock(node);},
  visual_math(state,node){state.write(`\n$$\n${(node.attrs.latex || '').trim()}\n$$\n\n`);state.closeBlock(node);},
  visual_inline_math(state,node){state.write(`$${(node.attrs.latex || '').trim()}$`);},
},{...defaultMarkdownSerializer.marks,strike:{open:'~~',close:'~~',mixable:true,expelEnclosingWhitespace:true},underline:{open:'<u>',close:'</u>',mixable:true,expelEnclosingWhitespace:true}});

function normalizeQuotes(node: DocumentNode): DocumentNode {
  if(node.isLeaf)return node;
  const children:DocumentNode[]=[];node.forEach(child=>children.push(normalizeQuotes(child)));
  let attrs=node.attrs;
  if(node.type.name==='blockquote' && children[0]?.type.name==='paragraph') {
    const match=children[0].textContent.match(/^\[!([^\]\r\n]+)\][ \t]*(?:\n[ \t]*)?/);
    if(match){attrs={...attrs,alertType:match[1]};children[0]=children[0].copy(children[0].content.cut(match[0].length));if(children[0].firstChild?.type===visualSchema.nodes.hard_break)children[0]=children[0].copy(children[0].content.cut(1));if(!children[0].content.size && children.length>1)children.shift();}
  }
  if(node.type.name==='list_item' && children[0]?.type.name==='paragraph') {
    const match=children[0].textContent.match(/^\[([ xX])\][ \t]+/);
    if(match){attrs={...attrs,checked:match[1].toLowerCase()==='x'};children[0]=children[0].copy(children[0].content.cut(match[0].length));}
  }
  return node.type.create(attrs,children,node.marks);
}
export function createVisualDocumentCodec(markdown: string) {
  const originals = new WeakMap<DocumentNode, string>();
  const meta = markdown.match(/^(?:\uFEFF)?---[^\S\r\n]*\r?\n[\s\S]*?\r?\n---[^\S\r\n]*(?:\r?\n|$)/);
  let prefix = meta?.[0] || '';
  let body = markdown.slice(prefix.length);
  const leadingBlank = body.match(/^(?:[^\S\r\n]*\r?\n)+/)?.[0] || '';
  prefix += leadingBlank;
  body = body.slice(leadingBlank.length);
  const lines = body.match(/[^\n]*\n|[^\n]+$/g) || [];
  const offsets = [0];
  lines.forEach(line => offsets.push(offsets[offsets.length - 1] + line.length));
  const nodes: DocumentNode[] = [];
  const tokenizer = defaultMarkdownParser.tokenizer;
  const hasReferenceDefinitions = /^\s*\[[^\]]+\]:/m.test(body);
  const tokens = tokenizer.parse(body, {});
  const starts = Array.from(new Set(tokens.filter(token => token.level === 0 && token.map).map(token => token.map![0])));
  lines.forEach((line, index) => { if (/^\s*\[[^\]]+\]:/.test(line) && !starts.includes(index)) starts.push(index); });
  let inMathBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inMathBlock && /^\s*\$\$/.test(line)) {
      if (!starts.includes(i)) starts.push(i);
      if (/^\s*\$\$[\s\S]*?\$\$\s*$/.test(line.trim())) {
        if (i + 1 < lines.length && !starts.includes(i + 1)) starts.push(i + 1);
      } else {
        inMathBlock = true;
      }
    } else if (inMathBlock && /\$\$\s*$/.test(line.trim())) {
      inMathBlock = false;
      if (i + 1 < lines.length && !starts.includes(i + 1)) starts.push(i + 1);
    }
  }
  starts.sort((a, b) => a - b);
  // Scene delimiters must stay together until the scene editor is implemented.
  const syntaxLines = [...lines];
  tokens.filter(token => token.type === 'fence' || token.type === 'code_block').forEach(token => {
    if (token.map) for (let line = token.map[0]; line < token.map[1]; line++) syntaxLines[line] = '\n';
  });
  const ranges = /(^|\n)\s*:::/.test(syntaxLines.join('')) ? [0] : starts;
  if (ranges.length && ranges[0] > 0) ranges.unshift(0);
  for (let i = 0; i < ranges.length; i++) {
    const raw = body.slice(offsets[ranges[i]], i + 1 < ranges.length ? offsets[ranges[i + 1]] : body.length);
    let node: DocumentNode;
    const mathMatch = raw.trim().match(/^\$\$([\s\S]*?)\$\$$/);
    const codeMathMatch = raw.trim().match(/^```(?:math|latex)\s*([\s\S]*?)```$/i);
    if (mathMatch || codeMathMatch) {
      const latexContent = (mathMatch ? mathMatch[1] : codeMathMatch![1]).trim();
      node = visualSchema.nodes.visual_math.create({ latex: latexContent });
    } else {
      const safeRaw=raw.replace(/<br\s*\/?\s*>/gi,'').replace(/<\/?u[^>]*>/gi,'');
      const unsupported = /(^|\n)\s*(:::|\[\^[^\]]+\]:|<\/?[a-zA-Z]|\|)|\[\^[^\]]+\]|!\[/m.test(safeRaw)
        || /^\s*\[[^\]]+\]:/m.test(safeRaw)
        || /<\/?[a-zA-Z][^>]*>|==/.test(safeRaw)
        || (hasReferenceDefinitions && /\[[^\]]+\](?!\()/.test(safeRaw))
        || /^\s*```\s*mermaid/m.test(safeRaw);
      try {
        const parsed = normalizeQuotes(visualParser.parse(raw,{preserveTrailingNewlines:i===ranges.length-1}));
        const plainCode = parsed.childCount === 1 && parsed.firstChild?.type.name === 'code_block'
          && !/^mermaid(?:\s|$)/i.test(parsed.firstChild.attrs.params || '');
        const nativeTable = parsed.childCount === 1 && parsed.firstChild?.type.name === 'table' && !/(^|\n)\s*(:::|```)/m.test(raw);
        const media = mediaDetails(raw);
        const standaloneImage = parsed.childCount === 1 && parsed.firstChild?.type.name === 'paragraph'
          && parsed.firstChild.childCount === 1 && parsed.firstChild.firstChild?.type.name === 'image';
        node = media ? visualSchema.nodes.visual_media.create({source:raw,kind:media.kind}) : standaloneImage ? visualSchema.nodes.visual_image.create({ source: raw }) : (plainCode || nativeTable || (!unsupported)) && parsed.childCount === 1
          ? visualSchema.nodeFromJSON(parsed.firstChild!.toJSON())
          : visualSchema.nodes.source_block.create({ source: raw });
      } catch {
        node = visualSchema.nodes.source_block.create({ source: raw });
      }
    }
    originals.set(node, raw);
    nodes.push(node);
  }
  // Whitespace-only documents also preserve their exact bytes until edited.
  if (!nodes.length) {
    const empty = body.trim() ? visualSchema.nodes.source_block.create({ source: body }) : visualSchema.nodes.paragraph.create();
    originals.set(empty, body);
    nodes.push(empty);
  }
  return {
    doc: visualSchema.nodes.doc.create({ frontmatter: prefix }, nodes),
    originalSource(node: DocumentNode) { return originals.get(node); },
    adopt(other: { doc: DocumentNode; originalSource: (node: DocumentNode) => string | undefined }) {
      other.doc.forEach(node => { const source = other.originalSource(node); if (source !== undefined) originals.set(node, source); });
    },
    serialize(doc: DocumentNode): string {
      let result = doc.attrs.frontmatter || '';
      let previousOriginal = true;
      let changed=false;doc.forEach(node=>{if(originals.get(node)===undefined)changed=true;});
      doc.forEach((node, _offset, index) => {
        const original = originals.get(node);
        if(changed && node.type.name==='heading'){if(!result)result='\n';else if(!result.endsWith('\n\n'))result+=result.endsWith('\n')?'\n':'\n\n';}
        if (index && !(previousOriginal && original !== undefined) && result && !result.endsWith('\n\n')) result += result.endsWith('\n') ? '\n' : '\n\n';
        result += original ?? (['source_block', 'visual_image', 'visual_media'].includes(node.type.name)
          ? node.attrs.source
          : node.type.name === 'visual_math'
          ? `\n$$\n${(node.attrs.latex || '').trim()}\n$$\n\n`
          : visualSerializer.serialize(visualSchema.nodes.doc.create(null,node)) + (node.type.name==='paragraph' ? '' : '\n\n'));
        previousOriginal = original !== undefined;
      });
      return result;
    },
  };
}

export function visualImageDetails(source: string) {
  const parsed = visualParser.parse(source);
  const node = parsed.firstChild?.firstChild;
  if (node?.type.name !== 'image') return { path: '', alt: '', title: '' };
  return { path: String(node.attrs.src || ''), alt: String(node.attrs.alt || ''), title: String(node.attrs.title || '') };
}
