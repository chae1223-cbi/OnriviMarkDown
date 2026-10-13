import { createVisualDocumentCodec } from '@/lib/visualDocumentCodec';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Slice } from 'prosemirror-model';

type Codec = ReturnType<typeof createVisualDocumentCodec>;

function fields(prefix: string) {
  const header = prefix.match(/^\uFEFF?---[^\S\r\n]*\r?\n([\s\S]*?)\r?\n---/)
    || prefix.match(/^---[^\S\r\n]*\r?\n([\s\S]*?)\r?\n---/);
  const result = new Map<string, string>();
  let key = '';
  for (const line of (header?.[1] || '').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][\w-]*)\s*:/);
    if (match) { key = match[1]; result.set(key, line); }
    else if (key) result.set(key, `${result.get(key)}\n${line}`);
  }
  return result;
}

export function mergePastedFrontmatter(current: string, incoming: string) {
  if (!incoming.trim()) return current;
  if (!current.trim()) return incoming;
  const incomingFields = fields(incoming);
  const extra = Array.from(fields(current)).filter(([key]) => !incomingFields.has(key)).map(([, value]) => value.trimEnd());
  if (!extra.length) return incoming;
  const newline = incoming.includes('\r\n') ? '\r\n' : '\n';
  return incoming.replace(/\r?\n---([^\S\r\n]*(?:\r?\n|$))/, `${newline}${extra.join(newline)}${newline}---$1`);
}

export function markdownPasteTransaction(state: EditorState, codec: Codec, source: string) {
  const pasted = createVisualDocumentCodec(source);
  codec.adopt(pasted);
  const empty = state.doc.childCount === 1 && state.doc.firstChild?.type.name === 'paragraph' && !state.doc.firstChild.content.size;
  const transaction = empty
    ? state.tr.replaceWith(0, state.doc.content.size, pasted.doc.content)
    : state.tr.replaceSelection(new Slice(pasted.doc.content, 0, 0));
  if (pasted.doc.attrs.frontmatter.trim()) {
    transaction.setDocAttribute('frontmatter', mergePastedFrontmatter(state.doc.attrs.frontmatter, pasted.doc.attrs.frontmatter));
  }
  transaction.setStoredMarks([]);
  transaction.setSelection(TextSelection.near(transaction.doc.resolve(transaction.mapping.map(state.selection.to)), 1));
  return transaction.scrollIntoView();
}
