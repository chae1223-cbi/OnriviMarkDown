export const CSS_PROFILE_GUIDE_MD = `# 🎨 Onrivi Author 서식 프로필 CSS 작성 가이드

이 문서는 외부에서 Onrivi 전용 테마를 직접 작성하거나 AI 프롬프트에 제공하기 위한 표준 명세서입니다. 이 가이드라인을 참조하여 JSON 형태로 서식을 작성한 후, 에디터의 서식 갤러리 모달에서 **[📥 테마 가져오기]** 를 통해 즉시 적용할 수 있습니다.

---

## 📌 1. 서식 프로필(JSON) 기본 구조

\`\`\`json
{
  "id": "고유ID (예: my-custom-theme-01)",
  "name": "테마 이름 (예: 모던 논문 양식)",
  "description": "설명 (예: 깔끔한 논문용 기본 템플릿)",
  "pageStyle": {
    "fontFamily": "글꼴 (예: 'KoPubBatang', 'Noto Sans KR')",
    "fontSize": "기본 글자 크기 (예: 15px)",
    "lineHeight": "기본 줄 간격 (예: 1.8)",
    "letterSpacing": "기본 자간 (예: 0em)",
    "paperSize": "a4, a3, b4, b5 등 (옵션)",
    "orientation": "portrait 또는 landscape (옵션)",
    "backgroundColor": "배경색 (예: #ffffff)",
    "margins": {
      "top": "여백(상)", "bottom": "여백(하)", "left": "여백(좌)", "right": "여백(우)"
    }
  },
  "rules": {
    "h1": { "font-size": "32px", "font-weight": "900", "color": "#111111", "margin-bottom": "20px" },
    "h2": { "font-size": "26px", "font-weight": "800", "color": "#222222", "border-bottom": "2px solid #eeeeee" },
    "h3": { "font-size": "22px", "color": "#333333" },
    "h4": { "color": "#444444" },
    "h5": { "color": "#555555" },
    "h6": { "color": "#666666" },
    "p": { "margin-bottom": "15px" },
    "a": { "color": "#2563eb", "text-decoration": "underline" },
    "strong": { "font-weight": "bold", "color": "#111111" },
    "em": { "font-style": "italic", "color": "#333333" },
    "del": { "text-decoration": "line-through", "color": "#999999" },
    "ul": { "padding-left": "24px", "color": "#333333", "list-style-type": "disc" },
    "ol": { "padding-left": "24px", "color": "#333333", "list-style-type": "decimal" },
    "li": { "margin-bottom": "4px" },
    "blockquote": { "border-left": "4px solid #0058bc", "padding-left": "16px", "color": "#555555", "background-color": "#f8f9fa" },
    "table": { "border-collapse": "collapse", "width": "100%" },
    "th": { "background-color": "#f8f9fa", "font-weight": "bold", "border": "1px solid #dee2e6", "padding": "12px" },
    "td": { "border": "1px solid #dee2e6", "padding": "12px" },
    "code": { "background-color": "#f1f5f9", "color": "#2563eb", "padding": "2px 4px", "border-radius": "2px" },
    "codeBlock": { "background-color": "#282c34", "color": "#abb2bf", "padding": "16px", "border-radius": "8px", "font-size": "14px" },
    "codeBlockTitle": { "background-color": "#1e2227", "color": "#ffffff" },
    "math": { "color": "#1e3a8a", "font-size": "16px", "text-align": "center", "margin-top": "16px", "margin-bottom": "16px" },
    "hr": { "border-top-width": "1px", "border-top-style": "solid", "border-top-color": "#d1d5db", "margin-top": "32px", "margin-bottom": "32px", "width": "100%" },
    "img": { "border-radius": "8px", "box-shadow": "0 4px 6px rgba(0,0,0,0.1)", "margin-left": "auto", "margin-right": "auto" },
    "video": { "border-radius": "12px", "box-shadow": "0 10px 15px rgba(0,0,0,0.1)", "margin-left": "auto", "margin-right": "auto" },
    "map": { "border-radius": "12px", "box-shadow": "0 10px 15px rgba(0,0,0,0.1)", "margin-left": "auto", "margin-right": "auto" },
    "footnote": { "font-size": "12px", "color": "#666666", "line-height": "1.4", "margin-top": "8px" }
  },
  "hrStructure": {
    "borderTopStyle": "solid",
    "borderTopWidth": "1px",
    "marginTopBottom": "32px",
    "lineWidth": "100%"
  },
  "checkboxStructure": {
    "boxSize": "16px",
    "checkedEffect": "none",
    "textGap": "10px",
    "color": "#333333"
  }
}
\`\`\`

---

## 📌 2. 주요 태그 규칙 및 추가 속성

\`rules\` 안에 다음과 같은 HTML 태그를 키로 정의하여 CSS 속성들을 맵핑할 수 있습니다.

- **h1 ~ h6**: 제목. (h2~h6의 경우 시스템이 \`headingSizeOffset\`을 기반으로 글자 크기를 자동 연산하기도 하지만 명시할 수 있습니다.)
- **p**: 일반 문단. 글꼴과 줄 간격은 기본적으로 \`pageStyle\`을 상속받으므로 색상이나 마진 정도만 정의합니다.
- **a**: 하이퍼링크. 색상(\`color\`) 및 밑줄(\`text-decoration\`) 처리 등을 정의합니다.
- **strong, em, del**: 텍스트 강조(굵게, 기울임, 취소선). 글자색이나 폰트 웨이트, 데코레이션 스타일을 지정합니다.
- **ul, ol, li**: 목록. 들여쓰기(\`padding-left\`), 텍스트 색상(\`color\`), 그리고 마커 스타일(\`list-style-type\`)을 정의합니다. \`ul\`은 기본적으로 \`"list-style-type": "disc"\`, \`ol\`은 \`"list-style-type": "decimal"\`을 권장합니다. \`li\`는 항목 간 간격 조절용으로 씁니다.
- **blockquote**: 인용구. 주로 왼쪽 테두리(\`border-left\`)나 배경색(\`background-color\`)을 정의합니다.
- **hr**: 구분선. 굵기와 선 스타일(\`border-top-width\`, \`border-top-style\`, \`border-top-color\`), 폭(\`width\`), 상하여백을 정의합니다.
- **table, th, td**: 표. 표의 테두리와 셀 간격(\`padding\`) 등을 정의합니다.
- **code**: 인라인 코드 블록. 텍스트 색상은 기본 \`#2563eb\`(파란색)으로 지정되어 있습니다.
- **codeBlock, codeBlockTitle**: 다중행 소스코드 블록 및 상단 타이틀 바. 배경색(\`background-color\`), 패딩, 둥근 모서리, 텍스트 색상 등을 지정합니다.
- **img, video, map**: 미디어 및 지도 삽입. 주로 라운딩 처리(\`border-radius\`), 중앙 정렬 마진(\`margin-left: auto\`), 그림자 효과(\`box-shadow\`) 등을 지정합니다.
- **math**: 수학 수식(KaTeX). 디스플레이 수식의 정렬(\`text-align\`), 상하 여백(\`margin-top\`, \`margin-bottom\`), 그리고 수식 글자 색상(\`color\`)과 크기(\`font-size\`)를 지정합니다.
- **footnote**: 각주 텍스트. 문서 하단의 각주 디자인(색상, 크기, 마진)을 정의합니다.

### 체크박스 세부 설정 (\`checkboxStructure\`)
체크박스 목록의 렌더링 스타일을 설정합니다.
- \`checkedEffect\`: 항목 완료 시 적용할 시각적 효과 (\`"none"\`: 효과 없음 기본값, \`"line-through-and-dim"\`: 취소선+반투명, \`"dim-only"\`: 반투명만)
- \`boxSize\`: 체크박스 크기 (예: \`"16px"\`)
- \`textGap\`: 체크박스와 텍스트 사이 간격 (예: \`"10px"\`)
- \`color\`: 체크박스 테두리 및 체크 마크 색상. 주로 리스트(ul/ol)의 글자 색상과 통일되도록 설정합니다. (예: \`"#333333"\`)

---

## 📌 3. AI에게 새 테마 작성을 지시할 때 (프롬프트 예시)

이 문서를 AI 채팅창에 제공하고 아래와 같이 요청하세요.

> **AI 프롬프트 예시:**
> "제공된 'Onrivi Author 서식 프로필 CSS 작성 가이드'를 기반으로, **[공공기관 보고서]** 형태의 테마 JSON 객체 1개를 생성해 줘.
> - 글꼴은 'KoPubDotum'
> - 제목(h1)은 파란색 계열, 왼쪽 굵은 테두리(border-left) 적용
> - 인용구, 소스코드 블록, 이미지 및 동영상 등 미디어 태그도 디자인 컨셉에 맞게 모두 CSS 규칙을 추가해
> - 줄 간격은 1.6, 글자 크기는 14px
> - 글머리 기호(ul)는 채워진 원(disc), 숫자 목록(ol)은 1,2,3(decimal) 기본 적용
> - 체크박스 색상은 본문 리스트 색상과 동일하게 맞춤
> 위 JSON 결과물만 코드블록으로 출력해."
`;
