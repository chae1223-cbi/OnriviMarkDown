import { CssProfile } from '../types/cssProfile';

// ====================================================================
// 📊 [OMD-CORE-cssProfile-0006] cssProfile ➔ SYSTEM_PROFILE_IDS
// 🎯 @KICK  : 시스템 프로필 식별자 목록을 정의한다
// 🛡️ @GUARD : 이 ID를 가진 프로필은 수정/삭제 불가
// 🚨 @PATCH : 없음
// 🔗 @CALLS : isSystemProfileId
// ====================================================================
/**
 * 시스템 프로필 식별자 목록 — 이 ID를 가진 프로필은 수정/삭제 불가
 */
export const SYSTEM_PROFILE_IDS = ['system-1', 'system-2', 'system-3', 'system-4', 'system-5'] as const;
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
 *
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
    "name": "[공공기관 기본 보고서]",
    "pageStyle": {
      "fontFamily": "'KoPubDotum', 'Noto Sans KR', sans-serif",
      "fontSize": "14px",
      "lineHeight": "1.6",
      "letterSpacing": "-0.02em",
      "backgroundColor": "#ffffff",
      "paperSize": "a4",
      "marginTop": "25mm",
      "marginBottom": "20mm",
      "marginLeft": "15mm",
      "marginRight": "15mm",
      "orientation": "portrait",
      "headingSizeOffset": "3",
      "tabSize": "4"
    },
    "rules": {
      "h1": {
        "font-size": "28px",
        "font-weight": "900",
        "color": "#0058bc",
        "border-left": "8px solid #0058bc",
        "padding-left": "15px",
        "margin-bottom": "24px"
      },
      "h2": {
        "font-size": "22px",
        "font-weight": "800",
        "color": "#333333",
        "border-bottom": "1px solid #dee2e6",
        "padding-bottom": "8px",
        "margin-top": "32px"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "17px",
        "margin-top": "20px",
        "margin-bottom": "10px"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "15px",
        "margin-top": "16px",
        "margin-bottom": "8px"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "14px",
        "margin-top": "12px",
        "margin-bottom": "6px"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "13px",
        "margin-top": "10px",
        "margin-bottom": "4px"
      },
      "p": {
        "text-align": "justify",
        "margin-top": "0px",
        "margin-bottom": "10px",
        "text-indent": "10px",
        "line-height": "1.8",
        "word-break": "keep-all"
      },
      "strong": {
        "font-weight": "bold"
      },
      "em": {
        "font-style": "italic"
      },
      "u": {},
      "del": {
        "text-decoration-color": "#9ca3af"
      },
      "ul": {
        "padding-left": "24px",
        "list-style-type": "disc"
      },
      "ol": {
        "padding-left": "24px",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "4px",
        "padding-inline-start": "6px"
      },
      "taskList": {},
      "hr": {
        "border-top-color": "#d1d5db"
      },
      "table": {
        "width": "100%",
        "border-collapse": "collapse",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-size": "13px"
      },
      "th": {
        "background-color": "#f3f4f6",
        "padding": "8px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-weight": "bold"
      },
      "td": {
        "padding": "6px 8px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af"
      },
      "blockquote": {
        "border-left": "4px solid #0058bc",
        "background-color": "#f8f9fa",
        "padding": "16px",
        "color": "#444444"
      },
      "codeBlock": {
        "background-color": "#1e293b",
        "color": "#e2e8f0",
        "font-size": "13px",
        "padding": "16px",
        "border-radius": "6px"
      },
      "codeBlockTitle": {
        "background-color": "#0f172a",
        "color": "#94a3b8"
      },
      "a": {
        "color": "#2563eb",
        "text-decoration": "underline"
      },
      "img": {
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "width": "500px",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "code": {
        "background-color": "#f1f5f9",
        "color": "#2563eb",
        "font-size": "0.85em",
        "padding-top": "1px",
        "padding-bottom": "1px",
        "padding-left": "4px",
        "padding-right": "4px",
        "border-radius": "3px",
        "line-height": "1"
      },
      "video": {
        "width": "560px",
        "height": "315px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "math": {
        "color": "#0058bc",
        "font-size": "15px",
        "text-align": "center"
      },
      "map": {
        "width": "600px",
        "height": "450px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "footnote": {
        "color": "#6b7280",
        "font-size": "11px",
        "line-height": "1.4",
        "margin-top": "8px",
        "margin-bottom": "8px"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "2px",
      "marginTopBottom": "40px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "boxSize": "18px",
      "checkedEffect": "dim-only",
      "textGap": "12px",
      "color": "#0058bc"
    }
  },
  {
    "id": "system-2",
    "name": "기본서식",
    "pageStyle": {
      "fontFamily": "'Noto Sans KR', sans-serif",
      "fontSize": "16px",
      "lineHeight": "1.7",
      "letterSpacing": "-0.01em",
      "backgroundColor": "#FFFFFF",
      "paperSize": "a4",
      "marginTop": "25mm",
      "marginBottom": "20mm",
      "marginLeft": "15mm",
      "marginRight": "15mm",
      "orientation": "portrait",
      "headingSizeOffset": "3",
      "tabSize": "4"
    },
    "rules": {
      "h1": {
        "font-size": "32px",
        "font-weight": "900",
        "color": "#0058BC",
        "margin-bottom": "24px",
        "margin-top": "40px"
      },
      "h2": {
        "font-size": "26px",
        "font-weight": "800",
        "color": "#0058BC",
        "border-bottom": "2px solid #0058BC",
        "padding-bottom": "8px",
        "margin-top": "32px",
        "margin-bottom": "16px"
      },
      "h3": {
        "font-size": "20px",
        "font-weight": "700",
        "color": "#333333",
        "margin-top": "24px",
        "margin-bottom": "12px"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "15px",
        "margin-top": "16px",
        "margin-bottom": "8px"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "14px",
        "margin-top": "12px",
        "margin-bottom": "6px"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "13px",
        "margin-top": "10px",
        "margin-bottom": "4px"
      },
      "p": {
        "margin-bottom": "18px",
        "color": "#333333"
      },
      "strong": {
        "font-weight": "bold"
      },
      "em": {
        "font-style": "italic"
      },
      "u": {},
      "del": {
        "text-decoration-color": "#9ca3af"
      },
      "ul": {
        "padding-left": "24px",
        "color": "#333333",
        "list-style-type": "disc"
      },
      "ol": {
        "padding-left": "24px",
        "color": "#333333",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "4px",
        "padding-inline-start": "6px"
      },
      "taskList": {},
      "hr": {
        "border-top-color": "#d1d5db"
      },
      "table": {
        "border-collapse": "collapse",
        "width": "100%",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "th": {
        "background-color": "#F0F4F8",
        "font-weight": "bold",
        "color": "#0058BC",
        "border": "1px solid #D1D5DB",
        "padding": "12px"
      },
      "td": {
        "border": "1px solid #E5E7EB",
        "padding": "12px",
        "color": "#374151"
      },
      "blockquote": {
        "border-left": "4px solid #0058BC",
        "padding-left": "20px",
        "color": "#4B5563",
        "font-style": "italic",
        "margin-top": "24px",
        "margin-bottom": "24px"
      },
      "codeBlock": {
        "background-color": "#1e293b",
        "color": "#e2e8f0",
        "font-size": "13px",
        "padding": "16px",
        "border-radius": "6px"
      },
      "codeBlockTitle": {
        "background-color": "#0f172a",
        "color": "#94a3b8"
      },
      "a": {
        "color": "#2563eb",
        "text-decoration": "underline"
      },
      "img": {
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "width": "500px",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "code": {
        "background-color": "#F3F4F6",
        "color": "#0058BC",
        "padding": "2px 6px",
        "border-radius": "4px",
        "font-family": "monospace"
      },
      "video": {
        "width": "560px",
        "height": "315px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "math": {
        "color": "#0058BC",
        "font-size": "16px",
        "text-align": "center",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "map": {
        "width": "600px",
        "height": "450px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "footnote": {
        "color": "#6b7280",
        "font-size": "11px",
        "line-height": "1.4",
        "margin-top": "8px",
        "margin-bottom": "8px"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "40px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "boxSize": "18px",
      "checkedEffect": "none",
      "textGap": "12px",
      "color": "#0058BC"
    }
  },
  {
    "id": "system-3",
    "name": "따뜻한 서정적 명조",
    "pageStyle": {
      "fontFamily": "'Noto Serif KR', serif",
      "fontSize": "16px",
      "lineHeight": "1.8",
      "letterSpacing": "0.02em",
      "backgroundColor": "#FAF6ED",
      "paperSize": "a4",
      "marginTop": "25mm",
      "marginBottom": "20mm",
      "marginLeft": "15mm",
      "marginRight": "15mm",
      "orientation": "portrait",
      "headingSizeOffset": "3",
      "tabSize": "4"
    },
    "rules": {
      "h1": {
        "font-size": "32px",
        "font-weight": "700",
        "color": "#4A3728",
        "margin-bottom": "24px"
      },
      "h2": {
        "font-size": "26px",
        "font-weight": "700",
        "color": "#5D4037",
        "margin-top": "30px",
        "margin-bottom": "18px",
        "border-bottom": "1px solid #E0D7C6"
      },
      "h3": {
        "font-size": "22px",
        "font-weight": "600",
        "color": "#5D4037",
        "margin-top": "24px",
        "margin-bottom": "12px"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "15px",
        "margin-top": "16px",
        "margin-bottom": "8px"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "14px",
        "margin-top": "12px",
        "margin-bottom": "6px"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "13px",
        "margin-top": "10px",
        "margin-bottom": "4px"
      },
      "p": {
        "margin-bottom": "1.8em",
        "color": "#4A3728"
      },
      "strong": {
        "font-weight": "bold"
      },
      "em": {
        "font-style": "italic"
      },
      "u": {},
      "del": {
        "text-decoration-color": "#9ca3af"
      },
      "ul": {
        "padding-left": "24px",
        "color": "#4A3728",
        "list-style-type": "disc"
      },
      "ol": {
        "padding-left": "24px",
        "color": "#4A3728",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "4px",
        "padding-inline-start": "6px"
      },
      "taskList": {},
      "hr": {
        "border-top-color": "#d1d5db"
      },
      "table": {
        "border-collapse": "collapse",
        "width": "100%",
        "margin-bottom": "20px"
      },
      "th": {
        "background-color": "#F0EAE0",
        "font-weight": "bold",
        "border": "1px solid #DCD0C0",
        "padding": "12px",
        "color": "#4A3728"
      },
      "td": {
        "border": "1px solid #DCD0C0",
        "padding": "12px",
        "color": "#4A3728"
      },
      "blockquote": {
        "border-left": "3px solid #A68B6D",
        "padding-left": "20px",
        "margin-left": "0",
        "margin-right": "0",
        "color": "#6D5A4E",
        "font-style": "italic",
        "background-color": "rgba(166, 139, 109, 0.05)",
        "padding-top": "10px",
        "padding-bottom": "10px"
      },
      "codeBlock": {
        "background-color": "#1e293b",
        "color": "#e2e8f0",
        "font-size": "13px",
        "padding": "16px",
        "border-radius": "6px"
      },
      "codeBlockTitle": {
        "background-color": "#0f172a",
        "color": "#94a3b8"
      },
      "a": {
        "color": "#2563eb",
        "text-decoration": "underline"
      },
      "img": {
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "width": "500px",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "code": {
        "background-color": "#EAE0D5",
        "color": "#8D6E63",
        "padding": "2px 5px",
        "border-radius": "3px",
        "font-family": "monospace"
      },
      "video": {
        "width": "560px",
        "height": "315px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "math": {
        "color": "#4A3728",
        "font-size": "1.1em",
        "text-align": "center",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "map": {
        "width": "600px",
        "height": "450px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "footnote": {
        "color": "#6b7280",
        "font-size": "11px",
        "line-height": "1.4",
        "margin-top": "8px",
        "margin-bottom": "8px"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "40px",
      "lineWidth": "80%"
    },
    "checkboxStructure": {
      "boxSize": "16px",
      "checkedEffect": "dim-only",
      "textGap": "10px",
      "color": "#4A3728"
    }
  },
  {
    "id": "system-4",
    "name": "빈티지 올리브 베이지",
    "pageStyle": {
      "fontFamily": "'KoPubBatang', 'Nanum Myeongjo', serif",
      "fontSize": "16px",
      "lineHeight": "2.0",
      "letterSpacing": "0.05em",
      "backgroundColor": "#F4EDE0",
      "paperSize": "a4",
      "marginTop": "25mm",
      "marginBottom": "20mm",
      "marginLeft": "15mm",
      "marginRight": "15mm",
      "orientation": "portrait",
      "headingSizeOffset": "3",
      "tabSize": "4"
    },
    "rules": {
      "h1": {
        "font-size": "36px",
        "font-weight": "900",
        "color": "#3E4A3D",
        "margin-bottom": "30px",
        "letter-spacing": "0.1em"
      },
      "h2": {
        "font-size": "28px",
        "font-weight": "800",
        "color": "#4A5D45",
        "border-bottom": "2px solid #4A5D45",
        "padding-bottom": "8px",
        "margin-top": "40px",
        "margin-bottom": "20px"
      },
      "h3": {
        "font-size": "22px",
        "font-weight": "700",
        "color": "#556B2F",
        "margin-top": "30px",
        "margin-bottom": "15px"
      },
      "h4": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "15px",
        "margin-top": "16px",
        "margin-bottom": "8px"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "14px",
        "margin-top": "12px",
        "margin-bottom": "6px"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "13px",
        "margin-top": "10px",
        "margin-bottom": "4px"
      },
      "p": {
        "margin-bottom": "24px",
        "color": "#3E3C3A",
        "text-align": "justify"
      },
      "strong": {
        "font-weight": "bold"
      },
      "em": {
        "font-style": "italic"
      },
      "u": {},
      "del": {
        "text-decoration-color": "#9ca3af"
      },
      "ul": {
        "padding-left": "30px",
        "color": "#3E4A3D",
        "list-style-type": "disc"
      },
      "ol": {
        "padding-left": "30px",
        "color": "#3E4A3D",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "4px",
        "padding-inline-start": "6px"
      },
      "taskList": {},
      "hr": {
        "border-top-color": "#d1d5db"
      },
      "table": {
        "border-collapse": "collapse",
        "width": "100%",
        "margin-bottom": "25px"
      },
      "th": {
        "background-color": "#E8DFD0",
        "font-weight": "bold",
        "border": "1px solid #D2C4B0",
        "padding": "14px",
        "color": "#3E4A3D"
      },
      "td": {
        "border": "1px solid #D2C4B0",
        "padding": "14px",
        "color": "#3E3C3A"
      },
      "blockquote": {
        "border-left": "4px solid #4A5D45",
        "padding": "12px 20px",
        "margin": "30px 0",
        "background-color": "#EDE4D3",
        "color": "#555555",
        "font-style": "italic"
      },
      "codeBlock": {
        "background-color": "#1e293b",
        "color": "#e2e8f0",
        "font-size": "13px",
        "padding": "16px",
        "border-radius": "6px"
      },
      "codeBlockTitle": {
        "background-color": "#0f172a",
        "color": "#94a3b8"
      },
      "a": {
        "color": "#2563eb",
        "text-decoration": "underline"
      },
      "img": {
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "width": "500px",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "code": {
        "background-color": "#EAE0D5",
        "color": "#4A5D45",
        "padding": "3px 6px",
        "border-radius": "4px",
        "font-family": "monospace"
      },
      "video": {
        "width": "560px",
        "height": "315px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "math": {
        "color": "#3E4A3D",
        "font-size": "17px",
        "text-align": "center",
        "margin-top": "24px",
        "margin-bottom": "24px"
      },
      "map": {
        "width": "600px",
        "height": "450px",
        "display": "block",
        "margin-left": "auto",
        "margin-right": "auto",
        "margin-top": "16px",
        "margin-bottom": "16px"
      },
      "footnote": {
        "color": "#6b7280",
        "font-size": "11px",
        "line-height": "1.4",
        "margin-top": "8px",
        "margin-bottom": "8px"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "40px",
      "lineWidth": "80%"
    },
    "checkboxStructure": {
      "boxSize": "18px",
      "checkedEffect": "dim-only",
      "textGap": "12px",
      "color": "#4A5D45"
    }
  },
  {
    "id": "system-5",
    "name": "시원한 계곡 풍경 테마",
    "pageStyle": {
      "fontFamily": "\"Batang\", serif",
      "fontSize": "16px",
      "lineHeight": "1.8",
      "letterSpacing": "-0.02em",
      "backgroundColor": "#f0f8ff",
      "paperSize": "a4",
      "marginTop": "20mm",
      "marginBottom": "20mm",
      "marginLeft": "15mm",
      "marginRight": "15mm",
      "orientation": "portrait",
      "headingSizeOffset": "2",
      "tabSize": "4"
    },
    "rules": {
      "h1": {
        "color": "#005b96",
        "font-weight": "800",
        "border-bottom": "4px solid #87ceeb",
        "padding-bottom": "10px",
        "margin-top": "30px",
        "margin-bottom": "15px",
        "text-shadow": "1px 1px 2px rgba(0,0,0,0.05)"
      },
      "h2": {
        "color": "#0077be",
        "font-weight": "700",
        "border-left": "6px solid #4db8ff",
        "padding-left": "12px",
        "margin-top": "25px",
        "margin-bottom": "12px"
      },
      "h3": {
        "color": "#0099cc",
        "font-weight": "600",
        "margin-top": "20px",
        "margin-bottom": "10px"
      },
      "h4": {
        "color": "#4682b4",
        "font-weight": "600",
        "margin-top": "18px",
        "margin-bottom": "8px"
      },
      "h5": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "12pt",
        "margin-top": "10px",
        "margin-bottom": "5px"
      },
      "h6": {
        "text-align": "left",
        "font-weight": "600",
        "font-size": "11pt",
        "margin-top": "10px",
        "margin-bottom": "5px"
      },
      "p": {
        "color": "#2c3e50",
        "margin-bottom": "18px"
      },
      "strong": {
        "color": "#005b96",
        "font-weight": "700"
      },
      "em": {
        "color": "#5f9ea0",
        "font-style": "italic"
      },
      "u": {
        "text-decoration-color": "#87ceeb"
      },
      "del": {
        "text-decoration-color": "#9ca3af"
      },
      "ul": {
        "color": "#34495e",
        "padding-left": "20px"
      },
      "ol": {
        "color": "#34495e",
        "padding-left": "20px"
      },
      "li": {
        "margin-bottom": "8px"
      },
      "taskList": {},
      "hr": {
        "border": "0",
        "height": "1px",
        "background-image": "linear-gradient(to right, transparent, #87ceeb, transparent)",
        "margin": "30px 0"
      },
      "table": {
        "border-collapse": "collapse",
        "width": "100%",
        "margin-bottom": "20px"
      },
      "th": {
        "background-color": "#b3e5fc",
        "color": "#005b96",
        "padding": "10px",
        "border-bottom": "2px solid #81d4fa"
      },
      "td": {
        "padding": "10px",
        "border-bottom": "1px solid #e0f2f1"
      },
      "blockquote": {
        "border-left": "5px solid #b0e0e6",
        "background-color": "#e0f7fa",
        "padding": "15px 20px",
        "color": "#006064",
        "font-style": "italic",
        "border-radius": "0 8px 8px 0"
      },
      "codeBlock": {
        "background-color": "#e1f5fe",
        "border": "1px solid #b3e5fc",
        "border-radius": "4px",
        "padding": "12px",
        "font-family": "monospace"
      },
      "codeBlockTitle": {
        "background-color": "#0f172a",
        "color": "#94a3b8"
      },
      "a": {
        "color": "#0288d1",
        "text-decoration": "none",
        "border-bottom": "1px dashed #0288d1"
      },
      "img": {
        "border-radius": "12px",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.1)"
      },
      "code": {
        "background-color": "#e1f5fe",
        "color": "#0077be",
        "padding": "2px 4px",
        "border-radius": "3px"
      }
    }
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
// 🚨 @PATCH : 없음
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
    pageStyle: { fontFamily: '', fontSize: '', lineHeight: '', letterSpacing: '', backgroundColor: '#ffffff', paperSize: 'a4', marginTop: '', marginBottom: '', marginLeft: '', marginRight: '', orientation: 'portrait', headingSizeOffset: '', tabSize: '4' },
    rules: JSON.parse(JSON.stringify(EMPTY_RULES)),
    hrStructure: {
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
      marginTopBottom: '32px',
      lineWidth: '100%'
    },
    checkboxStructure: {
      boxSize: '16px',
      checkedEffect: 'none',
      textGap: '10px'
    }
  };
}
