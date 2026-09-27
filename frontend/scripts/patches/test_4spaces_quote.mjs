import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// 4칸 공백 정규화가 적용된 인용문 리스트
const raw = `> **예시**
>
> **[글머리 리스트]**
> - 사과
>     - 바나나
> - 파인애플
> - 오렌지
> ---
> **[숫자 리스트]**
> 1. 첫 번째 순서
>     2. 두 번째 순서
> 3. 세 번째 순서
> ---
> **[체크 리스트]**
> **당신은 성별이 어떠해 됩니까?**
>     - [X] 여자
> - [ ] 남자`;

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = await processor.process(raw);
console.log(String(html));
