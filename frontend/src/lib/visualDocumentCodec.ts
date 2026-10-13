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
  }).addToEnd('table', {group:'block',content:'table_row+',isolating:true,toDOM:()=>['table',{class:'visual-editable-table'},['tbody',0]],parseDOM:[{tag:'table'}]})
    .addToEnd('table_row',{content:'(table_header | table_cell)+',toDOM:()=>['tr',0],parseDOM:[{tag:'tr'}]})
    .addToEnd('table_header',{content:'paragraph',isolating:true,attrs:{align:{default:'left'}},toDOM:()=>['th',{style:'text-align:center!important'},0],parseDOM:[{tag:'th'}]})
    .addToEnd('table_cell',{content:'paragraph',isolating:true,attrs:{align:{default:'left'}},toDOM:node=>['td',{style:`text-align:${node.attrs.align}`},0],parseDOM:[{tag:'td',getAttrs:dom=>({align:(dom as HTMLElement).style.textAlign || 'left'})}]}),
  marks: markdownSchema.spec.marks.addToEnd('strike', {
    inclusive:false, parseDOM:[{tag:'s'},{tag:'del'},{style:'text-decoration=line-through'}], toDOM:()=>['s',0],
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
  }),
});

const tokenizer = defaultMarkdownParser.tokenizer.enable(['table','strikethrough']);
const visualTokenizer = Object.create(tokenizer) as typeof tokenizer;
visualTokenizer.parse = (source,environment) => {
  const result = [];
  let inCell = false;
  for(const token of tokenizer.parse(source,environment)) {
    const constructor = token.constructor as any;
    if(token.type==='th_close'||token.type==='td_close')result.push(new constructor('paragraph_close','p',-1));
    if (inCell && token.type === 'inline' && token.children) {
      token.children = token.children.flatMap(child => {
        if (child.type !== 'text' || !/<br\s*\/?\s*>/i.test(child.content)) return [child];
        return child.content.split(/(<br\s*\/?\s*>)/i).map(part => {
          const next = new constructor(/^<br/i.test(part) ? 'hardbreak' : 'text', '', 0);
          next.content = /^<br/i.test(part) ? '' : part;
          return next;
        });
      });
    }
    result.push(token);
    if(token.type==='th_open'||token.type==='td_open')inCell=true;
    if(token.type==='th_close'||token.type==='td_close')inCell=false;
    if(token.type==='th_open'||token.type==='td_open')result.push(new constructor('paragraph_open','p',1));
  }
  return result;
};
const visualParser = new MarkdownParser(visualSchema,visualTokenizer,{
  ...defaultMarkdownParser.tokens,s:{mark:'strike'},table:{block:'table'},tr:{block:'table_row'},
  th:{block:'table_header',getAttrs:token=>({align:token.attrGet('style')?.match(/text-align:\s*(\w+)/)?.[1] || 'left'})},
  td:{block:'table_cell',getAttrs:token=>({align:token.attrGet('style')?.match(/text-align:\s*(\w+)/)?.[1] || 'left'})},
  thead:{ignore:true},tbody:{ignore:true},
});
export const visualSerializer = new MarkdownSerializer({
  ...defaultMarkdownSerializer.nodes,
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
},{...defaultMarkdownSerializer.marks,strike:{open:'~~',close:'~~',mixable:true,expelEnclosingWhitespace:true}});

function normalizeQuotes(node: DocumentNode): DocumentNode {
  if(node.isLeaf)return node;
  const children:DocumentNode[]=[];node.forEach(child=>children.push(normalizeQuotes(child)));
  let attrs=node.attrs;
  if(node.type.name==='blockquote' && children[0]?.type.name==='paragraph') {
    const match=children[0].textContent.match(/^\[!([^\]\r\n]+)\][ \t]*(?:\n[ \t]*)?/);
    if(match){attrs={...attrs,alertType:match[1]};children[0]=children[0].copy(children[0].content.cut(match[0].length));if(!children[0].content.size && children.length>1)children.shift();}
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
  // Link definitions are not represented by Markdown-it tokens; isolate them
  // so editing the preceding paragraph cannot erase their original source.
  lines.forEach((line, index) => { if (/^\s*\[[^\]]+\]:/.test(line) && !starts.includes(index)) starts.push(index); });
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
    const unsupported = /(^|\n)\s*(:::|\[\^[^\]]+\]:|\$\$|<\/?[a-zA-Z]|\|)|\[\^[^\]]+\]|\$[^\n$]+\$|!\[/m.test(raw)
      || /^\s*\[[^\]]+\]:/m.test(raw)
      || /<\/?[a-zA-Z][^>]*>|==/.test(raw)
      || (hasReferenceDefinitions && /\[[^\]]+\](?!\()/.test(raw))
      || /^\s*```\s*(mermaid|math)/m.test(raw);
    try {
      const parsed = normalizeQuotes(visualParser.parse(raw));
      const plainCode = parsed.childCount === 1 && parsed.firstChild?.type.name === 'code_block'
        && !/^(mermaid|math)(?:\s|$)/i.test(parsed.firstChild.attrs.params || '');
      const nativeTable = parsed.childCount === 1 && parsed.firstChild?.type.name === 'table' && !/!\[|<|\[\^|\$/.test(raw.replace(/<br\s*\/?\s*>/gi,''));
      const media = mediaDetails(raw);
      const standaloneImage = parsed.childCount === 1 && parsed.firstChild?.type.name === 'paragraph'
        && parsed.firstChild.childCount === 1 && parsed.firstChild.firstChild?.type.name === 'image';
      node = media ? visualSchema.nodes.visual_media.create({source:raw,kind:media.kind}) : standaloneImage ? visualSchema.nodes.visual_image.create({ source: raw }) : (plainCode || nativeTable || (!unsupported)) && parsed.childCount === 1
        ? visualSchema.nodeFromJSON(parsed.firstChild!.toJSON())
        : visualSchema.nodes.source_block.create({ source: raw });
    } catch {
      node = visualSchema.nodes.source_block.create({ source: raw });
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
      doc.forEach((node, _offset, index) => {
        const original = originals.get(node);
        if (index && !(previousOriginal && original !== undefined) && result && !result.endsWith('\n\n')) result += result.endsWith('\n') ? '\n' : '\n\n';
        result += original ?? (['source_block', 'visual_image', 'visual_media'].includes(node.type.name)
          ? node.attrs.source
          : visualSerializer.serialize(visualSchema.nodes.doc.create(null,node)) + '\n\n');
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
