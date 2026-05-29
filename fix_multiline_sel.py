with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'rb') as f:
    content = f.read().decode('utf-8')

# 멀티라인 else 블록 추가
old = '''        if (startLine === endLine) {\r
          const selectStart = startCol + before.length;\r
          const selectEnd = isEmpty && defaultText ? selectStart + defaultText.length : endCol + before.length;\r
          editor.setSelection(new (window as any).monaco.Selection(\r
            startLine,\r
            selectStart,\r
            endLine,\r
            selectEnd\r
          ));\r
        }\r
      }, 10);'''

new = '''        if (startLine === endLine) {\r
          const selectStart = startCol + before.length;\r
          const selectEnd = isEmpty && defaultText ? selectStart + defaultText.length : endCol + before.length;\r
          editor.setSelection(new (window as any).monaco.Selection(\r
            startLine,\r
            selectStart,\r
            endLine,\r
            selectEnd\r
          ));\r
        } else {\r
          // 멀티행 선택: 태그 적용 후에도 선택 범위 유지\r
          editor.setSelection(new (window as any).monaco.Selection(\r
            startLine,\r
            startCol,\r
            endLine,\r
            endCol + after.length\r
          ));\r
        }\r
      }, 10);'''

if old in content:
    content = content.replace(old, new, 1)
    print('OK: multiline else block added')
else:
    print('NOT FOUND')

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'wb') as f:
    f.write(content.encode('utf-8'))
