import re

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'rb') as f:
    content = f.read().decode('utf-8')

# triggerCharacters 알파벳 제거
old1 = "triggerCharacters: ['/', 'a','b','c','d','e','f','g','h','i','j','k','l','m',\r\n                        'n','o','p','q','r','s','t','u','v','w','x','y','z'],"
new1 = "triggerCharacters: ['/'],  // '/' 입력 시에만 슬래시 커맨드 팝업"

if old1 in content:
    content = content.replace(old1, new1, 1)
    print('triggerCharacters: OK')
else:
    # 알파벳 제거된 상태
    idx = content.find("triggerCharacters:")
    print(f"triggerCharacters at: {idx}")
    if idx > 0:
        print(repr(content[idx:idx+200]))

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'wb') as f:
    f.write(content.encode('utf-8'))

print("Done")
