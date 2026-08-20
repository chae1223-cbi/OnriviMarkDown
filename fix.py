import re
with open('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

fixed = re.sub(
    r"const isInline = inline \|\| \(!match && !codeContent\.includes\('\n\s*'\)\);",
    r"const isInline = inline || (!match && !codeContent.includes('\\n'));",
    content
)

with open('d:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MarkdownViewer.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed)
print('Done!')
