import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// editorUtils.ts 로직 복제
function isAnyListLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  const isOrdered = /^(?:\d+[\.\)]|[①-⑩❶-❿\u2460-\u2469])\s/.test(trimmed);
  const isUnordered = /^(?:[-*+]\s|\[[ xX]?\]|[\u2756-\u2767]\s)/.test(trimmed);
  return isOrdered || isUnordered;
}

function isTableLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  if (trimmed.startsWith('|')) return true;
  if (trimmed.includes('|')) return true;
  return false;
}

function preprocessMarkdownForPreview(content) {
  const originalLines = content.split("\n");
  let expandedLines = [...originalLines];
  let expandedLineMap = expandedLines.map((_, i) => i + 1);

  let listBlockBaseIndent = -1;
  let listHasActiveDiv = false;

  const correctedLines = expandedLines.map((line, index) => {
    let processedLine = line.replace(/\t/g, "    ");
    const isSpecial = /^(?:\s*#+\s|\s*[-*+]\s|\s*\d+\.\s|\s*>|\s*---|\s*\||\s*\$\$|\s*<[a-zA-Z]|\s*[①-⑩❶-❿\u2460-\u2469\u2756-\u2767])/.test(processedLine);

    if (isSpecial) {
      const indentMatch = processedLine.match(/^( +)/);
      if (indentMatch) {
        const indentSpaces = indentMatch[1];
        const remainingText = processedLine.substring(indentSpaces.length);
        const isListOrQuote = /^(?:[-*+]\s|(?:\d+)\.\s|>|\s*\[[ xX]?\])/.test(remainingText);

        if (isListOrQuote) {
          const indentLength = indentSpaces.length;
          let prefix = "";
          if (listBlockBaseIndent === -1) {
            listBlockBaseIndent = indentLength;
            if (listBlockBaseIndent > 0 && !listHasActiveDiv) {
              prefix = `<div style="padding-left: ${listBlockBaseIndent * 5}px;">\n\n`;
              listHasActiveDiv = true;
            }
          }

          const relativeIndent = Math.max(0, indentLength - listBlockBaseIndent);
          let normalizedIndent = "";
          if (relativeIndent >= 2) {
            let steps = 1;
            if (relativeIndent <= 4) steps = 1;
            else if (relativeIndent <= 8) steps = 2;
            else if (relativeIndent <= 12) steps = 3;
            else steps = Math.floor((relativeIndent + 1) / 4);
            normalizedIndent = "    ".repeat(steps);
          }
          processedLine = prefix + normalizedIndent + remainingText.trim();
        }
      } else {
        const isListOrQuote = /^(?:[-*+]\s|(?:\d+)\.\s|>|\s*\[[ xX]?\])/.test(processedLine);
        if (isListOrQuote) listBlockBaseIndent = 0;
        else listBlockBaseIndent = -1;
      }
      return processedLine;
    }
    return processedLine;
  });

  const deorderedLines = [...correctedLines];

  const finalLines = [];
  for (let i = 0; i < deorderedLines.length; i++) {
    const curr = deorderedLines[i];
    finalLines.push(curr);
    if (i < deorderedLines.length - 1) {
      const next = deorderedLines[i + 1];
      const isQuoteToQuote = curr.trim().startsWith(">") && next.trim().startsWith(">");
      const isTableToTable = isTableLine(curr) && isTableLine(next);
      const isListToList = isAnyListLine(curr.trim()) && isAnyListLine(next.trim());
      const isCurrEmpty = curr === "" || curr === "\u00A0";
      const isNextEmpty = next === "" || next === "\u00A0";
      const isCurrSpecial = /^(?:\s*[-*+]\s|\s*\d+\.\s|\s*#+\s|---|\s*\|)/.test(curr.trim());
      const isNextSpecial = /^(?:\s*[-*+]\s|\s*\d+\.\s|\s*#+\s|---|\s*\|)/.test(next.trim());

      if (!isTableToTable && !isQuoteToQuote && !isListToList && !isCurrEmpty && !isNextEmpty && (isCurrSpecial || isNextSpecial)) {
        finalLines.push("");
      }
    }
  }

  let finalText = finalLines.join("\n");
  if (listHasActiveDiv) finalText += "\n\n</div>\n\n";
  return { text: finalText };
}

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

const preprocessed = preprocessMarkdownForPreview(raw);
console.log('--- Step 2: After preprocessMarkdownForPreview ---');
console.log(preprocessed.text);

// cleanContent
let processed = preprocessed.text;
const lines = processed.split('\n');
processed = lines.map(line => {
  const isListItem = /^[ \t]*([*+-]|\d+\.)\s+/.test(line);
  if (isListItem) {
    const listMatch = line.match(/^([ \t]*[*+-]|[ \t]*\d+\.)\s+(.*)$/);
    if (listMatch) {
      const prefix = listMatch[1];
      let body = listMatch[2];
      body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
      return `${prefix} ${body}`;
    }
    return line;
  }
  const isQuote = /^[ \t]*>/.test(line);
  if (isQuote) {
    const quoteMatch = line.match(/^([ \t]*>+[ \t]*)(.*)$/);
    if (quoteMatch) {
      const prefix = quoteMatch[1];
      let body = quoteMatch[2];
      body = body.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/ {2,}/g, (spaces) => '&nbsp;'.repeat(spaces.length));
      return `${prefix}${body}`;
    }
    return line;
  }
  return line;
}).join('\n');

console.log('--- Step 3: After cleanContent ---');
console.log(processed);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = await processor.process(processed);
console.log('--- Step 4: Rendered HTML ---');
console.log(String(html));
