# 🎨 온리비 어서(Onrivi Author) 서식 프로필 CSS 작성 가이드

이 문서는 외부에서 온리비 어서 전용 서식 테마(CSS Profile)를 직접 설계하거나, AI(ChatGPT, Claude 등)에게 서식 생성을 요청할 때 사용하는 **표준 명세서(Specification)**입니다.  
이 가이드라인을 참조하여 JSON 형태로 서식을 작성한 후, 에디터 상단 **[🎨 서식 테마 설정]** ➔ **[서식 관리]** 모달에서 **[📥 테마 가져오기]**를 통해 즉시 등록하고 적용할 수 있습니다.

> 💡 **사용자 필수 안내**:  
> 본 문서에 기재된 모든 속성값(글자 크기, 줄 간격, 여백, 색상 등)은 이해를 돕기 위한 **'예시(Sample)'**입니다.  
> 사용자가 직접 코드를 작성하실 필요가 없으며, 에디터 화면의 **슬라이더와 버튼만 마우스로 조작**하셔도 모든 서식을 자유자재로 설정하실 수 있습니다.

---

## 📌 1. 서식 프로필(JSON) 기본 구조 (작성 예시)

> 💡 **참고**: 아래 JSON은 온리비 어서의 공식 기본 서식인 **'Onrivi 기본서식'** 대표 명세입니다. 각 수치는 사용자가 원하는 값으로 얼마든지 자유롭게 변경할 수 있습니다.

