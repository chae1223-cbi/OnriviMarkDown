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
```

---

## 📌 2. 주요 태그 규칙 및 추가 속성

`rules` 안에 다음과 같은 HTML 태그를 키로 정의하여 CSS 속성들을 맵핑할 수 있습니다.

- **h1 ~ h6**: 제목. (h2~h6의 경우 시스템이 `headingSizeOffset`을 기반으로 글자 크기를 자동 연산하기도 하지만 명시할 수 있습니다.)
- **p**: 일반 문단. 글꼴과 줄 간격은 기본적으로 `pageStyle`을 상속받으므로 색상이나 마진 정도만 정의합니다.
- **a**: 하이퍼링크. 색상(`color`) 및 밑줄(`text-decoration`) 처리 등을 정의합니다.
- **strong, em, del**: 텍스트 강조(굵게, 기울임, 취소선). 글자색이나 폰트 웨이트, 데코레이션 스타일을 지정합니다.
- **ul, ol, li**: 목록. 들여쓰기(`padding-left`), 텍스트 색상(`color`), 그리고 마커 스타일(`list-style-type`)을 정의합니다. `ul`은 기본적으로 `"list-style-type": "disc"`, `ol`은 `"list-style-type": "decimal"`을 권장합니다. `li`는 항목 간 간격 조절용으로 씁니다.
- **blockquote**: 인용구. 선형(좌측 테두리 강조), 박스형(배경색과 사방 둥근 모서리 강조) 등 자유롭게 디자인할 수 있습니다. (예: `border-left`, `background-color`, `border-radius`, `box-shadow` 적극 활용)
- **hr**: 구분선. 굵기와 선 스타일(`border-top-width`, `border-top-style`, `border-top-color`), 폭(`width`), 상하여백을 정의합니다.
- **table, th, td**: 표. 표의 테두리와 셀 간격(`padding`) 등을 정의합니다. 
  - 엑셀(Grid) 스타일: 사방에 실선 (`border: 1px solid #ccc`)
  - 논문(Horizontal) 가로선 강조 스타일: 좌우 테두리를 투명하게 처리 (`border-left: none`, `border-right: none`)
  - 미니멀(Minimal) 스타일: 테두리를 모두 없애고 헤더 배경색만 유지 (`border: none`)
- **code**: 인라인 코드 블록. 배경색, 글자색, 둥글기를 지정합니다. (⚠️ 주의: 인라인 코드의 폰트 크기(`font-size`) 속성은 시스템이 강제로 통일하므로 절대 기입하지 마세요.)
- **codeBlock, codeBlockTitle**: 다중행 소스코드 블록 및 상단 타이틀 바.
  - 기본 박스: 단색 배경, 둥근 모서리 (`border-radius: 6px`)
  - Mac OS 테마 흉내: 타이틀 바 상단만 둥글게 (`border-radius: 8px 8px 0 0`), 코드블록 하단만 둥글게 (`border-radius: 0 0 8px 8px`)
- **img, video, map**: 미디어 및 지도 삽입. `border-radius`, `box-shadow`를 적극 활용합니다.
  - 폴라로이드 사진 스타일: 흰색 굵은 테두리 (`border: 10px solid white`, 하단은 32px), 은은한 그림자
  - 둥근 썸네일 스타일: 테두리 없이 반경을 크게 (`border-radius: 16px`), 그림자 추가
- **math**: 수학 수식(KaTeX). 디스플레이 수식의 정렬(`text-align`), 상하 여백, 글자 색상과 크기를 지정합니다.
- **footnote**: 각주 텍스트. 문서 하단의 각주 디자인(색상, 크기, 마진, 굵기 등)을 정의합니다.

### 체크박스 세부 설정 (`checkboxStructure`)
체크박스 목록의 렌더링 스타일을 설정합니다.
- `checkedEffect`: 항목 완료 시 적용할 시각적 효과 (`"none"`: 효과 없음 기본값, `"line-through-and-dim"`: 취소선+반투명, `"dim-only"`: 반투명만)
- `boxSize`: 체크박스 크기 (예: `"16px"`)
- `textGap`: 체크박스와 텍스트 사이 간격 (예: `"10px"`)
- `color`: 체크박스 테두리 및 체크 마크 색상. 주로 리스트(ul/ol)의 글자 색상과 통일되도록 설정합니다. (예: `"#333333"`)

### 주요 주의 사항 (CSS 제약 조건)
- `code` 블록(인라인 코드)은 `font-size` 속성을 **절대 사용하지 마세요.**
- `word-break: keep-all` 속성은 **전역적으로 절대 사용 금지**합니다. (한국어 거대 공백 버그 방지)
- **테두리(border) 속성 중복 사용 금지**: `border` (단축 속성)와 `border-width`, `border-color` 등 (개별 속성)을 동시에 선언하지 마세요. (예: 표나 인용구 작성 시 `border: 1px solid black`만 사용하거나, 개별 속성들로 쪼개어 사용하되 둘 다 명시하면 안 됩니다)
- `blockquote`의 경우, '왼쪽 띠형' 디자인을 할 때는 `border-left` 속성만 사용하고 다른 `border` 관련 속성(`border-width` 등)은 넣지 마세요. 반대로 '전체 박스형' 디자인을 할 때는 `border` 속성만 사용하세요.
- AI 생성 시, 이 가이드에서 언급되지 않은 속성을 자의적으로 추가하지 마세요. (앱이 크래시될 수 있습니다)

---

## 📌 3. AI에게 새 테마 작성을 지시할 때 (프롬프트 예시)

이 문서를 AI 채팅창에 제공하고 아래와 같이 요청하세요.

> **AI 프롬프트 예시:**
> "제공된 '온리비 어서 서식 프로필 CSS 작성 가이드'를 기반으로, **[공공기관 보고서]** 형태의 테마 JSON 객체 1개를 생성해 줘.
> - 글꼴은 'KoPubDotum'
> - 제목(h1)은 파란색 계열, 왼쪽 굵은 테두리(border-left) 적용
> - 표(table)는 테두리가 없는 미니멀 스타일로, 코드 블록은 Mac OS 테마로 설정해 줘
> - 이미지(img)는 폴라로이드 사진처럼 흰색 두꺼운 테두리와 그림자 효과 추가해
> - 줄 간격은 1.6, 글자 크기는 14px
> - 글머리 기호(ul)는 채워진 원(disc), 숫자 목록(ol)은 1,2,3(decimal) 기본 적용
> - 체크박스 색상은 본문 리스트 색상과 동일하게 맞춤
> **(중요) 가이드에 나열된 모든 태그와 CSS 속성 항목을 단 하나도 빠짐없이 완벽하게 채워서 JSON 결과물만 출력해.**"
