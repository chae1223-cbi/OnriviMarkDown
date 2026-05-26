import os

backup_path = r'D:\developer\OnriviMarkDown - 복사본 (2)\frontend\src\app\page.tsx'
target_path = r'D:\developer\OnriviMarkDown\frontend\src\app\page.tsx'

with open(backup_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find handleEditorPaste
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'const handleEditorPaste = async' in line:
        start_idx = i
    if 'const applyLinePrefix = ' in line:
        end_idx = i - 1
        break

if start_idx == -1 or end_idx == -1:
    print("Could not find handleEditorPaste boundaries")
    exit(1)

new_paste_logic = """  const fixMarkdownTable = (text: string) => {
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
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageItem = items[i];
      }
      if (items[i].type === 'text/plain') {
        hasText = true;
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

    if (hasText) {
      const text = e.clipboardData.getData('text/plain');
      if (text && text.includes('|')) {
        const fixedText = fixMarkdownTable(text);
        if (fixedText !== text) {
          e.preventDefault();
          insertAtCursor(fixedText);
          if (editorRef.current) {
            setContent(editorRef.current.getValue());
          }
          showToast("깨진 표 문법이 자동으로 교정되었습니다.", "success");
        }
      }
    }
  };
"""

# Replace the block
new_lines = lines[:start_idx] + [new_paste_logic] + lines[end_idx:]

content = "".join(new_lines)

# Now attach paste listener to onMount
old_mount = '''onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    if (typeof window !== 'undefined') {
                      (window as any).monaco = monaco;
                    }
                    editor.onDidChangeCursorPosition'''

new_mount = '''onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    if (typeof window !== 'undefined') {
                      (window as any).monaco = monaco;
                    }
                    const container = editor.getContainerDomNode();
                    container.addEventListener('paste', handleEditorPaste, true);
                    editor.onDidChangeCursorPosition'''

if old_mount in content:
    content = content.replace(old_mount, new_mount)
else:
    print("WARNING: onMount hook not found precisely, finding fuzzy...")
    if 'editorRef.current = editor;' in content:
        content = content.replace('editorRef.current = editor;', "editorRef.current = editor;\n                    editor.getContainerDomNode().addEventListener('paste', handleEditorPaste, true);")
    else:
        print("ERROR: could not inject paste event listener")

with open(target_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restore and patch completed successfully.")
