const fs = require('fs');
const file = 'd:/Developer/OnriviMarkDown/OnriviMarkDown/frontend/src/components/MainEditorApp.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.set(newDecorations);
      }
    }, []);`;

const replaceStr = `      // Frontmatter (YAML) block: --- ~ --- 영역에 박스형 배경 데코레이션 적용
      let inFrontmatter = false;
      let frontmatterStart = -1;
      let frontmatterEnd = -1;
      if (lines.length > 0 && lines[0].trim() === '---') {
        frontmatterStart = 1;
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            frontmatterEnd = i + 1;
            break;
          }
        }
      }
      if (frontmatterStart > 0 && frontmatterEnd > 0) {
        for (let ln = frontmatterStart; ln <= frontmatterEnd; ln++) {
          newDecorations.push({
            range: new Range(ln, 1, ln, 1),
            options: {
              isWholeLine: true,
              className: 'monaco-frontmatter-line',
            }
          });
        }
      }

      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.set(newDecorations);
      }
    }, []);`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched frontmatter box decoration!");
} else {
    console.log("Not found targetStr!");
}
