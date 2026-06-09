/**
 * CSS Profile 작성 표준 명세서 — 서식 설정 화면에서 다운로드 가능한 가이드
 */
export const CSS_PROFILE_GUIDE_MD = `# Onrivi 마크다운 맞춤 서식(CSS Profile) 작성 표준 명세서

이 문서는 Onrivi Markdown 에디터 및 미리보기 컴포넌트와 100% 호환되는 서식 설정 파일(JSON)을 설계하고 생성하기 위한 기술 표준 명세입니다.
다른 생성형 AI(Gemini, ChatGPT, Claude 등)에 이 문서를 학습시키고 *"이 양식에 맞추어 JSON 파일을 생성해줘"*라고 요청하면 바로 연동하여 업로드해 쓸 수 있는 커스텀 서식을 획득할 수 있습니다.

---

## 1. 서식 JSON 구조 (Schema)

Onrivi 서식 프로필은 아래의 **5개** 루트 키를 가집니다.

| 키                  | 타입   | 필수               | 설명                                                     |
| ------------------- | ------ | ------------------ | -------------------------------------------------------- |
| \`id\`              | string | × (내부 자동 생성) | 고유 식별자 (예: \`"default"\`, \`"profile-1700000000000"\`) |
| \`name\`            | string | ○                  | 서식 프로필의 표시 이름                                  |
| \`pageStyle\`       | object | ○                  | 전역 폰트 및 용지 규격                                   |
| \`rules\`           | object | ○                  | 마크다운 태그별 CSS 룰셋                                 |
| \`hrStructure\`     | object | △                  | 구분선(HR) 전용 위젯 설정 (생략 시 기본값 상속)          |
| \`checkboxStructure\` | object | △                | 체크리스트 전용 위젯 설정 (생략 시 기본값 상속)          |

### 1.1 JSON 스키마 예시 (전체 구조)

\`\`\`json
{
  "name": "서식_이름_문자열",
  "pageStyle": {
    "fontFamily": "글꼴명_혹은_inherit",
    "fontSize": "기본_본문_크기_px단위",
    "lineHeight": "기본_줄간격_실수 문자열",
    "letterSpacing": "기본_자간_em단위",
    "backgroundColor": "페이지_배경색_hex",
    "marginTop": "용지_위여백_mm단위",
    "marginBottom": "용지_아래여백_mm단위",
    "marginLeft": "용지_왼쪽여백_mm단위",
    "marginRight": "용지_오른쪽여백_mm단위",
    "orientation": "portrait_또는_landscape",
    "headingSizeOffset": "제목단계별_감소폭_px단위",
    "tabSize": "탭_문자_렌더링_폭_정수"
  },
  "rules": {
    "h1": { "text-align": "left", "font-weight": "bold", "margin-top": "1.5rem", "margin-bottom": "1rem" },
    "h2": {},
    "h3": {},
    "h4": {},
    "h5": {},
    "h6": {},
    "p": { "text-align": "left", "margin-bottom": "8px", "text-indent": "0px" },
    "strong": {},
    "em": {},
    "u": {},
    "del": {},
    "ul": { "padding-left": "18px" },
    "ol": { "padding-left": "18px" },
    "li": { "margin-bottom": "3px", "padding-inline-start": "6px" },
    "taskList": {},
    "hr": {},
    "table": { "width": "100%", "border-collapse": "collapse" },
    "th": {},
    "td": {},
    "blockquote": { "border-left-width": "4px", "border-left-style": "solid", "padding": "12px" },
    "codeBlock": {},
    "codeBlockTitle": {},
    "a": {},
    "img": { "width": "400px", "height": "300px", "display": "block", "margin-left": "auto", "margin-right": "auto" },
    "code": { "background-color": "#f1f5f9", "color": "#e11d48", "font-size": "0.9em", "padding": "1px 4px", "border-radius": "4px", "line-height": "1" },
    "video": { "width": "560px", "height": "315px", "display": "block", "margin-left": "auto", "margin-right": "auto" },
    "math": { "color": "#1e3a8a", "font-size": "16px", "text-align": "center" },
    "map": { "width": "600px", "height": "450px", "display": "block", "margin-left": "auto", "margin-right": "auto" },
    "footnote": { "color": "#4b5563", "font-size": "12px", "line-height": "1.4" }
  },
  "hrStructure": {
    "borderTopStyle": "solid",
    "borderTopWidth": "1px",
    "marginTopBottom": "32px",
    "lineWidth": "100%"
  },
  "checkboxStructure": {
    "boxSize": "16px",
    "checkedEffect": "line-through-and-dim",
    "textGap": "10px"
  }
}
\`\`\`

---

## 2. 세부 필드 규격 명세

### 2.1 pageStyle (전역 타이포그래피 및 용지 설정)

모든 속성은 유효한 CSS 값이어야 합니다. 빈 문자열(\`""\`)로 기입하면 해당 속성은 시스템 기본값을 상속받습니다.

| 필드              | 타입   | 기본값        | 설명 및 예시                                                                 |
| ----------------- | ------ | ------------- | ---------------------------------------------------------------------------- |
| \`fontFamily\`    | string | \`"inherit"\` | 대표 서체. \`"Nanum Gothic"\`, \`"Nanum Gothic Coding, monospace"\`, \`"inherit"\` |
| \`fontSize\`      | string | \`"15px"\`    | 기본 본문 크기. 권장 범위: \`"12px"\` ~ \`"20px"\`                           |
| \`lineHeight\`    | string | \`"1.7"\`     | 기본 줄 간격 비율. 권장 범위: \`"1.4"\` ~ \`"2.0"\`                          |
| \`letterSpacing\` | string | \`"-0.02em"\` | 기본 자간 조절. 예: \`"-0.02em"\`, \`"0px"\`, \`"0.05em"\`                    |
| \`backgroundColor\` | string | \`"#ffffff"\` | 페이지 배경색 (헥스 코드)                                                    |
| \`marginTop\`     | string | \`"10mm"\`    | A4 인쇄/PDF 위쪽 여백. **반드시 \`mm\` 단위** 사용                           |
| \`marginBottom\`  | string | \`"10mm"\`    | A4 인쇄/PDF 아래쪽 여백. **반드시 \`mm\` 단위** 사용                         |
| \`marginLeft\`    | string | \`"10mm"\`    | A4 인쇄/PDF 왼쪽 여백. **반드시 \`mm\` 단위** 사용                           |
| \`marginRight\`   | string | \`"10mm"\`    | A4 인쇄/PDF 오른쪽 여백. **반드시 \`mm\` 단위** 사용                         |
| \`orientation\`   | string | \`"portrait"\` | 용지 방향. \`"portrait"\`(세로) 또는 \`"landscape"\`(가로) 중 하나여야 함    |
| \`headingSizeOffset\` | string | \`"4"\`   | H1→H6 단계별 크기 감소폭 (px 단위 정수 문자열)                               |
| \`tabSize\`       | string | \`"4"\`       | 탭(Tab) 문자 렌더링 폭 (공백 개수, 1~10 권장)                                |

### 2.2 rules (마크다운 태그별 CSS 룰셋)

각 태그 키는 빈 객체(\`{}\`)일 수 있으며, 이 경우 해당 요소는 기본 스타일(Tailwind Typography prose)을 그대로 사용합니다.  
유효한 CSS 속성-값 쌍을 자유롭게 기입할 수 있습니다.

| 태그 키            | HTML 요소              | 설명                                   | 자주 사용되는 CSS 속성 예시                                          |
| ------------------ | ---------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| \`h1\` ~ \`h6\`    | \`<h1>\` ~ \`<h6>\`   | 제목 위계                              | \`text-align\`, \`font-weight\`, \`font-size\`, \`color\`, \`margin-top\`, \`margin-bottom\`, \`border-bottom\`, \`letter-spacing\` |
| \`p\`              | \`<p>\`                | 기본 본문 문단                         | \`text-align\`, \`margin-top\`, \`margin-bottom\`, \`text-indent\`, \`line-height\`, \`color\` |
| \`strong\`         | \`<strong>\`           | 굵게 강조                             | \`font-weight\`, \`color\`, \`background-color\`                     |
| \`em\`             | \`<em>\`               | 기울임 강조                            | \`font-style\`, \`color\`                                           |
| \`u\`              | \`<u>\`                | 밑줄                                   | \`text-decoration-style\` (solid/dashed/dotted/wavy), \`text-decoration-color\`, \`text-underline-offset\` |
| \`del\`            | \`<del>\`              | 취소선                                 | \`text-decoration-color\`, \`text-decoration-thickness\`, \`opacity\` |
| \`ul\`             | \`<ul>\`               | 순서 없는 목록                         | \`padding-left\`, \`list-style-type\` (disc/circle/square/none)     |
| \`ol\`             | \`<ol>\`               | 순서 있는 목록                         | \`padding-left\`, \`list-style-type\` (decimal/decimal-leading-zero/lower-roman/upper-roman/none) |
| \`li\`             | \`<li>\`               | 목록 항목                              | \`margin-bottom\`, \`padding-inline-start\`                         |
| \`taskList\`       | \`<input type="checkbox">\` | 체크리스트                        | \`color\`, \`text-decoration\`                                      |
| \`hr\`             | \`<hr>\`               | 수평 구분선                            | \`border-top-color\` (두께/스타일은 hrStructure에서 관리)            |
| \`table\`          | \`<table>\`            | 표                                     | \`width\`, \`border-collapse\`, \`border-style\`, \`border-width\`, \`border-color\`, \`font-size\` |
| \`th\`             | \`<th>\`               | 표 헤더 셀                             | \`background-color\`, \`padding\`, \`font-size\`                     |
| \`td\`             | \`<td>\`               | 표 데이터 셀                           | \`background-color\`, \`padding\`, \`font-size\`                     |
| \`blockquote\`     | \`<blockquote>\`       | 인용 상자                              | \`background-color\`, \`border-left-color\`, \`border-left-width\`, \`padding\`, \`margin-top\`, \`margin-bottom\` |
| \`codeBlock\`      | \`<pre><code>\`        | 코드 블록                              | \`background-color\`, \`color\`, \`font-size\`, \`padding\`, \`border-radius\` |
| \`codeBlockTitle\` | 코드 블록 상단 제목바  | 코드 블록 타이틀바                     | \`background-color\`, \`color\`                                     |
| \`a\`              | \`<a>\`                | 하이퍼링크                             | \`color\`, \`text-decoration\`, \`font-weight\`                     |
| \`img\`            | \`<img>\`              | 이미지                                 | \`width\`, \`height\`, \`display\`, \`margin-left\`, \`margin-right\`, \`margin-top\`, \`margin-bottom\` |
| \`code\`           | \`<code>\`             | 인라인 코드                            | \`color\`, \`background-color\`, \`font-size\`, \`border-radius\`    |
| \`video\`          | \`<iframe>\` (YouTube 등) | 동영상 삽입체                       | \`width\`, \`height\`, \`display\`, \`margin-left\`, \`margin-right\`, \`margin-top\`, \`margin-bottom\` |
| \`math\`           | KaTeX 수식 블록        | 수식 블록                              | \`color\`, \`font-size\`, \`text-align\`, \`margin-top\`, \`margin-bottom\` |
| \`map\`            | \`<iframe>\` (지도)    | 지도 삽입체                            | \`width\`, \`height\`, \`display\`, \`margin-left\`, \`margin-right\`, \`margin-top\`, \`margin-bottom\` |
| \`footnote\`       | 각주 영역              | 각주                                   | \`color\`, \`font-size\`, \`line-height\`, \`margin-top\`, \`margin-bottom\` |

#### 2.2.1 미디어 정렬 방식

\`img\`, \`video\`, \`map\` 태그는 다음과 같은 CSS 조합으로 정렬을 제어합니다:

| 정렬   | CSS 속성 조합                                                                 |
| ------ | ----------------------------------------------------------------------------- |
| 중앙   | \`display: block; margin-left: auto; margin-right: auto; float: none;\`       |
| 왼쪽   | \`display: block; margin-left: 0px; margin-right: auto; float: none;\`        |
| 오른쪽 | \`display: block; margin-left: auto; margin-right: 0px; float: none;\`        |

#### 2.2.2 수식(Math) 정렬 방식

\`math\` 태그는 \`text-align\` 속성으로 정렬을 제어합니다:
- \`"center"\` — 중앙 정렬
- \`"left"\` — 왼쪽 정렬
- \`"right"\` — 오른쪽 정렬

### 2.3 hrStructure (수평 구분선 규격)

| 필드             | 타입   | 기본값     | 설명                                  |
| ---------------- | ------ | ---------- | ------------------------------------- |
| \`borderTopStyle\` | string | \`"solid"\` | 선 스타일: \`solid\` / \`dotted\` / \`dashed\` / \`double\` |
| \`borderTopWidth\` | string | \`"1px"\` | 선 두께 (px 단위)                     |
| \`marginTopBottom\` | string | \`"32px"\` | 구분선 상하 여백 (px 단위)            |
| \`lineWidth\`    | string | \`"100%"\` | 구분선 가로 길이: \`100%\` / \`75%\` / \`50%\` / \`30%\` |

### 2.4 checkboxStructure (체크리스트 규격)

| 필드            | 타입   | 기본값                    | 설명                                                                     |
| --------------- | ------ | ------------------------- | ------------------------------------------------------------------------ |
| \`boxSize\`     | string | \`"16px"\`                | 체크박스 물리 크기 (px 단위)                                             |
| \`checkedEffect\` | string | \`"line-through-and-dim"\` | 완료 항목 효과: \`"line-through-and-dim"\` / \`"dim-only"\` / \`"none"\` |
| \`textGap\`     | string | \`"10px"\`                | 체크박스와 텍스트 간격 (px 단위)                                          |

---

## 3. AI에게 서식 파일 생성을 요청하는 방법

### 3.1 프롬프트 템플릿

> 나는 Onrivi Markdown 에디터를 사용하고 있어.
> 아래 JSON 스키마에 맞춰 **정부 공문서 양식**에 적합한 CSS Profile JSON 파일을 생성해줘.
>
> 요구 조건:
> - 본문 글꼴은 "Noto Serif KR", 크기는 14px, 줄간격 1.9
> - 용지 여백은 상하좌우 25mm
> - 제목(H1)은 28px, 굵게, 중앙 정렬, 하단 실선
> - 본문 문단은 양끝 정렬(justify), 첫 줄 들여쓰기 10px
> - 인용구는 왼쪽 강조선 4px 실선, 배경색 #f8f6f0
> - 이미지는 중앙 정렬, 너비 500px

### 3.2 JSON 파일 저장 및 업로드

1. AI가 생성한 JSON 텍스트를 복사
2. Onrivi 에디터 우측 서식 설정 패널 열기
3. 📥 (가져오기) 버튼 클릭
4. "AI 생성 JSON 텍스트 붙여넣기" 영역에 붙여넣기
5. "가져오기 실행" 버튼 클릭

또는 JSON을 \`.json\` 파일로 저장한 후 📥 버튼 → "서식 JSON 파일 선택하기"로 업로드 가능합니다.

---

## 4. 전체 태그 목록 (22개)

\`h1\`, \`h2\`, \`h3\`, \`h4\`, \`h5\`, \`h6\`, \`p\`, \`strong\`, \`em\`, \`u\`, \`del\`, \`ul\`, \`ol\`, \`li\`, \`taskList\`, \`hr\`, \`table\`, \`th\`, \`td\`, \`blockquote\`, \`codeBlock\`, \`codeBlockTitle\`, \`a\`, \`img\`, \`code\`, \`video\`, \`math\`, \`map\`, \`footnote\`

---

## 5. 참고: CSS 속성 가이드

Onrivi 서식 시스템은 표준 CSS 속성을 지원합니다. 주요 카테고리는 다음과 같습니다:

| 카테고리       | 주요 CSS 속성 예시                                                               |
| -------------- | -------------------------------------------------------------------------------- |
| 글자 관련      | \`color\`, \`font-size\`, \`font-weight\`, \`font-style\`, \`font-family\`        |
| 정렬           | \`text-align\`, \`line-height\`, \`letter-spacing\`, \`text-indent\`              |
| 박스 모델      | \`width\`, \`height\`, \`padding\`, \`margin\` (\`margin-top\`, \`margin-left\` 등) |
| 테두리         | \`border\`, \`border-bottom\`, \`border-left-width\`, \`border-radius\`           |
| 배경           | \`background-color\`                                                             |
| 디스플레이     | \`display\` (\`block\`, \`inline\`, \`none\`), \`float\`                          |
| 텍스트 데코    | \`text-decoration\`, \`text-decoration-style\`, \`text-decoration-color\`, \`text-underline-offset\`, \`text-decoration-thickness\` |
| 기타           | \`opacity\`, \`list-style-type\`, \`border-collapse\`                              |

> ⚠️ \`!important\` 사용은 피해 주세요. Onrivi의 동적 CSS 시스템과 충돌할 수 있습니다.
`;
