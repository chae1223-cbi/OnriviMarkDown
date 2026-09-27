import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const processor = unified().use(remarkParse).use(remarkGfm);

const rawInput = `> - 사과
>   - 바나나
> - 파인애플`;

const ast = processor.parse(rawInput);
console.log('--- RAW AST ---');
console.log(JSON.stringify(ast, null, 2));
