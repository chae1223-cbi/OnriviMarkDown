import { CssProfile } from '../types/cssProfile';

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0006] cssProfile ➔ SYSTEM_PROFILE_IDS
// 🎯 @KICK  : 시스템 프로필 식별자 목록을 정의한다
// 🚨 @PATCH : **2026-09-25** — [한컴 테크 블로그 프리미엄 서식 신규 탑재]: 한컴(HANCOM) 공식 블로그의 모던 테크니컬 디자인을 완벽 재현한 'Onrivi 한컴 테크 블로그 서식(hancom-tech-blog)'을 시스템 프로필로 공식 등록 (H2 오렌지 하단선, H3 오렌지 좌측바, 1.8배 본문 줄간격, 8px 문장 사이 간격, 가로선 중심 비교표, 와이드 라운드 미디어 등 반영)
// 🚨 @PATCH : **2026-09-25** — [문서 표준 용지 여백(상하 18mm, 좌우 12mm) 전 서식 일원화]: 모든 시스템 서식(SYSTEM_PROFILES), 빈 서식(createEmptyProfile), 정규화(normalizeCssProfile)의 pageStyle 여백을 marginTop: 18mm, marginBottom: 18mm, marginLeft: 12mm, marginRight: 12mm로 일원화
// 🚨 @PATCH : **2026-09-25** — [시스템 제공 서식 개편]: 구버전 서식('GitHub 기술 블로그/명세서', '공공기관 보고서 양식')을 삭제하고, 신규 시스템 제공 서식 5종('Onrivi 기술 표준 서식', 'Onrivi 법률·계약서 A4 공식 문서', 'Onrivi 네이버 블로그 감성 서식', 'Onrivi 일반 기술서적 표준 서식', 'Onrivi 공식 행사 및 가정통신문 안내장 서식')을 SYSTEM_PROFILES 및 SYSTEM_PROFILE_IDS에 공식 등록
// 🚨 @PATCH : **2026-09-25** — [체크박스 및 체크리스트 글자색 본문 기본색(#2f2f2f) 일치화]: DEFAULT_PROFILE의 taskList 및 checkboxStructure color를 본문 글자색(#2f2f2f)으로 일원화하여 별도 색상 분리 방지
// 🚨 @PATCH : **2026-09-25** — [체크리스트 완료 항목 스타일 '효과없음(none)' 기본값 통일]: DEFAULT_PROFILE rules.taskList 및 checkboxStructure.checkedEffect를 'none'으로 일원화하고, normalizeCssProfile 시 체크박스 완료 기본 효과를 무조건 'none'으로 보장
// 🚨 @PATCH : **2026-09-24** — [기본 서식 명칭 'Onrivi 기본서식' 표준화]: SYSTEM_PROFILES[0] 및 DEFAULT_PROFILE의 명칭을 'Onrivi 기본서식'으로 일원화하고, 서식 미지정/새 서식/가져오기/내보내기/AI 프롬프트의 기본 기준 서식으로 전면 확정
// 🚨 @PATCH : **2026-09-24** — [기본 서식 'ChatGPT 스타일 콘텐츠' 전환 및 전 시스템(가져오기/내보내기/정규화/프롬프트) 기본값 동기화]: DEFAULT_PROFILE 및 SYSTEM_PROFILES[0]을 'ChatGPT 스타일 콘텐츠'로 전면 교체, pageStyle 기본 여백(상하 22mm, 좌 19mm, 우 20mm), fontSize 16px, lineHeight 1.75, letterSpacing -0.01em 및 7대 쇼케이스 태그/구조체 미설정 시 폴백 기본값 일원화
// 🚨 @PATCH : **2026-09-24** — [문서 표준 용지 여백(상하 18mm, 좌우 12mm) 최적화]: DEFAULT_PROFILE(system-1) 및 SYSTEM_PROFILES(system-2, system-3), createEmptyProfile의 pageStyle 여백을 marginTop: 18mm, marginBottom: 18mm, marginLeft: 12mm, marginRight: 12mm로 일원화 (화면 가독성 및 A4 인쇄 균형 최적화)
// 🚨 @PATCH : **2026-09-24** — [표 외곽 테두리 및 열·행 두께 개별 설정(tableStructure) 지원]: outerBorderWidth(외곽 테두리), rowBorderWidth(행 가로선), colBorderWidth(열 세로선) 독립 제어 구조체 탑재 및 정규화(normalizeCssProfile) 연동
// 🚨 @PATCH : **2026-09-24** — [외부 서식 가져오기/붙여넣기/올리기 정제·정규화(sanitizeAndParseCssProfileJson, normalizeCssProfile) 엔진 표준화]: 마크다운 코드블록/주석/trailing-comma 관대 파싱, ID 중복 및 시스템 프로필 오염 0% 차단, 7대 쇼케이스(각주·수식·표·체크박스·미디어·구분선 등) 및 hrStructure/checkboxStructure 100% 자동 하이드레이션 제공
// 🚨 @PATCH : **2026-09-24** — [수식(MATH) 시스템 서식 기본 상하 마진(16px) 및 정렬 표준화]: DEFAULT_PROFILE 및 system-3의 math margin 단축 속성 잔재를 margin-top/bottom: 16px 및 text-align: center로 일원화하여 슬라이더 충돌 방어
// 🚨 @PATCH : **2026-09-24** — [미디어(이미지·비디오·지도) 기본 규격 및 상하/좌우 정렬 마진 표준화]: DEFAULT_PROFILE 및 SYSTEM_PROFILES(system-2, system-3)의 img, video, map 규칙에 기본 너비(width: 480px/560px/600px), 높이(height), 상하 마진(16px), 좌우 마진(auto)을 명시 부여하여 서식 제어 슬라이더 및 좌/중/우 정렬 변경 즉시 시각적 변화 보장
// 🚨 @PATCH : **2026-09-24** — [표준 서식 표(Table) 기본 글자 크기 상속]: system-1의 table, th, td에서 고정 font-size(13px)를 제거하여 문서 기본 글자 크기(pageStyle.fontSize)를 기본 상속하도록 최적화
// 🚨 @PATCH : **2026-09-24** — [시스템 프로필 blockquote 기본 상하 마진(16px) 통일]: system-1/2/3의 blockquote margin-top/bottom을 16px로 일원화하여 초기 슬라이더 1:1 반응 보장
// 🚨 @PATCH : **2026-09-24** — [수평 구분선(HR) 시스템 서식 규격 표준화]: system-2 및 system-3에 hrStructure 기본 규격 추가 및 rules.hr 레거시 border:0 속성 정제
// 🚨 @PATCH : **2026-09-24** — [표준 서식 H1 왼쪽 여백 정렬]: system-1 H1의 padding-left 15px를 0px로 초기화하여 H2~H6와 시작선 완벽 일치
// 🔗 @CALLS : isSystemProfileId
// ====================================================================
/**
 * 시스템 프로필 식별자 목록 — 이 ID를 가진 프로필은 수정/삭제 불가
 */