\`\`\`json
{
  "id": "profile-1790253429429",
  "name": "Onrivi 기본서식",
  "description": "온리비 어서(Onrivi Author)의 공식 기본 서식 테마입니다. 정갈한 텍스트 배치와 최적화된 용지 규격을 제공합니다.",
  "pageStyle": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Noto Sans', Arial, sans-serif",
    "fontSize": "16px",
    "lineHeight": "1.75",
    "letterSpacing": "-0.01em",
    "backgroundColor": "#ffffff",
    "paperSize": "a4",
    "marginTop": "18mm",
    "marginBottom": "18mm",
    "marginLeft": "12mm",
    "marginRight": "12mm",
    "orientation": "portrait",
    "headingSizeOffset": "0px",
    "tabSize": "2",
    "exportPageBreakLevel": "h1"
  },
  "rules": {
    "h1": {
      "font-size": "32px",
      "font-weight": "700",
      "color": "#202123",
      "padding-left": "0px",
      "margin-bottom": "18px",
      "border-bottom": "",
      "margin-top": "32px",
      "text-align": "left",
      "text-decoration": "none",
      "font-style": "normal",
      "line-height": "1.25",
      "letter-spacing": "-0.025em"
    },
    "h2": {
      "font-size": "24px",
      "font-weight": "700",
      "color": "#202123",
      "border-bottom": "",
      "padding-bottom": "8px",
      "margin-top": "28px",
      "text-decoration": "none",
      "font-style": "normal",
      "margin-bottom": "14px",
      "text-align": "left",
      "line-height": "1.35",
      "letter-spacing": "-0.02em"
    },
    "h3": {
      "text-align": "left",
      "font-weight": "650",
      "font-size": "20px",
      "margin-top": "24px",
      "margin-bottom": "12px",
      "color": "#202123",
      "border-bottom": "",
      "line-height": "1.4"
    },
    "h4": {
      "text-align": "left",
      "font-weight": "650",
      "font-size": "18px",
      "margin-top": "20px",
      "margin-bottom": "10px",
      "color": "#202123",
      "border-bottom": "",
      "line-height": "1.5"
    },
    "h5": {
      "text-align": "left",
      "font-weight": "650",
      "font-size": "16px",
      "margin-top": "18px",
      "margin-bottom": "8px",
      "color": "#202123",
      "border-bottom": "",
      "line-height": "1.55"
    },
    "h6": {
      "text-align": "left",
      "font-weight": "650",
      "font-size": "15px",
      "margin-top": "16px",
      "margin-bottom": "8px",
      "color": "#6b6b6b",
      "border-bottom": "",
      "line-height": "1.55"
    },
    "p": {
      "margin-bottom": "16px",
      "margin-top": "0px",
      "line-height": "1.75",
      "color": "#2f2f2f",
      "text-align": "left",
      "text-indent": "0px",
      "letter-spacing": "-0.01em",
      "sentence-gap": "4px"
    },
    "strong": {
      "font-weight": "700",
      "color": "#202123"
    },
    "em": {
      "font-style": "italic",
      "color": "#2f2f2f"
    },
    "u": {
      "text-decoration-color": "#0d0d0d",
      "text-decoration-style": "solid",
      "text-underline-offset": "3px",
      "text-decoration": "underline"
    },
    "del": {
      "text-decoration": "line-through",
      "color": "#6b6b6b"
    },
    "ul": {
      "padding-left": "28px",
      "list-style-type": "disc",
      "color": "#2f2f2f"
    },
    "ol": {
      "padding-left": "28px",
      "color": "#2f2f2f",
      "list-style-type": "decimal"
    },
    "li": {
      "margin-bottom": "5px",
      "padding-inline-start": "3px",
      "line-height": "1.7"
    },
    "taskList": {
      "boxSize": "16px",
      "checkedEffect": "line-through-and-dim",
      "textGap": "9px",
      "color": "#0d0d0d"
    },
    "hr": {
      "border-top-color": "#e5e5e5",
      "border-top-width": "1px",
      "border-top-style": "solid",
      "margin-top": "28px",
      "margin-bottom": "28px",
      "width": "100%"
    },
    "table": {
      "width": "100%",
      "border-collapse": "collapse",
      "border-style": "solid",
      "border-width": "1px",
      "border-color": "#9ca3af",
      "margin-top": "22px",
      "margin-bottom": "22px",
      "font-size": "15px",
      "border-radius": "8px",
      "overflow": "hidden"
    },
    "th": {
      "background-color": "#f7f7f8",
      "padding": "10px 12px",
      "border-style": "solid",
      "border-width": "1px",
      "border-color": "#9ca3af",
      "font-weight": "650",
      "border-bottom": "1px solid #e5e5e5",
      "border-left": "none",
      "border-right": "none",
      "text-align": "left",
      "color": "#202123"
    },
    "td": {
      "padding": "10px 12px",
      "border-style": "solid",
      "border-width": "1px",
      "border-color": "#9ca3af",
      "border-bottom": "1px solid #e5e5e5",
      "border-left": "none",
      "border-right": "none",
      "color": "#2f2f2f"
    },
    "blockquote": {
      "padding": "2px 0 2px 18px",
      "color": "#6b6b6b",
      "background-color": "transparent",
      "border-radius": "0",
      "margin-top": "20px",
      "margin-bottom": "20px",
      "font-weight": "normal",
      "border-left": "3px solid #d9d9d9",
      "font-size": "16px"
    },
    "codeBlock": {
      "background-color": "#f7f7f8",
      "color": "#242424",
      "padding": "16px",
      "border-radius": "8px",
      "font-size": "13.5px",
      "border": "1px solid #e5e5e5"
    },
    "codeBlockTitle": {
      "background-color": "#ececec",
      "color": "#5f5f5f",
      "padding": "8px 12px",
      "border-radius": "8px 8px 0 0",
      "border": "1px solid #e5e5e5"
    },
    "a": {
      "color": "#2563eb",
      "text-decoration": "underline",
      "font-weight": "bold"
    },
    "img": {
      "width": "100%",
      "border-radius": "8px",
      "margin-top": "20px",
      "margin-bottom": "20px",
      "margin-left": "auto",
      "margin-right": "auto",
      "background-color": "white",
      "padding": "0px",
      "box-shadow": "none"
    },
    "code": {
      "background-color": "#f7f7f8",
      "color": "#242424",
      "padding": "2px 6px",
      "border-radius": "5px",
      "font-weight": "normal",
      "border": "1px solid #e5e5e5"
    },
    "video": {
      "width": "100%",
      "height": "315px",
      "border-radius": "8px",
      "box-shadow": "none",
      "margin-top": "20px",
      "margin-bottom": "20px",
      "margin-left": "auto",
      "margin-right": "auto",
      "display": "block",
      "float": "none"
    },
    "math": {
      "color": "#2f2f2f",
      "font-size": "16px",
      "text-align": "center",
      "margin-top": "20px",
      "margin-bottom": "20px"
    },
    "map": {
      "width": "100%",
      "height": "400px",
      "border-radius": "8px",
      "box-shadow": "none",
      "margin-top": "20px",
      "margin-bottom": "20px",
      "margin-left": "auto",
      "margin-right": "auto"
    },
    "footnote": {
      "font-size": "13px",
      "color": "#6b6b6b",
      "line-height": "1.5",
      "margin-top": "12px",
      "margin-bottom": "12px",
      "font-weight": "normal"
    }
  },
  "hrStructure": {
    "borderTopStyle": "solid",
    "borderTopWidth": "1px",
    "marginTopBottom": "28px",
    "lineWidth": "100%"
  },
  "checkboxStructure": {
    "boxSize": "16px",
    "checkedEffect": "none",
    "textGap": "9px",
    "color": "#0d0d0d"
  },
  "tableStructure": {
    "outerBorderWidth": "1px",
    "rowBorderWidth": "1px",
    "colBorderWidth": "1px"
  },
  "customCss": ""
}
\`\`\`

---

## 📌 2. 7대 서식 쇼케이스 영역별 상세 명세

온리비 어서는 서식 관리 모달 우측의 **7대 쇼케이스 모듈(Showcase Cards)**과 1:1로 정확히 동기화됩니다.

### 🎴 Card 1. 본문 및 기본 타이포그래피 (\`pageStyle\`, \`p\`, \`strong\`, \`em\`, \`u\`, \`del\`, \`code\`, \`a\`)
- **pageStyle.fontFamily**: 문서 기본 폰트 패밀리 (\`'KoPubBatang'\`, \`'KoPubDotum'\`, \`'Pretendard'\`, \`'Noto Sans KR'\`, \`'D2Coding'\` 등)
- **pageStyle.fontSize**: 본문 기준 글자 크기 (기본값: \`"16px"\`)
- **pageStyle.lineHeight**: 본문 기준 줄 간격 (배율 단위, 기본값: \`"1.75"\`)
- **pageStyle.letterSpacing**: 본문 기준 자간 (기본값: \`"-0.01em"\`)
- **pageStyle.paperSize**: 인쇄/출판 표준 용지 규격 (\`"a4"\`, \`"a3"\`, \`"b4"\`, \`"b5"\`, \`"letter"\`)
- **pageStyle.orientation**: 용지 방향 (\`"portrait"\`: 세로형, \`"landscape"\`: 가로형)
- **pageStyle.backgroundColor**: 문서 배경색 (\`"#ffffff"\`, 미색 \`"#fcfbf9"\`, 다크 \`"#0f172a"\` 등)
- **pageStyle.margins**: 상/하/좌/우 인쇄 안전 여백 (\`marginTop\`, \`marginBottom\`: 기본값 \`"18mm"\`, \`marginLeft\`, \`marginRight\`: 기본값 \`"12mm"\`)
- **인라인 스타일**:
  - \`strong\`: 굵게 (\`font-weight\`, \`color\`)
  - \`em\`: 기울임 (\`font-style: italic\`, \`color\`)
  - \`u\`: 밑줄 (\`text-decoration: underline\`)
  - \`del\`: 취소선 (\`text-decoration: line-through\`, \`color\`)
  - \`code\`: 인라인 코드 (\`background-color\`, \`color\`, \`border-radius\`, \`font-weight\`)
  - \`a\`: 하이퍼링크 (\`color\`, \`text-decoration\`)

### 🎴 Card 2. 제목 위계 스타일 (\`h1\` ~ \`h6\`)
- **글자 크기 배율(\`font-size\`)**: H1(대분류)부터 H6(최소단위)까지 위계 질서에 맞는 크기 지정
- **굵기(\`font-weight\`)**: \`"700"\`, \`"800"\`, \`"900"\`, \`"bold"\`
- **정렬(\`text-align\`)**: \`"left"\`, \`"center"\`, \`"right"\`
- **구분선(\`border-bottom\`)**: 대제목 및 중제목 하단 장식선 (예: \`"2px solid #1d4ed8"\`, \`"1px solid #e2e8f0"\`)
- **여백(\`margin-top\`, \`margin-bottom\`)**: 상하 간격을 통해 문단과의 호흡 조절

### 🎴 Card 3. 목록 및 체크리스트 (\`ul\`, \`ol\`, \`li\`, \`taskList\`)
- **순서 없는 목록(\`ul\`)**: \`"list-style-type": "disc"\` (원형), \`"circle"\` (속 빈 원), \`"square"\` (사각형)
- **순서 있는 목록(\`ol\`)**: \`"list-style-type": "decimal"\` (1, 2, 3), \`"upper-roman"\` (I, II, III), \`"lower-alpha"\` (a, b, c)
- **항목 여백(\`li\`)**: \`"margin-bottom": "6px"\`
- **체크리스트(\`taskList\`, \`checkboxStructure\`)**:
  - \`boxSize\`: 체크박스 크기 (\`"16px"\`)
  - \`textGap\`: 체크박스와 텍스트 사이 간격 (\`"10px"\`)
  - \`color\`: 체크박스 테두리 및 체크 마크 테마 색상 (예: \`"#1d4ed8"\`)
  - \`checkedEffect\`: 완료 시 효과 (\`"none"\`: 효과 없음, \`"line-through-and-dim"\`: 취소선+반투명, \`"dim-only"\`: 반투명만)

### 🎴 Card 4. 표(Table) · 인용구 · 소스코드 블록
- **인용구(\`blockquote\`) 형태 프리셋**:
  1. **왼쪽 띠형 (Left Stripe)**: \`"border-left": "4px solid #1d4ed8"\`, \`"border-radius": "0 8px 8px 0"\`
  2. **전체 박스형 (Full Box)**: \`"border": "1px solid #cbd5e1"\`, \`"border-radius": "8px"\`
  3. **그림자 박스형 (Shadow Box)**: \`"border": "none"\`, \`"box-shadow": "0 8px 24px rgba(0,0,0,0.12)"\`, \`"border-radius": "8px"\`
  - 공통 속성: \`background-color\`, \`padding\`, \`margin-top\`, \`margin-bottom\`, \`font-size\`, \`font-weight\`
- **표(\`table\`, \`th\`, \`td\`, \`tableStructure\`) 형태 프리셋 및 개별 두께**:
  - **\`tableStructure\` 구조체 (외곽/행/열 두께 독립 제어)**:
    - \`outerBorderWidth\`: 표 외곽 테두리 두께 (예: \`"1px"\`, \`"2px"\`, \`"0px"\`)
    - \`rowBorderWidth\`: 표 행(가로선) 구분선 두께 (예: \`"1px"\`, \`"2px"\`, \`"0px"\`)
    - \`colBorderWidth\`: 표 열(세로선) 구분선 두께 (예: \`"1px"\`, \`"0px"\`)
  - **프리셋별 기본값**:
    1. **엑셀 격자(Grid)**: 사방 실선 (\`outerBorderWidth: "1px"\`, \`rowBorderWidth: "1px"\`, \`colBorderWidth: "1px"\`)
    2. **논문/관보 가로선 강조(Horizontal)**: 세로선 제거 (\`colBorderWidth: "0px"\`), 상하 외곽 굵은선 강조 (\`outerBorderWidth: "2px"\`, \`rowBorderWidth: "1px"\`)
    3. **미니멀(Minimal)**: 모든 테두리 제거 (\`outerBorderWidth: "0px"\`, \`rowBorderWidth: "0px"\`, \`colBorderWidth: "0px"\`), 헤더 배경색만 유지
  - 셀 패딩(\`padding\`), 글자 크기(\`font-size\`), 상하 바깥 여백(\`margin-top\`, \`margin-bottom\`)
- **코드 블록(\`codeBlock\`, \`codeBlockTitle\`)**:
  - \`background-color\`, \`color\`, \`padding\`, \`border-radius\`, \`font-size\`

### 🎴 Card 5. 미디어(이미지·비디오·지도) & 수식(MATH) · 구분선
- **미디어 객체 공통 (\`img\`, \`video\`, \`map\`)**:
  - **너비 및 높이**: \`width\` (\`"100%"\`, \`"480px"\`, \`"560px"\` 등), \`height\` (\`"auto"\`, \`"400px"\`)
  - **정렬 마진**:
    - 좌측 정렬: \`"margin-left": "0px"\`, \`"margin-right": "auto"\`
    - 중앙 정렬: \`"margin-left": "auto"\`, \`"margin-right": "auto"\`
    - 우측 정렬: \`"margin-left": "auto"\`, \`"margin-right": "0px"\`
  - **테두리 및 효과**: \`border-radius\` (라운딩), \`box-shadow\` (입체 그림자)
  - **상하 여백**: \`margin-top\`, \`margin-bottom\`
- **수학 수식 (\`math\`)**:
  - KaTeX Display 블록 렌더링
  - \`color\`: 수식 글자 테마 색상 (예: \`"#1d4ed8"\`)
  - \`font-size\`: 수식 크기 (\`"16px"\`, \`"18px"\` 또는 생략 시 본문 크기 상속)
  - \`text-align\`: 정렬 (\`"center"\`, \`"left"\`, \`"right"\`)
  - \`margin-top\`, \`margin-bottom\`: 상하 여백
- **수평 구분선 (\`hr\`, \`hrStructure\`)**:
  - 선 종류: \`border-top-style\` (\`"solid"\`, \`"dashed"\`, \`"dotted"\`, \`"double"\`)
  - 선 두께: \`border-top-width\` (\`"1px"\`, \`"2px"\`, \`"3px"\`)
  - 선 색상: \`border-top-color\` (\`"#e2e8f0"\`)
  - 폭: \`width\` (\`"100%"\`, \`"70%"\`, \`"50%"\`, \`"30%"\`)
  - 상하 여백: \`margin-top\`, \`margin-bottom\`

### 🎴 Card 6. 고급 레이아웃 및 본문 문단 (\`p\`)
- **본문 정렬(\`text-align\`)**: \`"justify"\` (출판물 스타일 양끝 정렬), \`"left"\` (좌측 정렬)
- **첫 줄 들여쓰기(\`text-indent\`)**: 문단 첫머리 들여쓰기 (예: \`"16px"\`, \`"0px"\`)
- **문단 상하 여백(\`margin-top\`, \`margin-bottom\`)**: 문단과 문단 사이의 호흡 간격
- **문장 사이 간격(\`sentence-gap\`)**: 문단 내에서 \`<br />\` 또는 Shift+Enter로 개행된 문장 간 미세 간격 (예: \`"4px"\`, \`"6px"\`)

### 🎴 Card 7. 각주 및 주석 (\`footnote\`)
- **글자 크기(\`font-size\`)**: 주석 글자 크기 (슬라이더 조작, 예: \`"12px"\`)
- **글자 굵기(\`font-weight\`)**: \`"normal"\` 또는 \`"bold"\`
- **글자 색상(\`color\`)**: 본문보다 차분한 서브 톤 (예: \`"#64748b"\`)
- **줄 간격(\`line-height\`)**: 각주 전용 행간 (예: \`"1.4"\`)
- **상하 바깥 여백(\`margin-top\`, \`margin-bottom\`)**: 본문 및 각주 항목 간 상하 간격 (예: \`"8px"\`, \`"12px"\`)

---

## 📌 3. AI에게 서식 프로필 생성을 지시할 때 (프롬프트 작성 예시)

> 💡 **안내 (필독)**:  
> 아래 프롬프트에 기재된 수치(글자 크기 14.5px, 네이비 색상, 들여쓰기 14px 등)는 **사용자가 쉽게 응용할 수 있도록 제공하는 "하나의 작성 예시"**입니다!  
> 사용자가 원하는 스타일에 맞추어 **글꼴, 글자 크기, 색상, 여백 등의 수치를 자유롭게 바꾸어 지시**하시면 됩니다.  
> 또한, AI가 만들어준 서식 JSON을 온리비 어서로 가져온 후에도 **에디터 제어판의 슬라이더를 통해 언제든지 자유롭게 수정**할 수 있으므로 어떤 값도 고정되지 않습니다.

> **🤖 AI 프롬프트 작성 예시 (수치를 원하는 대로 바꾸어 사용하세요):**
> 
> "제공된 온리비 어서(Onrivi Author) 서식 프로필 CSS 작성 가이드를 기반으로, **[예시: 대한민국 공공기관 정기간행물 양식]** 서식 프로필 JSON 1개를 생성해 줘.
> 
> [요구 조건 (예시 - 사용자가 원하는 수치로 얼마든지 변경 가능)]
> 1. 글꼴(fontFamily)은 'KoPubDotum' 또는 'Pretendard', 기본 글자 크기는 14.5px, 줄 간격은 1.7. (※ 예시 수치이며 원하는 크기나 폰트로 변경 가능)
> 2. 제목(h1~h6)은 세련된 네이비(#1e3a8a) 및 슬레이트(#334155) 톤으로 위계감 있게 차등 지정하고, h1에는 하단 강조선 적용. (※ 예시 색상이며 원하는 색상으로 변경 가능)
> 3. 본문 문단(p)은 양끝 정렬(justify), 첫 줄 들여쓰기 14px, 문단 아래 여백 12px, 문장 사이 간격(sentence-gap) 4px 적용. (※ 예시 설정이며 들여쓰기 0px 등 자유롭게 변경 가능)
> 4. 표(table)는 논문/보고서형 가로선 강조 스타일(상단 2px 굵은선, 좌우 선 없음)로 설정. (※ 격자형 또는 미니멀형으로 변경 가능)
> 5. 인용구(blockquote)는 왼쪽 네이비 띠형(border-left) 및 연한 회색 배경(#f8fafc) 적용. (※ 전체 박스형이나 그림자형으로 변경 가능)
> 6. 미디어(img, video, map), 수식(math), 구분선(hr), 각주(footnote), 체크박스(taskList)까지 모든 7대 쇼케이스 태그 규칙을 빠짐없이 포함.
> 7. 설명이나 인사말 없이 오직 유효한 JSON 코드블록(\`\`\`json ... \`\`\`) 하나만 출력해."
