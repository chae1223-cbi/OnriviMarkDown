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
export const SYSTEM_PROFILE_IDS = ['system-1', 'system-2', 'system-3'] as const;
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
    "name": "온리비어서 표준 서식",
    "description": "온리비 어서(Onrivi Author)의 최적화된 공식 기본 서식 테마입니다. 정갈한 텍스트 배치와 시각적 안정감을 제공합니다.",
    "pageStyle": {
      "fontFamily": "\"GulimChe\", serif",
      "fontSize": "14px",
      "lineHeight": "1.3",
      "letterSpacing": "-0.02em",
      "backgroundColor": "#f7f7f7",
      "paperSize": "a4",
      "marginTop": "20mm",
      "marginBottom": "20mm",
      "marginLeft": "10mm",
      "marginRight": "10mm",
      "orientation": "portrait",
      "headingSizeOffset": "3",
      "tabSize": "4",

    },
    "rules": {
      "h1": {
        "font-size": "28px",
        "font-weight": "bold",
        "color": "#0d0d0d",
        "padding-left": "15px",
        "margin-bottom": "20px",
        "border-bottom": "",
        "margin-top": "36px",
        "text-align": "left",
        "text-decoration": "none",
        "font-style": "normal"
      },
      "h2": {
        "font-size": "22px",
        "font-weight": "bold",
        "color": "#0d0d0d",
        "border-bottom": "",
        "padding-bottom": "8px",
        "margin-top": "14px",
        "text-decoration": "none",
        "font-style": "normal",
        "margin-bottom": "0px"
      },
      "h3": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "18.5px",
        "margin-top": "18px",
        "margin-bottom": "10px",
        "color": "#0d0d0d",
        "border-bottom": ""
      },
      "h4": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "15px",
        "margin-top": "16px",
        "margin-bottom": "8px",
        "color": "#0d0d0d",
        "border-bottom": ""
      },
      "h5": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "14px",
        "margin-top": "12px",
        "margin-bottom": "6px",
        "color": "#0d0d0d",
        "border-bottom": ""
      },
      "h6": {
        "text-align": "left",
        "font-weight": "bold",
        "font-size": "13px",
        "margin-top": "10px",
        "margin-bottom": "4px",
        "color": "#0d0d0d",
        "border-bottom": ""
      },
      "p": {
        "margin-bottom": "25px",
        "margin-top": "0px",
        "line-height": "1.5",
        "color": "#0d0d0d"
      },
      "strong": {
        "font-weight": "900",
        "color": "#6755f7"
      },
      "em": {
        "font-style": "oblique",
        "color": "#6755f7"
      },
      "u": {
        "text-decoration-color": "#0d0d0d",
        "text-decoration-style": "solid",
        "text-underline-offset": "3px"
      },
      "del": { "text-decoration": "line-through" },
      "ul": {
        "padding-left": "20px",
        "list-style-type": "disc",
        "color": "#374151"
      },
      "ol": {
        "padding-left": "20px",
        "color": "#374151",
        "list-style-type": "decimal"
      },
      "li": {
        "margin-bottom": "3px",
        "padding-inline-start": "3px"
      },
      "taskList": {},
      "hr": {
        "border-top-color": "#e5e7eb"
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
        "background-color": "#f8fafc",
        "padding": "7px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-weight": "bold",
        "font-size": "13px"
      },
      "td": {
        "padding": "7px",
        "border-style": "solid",
        "border-width": "1px",
        "border-color": "#9ca3af",
        "font-size": "13px"
      },
      "blockquote": {
        "padding": "14px 20px",
        "color": "#374151",
        "background-color": "#e8f2fd",
        "border-radius": "0 8px 8px 0",
        "margin-top": "0px",
        "margin-bottom": "0px",
        "font-weight": "bold",
        "border-left": "5px solid #2563eb"
      },
      "codeBlock": {
        "background-color": "#0f172a",
        "color": "#e2e8f0",
        "padding": "18px",
        "border-radius": "0 0 8px 8px",
        "font-size": "13.5px"
      },
      "codeBlockTitle": {
        "background-color": "#1e293b",
        "color": "#94a3b8",
        "padding": "8px 12px",
        "border-radius": "8px 8px 0 0"
      },
      "a": {
        "color": "#761de2",
        "text-decoration": "underline",
        "font-weight": "bold"
      },
      "img": {
        "border-radius": "16px",
        "margin-left": "auto",
        "margin-right": "auto",
        "background-color": "white",
        "padding": "0px",
        "box-shadow": "0 4px 12px rgba(0,0,0,0.1)"
      },
      "code": {
        "background-color": "#e3edf8",
        "color": "#122fbf",
        "padding": "2px 6px",
        "border-radius": "8px",
        "font-weight": "bold"
      },
      "video": {
        "border-radius": "8px",
        "box-shadow": "0 8px 16px rgba(0,0,0,0.08)",
        "margin-left": "auto",
        "margin-right": "auto",
        "display": "block",
        "float": "none"
      },
      "math": {
        "color": "#7967a2",
        "font-size": "16px",
        "text-align": "center",
        "margin-top": "20px",
        "margin-bottom": "20px"
      },
      "map": {
        "border-radius": "8px",
        "box-shadow": "0 8px 16px rgba(0,0,0,0.08)",
        "margin-left": "auto",
        "margin-right": "auto"
      },
      "footnote": {
        "font-size": "11px",
        "color": "#6d6b80",
        "line-height": "1.1",
        "margin-top": "1px",
        "margin-bottom": "1px",
        "font-weight": "bold"
      }
    },
    "hrStructure": {
      "borderTopStyle": "solid",
      "borderTopWidth": "1px",
      "marginTopBottom": "32px",
      "lineWidth": "100%"
    },
    "checkboxStructure": {
      "boxSize": "14px",
      "checkedEffect": "none",
      "textGap": "1px",
      "color": "#292829"
    }
  },
{
  "id": "system-2",
  "name": "GitHub 기술 블로그/명세서",
  "description": "개발자 친화적인 GitHub 스타일 템플릿입니다. 시스템 개발 명세서, API 문서 작성 등에 최적화되어 있습니다.",
  "pageStyle": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
    "fontSize": "15px",
    "lineHeight": "1.6",
    "letterSpacing": "0em",
    "backgroundColor": "#ffffff",
    "paperSize": "a4",
    "marginTop": "20mm",
    "marginBottom": "20mm",
    "marginLeft": "15mm",
    "marginRight": "15mm",
    "orientation": "portrait",
    "headingSizeOffset": "0",
    "tabSize": "4"
  },
  "rules": {
    "h1": {
      "font-size": "32px",
      "font-weight": "600",
      "color": "#24292f",
      "border-bottom": "1px solid #d0d7de",
      "padding-bottom": "0.3em",
      "margin-bottom": "16px",
      "margin-top": "24px"
    },
    "h2": {
      "font-size": "24px",
      "font-weight": "600",
      "color": "#24292f",
      "border-bottom": "1px solid #d0d7de",
      "padding-bottom": "0.3em",
      "margin-bottom": "16px",
      "margin-top": "24px"
    },
    "h3": {
      "font-size": "20px",
      "font-weight": "600",
      "color": "#24292f",
      "margin-bottom": "16px",
      "margin-top": "24px"
    },
    "h4": {
      "font-size": "16px",
      "font-weight": "600",
      "color": "#24292f",
      "margin-bottom": "16px",
      "margin-top": "24px"
    },
    "h5": {
      "font-size": "14px",
      "font-weight": "600",
      "color": "#24292f",
      "margin-bottom": "16px",
      "margin-top": "24px"
    },
    "h6": {
      "font-size": "13.5px",
      "font-weight": "600",
      "color": "#57606a",
      "margin-bottom": "16px",
      "margin-top": "24px"
    },
    "p": {
      "margin-top": "0",
      "margin-bottom": "16px",
      "color": "#24292f"
    },
    "strong": {
      "font-weight": "600"
    },
    "em": {
      "font-style": "italic"
    },
    "del": { "text-decoration": "line-through" },
      "u": { "text-decoration": "underline" },
    "ul": {
      "list-style-type": "disc",
      "padding-left": "2em",
      "margin-top": "0",
      "margin-bottom": "16px"
    },
    "ol": {
      "list-style-type": "decimal",
      "padding-left": "2em",
      "margin-top": "0",
      "margin-bottom": "16px"
    },
    "li": {
      "margin-top": "0.25em"
    },
    "taskList": {
      "list-style-type": "none",
      "padding-left": "0"
    },
    "hr": {
      "height": "0.25em",
      "padding": "0",
      "margin": "24px 0",
      "background-color": "#d0d7de",
      "border": "0"
    },
    "blockquote": {
      "padding": "0 1em",
      "color": "#57606a",
      "border-left": "0.25em solid #d0d7de",
      "margin-top": "0",
      "margin-bottom": "16px"
    },
    "table": {
      "width": "100%",
      "margin-top": "0",
      "margin-bottom": "16px",
      "border-collapse": "collapse"
    },
    "th": {
      "padding": "6px 13px",
      "border": "1px solid #d0d7de",
      "font-weight": "600",
      "background-color": "#f6f8fa"
    },
    "td": {
      "padding": "6px 13px",
      "border": "1px solid #d0d7de"
    },
    "code": {
      "padding": "0.2em 0.4em",
      "margin": "0",
      "background-color": "#afb8c133",
      "border-radius": "6px",
      "font-family": "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace"
    },
    "codeBlock": {
      "padding": "16px",
      "overflow": "auto",
      "line-height": "1.45",
      "background-color": "#f6f8fa",
      "border-radius": "6px",
      "margin-bottom": "16px"
    },
    "codeBlockTitle": {
      "padding": "8px 16px",
      "background-color": "#eaeef2",
      "border-bottom": "1px solid #d0d7de",
      "border-top-left-radius": "6px",
      "border-top-right-radius": "6px",
      "font-weight": "600",
      "color": "#24292f"
    },
    "a": {
      "color": "#0969da",
      "text-decoration": "none",
      "background-color": "transparent"
    },
    "img": {
      "max-width": "100%",
      "box-sizing": "content-box",
      "background-color": "#ffffff"
    },
    "video": {
      "max-width": "100%"
    },
    "math": {
      "display": "block",
      "margin": "1em 0"
    },
    "map": {
      "width": "100%",
      "height": "400px"
    },
    "footnote": {
      "font-size": "12px",
      "color": "#57606a",
      "border-top": "1px solid #d0d7de",
      "padding-top": "1em"
    }
  }
},
{
  "id": "system-3",
  "name": "공공기관 보고서 양식",
  "description": "깔끔하고 정돈된 공공기관/기업 보고서 스타일입니다. 굵은 명조체 계열 헤딩과 가독성 높은 본문 폰트를 사용합니다.",
  "pageStyle": {
    "fontFamily": "\"KoPubBatang\", \"Noto Sans KR\", \"Malgun Gothic\", sans-serif",
    "fontSize": "15px",
    "lineHeight": "1.8",
    "letterSpacing": "-0.02em",
    "backgroundColor": "#ffffff",
    "paperSize": "a4",
    "marginTop": "25mm",
    "marginBottom": "20mm",
    "marginLeft": "20mm",
    "marginRight": "20mm",
    "orientation": "portrait",
    "headingSizeOffset": "0",
    "tabSize": "4"
  },
  "rules": {
    "h1": {
      "font-size": "28px",
      "font-weight": "bold",
      "color": "#000000",
      "text-align": "center",
      "margin-bottom": "32px",
      "margin-top": "24px"
    },
    "h2": {
      "font-size": "20px",
      "font-weight": "bold",
      "color": "#000000",
      "margin-bottom": "16px",
      "margin-top": "24px",
      "border-bottom": "2px solid #000000",
      "padding-bottom": "8px"
    },
    "h3": {
      "font-size": "18px",
      "font-weight": "bold",
      "color": "#000000",
      "margin-bottom": "16px",
      "margin-top": "20px"
    },
    "h4": {
      "font-size": "16px",
      "font-weight": "bold",
      "color": "#333333",
      "margin-bottom": "12px",
      "margin-top": "16px"
    },
    "h5": {
      "font-size": "15px",
      "font-weight": "bold",
      "color": "#333333",
      "margin-bottom": "12px",
      "margin-top": "16px"
    },
    "h6": {
      "font-size": "14px",
      "font-weight": "bold",
      "color": "#555555",
      "margin-bottom": "12px",
      "margin-top": "16px"
    },
    "p": {
      "margin-top": "0",
      "margin-bottom": "16px",
      "color": "#222222",
      "text-indent": "10px"
    },
    "strong": {
      "font-weight": "bold",
      "color": "#000000"
    },
    "em": {
      "font-style": "italic"
    },
    "del": { "text-decoration": "line-through" },
      "u": { "text-decoration": "underline" },
    "ul": {
      "list-style-type": "disc",
      "padding-left": "2em",
      "margin-top": "0",
      "margin-bottom": "16px"
    },
    "ol": {
      "list-style-type": "decimal",
      "padding-left": "2em",
      "margin-top": "0",
      "margin-bottom": "16px"
    },
    "li": {
      "margin-top": "0.5em",
      "color": "#222222"
    },
    "taskList": {
      "list-style-type": "none",
      "padding-left": "0"
    },
    "hr": {
      "height": "1px",
      "padding": "0",
      "margin": "24px 0",
      "background-color": "#000000",
      "border": "0"
    },
    "blockquote": {
      "padding": "16px",
      "color": "#333333",
      "background-color": "#f9f9f9",
      "border-left": "4px solid #cccccc",
      "margin-top": "0",
      "margin-bottom": "16px"
    },
    "table": {
      "width": "100%",
      "margin-top": "0",
      "margin-bottom": "16px",
      "border-collapse": "collapse",
      "border": "1px solid #000000"
    },
    "th": {
      "padding": "10px",
      "border": "1px solid #000000",
      "font-weight": "bold",
      "background-color": "#f2f2f2",
      "text-align": "center"
    },
    "td": {
      "padding": "10px",
      "border": "1px solid #000000"
    },
    "code": {
      "padding": "0.2em 0.4em",
      "margin": "0",
      "background-color": "#f4f4f4",
      "font-family": "monospace"
    },
    "codeBlock": {
      "padding": "16px",
      "overflow": "auto",
      "line-height": "1.5",
      "background-color": "#f9f9f9",
      "border": "1px solid #cccccc",
      "margin-bottom": "16px"
    },
    "codeBlockTitle": {
      "padding": "8px 16px",
      "background-color": "#e6e6e6",
      "border": "1px solid #cccccc",
      "border-bottom": "none",
      "font-weight": "bold",
      "color": "#333333"
    },
    "a": {
      "color": "#0000ee",
      "text-decoration": "underline"
    },
    "img": {
      "max-width": "100%",
      "box-sizing": "content-box",
      "display": "block",
      "margin": "0 auto"
    },
    "video": {
      "max-width": "100%",
      "display": "block",
      "margin": "0 auto"
    },
    "math": {
      "display": "block",
      "margin": "1em 0",
      "text-align": "center"
    },
    "map": {
      "width": "100%",
      "height": "400px"
    },
    "footnote": {
      "font-size": "13px",
      "color": "#555555",
      "border-top": "1px solid #cccccc",
      "padding-top": "1em"
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