export const SYSTEM_PROFILE_IDS = [
  'system-1',
  'github-readme-style',
  'legal-contract-a4',
  'naver-blog-style',
  'profile-tech-book-2026',
  'profile-official-notice-letter',
  'hancom-tech-blog'
] as const;
export type SystemProfileId = typeof SYSTEM_PROFILE_IDS[number];

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0005] cssProfile ➔ isSystemProfileId
// 🎯 @KICK  : 주어진 id가 시스템 프로필 ID인지 검사한다
// 🛡️ @GUARD : SYSTEM_PROFILE_IDS 배열에 포함된 값인지만 확인
// 🚨 @PATCH : 없음
// 🔗 @CALLS : SYSTEM_PROFILE_IDS
// ====================================================================
export function isSystemProfileId(id: string): boolean {
  return (SYSTEM_PROFILE_IDS as readonly string[]).includes(id);
}

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0004] cssProfile ➔ EMPTY_RULES
// 🎯 @KICK  : 모든 태그가 빈 객체인 CssRuleSet 템플릿을 제공한다
// 🛡️ @GUARD : createEmptyProfile()에서 깊은 복사하여 사용되므로 직접 참조하지 않도록 주의
// 🚨 @PATCH : 없음
// 🔗 @CALLS : createEmptyProfile
// ====================================================================
/**
 * 모든 태그가 빈 CssRuleSet을 가진 템플릿 객체입니다.
 * createEmptyProfile()에서 깊은 복사(deep clone)하여 사용합니다.
 * @see createEmptyProfile
 */
const EMPTY_RULES = {
  h1: {}, h2: {}, h3: {}, h4: {}, h5: {}, h6: {},
  p: {}, strong: {}, em: {}, del: {},
  ul: { "list-style-type": "disc" }, ol: { "list-style-type": "decimal" }, li: {}, taskList: {}, hr: {},
  table: {}, th: {}, td: {}, blockquote: {}, codeBlock: {}, codeBlockTitle: {},
  a: {}, img: {}, code: {}, video: {}, math: {},
  map: {}, footnote: {},
};

/**
 * DEFAULT_PROFILE: 애플리케이션 기본값 프로필입니다.
 * - id가 'default'이므로 CssStyleForm에서 모든 입력 필드가 비활성화(disabled)됩니다.
 * - rules는 각 태그에 최소한의 CSS 속성만 지정하여
 *   Tailwind Typography(prose)의 기본 스타일 위에 자연스럽게 얹어집니다.
 * - 사용자가 이 프로필을 선택하면 동적 CSS 주입이 중단되고(dynamicCssString === ''),
 *   MarkdownViewer가 순수 prose 스타일만 사용하게 됩니다.
 * @remarks 사용자 정의 프로필을 생성할 때도 이 객체를 얕은 복사한 뒤
 * rules만 깊은 복사하여 사용합니다. (page.tsx onAddProfile 참고)
 */
// ====================================================================
// 📊 [OMD-CORE-cssProfile-0003] cssProfile ➔ SYSTEM_PROFILES
// 🎯 @KICK  : 앱에 내장된 3개의 시스템 프로필 배열을 정의한다
// 🛡️ @GUARD : system-* 접두사 id를 가지며 수정/삭제 불가
// 🚨 @PATCH : 없음
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * 시스템 기본 프로필 목록 (4개)
 * - 앱에 내장되어 배포되며 수정/삭제 불가
 * - id는 'system-*' 접두사 사용
 */
