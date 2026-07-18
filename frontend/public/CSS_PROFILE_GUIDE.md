# 🎨 온리비 어서(Onrivi Author) 서식 프로필 CSS 작성 가이드

이 문서는 외부에서 온리비 전용 테마를 직접 작성하거나 AI 프롬프트에 제공하기 위한 표준 명세서입니다. 이 가이드라인을 참조하여 JSON 형태로 서식을 작성한 후, 에디터의 서식 갤러리 모달에서 **[📥 테마 가져오기]** 를 통해 즉시 적용할 수 있습니다.

---

## 📌 1. 서식 프로필(JSON) 기본 구조

```json
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
    "p": { "margin-bottom": "15px" },
    "ul": { "padding-left": "24px", "color": "#333333" },
    "ol": { "padding-left": "24px", "color": "#333333" },
    "blockquote": { "border-left": "4px solid #0058bc", "padding-left": "16px", "color": "#555555" },
    "table": { "border-collapse": "collapse", "width": "100%" },
    "th": { "background-color": "#f8f9fa", "font-weight": "bold", "border": "1px solid #dee2e6", "padding": "12px" },
    "td": { "border": "1px solid #dee2e6", "padding": "12px" },
    "code": { "background-color": "#f1f5f9", "color": "#0000ee", "padding": "2px 4px", "border-radius": "2px" }
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
    "textGap": "10px"
  }
}
```

---

## 📌 2. 주요 태그 규칙 및 추가 속성

`rules` 안에 다음과 같은 HTML 태그를 키로 정의하여 CSS 속성들을 맵핑할 수 있습니다.

- **h1 ~ h6**: 제목. (h2~h6의 경우 시스템이 `headingSizeOffset`을 기반으로 글자 크기를 자동 연산하기도 하지만 명시할 수 있습니다.)
- **p**: 일반 문단. 글꼴과 줄 간격은 기본적으로 `pageStyle`을 상속받으므로 색상이나 마진 정도만 정의합니다.
- **ul, ol, li**: 목록. 들여쓰기(`padding-left`)와 텍스트 색상(`color`) 등을 정의합니다. 글머리 기호(마커) 색상은 기본적으로 `color: inherit`을 통해 텍스트 색상을 자동으로 따라갑니다.
- **blockquote**: 인용구. 주로 왼쪽 테두리(`border-left`)나 배경색을 정의합니다. (다크모드에서는 전용 컬러로 오버라이드 됨)
- **hr**: 구분선. 굵기와 선 스타일(`border-top`)을 정의합니다. 특정 값을 지정하지 않으면 옅은 회색(`#d1d5db`)이 기본 적용됩니다.
- **table, th, td**: 표. 표의 테두리와 셀 간격(`padding`) 등을 정의합니다.
- **code, pre**: 코드 블록. 인라인 코드의 텍스트 색상은 기본 `#0000ee`(파란색)으로 지정되어 있습니다.

### 체크박스 세부 설정 (`checkboxStructure`)
체크박스 목록의 렌더링 스타일을 설정합니다.
- `checkedEffect`: 항목 완료 시 적용할 시각적 효과 (`"none"`: 효과 없음 기본값, `"line-through-and-dim"`: 취소선+반투명, `"dim-only"`: 반투명만)
- `boxSize`: 체크박스 크기 (예: `"16px"`)
- `textGap`: 체크박스와 텍스트 사이 간격 (예: `"10px"`)

---

## 📌 3. AI에게 새 테마 작성을 지시할 때 (프롬프트 예시)

이 문서를 AI 채팅창에 제공하고 아래와 같이 요청하세요.

> **AI 프롬프트 예시:**
> "제공된 '온리비 어서 서식 프로필 CSS 작성 가이드'를 기반으로, **[공공기관 보고서]** 형태의 테마 JSON 객체 1개를 생성해 줘.
> - 글꼴은 'KoPubDotum'
> - 제목(h1)은 파란색 계열, 왼쪽 굵은 테두리(border-left) 적용
> - 줄 간격은 1.6, 글자 크기는 14px
> 위 JSON 결과물만 코드블록으로 출력해."
