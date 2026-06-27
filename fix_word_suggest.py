with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'rb') as f:
    content = f.read().decode('utf-8')

# 1. quickSuggestions: false -> true
idx = content.find('quickSuggestions: { other: false')
if idx > 0:
    end = content.find('\n', idx)
    old_line = content[idx:end]
    content = content.replace(old_line, 'quickSuggestions: { other: true, comments: true, strings: true },  // 일반 단어 타이핑 시에도 IntelliSense 팝업', 1)
    print('quickSuggestions: OK')
else:
    print('quickSuggestions NOT FOUND, checking...')
    idx2 = content.find('quickSuggestions')
    print(repr(content[idx2:idx2+120]))

# 2. wordBasedSuggestions 추가
if 'wordBasedSuggestions' not in content:
    content = content.replace(
        'fixedOverflowWidgets: true,',
        'fixedOverflowWidgets: true,\r\n                    wordBasedSuggestions: "allDocuments",  // 현재 문서의 모든 단어를 학습해 추천 풀 생성',
        1
    )
    print('wordBasedSuggestions: added')
else:
    print('wordBasedSuggestions: already exists')

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'wb') as f:
    f.write(content.encode('utf-8'))

# 결과 확인
idx3 = content.find('quickSuggestions')
print('Result:', repr(content[idx3:idx3+120]))
