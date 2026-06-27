with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'rb') as f:
    content = f.read().decode('utf-8')

old = 'editor.onDidChangeCursorSelection((e) => {\r\n                       lastSelectionRef.current = e.selection;\r\n                       if (!e.selection.isEmpty() && editor.hasTextFocus()) {'

new = 'editor.onDidChangeCursorSelection((e) => {\r\n                       // 실제 텍스트 선택 시에만 lastSelectionRef 갱신 (커서 이동으로 덮어써지는 버그 방지)\r\n                       if (!e.selection.isEmpty()) {\r\n                         lastSelectionRef.current = e.selection;\r\n                       }\r\n                       if (!e.selection.isEmpty() && editor.hasTextFocus()) {'

if old in content:
    content = content.replace(old, new, 1)
    print('OK')
else:
    print('NOT FOUND')

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'wb') as f:
    f.write(content.encode('utf-8'))
