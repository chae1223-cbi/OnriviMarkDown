import os

target_path = r'D:\developer\OnriviMarkDown\frontend\src\app\page.tsx'

with open(target_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'const sanitizePastedText = (text: string) => {' in line:
        start_idx = i
    if 'const applyLinePrefix =' in line:
        end_idx = i - 1
        break

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    print(f"start: {start_idx}, end: {end_idx}")
    exit(1)

new_logic = """  const parseHtmlTableToMarkdown = (html: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      if (!table) return null;

      let mdTable = '';
      const rows = table.querySelectorAll('tr');
      let isFirstRow = true;

      rows.forEach((row) => {
        const cells = row.querySelectorAll('th, td');
        if (cells.length === 0) return;

        const cellTexts = Array.from(cells).map(cell => {
          let inner = cell.innerHTML;
          inner = inner.replace(/<br\\s*\\/?>/gi, ' <br> ');
          inner = inner.replace(/<\\/(p|div)>/gi, ' <br> ');
          
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = inner;
          let text = tempDiv.textContent || tempDiv.innerText || '';
          
          text = text.replace(/[\\r\\n]+/g, ' ').replace(/\\s+/g, ' ').trim();
          text = text.replace(/(<br>\\s*)+/g, '<br>');
          if (text.startsWith('<br>')) text = text.substring(4).trim();
          if (text.endsWith('<br>')) text = text.substring(0, text.length - 4).trim();
          
          return text;
        });
        
        mdTable += '| ' + cellTexts.join(' | ') + ' |\\n';
        
        if (isFirstRow) {
          mdTable += '|' + cellTexts.map(() => '---').join('|') + '|\\n';
          isFirstRow = false;
        }
      });
      return mdTable.trim() + '\\n';
    } catch (err) {
      console.error('HTML Table parsing error', err);
      return null;
    }
  };

  const sanitizePastedText = (text: string) => {
    let sanitized = text;
    // <br>\\n<br> or <br>\\r\\n<br> -> <br>
    sanitized = sanitized.replace(/<br>\\s*[\\r\\n]+\\s*<br>/gi, '<br>');
    // \\n<br> -> <br>
    sanitized = sanitized.replace(/[\\r\\n]+\\s*<br>/gi, '<br>');
    // <br>\\n -> <br>
    sanitized = sanitized.replace(/<br>\\s*[\\r\\n]+/gi, '<br>');
    
    // Auto-convert TSV to Markdown Table
    if (sanitized.includes('\\t') && sanitized.includes('\\n') && !sanitized.includes('|')) {
      const lines = sanitized.split('\\n');
      const isTable = lines.some(line => line.includes('\\t'));
      
      if (isTable) {
        const mdLines = lines.map((line, index) => {
          if (!line.trim()) return line;
          const cells = line.split('\\t').map(cell => cell.trim());
          const row = '| ' + cells.join(' | ') + ' |';
          
          if (index === 0) {
            const separator = '|' + cells.map(() => '---').join('|') + '|';
            return row + '\\n' + separator;
          }
          return row;
        });
        sanitized = mdLines.join('\\n');
      }
    }
    
    return sanitized;
  };

  const fixMarkdownTable = (text: string) => {
    if (!text.includes('|')) return text;
    
    const lines = text.split('\\n');
    const result: string[] = [];
    let currentRow = '';
    let inTable = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!inTable && trimmed.startsWith('|')) {
        inTable = true;
      }
      
      if (inTable) {
        if (trimmed === '' && currentRow === '') {
          inTable = false;
          result.push(line);
          continue;
        }
        
        if (currentRow === '') {
          currentRow = line;
        } else {
          if (trimmed === '') {
             currentRow += '<br>';
          } else {
             if (!currentRow.trim().endsWith('<br>')) {
               currentRow += '<br>';
             }
             currentRow += line;
          }
        }
        
        if (currentRow.trim().endsWith('|')) {
          result.push(currentRow);
          currentRow = '';
        }
      } else {
        result.push(line);
      }
    }
    
    if (currentRow !== '') {
      result.push(currentRow);
    }
    
    return result.join('\\n');
  };

  const handleEditorPaste = async (e: any) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let imageItem = null;
    let hasText = false;
    let hasHtml = false;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageItem = items[i];
      }
      if (items[i].type === 'text/plain') {
        hasText = true;
      }
      if (items[i].type === 'text/html') {
        hasHtml = true;
      }
    }

    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) return;

        try {
          const response = await fetch(getApiUrl('/api/upload-pasted-image'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data })
          });

          if (response.ok) {
            const data = await response.json();
            const relativePath = data.relativePath;

            if (editorRef.current) {
              const editor = editorRef.current;
              const selection = editor.getSelection();
              const range = {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn
              };
              const textToInsert = `![이미지](${relativePath})`;
              editor.executeEdits("pasteImage", [{ range, text: textToInsert, forceMoveMarkers: true }]);

              const newValue = editor.getValue();
              setContent(newValue);
            }
          }
        } catch (err) {
          console.error("클립보드 이미지 업로드 실패:", err);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Try HTML Table extraction first
    if (hasHtml) {
      const htmlData = e.clipboardData.getData('text/html');
      if (htmlData && htmlData.includes('<table')) {
        const mdTable = parseHtmlTableToMarkdown(htmlData);
        if (mdTable) {
          e.preventDefault();
          insertAtCursor(mdTable);
          if (editorRef.current) {
            setContent(editorRef.current.getValue());
          }
          showToast("웹 표 데이터가 마크다운으로 완벽하게 변환되었습니다.", "success");
          return;
        }
      }
    }

    // Fallback to text/plain
    if (hasText) {
      const text = e.clipboardData.getData('text/plain');
      if (text) {
        let processedText = sanitizePastedText(text);
        
        if (processedText.includes('|')) {
          processedText = fixMarkdownTable(processedText);
        }
        
        if (processedText !== text) {
          e.preventDefault();
          insertAtCursor(processedText);
          if (editorRef.current) {
            setContent(editorRef.current.getValue());
          }
          showToast("붙여넣은 텍스트가 자동으로 정제(교정)되었습니다.", "success");
        }
      }
    }
  };\n"""

# Replace the block
new_lines = lines[:start_idx] + [new_logic] + lines[end_idx:]

with open(target_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Patch v3 HTML Parser applied successfully.")
