const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(decorationsCollectionRef\.current\) \{[\s\n]*decorationsCollectionRef\.current\.set\(newDecorations\);[\s\n]*\}[\s\n]*\}, \[\]\);[\s\n]*const isResizing/;

const replaceStr = `// Frontmatter (YAML) block: --- ~ --- 영역에 박스형 배경 데코레이션 적용
      if (lines.length > 0 && lines[0].trim() === '---') {
        let frontmatterEnd = -1;
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            frontmatterEnd = i + 1;
            break;
          }
        }
        if (frontmatterEnd > 0) {
          for (let ln = 1; ln <= frontmatterEnd; ln++) {
            newDecorations.push({
              range: new Range(ln, 1, ln, 1),
              options: {
                isWholeLine: true,
                className: 'monaco-frontmatter-line',
              }
            });
          }
        }
      }

      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.set(newDecorations);
      }
    }, []);
    const isResizing`;

if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched frontmatter box decoration via regex!");
} else {
    console.log("Not found via regex either!");
}
