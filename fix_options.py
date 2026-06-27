with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'rb') as f:
    content = f.read().decode('utf-8')

# 1. acceptSuggestionOnEnter: 'off' -> 'on'
content = content.replace("acceptSuggestionOnEnter: 'off',", "acceptSuggestionOnEnter: 'on',", 1)

# 2. tabCompletion: 'off' -> 'on'
content = content.replace("tabCompletion: 'off',", "tabCompletion: 'on',", 1)

# 3. fixedOverflowWidgets 추가 (아직 없으면)
if 'fixedOverflowWidgets' not in content:
    content = content.replace(
        "tabCompletion: 'on',",
        "tabCompletion: 'on',\r\n                    fixedOverflowWidgets: true,  // 자동완성 팝업을 최상위 레이어로 올려서 클릭 이벤트 정상 전달",
        1
    )

# 4. quickSuggestions: 일반 텍스트 입력 시에도 계속 보이도록 활성화
#    (슬래시 입력 후 계속 필터링이 되려면 필요)
content = content.replace(
    "quickSuggestions: { other: false, comments: false, strings: false },",
    "quickSuggestions: { other: false, comments: false, strings: false },  // 슬래시 커맨드는 triggerCharacters로만 트리거",
    1
)

with open(r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx', 'wb') as f:
    f.write(content.encode('utf-8'))

print("Done")

# 확인
idx = content.find('acceptSuggestionOnEnter')
print(repr(content[idx-50:idx+200]))
