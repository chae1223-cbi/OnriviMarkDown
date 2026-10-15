/** Render punctuation-ending strong text followed by a Korean particle. */
export function remarkKoreanStrong() {
  const punctuation = new RegExp('[\\p{Pe}\\p{Pf}:;.!?%…]$', 'u');
  return (tree: any, file: any) => {
    const source = String(file.value || '');
    const walk = (parent: any) => {
      if (!Array.isArray(parent.children) || ['code', 'inlineCode', 'html', 'math', 'inlineMath'].includes(parent.type)) return;
      parent.children = parent.children.flatMap((node: any) => {
        if (node.type !== 'text') { walk(node); return [node]; }
        const raw = source.slice(node.position?.start?.offset, node.position?.end?.offset);
        if (/\\\*/.test(raw)) return [node]; // Intentionally escaped literal asterisks.
        const pattern = /\*\*([^*\n]+)\*\*(?=\u200B*[가-힣A-Za-z0-9])/g;
        const pieces: any[] = [];
        let offset = 0, match: RegExpExecArray | null;
        while ((match = pattern.exec(node.value))) {
          if (!punctuation.test(match[1])) continue;
          if (match.index > offset) pieces.push({ type: 'text', value: node.value.slice(offset, match.index) });
          pieces.push({ type: 'strong', children: [{ type: 'text', value: match[1] }] });
          offset = match.index + match[0].length;
        }
        if (!pieces.length) return [node];
        if (offset < node.value.length) pieces.push({ type: 'text', value: node.value.slice(offset) });
        return pieces;
      });
    };
    walk(tree);
  };
}
