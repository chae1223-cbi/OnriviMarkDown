import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const parser = unified().use(remarkParse).use(remarkGfm);

const raw = `> **예시**
>
> **[글머리 리스트]**
> - 사과
>   - 바나나
> - 파인애플
> - 오렌지
> ---
> **[숫자 리스트]**
> 1. 첫 번째 순서
>   2. 두 번째 순서
> 3. 세 번째 순서
> ---
> **[체크 리스트]**
> **당신은 성별이 어떠해 됩니까?**
>   - [X] 여자
> - [ ] 남자`;

const ast = parser.parse(raw);

function inspectAst(node, indent = 0) {
  const pad = ' '.repeat(indent);
  if (node.type === 'root') {
    node.children.forEach(c => inspectAst(c, indent));
  } else if (node.type === 'list') {
    console.log(`${pad}LIST (ordered: ${node.ordered})`);
    node.children.forEach(c => inspectAst(c, indent + 2));
  } else if (node.type === 'listItem') {
    const textChildren = node.children.filter(c => c.type !== 'list');
    const listChildren = node.children.filter(c => c.type === 'list');
    console.log(`${pad}ITEM (checked: ${node.checked})`);
    node.children.forEach(c => inspectAst(c, indent + 2));
  } else if (node.type === 'paragraph') {
    const text = node.children.map(c => c.value || c.type).join('');
    console.log(`${pad}P: ${text.slice(0, 30)}`);
  } else if (node.type === 'blockquote') {
    console.log(`${pad}BLOCKQUOTE`);
    node.children.forEach(c => inspectAst(c, indent + 2));
  } else if (node.type === 'thematicBreak') {
    console.log(`${pad}---`);
  }
}

inspectAst(ast);