export const SYSTEM_PROFILES: CssProfile[] = [
  {
    "id": "system-1",
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
  },
  {
    "id": "github-readme-style",
    "name": "Onrivi 기술 표준 서식",
    "description": "GitHub Flavored Markdown 및 GitHub Markdown CSS의 콘텐츠 표현을 참고한 Onrivi Author Preview 전용 서식 테마. GitHub 앱 UI가 아니라 README 문서 콘텐츠의 가독성과 Markdown 표현을 재현한다.",
    "pageStyle": {
      "fontFamily": "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Noto Sans', Helvetica, Arial, sans-serif",
      "fontSize": "16px",
      "lineHeight": "1.5",
      "letterSpacing": "0em",
      "backgroundColor": "#ffffff",
      "paperSize": "a4",
      "marginTop": "18mm",
      "marginBottom": "18mm",
      "marginLeft": "12mm",
      "marginRight": "12mm",
      "orientation": "portrait",
      "headingSizeOffset": "0px",
      "tabSize": "4",
      "exportPageBreakLevel": "h1"
    },
    "rules": {
      "h1": {
        "font-size": "32px",
        "font-weight": "600",
        "color": "#1f2328",
        "padding-left": "0px",
        "margin-bottom": "16px",
        "border-bottom": "1px solid #d0d7de",
        "margin-top": "24px",
        "text-align": "left",
        "text-decoration": "none",
        "font-style": "normal",
        "line-height": "1.25",
        "letter-spacing": "-0.025em",
        "padding-bottom": "8px"
      },
      "h2": {
        "font-size": "24px",
        "font-weight": "600",
        "color": "#1f2328",
        "border-bottom": "1px solid #d8dee4",
        "padding-bottom": "6px",
        "margin-top": "24px",
        "text-decoration": "none",
        "font-style": "normal",
        "margin-bottom": "16px",
        "text-align": "left",
        "line-height": "1.25",
        "letter-spacing": "-0.02em"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "20px",
        "margin-top": "24px",
        "margin-bottom": "16px",
        "color": "#1f2328",
        "border-bottom": "",
        "line-height": "1.25"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "16px",
        "margin-top": "24px",
        "margin-bottom": "16px",
        "color": "#1f2328",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "14px",
        "margin-top": "24px",
        "margin-bottom": "16px",
        "color": "#1f2328",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "12px",
        "margin-top": "24px",
        "margin-bottom": "16px",
        "color": "#656d76",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "p": {
        "margin-bottom": "16px",
        "margin-top": "0px",
        "line-height": "1.5",
        "color": "#1f2328",
        "text-align": "left",
        "text-indent": "0px",
        "letter-spacing": "0em",
        "sentence-gap": "4px"
      },
      "strong": {
        "font-weight": "600",
        "color": "#1f2328"
      },
      "em": {
        "font-style": "italic",
        "color": "#1f2328"
      },
      "u": {
        "text-decoration-color": "#0d0d0d",
        "text-decoration-style": "solid",
        "text-underline-offset": "2px",
        "text-decoration": "underline"
      },
      "del": {
        "text-decoration": "line-through",
        "color": "#656d76"
      },
      "ul": {
        "padding-left": "2em",
        "list-style-type": "disc",
        "color": "#1f2328"
      },
      "ol": {
        "padding-left": "2em",
        "color": "#1f2328",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "4px",
        "padding-inline-start": "3px",
        "line-height": "1.5"
      },
      "taskList": {
        "boxSize": "16px",
        "checkedEffect": "none",
        "textGap": "8px",
        "color": "#1f2328"
      },
      "hr": {
        "border-top-color": "#d8dee4",
        "border-top-width": "1px",
        "border-top-style": "solid",
        "margin-top": "24px",
        "margin-bottom": "24px",
        "width": "100%"
      },
      "table": {
        "width": "100%",
        "border-collapse": "collapse",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "margin-top": "0px",
        "margin-bottom": "16px",
        "font-size": "14px",
        "border-radius": "6px",
        "overflow": "hidden"
      },
      "th": {
        "background-color": "#f6f8fa",
        "padding": "6px 13px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-weight": "600",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "text-align": "left",
        "color": "#1f2328",
        "line-height": "1.5"
      },
      "td": {
        "padding": "6px 13px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "color": "#1f2328",
        "line-height": "1.5"
      },
      "blockquote": {
        "padding": "0 16px",
        "color": "#656d76",
        "background-color": "transparent",
        "border-radius": "0",
        "margin-top": "0px",
        "margin-bottom": "16px",
        "font-weight": "normal",
        "border-left": "4px solid #d0d7de",
        "font-size": "16px",
        "line-height": "1.5"
      },
      "codeBlock": {
        "background-color": "#f6f8fa",
        "color": "#1f2328",
        "padding": "16px",
        "border-radius": "6px",
        "font-size": "13px",
        "border": "1px solid #d0d7de",
        "line-height": "1.45"
      },
      "codeBlockTitle": {
        "background-color": "#f6f8fa",
        "color": "#656d76",
        "padding": "8px 12px",
        "border-radius": "8px 8px 0 0",
        "border": "1px solid #d0d7de"
      },
      "a": {
        "color": "#0969da",
        "text-decoration": "none",
        "font-weight": "bold"
      },
      "img": {
        "width": "100%",
        "border-radius": "6px",
        "margin-top": "16px",
        "margin-bottom": "16px",
        "margin-left": "auto",
        "margin-right": "auto",
        "background-color": "white",
        "padding": "0px",
        "box-shadow": "none"
      },
      "code": {
        "background-color": "#afb8c133",
        "color": "#1f2328",
        "padding": "0.2em 0.4em",
        "border-radius": "6px",
        "font-weight": "normal",
        "border": "none"
      },
      "video": {
        "width": "100%",
        "height": "315px",
        "border-radius": "6px",
        "box-shadow": "none",
        "margin-top": "16px",
        "margin-bottom": "16px",
        "margin-left": "auto",
        "margin-right": "auto",
        "display": "block",
        "float": "none"
      },
      "math": {
        "color": "#1f2328",
        "font-size": "16px",
        "text-align": "center",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "map": {
        "width": "100%",
        "height": "400px",
        "border-radius": "6px",
        "box-shadow": "none",
        "margin-top": "16px",
        "margin-bottom": "16px",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "footnote": {
        "font-size": "12px",
        "color": "#656d76",
        "line-height": "1.5",
        "margin-top": "12px",
        "margin-bottom": "12px",
        "font-weight": "normal"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "24px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "boxSize": "16px",
      "textGap": "8px",
      "color": "#292829",
      "checkedEffect": "none"
    },
    "tableStructure": {
      "outerBorderWidth": "1px",
      "rowBorderWidth": "1px",
      "colBorderWidth": "1px"
    },
    "customCss": ""
  },
  {
    "id": "legal-contract-a4",
    "name": "Onrivi 법률·계약서 A4 공식 문서",
    "description": "법률문서, 계약서, 협약서, 합의서 및 공식 문서 작성에 적합한 A4 전용 서식 테마",
    "pageStyle": {
      "fontFamily": "'Noto Serif KR', 'KoPubBatang', 'Batang', 'Malgun Gothic', serif",
      "fontSize": "16px",
      "lineHeight": "1.8",
      "letterSpacing": "0em",
      "backgroundColor": "#ffffff",
      "paperSize": "a4",
      "marginTop": "18mm",
      "marginBottom": "18mm",
      "marginLeft": "12mm",
      "marginRight": "12mm",
      "orientation": "portrait",
      "headingSizeOffset": "0px",
      "tabSize": "4",
      "exportPageBreakLevel": "h1"
    },
    "rules": {
      "h1": {
        "font-size": "34px",
        "font-weight": "700",
        "color": "#111111",
        "padding-left": "0px",
        "margin-bottom": "20px",
        "border-bottom": "",
        "margin-top": "28px",
        "text-align": "center",
        "text-decoration": "none",
        "font-style": "normal",
        "line-height": "1.5",
        "letter-spacing": "-0.025em"
      },
      "h2": {
        "font-size": "18px",
        "font-weight": "700",
        "color": "#111111",
        "border-bottom": "",
        "padding-bottom": "8px",
        "margin-top": "24px",
        "text-decoration": "none",
        "font-style": "normal",
        "margin-bottom": "12px",
        "text-align": "left",
        "line-height": "1.6",
        "letter-spacing": "-0.02em"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "700",
        "font-size": "15px",
        "margin-top": "18px",
        "margin-bottom": "8px",
        "color": "#111111",
        "border-bottom": "",
        "line-height": "1.7"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "700",
        "font-size": "13px",
        "margin-top": "14px",
        "margin-bottom": "6px",
        "color": "#222222",
        "border-bottom": "",
        "line-height": "1.7"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "700",
        "font-size": "12px",
        "margin-top": "12px",
        "margin-bottom": "5px",
        "color": "#333333",
        "border-bottom": "",
        "line-height": "1.7"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "700",
        "font-size": "11px",
        "margin-top": "10px",
        "margin-bottom": "4px",
        "color": "#444444",
        "border-bottom": "",
        "line-height": "1.7"
      },
      "p": {
        "margin-bottom": "8px",
        "margin-top": "0px",
        "line-height": "1.8",
        "color": "#111111",
        "text-align": "justify",
        "text-indent": "0px",
        "letter-spacing": "0em",
        "sentence-gap": "4px"
      },
      "strong": {
        "font-weight": "700",
        "color": "#111111"
      },
      "em": {
        "font-style": "italic",
        "color": "#222222"
      },
      "u": {
        "text-decoration-color": "#0d0d0d",
        "text-decoration-style": "solid",
        "text-underline-offset": "3px",
        "text-decoration": "underline"
      },
      "del": {
        "text-decoration": "line-through",
        "color": "#666666"
      },
      "ul": {
        "padding-left": "24px",
        "list-style-type": "disc",
        "color": "#111111"
      },
      "ol": {
        "padding-left": "28px",
        "color": "#111111",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "3px",
        "padding-inline-start": "3px",
        "line-height": "1.8"
      },
      "taskList": {
        "boxSize": "14px",
        "checkedEffect": "none",
        "textGap": "7px",
        "color": "#111111"
      },
      "hr": {
        "border-top-color": "#777777",
        "border-top-width": "1px",
        "border-top-style": "solid",
        "margin-top": "18px",
        "margin-bottom": "18px",
        "width": "100%"
      },
      "table": {
        "width": "100%",
        "border-collapse": "collapse",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "margin-top": "12px",
        "margin-bottom": "16px",
        "font-size": "15px",
        "border-radius": "8px",
        "overflow": "hidden"
      },
      "th": {
        "background-color": "#f5f5f5",
        "padding": "7px 9px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-weight": "700",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "text-align": "center",
        "color": "#111111"
      },
      "td": {
        "padding": "7px 9px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "color": "#111111"
      },
      "blockquote": {
        "padding": "8px 14px",
        "color": "#333333",
        "background-color": "#fafafa",
        "border-radius": "0",
        "margin-top": "12px",
        "margin-bottom": "12px",
        "font-weight": "normal",
        "border-left": "2px solid #777777",
        "font-size": "11px"
      },
      "codeBlock": {
        "background-color": "#f7f7f7",
        "color": "#222222",
        "padding": "12px 14px",
        "border-radius": "3px",
        "font-size": "13.5px",
        "border": "1px solid #cccccc"
      },
      "codeBlockTitle": {
        "background-color": "#eeeeee",
        "color": "#444444",
        "padding": "8px 12px",
        "border-radius": "8px 8px 0 0",
        "border": "1px solid #cccccc"
      },
      "a": {
        "color": "#111111",
        "text-decoration": "underline",
        "font-weight": "bold"
      },
      "img": {
        "width": "800px",
        "border-radius": "0",
        "margin-top": "10px",
        "margin-bottom": "10px",
        "margin-left": "auto",
        "margin-right": "auto",
        "background-color": "white",
        "padding": "0px",
        "box-shadow": "none",
        "height": "600px",
        "display": "block"
      },
      "code": {
        "background-color": "#f4f4f4",
        "color": "#222222",
        "padding": "1px 4px",
        "border-radius": "2px",
        "font-weight": "normal",
        "border": "1px solid #dddddd"
      },
      "video": {
        "width": "800px",
        "height": "600px",
        "border-radius": "0",
        "box-shadow": "none",
        "margin-top": "12px",
        "margin-bottom": "12px",
        "margin-left": "auto",
        "margin-right": "auto",
        "display": "block",
        "float": "none"
      },
      "math": {
        "color": "#111111",
        "font-size": "13px",
        "text-align": "center",
        "margin-top": "12px",
        "margin-bottom": "12px"
      },
      "map": {
        "width": "800px",
        "height": "600px",
        "border-radius": "0",
        "box-shadow": "none",
        "margin-top": "12px",
        "margin-bottom": "12px",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "footnote": {
        "font-size": "9px",
        "color": "#555555",
        "line-height": "1.5",
        "margin-top": "8px",
        "margin-bottom": "8px",
        "font-weight": "normal"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "18px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "boxSize": "14px",
      "textGap": "7px",
      "color": "#111111",
      "checkedEffect": "none"
    },
    "tableStructure": {
      "outerBorderWidth": "1px",
      "rowBorderWidth": "1px",
      "colBorderWidth": "1px"
    },
    "customCss": ""
  },
  {
    "id": "naver-blog-style",
    "name": "Onrivi 네이버 블로그 감성 서식",
    "description": "트렌디하고 가독성이 뛰어난 네이버 블로그 전용 서식 테마",
    "pageStyle": {
      "fontFamily": "'Pretendard', 'NanumSquare', 'Nanum Gothic', sans-serif",
      "fontSize": "15px",
      "lineHeight": "1.8",
      "letterSpacing": "-0.01em",
      "backgroundColor": "#FFFFFF",
      "paperSize": "a4",
      "marginTop": "18mm",
      "marginBottom": "18mm",
      "marginLeft": "12mm",
      "marginRight": "12mm",
      "orientation": "portrait",
      "headingSizeOffset": "3px",
      "tabSize": "4",
      "exportPageBreakLevel": "h1"
    },
    "rules": {
      "h1": {
        "font-size": "24px",
        "font-weight": "700",
        "color": "#111111",
        "padding-left": "12px",
        "margin-bottom": "16px",
        "border-bottom": "",
        "margin-top": "28px",
        "text-align": "left",
        "text-decoration": "none",
        "font-style": "normal",
        "line-height": "1.25",
        "letter-spacing": "-0.025em",
        "border-left": "5px solid #03C75A"
      },
      "h2": {
        "font-size": "20px",
        "font-weight": "700",
        "color": "#4e62e2",
        "border-bottom": "1px solid #E5E7EB",
        "padding-bottom": "8px",
        "margin-top": "22px",
        "text-decoration": "none",
        "font-style": "normal",
        "margin-bottom": "12px",
        "text-align": "left",
        "line-height": "1.35",
        "letter-spacing": "-0.02em",
        "padding-left": "0px"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "17px",
        "margin-top": "18px",
        "margin-bottom": "8px",
        "color": "#333333",
        "border-bottom": "",
        "line-height": "1.4"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "15px",
        "margin-top": "14px",
        "margin-bottom": "6px",
        "color": "#444444",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "14px",
        "margin-top": "12px",
        "margin-bottom": "4px",
        "color": "#666666",
        "border-bottom": "",
        "line-height": "1.55"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "13px",
        "margin-top": "10px",
        "margin-bottom": "4px",
        "color": "#888888",
        "border-bottom": "",
        "line-height": "1.55"
      },
      "p": {
        "margin-bottom": "14px",
        "margin-top": "0px",
        "line-height": "1.8",
        "color": "#333333",
        "text-align": "left",
        "text-indent": "0px",
        "letter-spacing": "-0.01em",
        "sentence-gap": "6px"
      },
      "strong": {
        "font-weight": "bold",
        "color": "#111111",
        "background-color": "#F7F9FA"
      },
      "em": {
        "font-style": "italic",
        "color": "#0d0d0d"
      },
      "u": {
        "text-decoration-color": "#0d0d0d",
        "text-decoration-style": "solid",
        "text-underline-offset": "3px",
        "text-decoration": "underline"
      },
      "del": {
        "text-decoration": "line-through",
        "color": "#999999"
      },
      "ul": {
        "padding-left": "20px",
        "list-style-type": "disc",
        "color": "#333333"
      },
      "ol": {
        "padding-left": "20px",
        "color": "#333333",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "6px",
        "padding-inline-start": "3px",
        "line-height": "1.7"
      },
      "taskList": {
        "boxSize": "16px",
        "checkedEffect": "none",
        "textGap": "8px",
        "color": "#333333"
      },
      "hr": {
        "border-top-color": "#E5E7EB",
        "border-top-width": "3px",
        "border-top-style": "solid",
        "margin-top": "24px",
        "margin-bottom": "24px",
        "width": "100%"
      },
      "table": {
        "width": "100%",
        "border-collapse": "collapse",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "margin-top": "16px",
        "margin-bottom": "20px",
        "font-size": "14px",
        "border-radius": "8px",
        "overflow": "hidden"
      },
      "th": {
        "background-color": "#F3F4F6",
        "padding": "10px 12px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-weight": "bold",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "text-align": "center",
        "color": "#111111"
      },
      "td": {
        "padding": "10px 12px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "color": "#333333"
      },
      "blockquote": {
        "padding": "16px 20px",
        "color": "#495057",
        "background-color": "#F7F9FA",
        "border-radius": "12px",
        "margin-top": "18px",
        "margin-bottom": "18px",
        "font-weight": "normal",
        "border-left": "5px solid #2563eb",
        "font-size": "14px",
        "border": "1px solid #E9ECEF"
      },
      "codeBlock": {
        "background-color": "#1E293B",
        "color": "#F8FAFC",
        "padding": "16px",
        "border-radius": "10px",
        "font-size": "13.5px",
        "border": "1px solid #e5e5e5"
      },
      "codeBlockTitle": {
        "background-color": "#0F172A",
        "color": "#94A3B8",
        "padding": "8px 12px",
        "border-radius": "8px 8px 0 0",
        "border": "1px solid #e5e5e5"
      },
      "a": {
        "color": "#4e62e2",
        "text-decoration": "underline",
        "font-weight": "bold"
      },
      "img": {
        "width": "100%",
        "border-radius": "12px",
        "margin-top": "16px",
        "margin-bottom": "16px",
        "margin-left": "auto",
        "margin-right": "auto",
        "background-color": "white",
        "padding": "0px",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.06)"
      },
      "code": {
        "background-color": "#F1F5F9",
        "color": "#4e62e2",
        "padding": "2px 6px",
        "border-radius": "4px",
        "font-weight": "bold",
        "border": "1px solid #e5e5e5"
      },
      "video": {
        "width": "100%",
        "height": "315px",
        "border-radius": "12px",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.08)",
        "margin-top": "16px",
        "margin-bottom": "16px",
        "margin-left": "auto",
        "margin-right": "auto",
        "display": "block",
        "float": "none"
      },
      "math": {
        "color": "#333333",
        "font-size": "16px",
        "text-align": "center",
        "margin-top": "14px",
        "margin-bottom": "14px"
      },
      "map": {
        "width": "100%",
        "height": "360px",
        "border-radius": "12px",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.08)",
        "margin-top": "16px",
        "margin-bottom": "16px",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "footnote": {
        "font-size": "12px",
        "color": "#6B7280",
        "line-height": "1.5",
        "margin-top": "10px",
        "margin-bottom": "10px",
        "font-weight": "normal"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "3px",
      "marginTopBottom": "24px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "boxSize": "16px",
      "textGap": "8px",
      "color": "#333333",
      "checkedEffect": "none"
    },
    "tableStructure": {
      "outerBorderWidth": "1px",
      "rowBorderWidth": "1px",
      "colBorderWidth": "1px"
    },
    "customCss": ""
  },
  {
    "id": "profile-tech-book-2026",
    "name": "Onrivi 일반 기술서적 표준 서식",
    "description": "가독성과 코드/도표 식별성을 극대화한 IT 및 일반 기술 서적 전용 표준 서식 테마입니다.",
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
        "font-size": "30px",
        "font-weight": "800",
        "color": "#0f172a",
        "padding-left": "0px",
        "margin-bottom": "20px",
        "border-bottom": "2px solid #0284c7",
        "margin-top": "36px",
        "text-align": "left",
        "text-decoration": "none",
        "font-style": "normal",
        "line-height": "1.3",
        "letter-spacing": "-0.02em",
        "padding-bottom": "10px"
      },
      "h2": {
        "font-size": "23px",
        "font-weight": "700",
        "color": "#1e293b",
        "border-bottom": "1px solid #e2e8f0",
        "padding-bottom": "8px",
        "margin-top": "30px",
        "text-decoration": "none",
        "font-style": "normal",
        "margin-bottom": "14px",
        "text-align": "left",
        "line-height": "1.35",
        "letter-spacing": "-0.015em"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "700",
        "font-size": "19px",
        "margin-top": "24px",
        "margin-bottom": "10px",
        "color": "#0284c7",
        "border-bottom": "",
        "line-height": "1.4"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "650",
        "font-size": "17px",
        "margin-top": "20px",
        "margin-bottom": "8px",
        "color": "#334155",
        "border-bottom": "",
        "line-height": "1.45"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "650",
        "font-size": "16px",
        "margin-top": "18px",
        "margin-bottom": "6px",
        "color": "#475569",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "15px",
        "margin-top": "16px",
        "margin-bottom": "6px",
        "color": "#64748b",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "p": {
        "margin-bottom": "16px",
        "margin-top": "0px",
        "line-height": "1.75",
        "color": "#334155",
        "text-align": "left",
        "text-indent": "0px",
        "letter-spacing": "-0.01em",
        "sentence-gap": "3px"
      },
      "strong": {
        "font-weight": "700",
        "color": "#0f172a"
      },
      "em": {
        "font-style": "italic",
        "color": "#0284c7"
      },
      "u": {
        "text-decoration-color": "#0284c7",
        "text-decoration-style": "solid",
        "text-underline-offset": "3px",
        "text-decoration": "underline"
      },
      "del": {
        "text-decoration": "line-through",
        "color": "#94a3b8"
      },
      "ul": {
        "padding-left": "24px",
        "list-style-type": "disc",
        "color": "#334155"
      },
      "ol": {
        "padding-left": "24px",
        "color": "#334155",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "6px",
        "padding-inline-start": "2px",
        "line-height": "1.7"
      },
      "taskList": {
        "boxSize": "16px",
        "checkedEffect": "none",
        "textGap": "9px",
        "color": "#334155"
      },
      "hr": {
        "border-top-color": "#cbd5e1",
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
        "border-color": "#cbd5e1",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "font-size": "14.5px",
        "border-radius": "4px",
        "overflow": "hidden"
      },
      "th": {
        "background-color": "#f1f5f9",
        "padding": "10px 14px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#cbd5e1",
        "font-weight": "700",
        "border-bottom": "2px solid #94a3b8",
        "border-left": "1px solid #cbd5e1",
        "border-right": "1px solid #cbd5e1",
        "text-align": "left",
        "color": "#0f172a"
      },
      "td": {
        "padding": "9px 14px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#cbd5e1",
        "border-bottom": "1px solid #cbd5e1",
        "border-left": "1px solid #cbd5e1",
        "border-right": "1px solid #cbd5e1",
        "color": "#334155"
      },
      "blockquote": {
        "padding": "14px 18px",
        "color": "#334155",
        "background-color": "#f0f9ff",
        "border-radius": "0px 6px 6px 0px",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "font-weight": "normal",
        "border-left": "4px solid #0284c7",
        "font-size": "15px"
      },
      "codeBlock": {
        "background-color": "#1e293b",
        "color": "#f8fafc",
        "padding": "16px",
        "border-radius": "6px",
        "font-size": "13.5px",
        "border": "1px solid #0f172a"
      },
      "codeBlockTitle": {
        "background-color": "#0f172a",
        "color": "#94a3b8",
        "padding": "8px 14px",
        "border-radius": "6px 6px 0 0",
        "border": "1px solid #0f172a"
      },
      "a": {
        "color": "#0284c7",
        "text-decoration": "underline",
        "font-weight": "600"
      },
      "img": {
        "width": "100%",
        "border-radius": "6px",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "margin-left": "auto",
        "margin-right": "auto",
        "background-color": "#ffffff",
        "padding": "0px",
        "box-shadow": "0 1px 3px rgba(0,0,0,0.1)"
      },
      "code": {
        "background-color": "#f1f5f9",
        "color": "#0f172a",
        "padding": "2px 6px",
        "border-radius": "4px",
        "font-weight": "600",
        "border": "1px solid #e2e8f0"
      },
      "video": {
        "width": "100%",
        "height": "350px",
        "border-radius": "6px",
        "box-shadow": "none",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "margin-left": "auto",
        "margin-right": "auto",
        "display": "block",
        "float": "none"
      },
      "math": {
        "color": "#0f172a",
        "font-size": "16px",
        "text-align": "center",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "map": {
        "width": "100%",
        "height": "380px",
        "border-radius": "6px",
        "box-shadow": "none",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "footnote": {
        "font-size": "13px",
        "color": "#64748b",
        "line-height": "1.5",
        "margin-top": "10px",
        "margin-bottom": "10px",
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
      "textGap": "9px",
      "color": "#0d0d0d",
      "checkedEffect": "none"
    },
    "tableStructure": {
      "outerBorderWidth": "1px",
      "rowBorderWidth": "1px",
      "colBorderWidth": "1px"
    },
    "customCss": ""
  },
  {
    "id": "profile-official-notice-letter",
    "name": "Onrivi 공식 행사 및 가정통신문 안내장 서식",
    "description": "학교 가정통신문, 사내 공지문, 세미나 및 행사 안내장을 정갈하고 신뢰감 있게 출력·배포할 수 있는 공식 안내장 테마입니다.",
    "pageStyle": {
      "fontFamily": "'Pretendard', 'KoPubDotum', 'Noto Sans KR', -apple-system, sans-serif",
      "fontSize": "15.5px",
      "lineHeight": "1.75",
      "letterSpacing": "-0.015em",
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
        "font-size": "30px",
        "font-weight": "800",
        "color": "#111827",
        "padding-left": "0px",
        "margin-bottom": "22px",
        "border-bottom": "3px double #374151",
        "margin-top": "24px",
        "text-align": "center",
        "text-decoration": "none",
        "font-style": "normal",
        "line-height": "1.3",
        "letter-spacing": "-0.02em",
        "padding-bottom": "12px"
      },
      "h2": {
        "font-size": "22px",
        "font-weight": "750",
        "color": "#1f2937",
        "border-bottom": "1px solid #d1d5db",
        "padding-bottom": "6px",
        "margin-top": "28px",
        "text-decoration": "none",
        "font-style": "normal",
        "margin-bottom": "14px",
        "text-align": "left",
        "line-height": "1.35",
        "letter-spacing": "-0.015em"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "700",
        "font-size": "18.5px",
        "margin-top": "22px",
        "margin-bottom": "10px",
        "color": "#374151",
        "border-bottom": "",
        "line-height": "1.4"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "650",
        "font-size": "17px",
        "margin-top": "18px",
        "margin-bottom": "8px",
        "color": "#4b5563",
        "border-bottom": "",
        "line-height": "1.45"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "650",
        "font-size": "16px",
        "margin-top": "16px",
        "margin-bottom": "8px",
        "color": "#4b5563",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "650",
        "font-size": "15px",
        "margin-top": "14px",
        "margin-bottom": "6px",
        "color": "#6b7280",
        "border-bottom": "",
        "line-height": "1.5"
      },
      "p": {
        "margin-bottom": "14px",
        "margin-top": "0px",
        "line-height": "1.75",
        "color": "#374151",
        "text-align": "justify",
        "text-indent": "0px",
        "letter-spacing": "-0.01em",
        "sentence-gap": "4px"
      },
      "strong": {
        "font-weight": "700",
        "color": "#111827"
      },
      "em": {
        "font-style": "italic",
        "color": "#4b5563"
      },
      "u": {
        "text-decoration-color": "#4b5563",
        "text-decoration-style": "solid",
        "text-underline-offset": "3px",
        "text-decoration": "underline"
      },
      "del": {
        "text-decoration": "line-through",
        "color": "#9ca3af"
      },
      "ul": {
        "padding-left": "24px",
        "list-style-type": "disc",
        "color": "#374151"
      },
      "ol": {
        "padding-left": "24px",
        "color": "#374151",
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
        "color": "#374151"
      },
      "hr": {
        "border-top-color": "#e5e7eb",
        "border-top-width": "1px",
        "border-top-style": "solid",
        "margin-top": "26px",
        "margin-bottom": "26px",
        "width": "100%"
      },
      "table": {
        "width": "100%",
        "border-collapse": "collapse",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "font-size": "14.5px",
        "border-radius": "6px",
        "overflow": "hidden"
      },
      "th": {
        "background-color": "#f3f4f6",
        "padding": "10px 12px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-weight": "700",
        "border-bottom": "1.5px solid #6b7280",
        "border-left": "none",
        "border-right": "none",
        "text-align": "center",
        "color": "#111827"
      },
      "td": {
        "padding": "9px 12px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#d1d5db",
        "border-bottom": "1px solid #e5e5e5",
        "border-left": "none",
        "border-right": "none",
        "color": "#374151"
      },
      "blockquote": {
        "padding": "12px 18px",
        "color": "#1f2937",
        "background-color": "#f9fafb",
        "border-radius": "6px",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "font-weight": "500",
        "border-left": "4px solid #4b5563",
        "font-size": "15px"
      },
      "codeBlock": {
        "background-color": "#f3f4f6",
        "color": "#1f2937",
        "padding": "14px 18px",
        "border-radius": "6px",
        "font-size": "13.5px",
        "border": "1px solid #e5e7eb"
      },
      "codeBlockTitle": {
        "background-color": "#e5e7eb",
        "color": "#374151",
        "padding": "8px 12px",
        "border-radius": "6px 6px 0 0",
        "border": "1px solid #d1d5db"
      },
      "a": {
        "color": "#1d4ed8",
        "text-decoration": "underline",
        "font-weight": "600"
      },
      "img": {
        "width": "100%",
        "border-radius": "6px",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "margin-left": "auto",
        "margin-right": "auto",
        "background-color": "white",
        "padding": "0px",
        "box-shadow": "none"
      },
      "code": {
        "background-color": "#f3f4f6",
        "color": "#111827",
        "padding": "2px 6px",
        "border-radius": "4px",
        "font-weight": "600",
        "border": "1px solid #e5e7eb"
      },
      "video": {
        "width": "100%",
        "height": "315px",
        "border-radius": "6px",
        "box-shadow": "none",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "margin-left": "auto",
        "margin-right": "auto",
        "display": "block",
        "float": "none"
      },
      "math": {
        "color": "#111827",
        "font-size": "16px",
        "text-align": "center",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "map": {
        "width": "100%",
        "height": "400px",
        "border-radius": "6px",
        "box-shadow": "none",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "footnote": {
        "font-size": "12.5px",
        "color": "#6b7280",
        "line-height": "1.5",
        "margin-top": "12px",
        "margin-bottom": "12px",
        "font-weight": "normal"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "26px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "checkedEffect": "none",
      "boxSize": "16px",
      "textGap": "9px",
      "color": "#374151"
    },
    "tableStructure": {
      "outerBorderWidth": "1px",
      "rowBorderWidth": "1px",
      "colBorderWidth": "1px"
    },
    "customCss": ""
  },
  {
    "id": "hancom-tech-blog",
    "name": "Onrivi 한컴 테크 블로그 서식",
    "description": "한컴(HANCOM) 공식 기술 블로그의 모던 테크니컬 디자인을 완벽 구현한 서식입니다. H2 오렌지 하단선과 H3 오렌지 버티컬 바, 1.8배 본문 줄간격과 8px 문장 사이 간격, 가로선 중심의 비교표와 100% 와이드 라운드 미디어로 전문적인 IT 기술 아티클과 리포트를 완성합니다.",
    "pageStyle": {
      "fontFamily": "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', Arial, sans-serif",
      "fontSize": "16px",
      "lineHeight": "1.8",
      "letterSpacing": "-0.02em",
      "backgroundColor": "#ffffff",
      "paperSize": "a4",
      "marginTop": "18mm",
      "marginBottom": "18mm",
      "marginLeft": "12mm",
      "marginRight": "12mm",
      "orientation": "portrait",
      "headingSizeOffset": "0px",
      "tabSize": "4",
      "exportPageBreakLevel": "h1"
    },
    "rules": {
      "h1": {
        "font-size": "32px",
        "font-weight": "800",
        "color": "#111827",
        "line-height": "1.35",
        "letter-spacing": "-0.03em",
        "margin-top": "36px",
        "margin-bottom": "24px",
        "text-align": "left",
        "padding-left": "0px"
      },
      "h2": {
        "font-size": "23px",
        "font-weight": "700",
        "color": "#111827",
        "line-height": "1.4",
        "letter-spacing": "-0.02em",
        "border-bottom": "2px solid #ff5a00",
        "padding-bottom": "10px",
        "margin-top": "52px",
        "margin-bottom": "20px",
        "text-align": "left",
        "padding-left": "0px"
      },
      "h3": {
        "font-size": "18.5px",
        "font-weight": "700",
        "color": "#1f2937",
        "line-height": "1.5",
        "letter-spacing": "-0.015em",
        "border-left": "4px solid #ff5a00",
        "padding-left": "12px",
        "margin-top": "34px",
        "margin-bottom": "14px",
        "text-align": "left"
      },
      "h4": {
        "font-size": "16px",
        "font-weight": "700",
        "color": "#374151",
        "line-height": "1.5",
        "letter-spacing": "-0.01em",
        "margin-top": "24px",
        "margin-bottom": "10px",
        "text-align": "left",
        "padding-left": "0px"
      },
      "h5": {
        "font-size": "15px",
        "font-weight": "700",
        "color": "#4b5563",
        "line-height": "1.5",
        "margin-top": "20px",
        "margin-bottom": "8px",
        "text-align": "left",
        "padding-left": "0px"
      },
      "h6": {
        "font-size": "14px",
        "font-weight": "700",
        "color": "#64748b",
        "line-height": "1.5",
        "margin-top": "16px",
        "margin-bottom": "6px",
        "text-align": "left",
        "padding-left": "0px"
      },
      "p": {
        "font-size": "16px",
        "font-weight": "400",
        "line-height": "1.8",
        "letter-spacing": "-0.02em",
        "color": "#374151",
        "margin-top": "0px",
        "margin-bottom": "20px",
        "sentence-gap": "8px",
        "text-align": "left",
        "text-indent": "0px"
      },
      "strong": {
        "font-weight": "700",
        "color": "#111827"
      },
      "em": {
        "font-style": "italic",
        "color": "#374151"
      },
      "u": {
        "text-decoration": "underline",
        "text-decoration-color": "#ff5a00",
        "text-underline-offset": "3px"
      },
      "del": {
        "text-decoration": "line-through",
        "color": "#94a3b8"
      },
      "a": {
        "color": "#0284c7",
        "text-decoration": "underline",
        "text-underline-offset": "3px",
        "font-weight": "600"
      },
      "blockquote": {
        "background-color": "#f8fafc",
        "border-left": "4px solid #ff5a00",
        "border-radius": "6px",
        "padding": "16px 20px",
        "margin-top": "24px",
        "margin-bottom": "24px",
        "color": "#475569",
        "font-size": "15px",
        "line-height": "1.7"
      },
      "table": {
        "width": "100%",
        "border-collapse": "collapse",
        "margin-top": "24px",
        "margin-bottom": "32px",
        "border-top": "2px solid #111827",
        "border-bottom": "1px solid #e2e8f0"
      },
      "th": {
        "background-color": "#f8fafc",
        "color": "#111827",
        "font-weight": "700",
        "padding": "12px 16px",
        "text-align": "center",
        "border-bottom": "1.5px solid #cbd5e1"
      },
      "td": {
        "padding": "12px 16px",
        "color": "#334155",
        "border-bottom": "1px solid #f1f5f9",
        "font-size": "14.5px",
        "line-height": "1.6"
      },
      "ul": {
        "padding-left": "22px",
        "list-style-type": "disc",
        "color": "#374151",
        "margin-bottom": "20px"
      },
      "ol": {
        "padding-left": "22px",
        "list-style-type": "decimal",
        "color": "#374151",
        "margin-bottom": "20px"
      },
      "li": {
        "margin-bottom": "8px",
        "line-height": "1.75",
        "padding-inline-start": "6px"
      },
      "taskList": {
        "boxSize": "16px",
        "checkedEffect": "none",
        "textGap": "10px",
        "color": "#ff5a00"
      },
      "hr": {
        "border-top": "1px solid #e2e8f0",
        "margin-top": "40px",
        "margin-bottom": "40px",
        "width": "100%"
      },
      "codeBlock": {
        "background-color": "#0f172a",
        "color": "#f8fafc",
        "border-radius": "8px",
        "padding": "16px 20px",
        "margin-top": "20px",
        "margin-bottom": "24px",
        "font-family": "JetBrains Mono, D2Coding, Consolas, monospace",
        "font-size": "14px",
        "line-height": "1.6"
      },
      "codeBlockTitle": {
        "background-color": "#1e293b",
        "color": "#94a3b8",
        "padding": "8px 16px",
        "border-radius": "8px 8px 0 0",
        "font-size": "13px"
      },
      "code": {
        "background-color": "#f1f5f9",
        "color": "#ea580c",
        "border-radius": "4px",
        "padding": "2px 6px",
        "font-weight": "600"
      },
      "img": {
        "width": "100%",
        "height": "auto",
        "border-radius": "10px",
        "box-shadow": "0 4px 16px -2px rgba(0, 0, 0, 0.08)",
        "margin-top": "28px",
        "margin-bottom": "28px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "video": {
        "width": "100%",
        "height": "315px",
        "border-radius": "10px",
        "margin-top": "28px",
        "margin-bottom": "28px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "map": {
        "width": "100%",
        "height": "400px",
        "border-radius": "10px",
        "margin-top": "28px",
        "margin-bottom": "28px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "math": {
        "color": "#111827",
        "margin-top": "20px",
        "margin-bottom": "20px",
        "text-align": "center"
      },
      "footnote": {
        "font-size": "13px",
        "color": "#64748b",
        "line-height": "1.6",
        "margin-top": "32px",
        "margin-bottom": "16px"
      }
    },
    "tableStructure": {
      "outerBorderWidth": "1px",
      "rowBorderWidth": "1px",
      "colBorderWidth": "0px"
    },
    "hrStructure": {
      "borderTopWidth": "1px",
      "borderTopStyle": "solid",
      "lineWidth": "100%",
      "marginTopBottom": "40px"
    },
    "checkboxStructure": {
      "boxSize": "16px",
      "checkedEffect": "none",
      "textGap": "10px",
      "color": "#ff5a00"
    },
    "customCss": ""
  }
];
// ====================================================================
// 📊 [OMD-CORE-cssProfile-0002] cssProfile ➔ DEFAULT_PROFILE
// 🎯 @KICK  : 시스템 기본 프로필(system-gov)을 기본값으로 내보낸다
// 🛡️ @GUARD : SYSTEM_PROFILES[0]을 참조하며 시스템 프로필이므로 수정/삭제 불가
// 🚨 @PATCH : 없음
// 🔗 @CALLS : SYSTEM_PROFILES
// ====================================================================
/**
 * DEFAULT_PROFILE: 사용자 정의 프로필 생성/가져오기 시 템플릿으로 사용합니다.
 * (시스템 프로필이 아니므로 가져온 스타일로 덮어쓸 수 있습니다)
 */
export const DEFAULT_PROFILE: CssProfile = SYSTEM_PROFILES[0]; // system-gov

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0001] cssProfile ➔ createEmptyProfile
// 🎯 @KICK  : 새로운 빈 CssProfile 객체를 생성하여 반환한다
// 🛡️ @GUARD : EMPTY_RULES를 깊은 복사하여 여러 프로필이 동일 객체를 참조하지 않도록 방지한다
// 🚨 @PATCH : **2026-09-11** — CssProfile에 customCss 사용자 정의 CSS 속성 연동
// 🔗 @CALLS : 없음
// ====================================================================
/**
 * 새로운 빈 프로필을 생성합니다.
 * EMPTY_RULES를 JSON.parse(JSON.stringify(...))로 깊은 복사하여
 * 여러 프로필이同一个 객체를 참조하지 않도록 합니다.
 * @returns 모든 rules가 빈 객체인 CssProfile (id와 이름은 빈 문자열)
 */
export function createEmptyProfile(): CssProfile {
  return {
    id: '',
    name: '',
    customCss: '',
    pageStyle: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Noto Sans', Arial, sans-serif",
      fontSize: '16px',
      lineHeight: '1.75',
      letterSpacing: '-0.01em',
      backgroundColor: '#ffffff',
      paperSize: 'a4',
      marginTop: '18mm',
      marginBottom: '18mm',
      marginLeft: '12mm',
      marginRight: '12mm',
      orientation: 'portrait',
      headingSizeOffset: '0px',
      tabSize: '2',
      exportPageBreakLevel: 'h1'
    },
    rules: JSON.parse(JSON.stringify(EMPTY_RULES)),
    hrStructure: {
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
      marginTopBottom: '28px',
      lineWidth: '100%'
    },
    checkboxStructure: {
      boxSize: '16px',
      checkedEffect: 'none',
      textGap: '9px',
      color: '#2f2f2f'
    },
    tableStructure: {
      outerBorderWidth: '1px',
      rowBorderWidth: '1px',
      colBorderWidth: '1px'
    }
  };
}

/**
 * 외부에서 붙여넣기 되거나 파일로 업로드된 원본 JSON 문자열을
 * 마크다운 코드블록, 앞뒤 주석, trailing comma 등을 관대하게 정제하여 안전하게 파싱합니다.
 */
export function sanitizeAndParseCssProfileJson(rawText: string): any | null {
  if (!rawText || typeof rawText !== 'string') return null;
  let text = rawText.trim();

  // 1. 마크다운 ```json ... ``` 블록 추출
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = text.match(codeBlockRegex);
  if (match && match[1]) {
    text = match[1].trim();
  }

  // 2. 앞뒤 설명 텍스트 방어: 첫 '{'부터 마지막 '}'까지 슬라이스
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  }

  // 3. 1차 표준 JSON.parse 시도
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {
    // 파싱 실패 시 추가 살균 시도
  }

  // 4. 단일행 주석(// ...) 및 마지막 쉼표(trailing comma) 정제 후 2차 시도
  try {
    const relaxed = text
      .replace(/\/\/[^\n\r]*/g, '') // 단일행 주석 제거
      .replace(/,\s*([\]}])/g, '$1'); // trailing comma 제거
    const parsed = JSON.parse(relaxed);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (_) {
    // 2차 파싱 실패
  }

  return null;
}

/**
 * 임포트/붙여넣기/업로드된 프로필 데이터를 Onrivi 최신 서식 기준(DEFAULT_PROFILE / 7대 쇼케이스 태그 등)에 맞추어
 * 완벽하게 정규화(Deep Merge, 살균, 누락 필드 하이드레이션, ID 충돌 방지)합니다.
 */
export function normalizeCssProfile(
  imported: any,
  existingProfiles: CssProfile[] = []
): CssProfile {
  // 1. ID 충돌 방지 및 안전한 새 식별자 부여
  const isDuplicateId = existingProfiles.some((p: any) => p.id === imported?.id);
  const isSystem = isSystemProfileId(imported?.id || '');
  const finalId = (!imported?.id || isDuplicateId || isSystem)
    ? ('profile-' + Date.now())
    : imported.id;

  // 2. pageStyle null/undefined/empty string 살균 및 기본값 병합
  const cleanPageStyle = Object.fromEntries(
    Object.entries(imported?.pageStyle || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const mergedPageStyle = {
    ...DEFAULT_PROFILE.pageStyle,
    ...cleanPageStyle,
    fontFamily: cleanPageStyle.fontFamily || DEFAULT_PROFILE.pageStyle.fontFamily,
    fontSize: cleanPageStyle.fontSize || DEFAULT_PROFILE.pageStyle.fontSize || '16px',
    lineHeight: cleanPageStyle.lineHeight || DEFAULT_PROFILE.pageStyle.lineHeight || '1.75',
    letterSpacing: cleanPageStyle.letterSpacing || DEFAULT_PROFILE.pageStyle.letterSpacing || '-0.01em',
    paperSize: cleanPageStyle.paperSize || DEFAULT_PROFILE.pageStyle.paperSize || 'a4',
    orientation: cleanPageStyle.orientation || DEFAULT_PROFILE.pageStyle.orientation || 'portrait',
    marginTop: cleanPageStyle.marginTop || DEFAULT_PROFILE.pageStyle.marginTop || '18mm',
    marginBottom: cleanPageStyle.marginBottom || DEFAULT_PROFILE.pageStyle.marginBottom || '18mm',
    marginLeft: cleanPageStyle.marginLeft || DEFAULT_PROFILE.pageStyle.marginLeft || '12mm',
    marginRight: cleanPageStyle.marginRight || DEFAULT_PROFILE.pageStyle.marginRight || '12mm',
    tabSize: cleanPageStyle.tabSize || DEFAULT_PROFILE.pageStyle.tabSize || '2',
    headingSizeOffset: cleanPageStyle.headingSizeOffset || DEFAULT_PROFILE.pageStyle.headingSizeOffset || '0px',
    exportPageBreakLevel: cleanPageStyle.exportPageBreakLevel || DEFAULT_PROFILE.pageStyle.exportPageBreakLevel || 'h1',
  };

  // 3. rules 구버전 호환 살균 (Sanitization)
  const incomingRules = imported?.rules ? structuredClone(imported.rules) : {};
  Object.keys(incomingRules).forEach(tag => {
    const r = incomingRules[tag];
    if (r && typeof r === 'object') {
      // 3-1. 거대 공백 버그 유발 keep-all -> break-all 변환
      if (r['word-break'] === 'keep-all') {
        r['word-break'] = 'break-all';
      }
    }
  });

  // 3-2. blockquote 테두리 중복 속성 살균
  if (incomingRules.blockquote) {
    const bq = incomingRules.blockquote;
    if (bq['border-left'] === 'none') {
      delete bq['border-left'];
    }
    if (bq['border-left'] && bq['border-left'] !== 'none' && bq['border-width']) {
      delete bq['border-width'];
    }
    if (bq['border'] && bq['border'] !== 'none' && bq['border-left-width']) {
      delete bq['border-left-width'];
    }
  }

  // 3-3. 인라인 code 폰트 크기 조절 잔재 제거
  if (incomingRules.code && incomingRules.code['font-size']) {
    delete incomingRules.code['font-size'];
  }

  // 3-4. 표(table, th, td) 단축 속성과 개별 속성 중복 제거
  ['table', 'th', 'td'].forEach(tag => {
    if (incomingRules[tag] && incomingRules[tag]['border-width'] && incomingRules[tag]['border']) {
      delete incomingRules[tag]['border'];
    }
  });

  // 4. 7대 쇼케이스 태그(각주, 수식, 표, 인용구, 체크박스, 구분선, 미디어 등) 누락 방어 2-Depth Deep Merge
  const cleanRules = Object.fromEntries(
    Object.entries(incomingRules).filter(([, v]) => v !== undefined && v !== null)
  );
  const deeplyMergedRules: any = structuredClone(DEFAULT_PROFILE.rules || {});
  Object.keys(cleanRules).forEach(tag => {
    deeplyMergedRules[tag] = {
      ...(deeplyMergedRules[tag] || {}),
      ...(cleanRules[tag] as object || {}),
    };
  });

  // 5. hrStructure 및 checkboxStructure, tableStructure 안전 병합
  const mergedHrStructure = {
    ...(DEFAULT_PROFILE.hrStructure || {}),
    ...(imported?.hrStructure || {}),
  };
  const mergedCheckboxStructure = {
    boxSize: '16px',
    textGap: '9px',
    color: '#2f2f2f',
    checkedEffect: 'none',
    ...(DEFAULT_PROFILE.checkboxStructure || {}),
    ...(imported?.checkboxStructure || {}),
  };
  if (!mergedCheckboxStructure.checkedEffect) {
    mergedCheckboxStructure.checkedEffect = 'none';
  }
  if (deeplyMergedRules.taskList) {
    deeplyMergedRules.taskList.checkedEffect = deeplyMergedRules.taskList.checkedEffect || 'none';
    if (!deeplyMergedRules.taskList.color || deeplyMergedRules.taskList.color === '#0d0d0d') {
      deeplyMergedRules.taskList.color = deeplyMergedRules.p?.color || '#2f2f2f';
    }
  }
  const mergedTableStructure = {
    ...(DEFAULT_PROFILE.tableStructure || {
      outerBorderWidth: '1px',
      rowBorderWidth: '1px',
      colBorderWidth: '1px',
    }),
    ...(imported?.tableStructure || {}),
  };

  // 6. 최종 서식 객체 조립
  return {
    ...DEFAULT_PROFILE,
    ...imported,
    id: finalId,
    name: (imported?.name && String(imported.name).trim()) || 'Onrivi 기본서식',
    description: imported?.description || '',
    customCss: imported?.customCss || '',
    pageStyle: mergedPageStyle,
    rules: deeplyMergedRules,
    hrStructure: mergedHrStructure,
    checkboxStructure: mergedCheckboxStructure,
    tableStructure: mergedTableStructure,
  };
}

