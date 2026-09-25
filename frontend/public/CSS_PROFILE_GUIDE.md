`# 🎨 온리비 어서(Onrivi Author) 서식 프로필 CSS 작성 가이드

이 문서는 외부에서 온리비 어서 전용 서식 테마(CSS Profile)를 직접 설계하거나, AI(ChatGPT, Claude 등)에게 서식 생성을 요청할 때 사용하는 **표준 명세서(Specification)**입니다.  
이 가이드라인을 참조하여 JSON 형태로 서식을 작성한 후, 에디터 상단 **[🎨 서식 테마 설정]** ➔ **[서식 관리]** 모달에서 **[📥 테마 가져오기]**를 통해 즉시 등록하고 적용할 수 있습니다.

> 💡 **사용자 필수 안내**:  
> 본 문서에 기재된 모든 속성값(글자 크기, 줄 간격, 여백, 색상 등)은 이해를 돕기 위한 **'예시(Sample)'**입니다.  
> 사용자가 직접 코드를 작성하실 필요가 없으며, 에디터 화면의 **슬라이더와 버튼만 마우스로 조작**하셔도 모든 서식을 자유자재로 설정하실 수 있습니다.  
> 
> 🛡️ **누락 태그 자동 상속 규칙**:  
> 서식 프로필에 특정 태그(예: \`video\`, \`map\`, \`footnote\`, \`taskList\` 등)나 구조체가 생략되어 있거나 정의되지 않은 경우, 온리비 어서 렌더러와 내보내기 엔진은 자동으로 **'Onrivi 기본서식'의 표준 규칙을 100% 기준으로 보완(하이드레이션)**하여 안전하게 적용합니다.

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
      "checkedEffect": "none",
      "textGap": "9px",
      "color": "#2f2f2f"
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
    "color": "#2f2f2f"
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
- **pageStyle.margins**: 상/하/좌/우 인쇄 안전 여백 (\`marginTop\`, \`marginBottom\`: 기본값 \`"18mm"\`, \`marginLeft\`: 기본값 \`"12mm"\`, \`marginRight\`: 기본값 \`"12mm"\`)
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
- **구분선(\`border-bottom\`)**: 대제목 및 중제목 하단 장식선 (예: \`"2px solid #ff5a00"\`, \`"1px solid #e2e8f0"\`)
- **세로 바(\`border-left\`)**: 중제목 및 소제목 좌측 포인트 바 (예: \`"4px solid #ff5a00"\`, \`padding-left: "12px"\`)
- **여백(\`margin-top\`, \`margin-bottom\`)**: 상하 간격을 통해 문단과의 호흡 조절
- **🌟 모던 테크 블로그 시그니처 위계 (한컴 테크 블로그 표준 규격)**:
  - **H1 (아티클 메인 타이틀)**: \`32px\`, \`font-weight: 800\`, \`margin-top: 36px\`, \`margin-bottom: 24px\`, \`line-height: 1.35\`
  - **H2 (대섹션 제목)**: \`23px\`, \`font-weight: 700\`, **하단 오렌지 포인트 라인(\`border-bottom: "2px solid #ff5a00"\`)**, 패딩 \`padding-bottom: "10px"\`, 넉넉한 섹션 분리 여백(\`margin-top: "52px"\`, \`margin-bottom: "20px"\`)
  - **H3 (중섹션 소제목)**: \`18.5px\`, \`font-weight: 700\`, **좌측 오렌지 버티컬 바(\`border-left: "4px solid #ff5a00"\`)**, 좌측 여백 \`padding-left: "12px"\`, 상하 여백(\`margin-top: "34px"\`, \`margin-bottom: "14px"\`)
  - **H4 (세부 항목)**: \`16px\`, \`font-weight: 700\`, \`margin-top: 24px\`, \`margin-bottom: 10px\`

### 🎴 Card 3. 목록 및 체크리스트 (\`ul\`, \`ol\`, \`li\`, \`taskList\`)
- **순서 없는 목록(\`ul\`)**: \`"list-style-type": "disc"\` (원형), \`"circle"\` (속 빈 원), \`"square"\` (사각형)
- **순서 있는 목록(\`ol\`)**: \`"list-style-type": "decimal"\` (1, 2, 3), \`"upper-roman"\` (I, II, III), \`"lower-alpha"\` (a, b, c)
- **항목 여백(\`li\`)**: \`"margin-bottom": "5px"\`, \`"line-height": "1.7"\`
- **체크리스트(\`taskList\`, \`checkboxStructure\`)**:
  - \`boxSize\`: 체크박스 크기 (\`"16px"\`)
  - \`textGap\`: 체크박스와 텍스트 사이 간격 (\`"9px"\`)
  - \`color\`: 체크박스 테두리, 체크 마크 및 텍스트 기본 색상 (본문 글자색과 동일한 \`"#2f2f2f"\`)
  - \`checkedEffect\`: 완료 항목 스타일 (**기본값: \`"none"\` - 효과 없음**, \`"line-through-and-dim"\`: 취소선+반투명, \`"dim-only"\`: 반투명만)

### 🎴 Card 4. 표(Table) · 인용구 · 소스코드 블록
- **인용구(\`blockquote\`) 형태 프리셋**:
  1. **왼쪽 띠형 (Left Stripe)**: \`"border-left": "3px solid #d9d9d9"\`, \`"border-radius": "0"\`
  2. **전체 박스형 (Full Box)**: \`"border": "1px solid #cbd5e1"\`, \`"border-radius": "8px"\`
  3. **그림자 박스형 (Shadow Box)**: \`"border": "none"\`, \`"box-shadow": "0 8px 24px rgba(0,0,0,0.12)"\`, \`"border-radius": "8px"\`
  - 공통 속성: \`background-color\`, \`padding\`, \`margin-top\`, \`margin-bottom\`, \`font-size\`, \`font-weight\`
- **표(\`table\`, \`th\`, \`td\`, \`tableStructure\`) 형태 프리셋 및 개별 두께**:
  - **\`tableStructure\` 구조체 (외곽/행/열 두께 독립 제어)**:
    - \`outerBorderWidth\`: 표 외곽 테두리 두께 (기본값: \`"1px"\`)
    - \`rowBorderWidth\`: 표 행(가로선) 구분선 두께 (기본값: \`"1px"\`)
    - \`colBorderWidth\`: 표 열(세로선) 구분선 두께 (기본값: \`"1px"\`)
  - **프리셋별 기본값**:
    1. **엑셀 격자(Grid)**: 사방 실선 (\`outerBorderWidth: "1px"\`, \`rowBorderWidth: "1px"\`, \`colBorderWidth: "1px"\`)
    2. **논문/관보 가로선 강조(Horizontal)**: 세로선 제거 (\`colBorderWidth: "0px"\`), 상하 외곽 굵은선 강조 (\`outerBorderWidth: "2px"\`, \`rowBorderWidth: "1px"\`)
    3. **미니멀(Minimal)**: 모든 테두리 제거 (\`outerBorderWidth: "0px"\`, \`rowBorderWidth: "0px"\`, \`colBorderWidth: "0px"\`), 헤더 배경색만 유지
  - 셀 패딩(\`padding\`), 글자 크기(\`font-size\`), 상하 바깥 여백(\`margin-top\`, \`margin-bottom\`)
- **코드 블록(\`codeBlock\`, \`codeBlockTitle\`)**:
  - \`background-color: "#f7f7f8"\`, \`color: "#242424"\`, \`padding: "16px"\`, \`border-radius: "8px"\`, \`font-size: "13.5px"\`

### 🎴 Card 5. 미디어(이미지·비디오·지도) & 수식(MATH) · 구분선
- **미디어 객체 공통 (\`img\`, \`video\`, \`map\`)**:
  - **너비 및 높이**:
    - 본문 전체 폭에 맞춰 시원하게 전개되도록 **\`width: "100%"\`**를 표준으로 고정 적용합니다.
    - \`video\`: \`"width": "100%"\`, \`"height": "315px"\` (16:9 와이드 가로형 표준)
    - \`map\`: \`"width": "100%"\`, \`"height": "400px"\` (대화형 지도 표준)
    - \`img\`: \`"width": "100%"\`, \`"border-radius": "8px"\`
  - **정렬 마진**:
    - 좌측 정렬: \`"margin-left": "0px"\`, \`"margin-right": "auto"\`
    - 중앙 정렬: \`"margin-left": "auto"\`, \`"margin-right": "auto"\`
    - 우측 정렬: \`"margin-left": "auto"\`, \`"margin-right": "0px"\`
  - **테두리 및 효과**: \`border-radius\` (라운딩, 기본 \`"8px"\`), \`box-shadow\`
  - **상하 여백**: \`margin-top: "20px"\`, \`margin-bottom: "20px"\`
- **수학 수식 (\`math\`)**:
  - KaTeX Display 블록 렌더링
  - \`color\`: \`"#2f2f2f"\` (고대비 텍스트)
  - \`font-size\`: \`"16px"\` (생략 시 본문 기본 크기 자동 상속)
  - \`text-align\`: \`"center"\` (중앙 정렬)
  - \`margin-top: "20px"\`, \`margin-bottom: "20px"\`
- **수평 구분선 (\`hr\`, \`hrStructure\`)**:
  - 선 종류: \`border-top-style\` (\`"solid"\`, \`"dashed"\`, \`"dotted"\`, \`"double"\`)
  - 선 두께: \`border-top-width\` (\`"1px"\`)
  - 선 색상: \`border-top-color\` (\`"#e5e5e5"\`)
  - 폭: \`width\` (\`"100%"\`)
  - 상하 여백: \`margin-top: "28px"\`, \`margin-bottom: "28px"\`

### 🎴 Card 6. 고급 레이아웃 및 본문 문단 (\`p\`)
- **용지 마진 여백(\`pageStyle.marginTop\`, \`marginBottom\`, \`marginLeft\`, \`marginRight\`)**: 위/아래 \`"18mm"\`, 왼/오른쪽 \`"12mm"\` (표준 규격)
- **본문 정렬(\`text-align\`)**: \`"left"\` (기본 정렬), \`"justify"\` (출판물 스타일 양끝 정렬)
- **첫 줄 들여쓰기(\`text-indent\`)**: 기본 \`"0px"\` (출판 서식의 경우 \`"16px"\`)
- **문단 상하 여백(\`margin-top\`, \`margin-bottom\`)**: 상단 \`"0px"\`, 하단 \`"16px"\`
- **문장 사이 간격(\`sentence-gap\`)**: 문단 내에서 \`<br />\` 또는 Shift+Enter로 개행된 문장 간 미세 간격 (기본 \`"4px"\`)
- **줄 간격(\`line-height\`)**: 기본 \`"1.75"\`
- **본문 글자색(\`color\`)**: 부드럽고 가독성 높은 차콜 그레이 (\`"#2f2f2f"\` 또는 \`"#374151"\`)
- **🌟 모던 테크 블로그(한컴 테크 블로그) 본문 문단 표준 규격**:
  - \`font-size\`: \`"16px"\`, \`color\`: \`"#374151"\` (부드러운 고대비)
  - \`line-height\`: \`"1.8"\` (시원하고 편안한 줄간격)
  - \`margin-top\`: \`"0px"\`, \`margin-bottom\`: \`"20px"\` (명확한 단락 분리)
  - \`sentence-gap\`: \`"8px"\` (단락 내 문장 간 여유 있는 호흡 확보)

### 🎴 Card 7. 각주 및 주석 (\`footnote\`)
- **글자 크기(\`font-size\`)**: 기본 \`"13px"\`
- **글자 굵기(\`font-weight\`)**: \`"normal"\`
- **글자 색상(\`color\`)**: \`"#6b6b6b"\`
- **줄 간격(\`line-height\`)**: \`"1.5"\`
- **상하 바깥 여백(\`margin-top\`, \`margin-bottom\`)**: 상단 \`"12px"\`, 하단 \`"12px"\`

---

## 📌 3. AI에게 서식 프로필 생성을 지시할 때 (프롬프트 작성 예시)

> 💡 **안내 (필독)**:  
> 아래 프롬프트는 **Onrivi 기본서식** 및 **한컴 테크 블로그 프리미엄 서식**을 기준으로 한 모범적인 작성 예시입니다.  
> 사용자가 원하는 스타일에 맞추어 **글꼴, 글자 크기, 색상, 여백 등의 수치를 자유롭게 바꾸어 지시**하실 수 있습니다.  
> 또한, AI가 만들어준 서식 JSON에 특정 태그가 생략되어 있더라도 **온리비 어서가 Onrivi 기본서식 규격을 자동으로 상속**하므로 안심하고 사용하실 수 있습니다.

### 🤖 AI 프롬프트 예시 1: Onrivi 기본 표준 서식
\`\`\`text
제공된 온리비 어서(Onrivi Author) 서식 프로필 CSS 작성 가이드를 기반으로, "에디토리얼 테크니컬 서식" 프로필 JSON 1개를 생성해 줘.

[요구 조건]
1. 용지 규격(pageStyle)은 A4 세로(portrait), 상하 18mm, 좌우 12mm 여백(marginTop: 18mm, marginBottom: 18mm, marginLeft: 12mm, marginRight: 12mm), 기본 글꼴은 시스템 고딕, 글자 크기 16px, 줄 간격 1.75 적용.
2. 제목(h1~h6)은 32px부터 15px까지 단계별 위계와 정갈한 상하 여백으로 구성.
3. 본문 문단(p)은 줄 간격 1.75, 문단 아래 여백 16px, 문장 사이 간격(sentence-gap) 4px 적용.
4. 표(tableStructure)는 outerBorderWidth: 1px, rowBorderWidth: 1px, colBorderWidth: 1px의 정갈한 격자 스타일로 구성.
5. 미디어(img, video, map)는 가로 너비를 100%("width": "100%")로 설정하고, video는 "height": "315px", map은 "height": "400px"으로 16:9 와이드 비율 적용.
6. 구분선(hrStructure: 28px/1px/solid/100%) 및 체크박스(checkboxStructure: 16px/none/9px/#2f2f2f - 체크박스 및 글자색은 본문과 동일한 #2f2f2f, 완료 효과 checkedEffect는 무조건 "none") 구조체를 완벽히 포함.
7. 설명이나 인사말 없이 오직 유효한 단일 JSON 객체({ ... })만 출력해.
\`\`\`

### 🤖 AI 프롬프트 예시 2: 한컴 테크 블로그 프리미엄 서식 (오렌지 포인트 테마)
\`\`\`text
제공된 온리비 어서(Onrivi Author) 서식 프로필 CSS 작성 가이드를 기반으로, 한컴 테크 블로그 스타일의 "모던 테크 블로그 서식" 프로필 JSON 1개를 생성해 줘.

[요구 조건]
1. 용지 규격(pageStyle)은 A4 세로(portrait), 상하 18mm, 좌우 12mm 여백, 글자 크기 16px, 줄 간격 1.8 적용.
2. 제목 위계:
   - H1: 32px, 굵기 800, margin-top 36px, margin-bottom 24px, color: #111827
   - H2: 23px, 굵기 700, 하단 오렌지선("border-bottom": "2px solid #ff5a00"), padding-bottom: 10px, margin-top 52px, margin-bottom 20px
   - H3: 18.5px, 굵기 700, 좌측 오렌지바("border-left": "4px solid #ff5a00"), padding-left: 12px, margin-top 34px, margin-bottom 14px
3. 본문 문단(p): 글자색 #374151, 줄 간격 1.8, 문단 하단 여백 20px("margin-bottom": "20px"), 문장 간격 8px("sentence-gap": "8px") 적용.
4. 인용구(blockquote): 배경색 #f8fafc, 좌측선 "border-left": "4px solid #ff5a00", 패딩 16px 20px, 둥근 모서리 6px.
5. 표(tableStructure): colBorderWidth: 0px(세로선 없음), outerBorderWidth: 1px, rowBorderWidth: 1px의 가로선 강조형, th 배경색 #f8fafc.
6. 링크(a): color: "#0284c7", 밑줄("text-decoration": "underline"), text-underline-offset: 3px.
7. 이미지(img): width: "100%", border-radius: "10px", margin-top: "28px", margin-bottom: "28px".
8. 설명이나 인사말 없이 오직 유효한 단일 JSON 객체({ ... })만 출력해.
\`\`\`
`